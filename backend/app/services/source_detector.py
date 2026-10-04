from urllib.parse import urlparse
from typing import Optional
from backend.app.adapters.base import MediaSourceAdapter
from backend.app.adapters.youtube import YouTubeAdapter
from backend.app.adapters.instagram import InstagramAdapter
from backend.app.adapters.direct_url import DirectUrlAdapter

adapters = [
    YouTubeAdapter(),
    InstagramAdapter(),
    DirectUrlAdapter(),
]

def detect_source(url: str) -> str:
    """
    Detects the source platform from a URL.
    Returns: 'youtube', 'instagram', 'direct_url', or 'unsupported'.
    """
    if not url or not isinstance(url, str):
        return "unsupported"

    clean_url = url.strip()
    try:
        parsed = urlparse(clean_url)
    except Exception:
        return "unsupported"

    if parsed.scheme.lower() not in ("http", "https"):
        return "unsupported"

    host = (parsed.hostname or "").lower()

    if "youtube.com" in host or "youtu.be" in host:
        return "youtube"

    if "instagram.com" in host:
        return "instagram"

    # Check direct url adapter
    for adapter in adapters:
        if isinstance(adapter, DirectUrlAdapter) and adapter.can_handle(clean_url):
            return "direct_url"

    return "unsupported"

def get_adapter_for_source(source_type: str) -> Optional[MediaSourceAdapter]:
    if source_type == "youtube":
        return adapters[0]
    elif source_type == "instagram":
        return adapters[1]
    elif source_type == "direct_url":
        return adapters[2]
    return None

def get_adapter(url: str) -> Optional[MediaSourceAdapter]:
    source_type = detect_source(url)
    return get_adapter_for_source(source_type)
