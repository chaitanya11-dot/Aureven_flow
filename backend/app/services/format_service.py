from typing import Dict, Any, Optional

class FormatService:
    @staticmethod
    def validate_format(format_id: str, available_formats: list) -> Optional[Dict[str, Any]]:
        for fmt in available_formats:
            if fmt.get("id") == format_id:
                return fmt
        return None

    @staticmethod
    def get_mime_type(extension: str) -> str:
        ext = extension.lower().lstrip(".")
        mime_map = {
            "mp4": "video/mp4",
            "webm": "video/webm",
            "mov": "video/quicktime",
            "mp3": "audio/mpeg",
            "m4a": "audio/mp4",
            "wav": "audio/wav",
            "ogg": "audio/ogg"
        }
        return mime_map.get(ext, "application/octet-stream")

format_service = FormatService()
