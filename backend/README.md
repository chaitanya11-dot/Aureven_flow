# Aureven Flow — Backend & Media Processing Engine

A lightweight, zero-cost architecture media processing backend built with FastAPI, Pydantic, and FFmpeg.

## 1. Project Overview
Aureven Flow provides a focused media retrieval and processing pipeline:
1. **Analyze**: Validates user links, performs SSRF checks, and queries authorized metadata.
2. **Format Selection**: Prepares available video resolutions (MP4) and audio bitrates (MP3).
3. **Job Processing**: Asynchronously converts, scales, or extracts media containers via FFmpeg without blocking.
4. **Delivery**: Streams files with sanitized filenames and automatic TTL cleanup.

---

## 2. Architecture
```
backend/
├── app/
│   ├── main.py              # FastAPI application & lifecycle
│   ├── config.py            # Environment settings
│   ├── routes/              # API endpoints (health, analyze, jobs)
│   ├── services/            # Core business logic (media, format, cleanup)
│   ├── adapters/            # Source adapters (YouTube, Instagram, Direct URL)
│   ├── schemas/             # Pydantic validation models
│   ├── models/              # In-memory job repository
│   ├── workers/             # Background FFmpeg processing tasks
│   └── utils/               # Security, validation, and safe filenames
├── tests/                   # Pytest test suite
├── Dockerfile               # Containerized deployment
└── requirements.txt         # Python dependencies
```

---

## 3. Local Setup
Ensure Python 3.10+ and FFmpeg are installed on your machine.

```bash
# 1. Create virtual environment
python3 -m venv venv

# 2. Activate virtual environment
# On macOS / Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt
```

---

## 4. FFmpeg Installation
- **macOS**: `brew install ffmpeg`
- **Ubuntu/Debian**: `sudo apt update && sudo apt install -y ffmpeg`
- **Windows**: `winget install Gyan.FFmpeg` or download from [ffmpeg.org](https://ffmpeg.org).

---

## 5. Environment Variables
Copy `.env.example` to `.env`:
```env
APP_ENV=development
FRONTEND_URL=http://localhost:5173
PORT=8000
HOST=0.0.0.0
MAX_FILE_SIZE_MB=100
MAX_PROCESSING_TIME_SECONDS=180
MAX_DURATION_SECONDS=900
TEMP_FILE_TTL_MINUTES=30
TEMP_DIR=/tmp/aureven/jobs
MAX_CONCURRENT_JOBS=1
ANALYZE_RATE_LIMIT=10/minute
JOB_RATE_LIMIT=5/10minutes
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

---

## 6. Running the Backend
```bash
uvicorn backend.app.main:app --reload --port 8000
```

---

## 7. Connecting the Frontend
The frontend connects to the backend endpoints at `http://localhost:8000` (or via the Vite proxy at `/api/*`).
Start the frontend:
```bash
npm run dev
```

---

## 8. API Endpoints
- `GET /api/health`: Health status (`{"status": "ok"}`).
- `POST /api/analyze`: Analyzes target URL and returns available authorized formats.
- `POST /api/jobs`: Initiates processing job for a selected `source_id` and `format_id`.
- `GET /api/jobs/{job_id}`: Polls processing status (`queued`, `processing`, `completed`, `failed`).
- `GET /api/jobs/{job_id}/download`: Streams completed media file.
- `DELETE /api/jobs/{job_id}`: Cancels and cleans up job.

---

## 9. Security & Hardening
- **SSRF Protection**: Resolves domain IPs and blocks private/loopback/cloud metadata networks (`127.0.0.1`, `10.0.0.0/8`, `192.168.0.0/16`, `169.254.169.254`).
- **Command Injection Protection**: FFmpeg and ffprobe are executed using structured argument arrays, never raw shell strings.
- **Filename Sanitization**: Removes path traversal (`../`) and illegal filesystem characters.
- **In-Memory Rate Limiting**: Guards against spam and automated abuse.

---

## 10. Temporary File Cleanup
Working files are stored in `/tmp/aureven/jobs/{job_id}/`. An asynchronous cleanup cycle removes any job directory exceeding `TEMP_FILE_TTL_MINUTES` (30 minutes).

---

## 11. Deployment
Deploy via Docker:
```bash
docker build -t aureven-backend -f Dockerfile .
docker run -p 8000:8000 aureven-backend
```

---

## 12. Authorized Content Rules
Aureven Flow strictly processes media that the user owns or is authorized to process. It does not bypass DRM, harvest platform credentials, or scrape private accounts.
