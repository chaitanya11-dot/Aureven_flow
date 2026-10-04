import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.utils.security import validate_url_security
from backend.app.utils.filenames import sanitize_filename
from backend.app.services.source_detector import detect_source

client = TestClient(app)

def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_source_detection():
    assert detect_source("https://www.youtube.com/watch?v=is92-80kX8Y") == "youtube"
    assert detect_source("https://youtu.be/is92-80kX8Y") == "youtube"
    assert detect_source("https://www.instagram.com/reel/C8qL9p2Mz0X/") == "instagram"
    assert detect_source("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4") == "direct_url"
    assert detect_source("https://example.com/not-media") == "unsupported"

def test_ssrf_protection():
    # Localhost / Private IPs must be rejected
    is_safe, err = validate_url_security("http://localhost:8080/secret")
    assert not is_safe
    assert err == "UNAUTHORIZED_CONTENT"

    is_safe, err = validate_url_security("http://127.0.0.1/admin")
    assert not is_safe

    is_safe, err = validate_url_security("http://169.254.169.254/latest/meta-data")
    assert not is_safe

def test_filename_sanitization():
    safe = sanitize_filename("../../etc/passwd", "mp4")
    assert ".." not in safe
    assert "/" not in safe
    assert safe.endswith(".mp4")

    safe_spaces = sanitize_filename("Icelandic 4K Video : Special Edition!", "mp4")
    assert ":" not in safe_spaces
    assert "!" not in safe_spaces
    assert safe_spaces == "Icelandic_4K_Video_Special_Edition.mp4"

def test_analyze_invalid_url():
    response = client.post("/api/analyze", json={"url": "not-a-valid-url"})
    assert response.status_code == 400
    data = response.json()
    assert data["success"] is False
    assert data["error"]["code"] in ("INVALID_URL", "UNSUPPORTED_SOURCE")

def test_analyze_authorized_sample():
    response = client.post("/api/analyze", json={"url": "https://www.youtube.com/watch?v=is92-80kX8Y"})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["source"] == "youtube"
    assert "source_id" in data
    assert len(data["formats"]) > 0

    # Test Job creation with valid format
    source_id = data["source_id"]
    format_id = data["formats"][0]["id"]

    job_res = client.post("/api/jobs", json={
        "source_id": source_id,
        "format_id": format_id
    })
    assert job_res.status_code == 201
    job_data = job_res.json()
    assert "job_id" in job_data
    assert job_data["status"] == "queued"

    # Test Job status
    job_id = job_data["job_id"]
    status_res = client.get(f"/api/jobs/{job_id}")
    assert status_res.status_code == 200
    assert status_res.json()["job_id"] == job_id

def test_analyze_unauthorized_source():
    # Arbitrary YouTube video without credentials returns SOURCE_NOT_AVAILABLE
    response = client.post("/api/analyze", json={"url": "https://www.youtube.com/watch?v=99999999999"})
    assert response.status_code == 400
    data = response.json()
    assert data["success"] is False
    assert data["error"]["code"] in ("SOURCE_NOT_AVAILABLE", "PRIVATE_CONTENT", "UNAUTHORIZED_CONTENT")
