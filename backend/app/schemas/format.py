from typing import Optional
from pydantic import BaseModel

class FormatItem(BaseModel):
    id: str
    type: str  # 'video' or 'audio'
    quality: str  # '1080p', '720p', '480p', '320kbps', '192kbps'
    extension: str  # 'mp4', 'mp3', 'm4a', 'webm'
    mime_type: str
    estimated_size: Optional[int] = None
    size_label: Optional[str] = None
    label: Optional[str] = None
