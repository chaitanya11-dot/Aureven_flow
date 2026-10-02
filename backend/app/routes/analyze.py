import uuid
from fastapi import APIRouter, Request, status
from fastapi.responses import JSONResponse
from backend.app.schemas.analyze import AnalyzeRequest, AnalyzeResponse, ErrorDetail
from backend.app.services.source_detector import get_adapter, detect_source
from backend.app.utils.validation import validate_input_url, get_error_message
from backend.app.utils.security import rate_limiter, get_client_ip
from backend.app.models.job import job_store

router = APIRouter(prefix="/api", tags=["analyze"])

@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_url(req: AnalyzeRequest, request: Request):
    client_ip = get_client_ip(request)

    # Rate limiting: 10 requests per minute
    if not rate_limiter.is_allowed(client_ip, max_requests=15, window_seconds=60):
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={
                "success": False,
                "error": {
                    "code": "RATE_LIMITED",
                    "message": get_error_message("RATE_LIMITED")
                }
            }
        )

    # 1. URL syntax & security validation
    err_code = validate_input_url(req.url)
    if err_code:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "success": False,
                "error": {
                    "code": err_code,
                    "message": get_error_message(err_code)
                }
            }
        )

    # 2. Source detection
    source = detect_source(req.url)
    if source == "unsupported":
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "success": False,
                "error": {
                    "code": "UNSUPPORTED_SOURCE",
                    "message": get_error_message("UNSUPPORTED_SOURCE")
                }
            }
        )

    adapter = get_adapter(req.url)
    if not adapter:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "success": False,
                "error": {
                    "code": "SOURCE_NOT_AVAILABLE",
                    "message": get_error_message("SOURCE_NOT_AVAILABLE")
                }
            }
        )

    # 3. Analyze via adapter
    result = await adapter.analyze(req.url)
    if not result.get("success"):
        err = result.get("error", {})
        code = err.get("code", "PROCESSING_FAILED")
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "success": False,
                "error": {
                    "code": code,
                    "message": get_error_message(code)
                }
            }
        )

    # Generate session-safe source_id
    source_id = f"src_{uuid.uuid4().hex[:12]}"
    job_store.save_source(source_id, {
        "source_id": source_id,
        "url": req.url,
        "source": result.get("source"),
        "title": result.get("title"),
        "formats": result.get("formats", []),
        "duration": result.get("duration", 0),
        "author": result.get("author", "")
    })

    return {
        "success": True,
        "source": result.get("source"),
        "source_id": source_id,
        "title": result.get("title"),
        "thumbnail": result.get("thumbnail"),
        "duration": result.get("duration"),
        "duration_label": result.get("duration_label"),
        "author": result.get("author"),
        "media_type": result.get("media_type"),
        "formats": result.get("formats")
    }
