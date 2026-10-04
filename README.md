# Aureven Flow — Fast, Free Video & Audio Downloader

Aureven Flow is a clean, modern, and mobile-first web application engineered for downloading authorized video and audio streams in original quality (4K, 1440p, 1080p, 720p, 480p, 360p, and MP3 320 kbps).

---

## 🚀 Features

- **True Adaptive Stream Merging**: Discovers full format ladders via `yt-dlp` and merges separate high-resolution video streams with audio streams via `FFmpeg` without transcoding degradation.
- **Audio Extraction**: Converts audio streams into high-bitrate MP3s (`libmp3lame`, up to 320 kbps).
- **Stream Validation & 10 KB Protection**: Validates every output file with `ffprobe` to verify non-zero duration, valid streams, and container integrity before streaming.
- **Mobile-First Responsive Design**: Optimized for mobile devices (320px to 430px) with touch targets (≥ 44px), drawer menus, and responsive format selectors.
- **Native Browser Downloads**: Transfers files directly into the native browser download manager so users can safely multitask or close the page.
- **Security & SSRF Hardened**: Blocks private IP ranges, cloud metadata addresses, and sanitizes filenames.
- **Transient Temporary Storage**: Cleans up temporary download artifacts immediately after response streaming.
- **Docker & Render Ready**: Multi-stage Linux container with pre-installed `FFmpeg`, `ffprobe`, `Python 3`, and `yt-dlp`.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons
- **Backend**: Node.js, Express, `tsx`
- **Media Engine**: `yt-dlp`, `FFmpeg` (with `+faststart`), `ffprobe`
- **Deployment**: Docker, Render

---

## ⚙️ Environment Variables

Create a `.env` file based on `.env.example`:

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | Port for the HTTP server |
| `NODE_ENV` | `development` | Runtime mode (`development` or `production`) |
| `ALLOWED_ORIGINS` | `""` | Comma-separated allowed CORS origins for production |
| `TEMP_DIR` | `os.tmpdir()/aureven-flow` | Directory for temporary media processing |
| `MAX_CONCURRENT_DOWNLOADS`| `3` | Max simultaneous active download pipelines |
| `RATE_LIMIT_WINDOW_MS` | `60000` | Rate limiter window in milliseconds (1 minute) |
| `ANALYZE_RATE_LIMIT` | `30` | Max `/api/analyze` requests per IP per window |
| `DOWNLOAD_RATE_LIMIT` | `20` | Max `/api/download` requests per IP per window |
| `ANALYZE_TIMEOUT_MS` | `120000` | Timeout for format discovery (2 minutes) |
| `DOWNLOAD_TIMEOUT_MS` | `1800000` | Timeout for media download & processing (30 minutes) |
| `YTDLP_PATH` | auto-detected | Custom path to `yt-dlp` binary |
| `FFMPEG_PATH` | auto-detected | Custom path to `ffmpeg` binary |
| `FFPROBE_PATH` | auto-detected | Custom path to `ffprobe` binary |

---

## 💻 Local Development

### Prerequisites
- Node.js 18+ (Node 20 or 22 recommended)
- `ffmpeg` & `ffprobe` installed and in your system PATH
- `yt-dlp` in `bin/` or in your system PATH

### Installation & Startup
```bash
# 1. Install dependencies
npm install

# 2. Run development server (Vite + Express backend with live reload)
npm run dev

# 3. Open in browser
http://localhost:3000
```

### Production Build & Local Test
```bash
# Type check and build Vite assets
npm run build

# Start production server
npm start
```

---

## 🐳 Docker Deployment

### 1. Build Docker Image
```bash
docker build -t aureven-flow .
```

### 2. Run Container Locally
```bash
docker run -p 3000:3000 --rm --name aureven-flow aureven-flow
```
Open `http://localhost:3000` to verify.

---

## ☁️ Render Deployment Guide (Step-by-Step)

### Step 1: Push to GitHub
1. Initialize git and commit your files:
   ```bash
   git init
   git add .
   git commit -m "feat: Aureven Flow production release"
   ```
2. Create a new repository on [GitHub](https://github.com/new).
3. Push your repository:
   ```bash
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Create Web Service on Render
1. Go to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** → **Web Service**.
3. Select **Build and deploy from a Git repository** and connect your GitHub repository.

### Step 3: Configure Settings
- **Name**: `aureven-flow` (or your chosen name)
- **Region**: Choose the region closest to your users (e.g., Oregon, Frankfurt, Singapore)
- **Branch**: `main`
- **Runtime**: **Docker**
- **Plan**:
  - **Starter / Standard (Recommended)**: 512 MB – 2 GB RAM. Best for high-bitrate 1080p/4K FFmpeg stream merging.
  - *Free Tier Note*: Works for 360p–720p; may experience RAM limits on heavy simultaneous 4K jobs.

### Step 4: Add Environment Variables
Under **Environment Variables** in Render, add:
- `NODE_ENV` = `production`
- `PORT` = `10000`
- `MAX_CONCURRENT_DOWNLOADS` = `2`
- `ALLOWED_ORIGINS` = `https://your-custom-domain.com` (optional)

### Step 5: Configure Health Check
- Set **Health Check Path** to: `/api/health`

### Step 6: Deploy
Click **Create Web Service**. Render will build the Docker container and deploy the app at `https://<service-name>.onrender.com`.

---

## 🔍 Health Check & Monitoring

Send a GET request to `/api/health`:
```bash
curl https://<your-service>.onrender.com/api/health
```
Response:
```json
{
  "status": "ok",
  "service": "Aureven Flow",
  "ffmpeg": true,
  "ffprobe": true,
  "ytdlp": true
}
```

---

## ❓ Troubleshooting

| Issue | Cause | Solution |
|---|---|---|
| **Build fails on Render** | Docker runtime not selected | Ensure **Runtime: Docker** is selected in Render service settings. |
| **Download fails with 422** | Source restricted or network block | The video may be geo-blocked or age-restricted. Try another URL. |
| **Download hangs on Render** | Free tier memory limit exceeded | Upgrade to Starter/Standard plan (512MB–1GB RAM) for 1080p/4K merging. |
| **Duplicate download in browser** | Rapid multi-clicking | Automatic deduplication debounce is active in `mediaService.ts`. |

---

## ⚖️ Responsible Use Notice

Aureven Flow is designed exclusively for downloading media that you own, have explicit authorization from copyright holders to download, or that is in the public domain. Please respect content creator rights and applicable platform terms.
