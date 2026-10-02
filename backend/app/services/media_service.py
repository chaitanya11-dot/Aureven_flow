import json
import os
import subprocess
from typing import Dict, Any, Optional
from backend.app.config import settings

class MediaService:
    """
    Safe FFmpeg / ffprobe media processing service.
    Guarantees command array execution without shell injection.
    """

    @staticmethod
    def get_metadata(file_path: str) -> Dict[str, Any]:
        if not os.path.exists(file_path):
            return {}

        cmd = [
            "ffprobe",
            "-v", "quiet",
            "-print_format", "json",
            "-show_format",
            "-show_streams",
            file_path
        ]

        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=15,
                check=False
            )
            if result.returncode == 0 and result.stdout:
                return json.loads(result.stdout)
        except Exception:
            pass

        return {}

    @staticmethod
    def convert_video(
        input_path: str,
        output_path: str,
        target_resolution: Optional[str] = None,
        max_duration: int = 900
    ) -> bool:
        cmd = [
            "ffmpeg",
            "-y",
            "-i", input_path,
            "-t", str(min(max_duration, settings.MAX_DURATION_SECONDS)),
            "-c:v", "libx264",
            "-preset", "veryfast",
            "-crf", "23",
            "-c:a", "aac",
            "-b:a", "192k"
        ]

        if target_resolution:
            res_clean = target_resolution.lower().replace("p", "")
            if res_clean.isdigit():
                cmd.extend(["-vf", f"scale=-2:{res_clean}"])

        cmd.append(output_path)

        try:
            res = subprocess.run(
                cmd,
                capture_output=True,
                timeout=settings.MAX_PROCESSING_TIME_SECONDS,
                check=False
            )
            return res.returncode == 0 and os.path.exists(output_path) and os.path.getsize(output_path) > 0
        except Exception:
            return False

    @staticmethod
    def extract_audio(
        input_path: str,
        output_path: str,
        target_bitrate: str = "320k",
        max_duration: int = 900
    ) -> bool:
        clean_bitrate = target_bitrate.lower().replace("bps", "").replace("b", "")
        if not clean_bitrate.endswith("k"):
            clean_bitrate = f"{clean_bitrate}k"

        cmd = [
            "ffmpeg",
            "-y",
            "-i", input_path,
            "-vn",
            "-t", str(min(max_duration, settings.MAX_DURATION_SECONDS)),
            "-c:a", "libmp3lame",
            "-b:a", clean_bitrate,
            output_path
        ]

        try:
            res = subprocess.run(
                cmd,
                capture_output=True,
                timeout=settings.MAX_PROCESSING_TIME_SECONDS,
                check=False
            )
            return res.returncode == 0 and os.path.exists(output_path) and os.path.getsize(output_path) > 0
        except Exception:
            return False

    @staticmethod
    def generate_authorized_container(
        output_path: str,
        media_type: str = "video",
        quality: str = "1080p",
        duration: int = 5
    ) -> bool:
        """
        Creates an authentic, playable media container for authorized demo streams.
        """
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        dur_str = str(min(duration, 30))

        if media_type == "audio":
            cmd = [
                "ffmpeg",
                "-y",
                "-f", "lavfi",
                "-i", f"sine=frequency=440:duration={dur_str}",
                "-c:a", "libmp3lame",
                "-b:a", "320k",
                output_path
            ]
        else:
            height = 1080
            if "720" in quality:
                height = 720
            elif "480" in quality:
                height = 480

            cmd = [
                "ffmpeg",
                "-y",
                "-f", "lavfi",
                "-i", f"testsrc=duration={dur_str}:size=1920x1080:rate=30",
                "-f", "lavfi",
                "-i", f"sine=frequency=523.25:duration={dur_str}",
                "-vf", f"scale=-2:{height}",
                "-c:v", "libx264",
                "-preset", "ultrafast",
                "-pix_fmt", "yuv420p",
                "-c:a", "aac",
                "-b:a", "192k",
                output_path
            ]

        try:
            res = subprocess.run(
                cmd,
                capture_output=True,
                timeout=60,
                check=False
            )
            return res.returncode == 0 and os.path.exists(output_path) and os.path.getsize(output_path) > 0
        except Exception:
            return False

media_service = MediaService()
