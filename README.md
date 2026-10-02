# Aureven Flow — Free High-Quality Media Downloader

Aureven Flow is a clean, modern web application that allows users to analyze public video links (YouTube, Instagram, TikTok, direct web video) and download real high-definition MP4 video or MP3 audio at the exact requested quality.

## Features
- **Accurate Format Detection**: Analyzes real streams and discovers actual available qualities (1080p, 720p, 480p, 360p, 240p).
- **Exact Quality Respect**: Never fakes resolutions. If 1080p is selected, approximately 1080p is generated.
- **Audio Extraction**: Clean FFmpeg audio conversion to standard MP3 (`audio/mpeg`).
- **10 KB Protection & Validation**: All media is verified via `ffprobe` before serving. Incomplete or corrupt files (< 100 KB) are rejected.
- **Automatic Temp Cleanup**: Temporary processing files are stored in `/tmp/aureven-flow/` and deleted immediately after streaming.
- **No Paid APIs / No Mandatory DB**: 100% free and open-source tooling using React, Node/TypeScript, Python, yt-dlp, and FFmpeg.

## Prerequisites
- **Node.js**: v18+ or v20+
- **Python**: 3.10+ (for backend and yt-dlp)
- **FFmpeg & ffprobe**: Required for audio/video merging and stream validation (`sudo apt-get install -y ffmpeg`)
- **yt-dlp**: Installed globally or placed in `bin/yt-dlp`

## Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Verify yt-dlp and FFmpeg
Ensure `ffmpeg` and `yt-dlp` are accessible:
```bash
ffmpeg -version
yt-dlp --version
```

### 3. Run Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

## Environment Variables (.env)
```env
PORT=3000
NODE_ENV=development
TEMP_DIR=/tmp/aureven-flow
MAX_CONCURRENT_DOWNLOADS=3
```

## Production Build & Deployment
```bash
npm run build
npm start
```
