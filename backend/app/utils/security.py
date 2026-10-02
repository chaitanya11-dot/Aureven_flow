import ipaddress
import socket
import time
from urllib.parse import urlparse
from typing import Dict, List, Tuple
from fastapi import HTTPException, Request

PRIVATE_NETWORKS = [
    ipaddress.ip_network("0.0.0.0/8"),
    ipaddress.ip_network("10.0.0.0/8"),
    ipaddress.ip_network("127.0.0.0/8"),
    ipaddress.ip_network("169.254.0.0/16"),
    ipaddress.ip_network("172.16.0.0/12"),
    ipaddress.ip_network("192.168.0.0/16"),
    ipaddress.ip_network("::1/128"),
    ipaddress.ip_network("fc00::/7"),
    ipaddress.ip_network("fe80::/10"),
]

BLOCKED_HOSTNAMES = {
    "localhost",
    "127.0.0.1",
    "0.0.0.0",
    "metadata.google.internal",
    "169.254.169.254",
}

def is_ip_private(ip_str: str) -> bool:
    try:
        ip = ipaddress.ip_address(ip_str)
        return any(ip in net for net in PRIVATE_NETWORKS) or ip.is_private or ip.is_loopback or ip.is_link_local
    except ValueError:
        return True

def validate_url_security(url: str) -> Tuple[bool, str]:
    """
    Validates URL scheme, hostname, and protects against SSRF.
    Returns (is_valid, error_code).
    """
    if not url or not isinstance(url, str):
        return False, "INVALID_URL"

    trimmed = url.strip()
    if len(trimmed) > 2048:
        return False, "INVALID_URL"

    try:
        parsed = urlparse(trimmed)
    except Exception:
        return False, "INVALID_URL"

    if parsed.scheme.lower() not in ("http", "https"):
        return False, "INVALID_URL"

    hostname = (parsed.hostname or "").lower()
    if not hostname:
        return False, "INVALID_URL"

    if hostname in BLOCKED_HOSTNAMES or hostname.endswith(".internal") or hostname.endswith(".local"):
        return False, "UNAUTHORIZED_CONTENT"

    # Resolve IP addresses to prevent DNS rebinding & private IP access
    try:
        addr_info = socket.getaddrinfo(hostname, None)
        if not addr_info:
            return False, "INVALID_URL"

        for item in addr_info:
            sockaddr = item[4]
            ip_str = sockaddr[0]
            if is_ip_private(ip_str):
                return False, "UNAUTHORIZED_CONTENT"
    except socket.gaierror:
        return False, "INVALID_URL"
    except Exception:
        return False, "INVALID_URL"

    return True, ""


class InMemoryRateLimiter:
    """
    Lightweight sliding window rate limiter for zero-cost MVP.
    """
    def __init__(self):
        # ip -> list of timestamps
        self._history: Dict[str, List[float]] = {}

    def is_allowed(self, client_id: str, max_requests: int, window_seconds: int) -> bool:
        now = time.time()
        timestamps = self._history.get(client_id, [])
        # filter out expired
        cutoff = now - window_seconds
        timestamps = [t for t in timestamps if t > cutoff]
        
        if len(timestamps) >= max_requests:
            self._history[client_id] = timestamps
            return False

        timestamps.append(now)
        self._history[client_id] = timestamps
        return True

    def cleanup(self):
        now = time.time()
        for k in list(self._history.keys()):
            self._history[k] = [t for t in self._history[k] if t > now - 3600]
            if not self._history[k]:
                del self._history[k]

rate_limiter = InMemoryRateLimiter()

def get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "127.0.0.1"
