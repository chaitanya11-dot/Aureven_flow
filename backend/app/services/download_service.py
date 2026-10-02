import os
from fastapi import HTTPException
from fastapi.responses import FileResponse
from backend.app.models.job import JobModel
from backend.app.utils.filenames import sanitize_filename

class DownloadService:
    @staticmethod
    def create_download_response(job: JobModel) -> FileResponse:
        if job.status != "completed" or not job.file_path or not os.path.exists(job.file_path):
            raise HTTPException(
                status_code=400,
                detail={"code": "PROCESSING_FAILED", "message": "File is not ready for download."}
            )

        safe_filename = sanitize_filename(job.title, job.extension)
        return FileResponse(
            path=job.file_path,
            filename=safe_filename,
            media_type=job.mime_type,
            headers={
                "Content-Disposition": f'attachment; filename="{safe_filename}"'
            }
        )

download_service = DownloadService()
