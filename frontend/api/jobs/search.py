"""
Vercel serverless: GET/POST /api/jobs/search — same-day reuse, then JSON, then SerpAPI/Adzuna.
No uvicorn; runs automatically when the route is requested.
"""
import json
import sys
from http.server import BaseHTTPRequestHandler
from pathlib import Path
from urllib.parse import parse_qs, urlparse

# Make backend importable: __file__ is frontend/api/jobs/search.py -> parent.parent = frontend
_root = Path(__file__).resolve().parent.parent
if str(_root) not in sys.path:
    sys.path.insert(0, str(_root))

# Load .env from frontend/ or backend/
for _env_dir in [_root / "backend", _root]:
    _env_file = _env_dir / ".env"
    if _env_file.exists():
        try:
            from dotenv import load_dotenv
            load_dotenv(_env_file)
        except ImportError:
            pass
        break


def _cors_headers():
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "600",
    }


def _run_search(q: str, location: str, user_id: int | None):
    from backend.db import get_db_session
    from backend.routers.jobs import _job_search_workflow

    db = get_db_session()
    try:
        out = _job_search_workflow(db, q, location, user_id)
        return [r.model_dump() for r in out]
    finally:
        db.close()


def _get_user_id_from_auth(auth_header: str | None) -> int | None:
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    token = auth_header[7:].strip()
    if not token:
        return None
    try:
        from backend.auth_utils import decode_token
        payload = decode_token(token)
        if payload and "sub" in payload:
            return int(payload["sub"])
    except Exception:
        pass
    return None


class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(204)
        for k, v in _cors_headers().items():
            self.send_header(k, v)
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        qs = parse_qs(parsed.query)
        q = (qs.get("q") or [""])[0].strip() or "Software Engineer"
        location = (qs.get("location") or [""])[0].strip() or "United States"
        user_id = _get_user_id_from_auth(self.headers.get("Authorization"))
        try:
            jobs = _run_search(q, location, user_id)
        except Exception as e:
            self.send_response(500)
            for k, v in _cors_headers().items():
                self.send_header(k, v)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"detail": str(e)}).encode("utf-8"))
            return
        self.send_response(200)
        for k, v in _cors_headers().items():
            self.send_header(k, v)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(jobs, default=str).encode("utf-8"))

    def do_POST(self):
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length).decode("utf-8") if content_length else "{}"
        try:
            data = json.loads(body) if body.strip() else {}
        except json.JSONDecodeError:
            data = {}
        q = (data.get("job_title") or data.get("q") or "").strip() or "Software Engineer"
        location = (data.get("location") or "").strip() or "United States"
        user_id = _get_user_id_from_auth(self.headers.get("Authorization"))
        try:
            jobs = _run_search(q, location, user_id)
        except Exception as e:
            self.send_response(500)
            for k, v in _cors_headers().items():
                self.send_header(k, v)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"detail": str(e)}).encode("utf-8"))
            return
        self.send_response(200)
        for k, v in _cors_headers().items():
            self.send_header(k, v)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(jobs, default=str).encode("utf-8"))
