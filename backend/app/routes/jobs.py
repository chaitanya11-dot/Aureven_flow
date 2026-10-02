import uuid
from fastapi import APIRouter, BackgroundTasks, Request, status
from fastapi.responses import JSONResponse
from backend.app.schemas.job import CreateJobRequest, CreateJobResponse, JobStatusResponse
from backend.app.models.job import JobModel, job_store
from backend.app.services.format_service import format_service
from backend.app.services.download_service import download_service
from backend.app.services.cleanup_service import cleanup_service
from backend.app.workers.processor import process_media_job
from backend.app.utils.security import rate_limiter, get_client_ip
from backend.app.utils.validation import get_error_message

router = APIRouter(prefix="/api/jobs", tags=["jobs"])

@router.post("", response_model=CreateJobResponse, status_code=status.HTTP_201_CREATED)
async def create_job(req: CreateJobRequest, request: Request, background_tasks: BackgroundTasks):
    client_ip = get_client_ip(request)

    # Rate limiting: 10 jobs per 10 minutes
    if not rate_limiter.is_allowed(f"job_{client_ip}", max_requests=10, window_seconds=600):
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={
                "success": False,
                "error": {
                    "code": "RATE_LIMITED",
                    "message": get_error_message("RATE_LIMITED")
                }
            }
        )

    # Validate source
    source_data = job_store.get_source(req.source_id)
    if not source_data:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "success": False,
                "error": {
                    "code": "SOURCE_NOT_AVAILABLE",
                    "message": "Source session has expired or is invalid. Please analyze the link again."
                }
            }
        )

    # Validate format selection
    formats = source_data.get("formats", [])
    selected_format = format_service.validate_format(req.format_id, formats)
    if not selected_format:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "success": False,
                "error": {
                    "code": "FORMAT_NOT_AVAILABLE",
                    "message": get_error_message("FORMAT_NOT_AVAILABLE")
                }
            }
        )

    job_id = f"job_{uuid.uuid4().hex[:14]}"
    job = JobModel(
        id=job_id,
        source_id=req.source_id,
        source_url=source_data.get("url", ""),
        title=source_data.get("title", "download"),
        format_id=req.format_id,
        format_type=selected_format.get("type", "video"),
        quality=selected_format.get("quality", "1080p"),
        extension=selected_format.get("extension", "mp4"),
        mime_type=selected_format.get("mime_type", "video/mp4"),
        status="queued",
        progress=5
    )

    job_store.add_job(job)

    # Dispatch processing in background
    background_tasks.add_task(process_media_job, job.id)

    return {"job_id": job.id, "status": "queued"}


@router.get("/{job_id}", response_model=JobStatusResponse)
async def get_job_status(job_id: str):
    job = job_store.get_job(job_id)
    if not job:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={
                "success": False,
                "error": {
                    "code": "JOB_NOT_FOUND",
                    "message": get_error_message("JOB_NOT_FOUND")
                }
            }
        )

    if job.status == "expired":
        return JSONResponse(
            status_code=status.HTTP_410_GONE,
            content={
                "success": False,
                "error": {
                    "code": "JOB_EXPIRED",
                    "message": get_error_message("JOB_EXPIRED")
                }
            }
        )

    err = None
    if job.status == "failed":
        code = job.error_code or "PROCESSING_FAILED"
        err = {
            "code": code,
            "message": job.error_message or get_error_message(code)
        }

    return {
        "job_id": job.id,
        "status": job.status,
        "progress": job.progress,
        "title": job.title,
        "format_label": job.format_label,
        "file_size": job.file_size,
        "download_ready": job.status == "completed",
        "error": err
    }


@router.get("/{job_id}/download")
async def download_job_file(job_id: str):
    job = job_store.get_job(job_id)
    if not job:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={
                "success": False,
                "error": {
                    "code": "JOB_NOT_FOUND",
                    "message": get_error_message("JOB_NOT_FOUND")
                }
            }
        )

    if job.status != "completed":
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "success": False,
                "error": {
                    "code": "PROCESSING_FAILED",
                    "message": "File processing has not completed yet."
                }
            }
        )

    return download_service.create_download_response(job)


@router.delete("/{job_id}")
async def delete_job(job_id: str):
    job = job_store.get_job(job_id)
    if not job:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={
                "success": False,
                "error": {
                    "code": "JOB_NOT_FOUND",
                    "message": get_error_message("JOB_NOT_FOUND")
                }
            }
        )

    cleanup_service.cleanup_job_files(job_id, job.working_dir)
    job_store.delete_job(job_id)
    return {"success": True, "message": "Job deleted"}
