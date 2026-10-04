import os
import shutil
import time
from backend.app.config import settings
from backend.app.models.job import job_store

class CleanupService:
    @staticmethod
    def cleanup_job_files(job_id: str, working_dir: str = None):
        target_dir = working_dir or os.path.join(settings.TEMP_DIR, job_id)
        if os.path.exists(target_dir):
            try:
                shutil.rmtree(target_dir, ignore_errors=True)
            except Exception:
                pass

    @staticmethod
    def cleanup_expired_jobs():
        now = time.time()
        all_jobs = list(job_store.get_all_jobs().values())
        for job in all_jobs:
            if job.expires_at < now or job.status in ("failed", "expired"):
                CleanupService.cleanup_job_files(job.id, job.working_dir)
                job.status = "expired"

        # Also cleanup filesystem directories older than TTL
        base_dir = settings.TEMP_DIR
        if os.path.exists(base_dir):
            cutoff = now - (settings.TEMP_FILE_TTL_MINUTES * 60)
            try:
                for entry in os.listdir(base_dir):
                    job_path = os.path.join(base_dir, entry)
                    if os.path.isdir(job_path):
                        mtime = os.path.getmtime(job_path)
                        if mtime < cutoff:
                            shutil.rmtree(job_path, ignore_errors=True)
            except Exception:
                pass

cleanup_service = CleanupService()
