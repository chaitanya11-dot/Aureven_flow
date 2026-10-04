from urllib.parse import urlparse
from backend.app.utils.security import validate_url_security

ERROR_MESSAGES = {
    "INVALID_URL": "Please enter a valid supported link.",
    "UNSUPPORTED_SOURCE": "This link isn't supported.",
    "SOURCE_NOT_AVAILABLE": "This source can't be processed through the available integration.",
    "PRIVATE_CONTENT": "Private or restricted content can't be processed.",
    "UNAUTHORIZED_CONTENT": "You are not authorized to process this destination.",
    "FORMAT_NOT_AVAILABLE": "That format isn't available.",
    "FILE_TOO_LARGE": "This file is too large to process.",
    "PROCESSING_TIMEOUT": "Processing took too long. Please try a smaller file.",
    "RATE_LIMITED": "Too many requests. Please try again later.",
    "PROCESSING_FAILED": "We couldn't prepare this download.",
    "JOB_NOT_FOUND": "The requested job was not found.",
    "JOB_EXPIRED": "This download has expired. Please analyze the link again.",
}

def get_error_message(code: str) -> str:
    return ERROR_MESSAGES.get(code, "An error occurred while processing your request.")

def validate_input_url(url: str) -> str:
    """
    Validates the user supplied URL.
    Returns error_code string if invalid, or empty string if valid.
    """
    if not url or not isinstance(url, str):
        return "INVALID_URL"

    clean_url = url.strip()
    if len(clean_url) < 10 or len(clean_url) > 2048:
        return "INVALID_URL"

    is_safe, err = validate_url_security(clean_url)
    if not is_safe:
        return err or "INVALID_URL"

    return ""
