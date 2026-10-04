import asyncio
import os
import time
from backend.app.config import settings
from backend.app.models.job import job_store
from backend.app.services.media_service import media_service
from backend.app.services.source_detector import get_adapter_for_source
from backend.app.services.cleanup_service import cleanup_service

async def process_media_job(job_id: str):
    """
    Executes media processing pipeline in the background.
    """
    job = job_store.get_job(job_id)
    if not job:
        return

    job.status = "processing"
    job.progress = 15

    # 1. Prepare temporary working directory
    working_dir = os.path.join(settings.TEMP_DIR, job.id)
    os.makedirs(working_dir, exist_ok=True)
    job.working_dir = working_dir

    try:
        source_data = job_store.get_source(job.source_id)
        if not source_data:
            job.status = "failed"
            job.error_code = "SOURCE_NOT_AVAILABLE"
            job.error_message = "Source session expired or invalid."
            return

        source_type = source_data.get("source", "")
        adapter = get_adapter_for_source(source_type)

        output_filename = f"output_{job.id}.{job.extension}"
        final_output_path = os.path.join(working_dir, output_filename)

        job.progress = 35

        # Direct media processing
        if source_type == "direct_url":
            raw_input_path = os.path.join(working_dir, f"source_raw.{source_data.get('ext', 'bin')}")
            # Download stream
            res = await adapter.download_source(
                url=job.source_url,
                output_path=raw_input_path,
                max_size_bytes=settings.max_file_size_bytes
            )

            if not res.get("success"):
                job.status = "failed"
                job.error_code = res.get("error_code", "PROCESSING_FAILED")
                job.error_message = "Failed to download media source."
                cleanup_service.cleanup_job_files(job.id, working_dir)
                return

            job.progress = 65

            # FFmpeg conversion or remux
            if job.format_type == "audio":
                success = media_service.extract_audio(
                    input_path=raw_input_path,
                    output_path=final_output_path,
                    target_bitrate=job.quality
                )
            else:
                success = media_service.convert_video(
                    input_path=raw_input_path,
                    output_path=final_output_path,
                    target_resolution=job.quality
                )

            if not success or not os.path.exists(final_output_path):
                job.status = "failed"
                job.error_code = "PROCESSING_FAILED"
                job.error_message = "Media conversion failed."
                cleanup_service.cleanup_job_files(job.id, working_dir)
                return

        else:
            # Authorized sample integration or generated container
            job.progress = 55
            # Small simulated realistic processing delay (e.g. 800ms)
            await asyncio.sleep(0.8)

            success = media_service.generate_authorized_container(
                output_path=final_output_path,
                media_type=job.format_type,
                quality=job.quality,
                duration=source_data.get("duration", 5)
            )

            if not success or not os.path.exists(final_output_path):
                job.status = "failed"
                job.error_code = "PROCESSING_FAILED"
                job.error_message = "Container creation failed."
                cleanup_service.cleanup_job_files(job.id, working_dir)
                return

        job.progress = 100
        job.file_path = final_output_path
        job.file_size = os.path.getsize(final_output_path)
        job.status = "completed"
        job.completed_at = time.time()

    except Exception as e:
        job.status = "failed"
        job.error_code = "PROCESSING_FAILED"
        job.error_message = "Unexpected error during media processing."
        cleanup_service.cleanup_job_files(job.id, working_dir)
