import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    APP_ENV: str = "development"
    FRONTEND_URL: str = "http://localhost:5173"
    PORT: int = 8000
    HOST: str = "0.0.0.0"

    MAX_FILE_SIZE_MB: int = 100
    MAX_PROCESSING_TIME_SECONDS: int = 180
    MAX_DURATION_SECONDS: int = 900

    TEMP_FILE_TTL_MINUTES: int = 30
    TEMP_DIR: str = "/tmp/aureven/jobs"

    MAX_CONCURRENT_JOBS: int = 1
    ANALYZE_RATE_LIMIT: str = "10/minute"
    JOB_RATE_LIMIT: str = "5/10minutes"

    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def cors_origins_list(self) -> List[str]:
        if not self.CORS_ORIGINS:
            return ["*"]
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def max_file_size_bytes(self) -> int:
        return self.MAX_FILE_SIZE_MB * 1024 * 1024

settings = Settings()
