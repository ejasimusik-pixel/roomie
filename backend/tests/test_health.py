"""Roomie backend health endpoint tests."""
import os
import requests

BASE_URL = os.environ.get(
    "REACT_APP_BACKEND_URL",
    "https://ai-roomie.preview.emergentagent.com",
).rstrip("/")


def test_root_returns_service_meta():
    r = requests.get(f"{BASE_URL}/api/", timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert data.get("service") == "roomie-backend"
    assert data.get("status") == "ok"


def test_health_endpoint():
    r = requests.get(f"{BASE_URL}/api/health", timeout=15)
    assert r.status_code == 200
    assert r.json().get("status") == "healthy"


def test_unknown_api_route_404():
    r = requests.get(f"{BASE_URL}/api/does-not-exist", timeout=15)
    assert r.status_code in (404, 405)
