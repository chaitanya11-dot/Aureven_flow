from typing import Optional
from pydantic import BaseModel
from backend.app.schemas.analyze import ErrorDetail

class CreateJobRequest(BaseModel):
    source_id: str
    format_id: str

class CreateJobResponse(BaseModel):
    job_id: str
    status: str

class JobStatusResponse(BaseModel):
    job_id: str
    status: str  # 'queued', 'processing', 'completed', 'failed', 'expired'
    progress: Optional[int] = 0
    title: Optional[str] = None
    format_label: Optional[str] = None
    file_size: Optional[int] = None
    download_ready: Optional[bool] = False
    error: Optional[ErrorDetail] = None
