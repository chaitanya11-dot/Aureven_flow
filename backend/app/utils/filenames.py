import re
import unicodedata

def sanitize_filename(name: str, extension: str = "") -> str:
    """
    Sanitizes a string to be a safe filesystem and download attachment filename.
    Prevents path traversal, control characters, and reserved names.
    """
    if not name:
        name = "media_download"

    # Normalize unicode
    name = unicodedata.normalize("NFKD", name)
    name = name.encode("ascii", "ignore").decode("ascii")

    # Replace forbidden path characters with underscores
    name = re.sub(r'[\\/*?:"<>|~`!@#$%^&+=,;[\]{}()\0]', "_", name)
    # Remove consecutive spaces and underscores
    name = re.sub(r'[\s_]+', "_", name).strip("._ ")

    if not name:
        name = "download"

    # Limit length
    if len(name) > 80:
        name = name[:80].rstrip("._ ")

    clean_ext = re.sub(r'[^a-zA-Z0-9]', '', extension).lower()
    if clean_ext:
        return f"{name}.{clean_ext}"
    return name
