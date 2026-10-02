import os
import httpx
from urllib.parse import urlparse, unquote
from typing import Dict, Any, List
from backend.app.adapters.base import MediaSourceAdapter
from backend.app.config import settings
from backend.app.utils.filenames import sanitize_filename
from backend.app.utils.security import validate_url_security

SUPPORTED_EXTENSIONS = {
    ".mp4", ".m4v", ".webm", ".mov", ".mkv",
    ".mp3", ".m4a", ".wav", ".aac", ".ogg", ".flac"
}

class DirectUrlAdapter(MediaSourceAdapter):
    """
    Adapter for directly accessible authorized media files.
    """

    def can_handle(self, url: str) -> bool:
        if not url:
            return False
        parsed = urlparse(url.strip())
        path_lower = parsed.path.lower()
        return any(path_lower.endswith(ext) for ext in SUPPORTED_EXTENSIONS)

    async def analyze(self, url: str) -> Dict[str, Any]:
        is_safe, err = validate_url_security(url)
        if not is_safe:
            return {
                "success": False,
                "error": {
                    "code": err or "INVALID_URL",
                    "message": "Security validation failed for the supplied URL."
                }
            }

        parsed = urlparse(url)
        raw_name = os.path.basename(parsed.path) or "direct_media"
        filename_base = unquote(raw_name)
        ext = os.path.splitext(filename_base)[1].lower().lstrip(".")
        is_audio = ext in ["mp3", "m4a", "wav", "aac", "ogg", "flac"]

        title = os.path.splitext(filename_base)[0].replace("_", " ").replace("-", " ").title()

        # Query headers with strict timeouts
        file_size = 0
        try:
            async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
                resp = await client.head(url)
                if resp.status_code in (200, 206):
                    cl = resp.headers.get("content-length")
                    if cl and cl.isdigit():
                        file_size = int(cl)
        except Exception:
            pass

        if file_size > settings.max_file_size_bytes:
            return {
                "success": False,
                "error": {
                    "code": "FILE_TOO_LARGE",
                    "message": f"File size exceeds maximum limit of {settings.MAX_FILE_SIZE_MB}MB."
                }
            }

        formats = self.get_formats({
            "is_audio": is_audio,
            "ext": ext or ("mp3" if is_audio else "mp4"),
            "file_size": file_size
        })

        return {
            "success": True,
            "source": "direct_url",
            "title": title or "Direct Media Resource",
            "thumbnail": "",
            "duration": 180,
            "duration_label": "03:00",
            "author": parsed.hostname or "Direct Web Media",
            "media_type": "audio" if is_audio else "video",
            "formats": formats
        }

    def get_formats(self, source_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        is_audio = source_data.get("is_audio", False)
        ext = source_data.get("ext", "mp4")
        file_size = source_data.get("file_size", 0)

        formats = []
        if not is_audio:
            size_mb = round(file_size / (1024 * 1024), 1) if file_size else 24
            formats.extend([
                {
                    "id": "direct-video-original",
                    "type": "video",
                    "quality": "Original",
                    "extension": ext if ext in ["mp4", "webm"] else "mp4",
                    "mime_type": f"video/{ext}",
                    "estimated_size": file_size or 25000000,
                    "size_label": f"{size_mb} MB" if size_mb else "Variable",
                    "label": f"Original · {ext.upper()} · {size_mb} MB"
                },
                {
                    "id": "direct-video-720p",
                    "type": "video",
                    "quality": "720p",
                    "extension": "mp4",
                    "mime_type": "video/mp4",
                    "estimated_size": int(file_size * 0.7) if file_size else 18000000,
                    "size_label": f"{round(size_mb * 0.7, 1)} MB" if size_mb else "18 MB",
                    "label": f"720p · MP4 · {round(size_mb * 0.7, 1)} MB"
                },
                {
                    "id": "direct-audio-mp3",
                    "type": "audio",
                    "quality": "320kbps",
                    "extension": "mp3",
                    "mime_type": "audio/mpeg",
                    "estimated_size": 7500000,
                    "size_label": "7.5 MB",
                    "label": "320kbps · MP3 · 7.5 MB"
                }
            ])
        else:
            size_mb = round(file_size / (1024 * 1024), 1) if file_size else 8
            formats.extend([
                {
                    "id": "direct-audio-320",
                    "type": "audio",
                    "quality": "320kbps",
                    "extension": "mp3",
                    "mime_type": "audio/mpeg",
                    "estimated_size": file_size or 8000000,
                    "size_label": f"{size_mb} MB" if size_mb else "8 MB",
                    "label": f"320kbps · MP3 · {size_mb} MB"
                },
                {
                    "id": "direct-audio-192",
                    "type": "audio",
                    "quality": "192kbps",
                    "extension": "mp3",
                    "mime_type": "audio/mpeg",
                    "estimated_size": int(file_size * 0.6) if file_size else 5000000,
                    "size_label": f"{round(size_mb * 0.6, 1)} MB" if size_mb else "5 MB",
                    "label": f"192kbps · MP3 · {round(size_mb * 0.6, 1)} MB"
                }
            ])
        return formats

    async def download_source(
        self,
        url: str,
        output_path: str,
        max_size_bytes: int,
        progress_callback = None
    ) -> Dict[str, Any]:
        bytes_received = 0
        async with httpx.AsyncClient(timeout=60.0, follow_redirects=True) as client:
            async with client.stream("GET", url) as response:
                if response.status_code not in (200, 206):
                    return {"success": False, "error_code": "PROCESSING_FAILED"}

                with open(output_path, "wb") as f:
                    async for chunk in response.aiter_bytes(chunk_size=65536):
                        bytes_received += len(chunk)
                        if bytes_received > max_size_bytes:
                            return {"success": False, "error_code": "FILE_TOO_LARGE"}
                        f.write(chunk)
                        if progress_callback:
                            progress_callback(bytes_received)

        return {"success": True, "bytes": bytes_received, "path": output_path}
