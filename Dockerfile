# ===================================================
# Stage 1: Build Frontend Assets
# ===================================================
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ===================================================
# Stage 2: Production Runtime
# ===================================================
FROM node:20-alpine AS runner

# Install FFmpeg, ffprobe, Python3, and ca-certificates for yt-dlp
RUN apk add --no-cache \
    ffmpeg \
    python3 \
    py3-pip \
    curl \
    ca-certificates

WORKDIR /app

# Install latest yt-dlp binary directly to system path
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && \
    chmod a+rx /usr/local/bin/yt-dlp

ENV NODE_ENV=production
ENV PORT=3000
ENV TEMP_DIR=/tmp/aureven-flow
ENV YTDLP_PATH=/usr/local/bin/yt-dlp
ENV FFMPEG_PATH=/usr/bin/ffmpeg
ENV FFPROBE_PATH=/usr/bin/ffprobe

# Create writable temp directory for non-root user
RUN mkdir -p /tmp/aureven-flow && chown -R node:node /tmp/aureven-flow /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder --chown=node:node /app/dist ./dist
COPY --from=builder --chown=node:node /app/server.ts ./server.ts
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/vite.config.ts ./vite.config.ts

# Switch to non-root user
USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["npx", "tsx", "server.ts"]
