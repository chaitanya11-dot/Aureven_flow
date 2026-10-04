import time
from typing import Dict, Optional, Any
from dataclasses import dataclass, field
from backend.app.config import settings

@dataclass
class JobModel:
    id: str
    source_id: str
    source_url: str
    title: str
    format_id: str
    format_type: str  # 'video' | 'audio'
    quality: str
    extension: str
    mime_type: str
    status: str = "queued"  # 'queued', 'processing', 'completed', 'failed', 'expired'
    progress: int = 0
    file_path: Optional[str] = None
    file_size: Optional[int] = None
    created_at: float = field(default_factory=time.time)
    completed_at: Optional[float] = None
    expires_at: float = 0.0
    error_code: Optional[str] = None
    error_message: Optional[str] = None
    working_dir: Optional[str] = None

    def __post_init__(self):
        if not self.expires_at:
            self.expires_at = self.created_at + (settings.TEMP_FILE_TTL_MINUTES * 60)

    @property
    def is_expired(self) -> bool:
        return time.time() > self.expires_at

    @property
    def format_label(self) -> str:
        size_str = f" · {round(self.file_size / (1024 * 1024), 1)} MB" if self.file_size else ""
        return f"{self.quality} · {self.extension.upper()}{size_str}"


class JobStore:
    def __init__(self):
        self._jobs: Dict[str, JobModel] = {}
        # Stores analyzed sources: source_id -> metadata dict
        self._sources: Dict[str, Dict[str, Any]] = {}

    def save_source(self, source_id: str, data: Dict[str, Any]):
        self._sources[source_id] = data

    def get_source(self, source_id: str) -> Optional[Dict[str, Any]]:
        return self._sources.get(source_id)

    def add_job(self, job: JobModel):
        self._jobs[job.id] = job

    def get_job(self, job_id: str) -> Optional[JobModel]:
        job = self._jobs.get(job_id)
        if job and job.is_expired and job.status != "expired":
            job.status = "expired"
        return job

    def delete_job(self, job_id: str) -> bool:
        if job_id in self._jobs:
            del self._jobs[job_id]
            return True
        return False

    def get_all_jobs(self) -> Dict[str, JobModel]:
        return self._jobs

job_store = JobStore()
