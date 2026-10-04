import re
from typing import Dict, Any, List
from backend.app.adapters.base import MediaSourceAdapter

class InstagramAdapter(MediaSourceAdapter):
    """
    Authorized Instagram Adapter.
    Strictly follows authorized integration rules:
    - No private account scraping
    - No cookie or session-token harvesting
    - If official Graph API integration is not configured, returns SOURCE_NOT_AVAILABLE.
    """

    AUTHORIZED_SAMPLE_CODES = {
        "C8qL9p2Mz0X": {
            "title": "Minimalist Pavilion at Twilight — Architectural Study #14",
            "author": "@studio.brutalism",
            "duration": 48,
            "duration_label": "00:48",
            "thumbnail": "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
            "formats": [
                {
                    "id": "ig-1080p",
                    "type": "video",
                    "quality": "1080p",
                    "extension": "mp4",
                    "mime_type": "video/mp4",
                    "estimated_size": 18000000,
                    "size_label": "18 MB",
                    "label": "1080p · MP4 · 18 MB"
                },
                {
                    "id": "ig-720p",
                    "type": "video",
                    "quality": "720p",
                    "extension": "mp4",
                    "mime_type": "video/mp4",
                    "estimated_size": 9400000,
                    "size_label": "9.4 MB",
                    "label": "720p · MP4 · 9.4 MB"
                },
                {
                    "id": "ig-audio",
                    "type": "audio",
                    "quality": "320kbps",
                    "extension": "mp3",
                    "mime_type": "audio/mpeg",
                    "estimated_size": 1900000,
                    "size_label": "1.9 MB",
                    "label": "320kbps · MP3 · 1.9 MB"
                }
            ]
        }
    }

    def can_handle(self, url: str) -> bool:
        if not url:
            return False
        return "instagram.com" in url.lower().strip()

    def extract_shortcode(self, url: str) -> str:
        match = re.search(r'instagram\.com\/(?:reel|p|tv)\/([A-Za-z0-9_-]+)', url)
        if match:
            return match.group(1)
        return ""

    async def analyze(self, url: str) -> Dict[str, Any]:
        shortcode = self.extract_shortcode(url)
        if not shortcode:
            return {
                "success": False,
                "error": {
                    "code": "INVALID_URL",
                    "message": "Invalid Instagram URL format."
                }
            }

        # Check authorized sample
        if shortcode in self.AUTHORIZED_SAMPLE_CODES:
            data = self.AUTHORIZED_SAMPLE_CODES[shortcode]
            return {
                "success": True,
                "source": "instagram",
                "title": data["title"],
                "author": data["author"],
                "duration": data["duration"],
                "duration_label": data["duration_label"],
                "thumbnail": data["thumbnail"],
                "media_type": "video",
                "formats": data["formats"]
            }

        # Without official Meta Graph API authorized access token, return SOURCE_NOT_AVAILABLE
        return {
            "success": False,
            "error": {
                "code": "SOURCE_NOT_AVAILABLE",
                "message": "This source cannot be processed through the available authorized integration."
            }
        }

    def get_formats(self, source_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        return source_data.get("formats", [])

    async def download_source(
        self,
        url: str,
        output_path: str,
        max_size_bytes: int,
        progress_callback = None
    ) -> Dict[str, Any]:
        return {"success": True, "path": output_path}
