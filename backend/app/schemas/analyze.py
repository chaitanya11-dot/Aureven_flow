from typing import List, Optional
from pydantic import BaseModel
from backend.app.schemas.format import FormatItem

class AnalyzeRequest(BaseModel):
    url: str

class ErrorDetail(BaseModel):
    code: str
    message: str

class AnalyzeResponse(BaseModel):
    success: bool
    source: Optional[str] = None
    source_id: Optional[str] = None
    title: Optional[str] = None
    thumbnail: Optional[str] = None
    duration: Optional[int] = None
    duration_label: Optional[str] = None
    author: Optional[str] = None
    media_type: Optional[str] = None
    formats: Optional[List[FormatItem]] = None
    error: Optional[ErrorDetail] = None
