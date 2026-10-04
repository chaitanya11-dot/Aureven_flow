import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from backend.app.config import settings
from backend.app.routes import health, analyze, jobs
from backend.app.services.cleanup_service import cleanup_service

# Structured backend logging (never logs credentials, cookies, tokens)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("aureven.api")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Aureven Flow Backend starting up on %s:%s", settings.HOST, settings.PORT)
    # Background periodic cleanup
    async def periodic_cleanup():
        while True:
            try:
                await asyncio.sleep(300)  # every 5 minutes
                cleanup_service.cleanup_expired_jobs()
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.warning("Cleanup cycle encountered error: %s", str(e))

    cleanup_task = asyncio.create_task(periodic_cleanup())
    yield
    cleanup_task.cancel()
    logger.info("Aureven Flow Backend shutting down")

app = FastAPI(
    title="Aureven Flow API",
    description="Clean, authorized media processing API",
    version="1.0.0",
    lifespan=lifespan,
    docs_url=None if settings.APP_ENV == "production" else "/docs",
    redoc_url=None
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Standardized error handling to prevent leaking internals
@app.exception_handler(HTTPException)
async def custom_http_exception_handler(request: Request, exc: HTTPException):
    detail = exc.detail
    if isinstance(detail, dict) and "code" in detail:
        return JSONResponse(
            status_code=exc.status_code,
            content={"success": False, "error": detail}
        )
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "code": "REQUEST_ERROR",
                "message": str(detail) if isinstance(detail, str) else "Request failed"
            }
        }
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled exception on %s: %s", request.url.path, str(exc))
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": {
                "code": "PROCESSING_FAILED",
                "message": "We couldn't prepare this request. Please try again."
            }
        }
    )

# Register routes
app.include_router(health.router)
app.include_router(analyze.router)
app.include_router(jobs.router)
