"""
PathPilot API - FastAPI app.
Creates DB tables on startup, mounts routers, CORS, /health.
Run: uvicorn main:app --reload

Loads backend/.env so SERPAPI_KEY, OPENAI_API_KEY, SECRET_KEY, etc. are available.
"""
import os
from pathlib import Path

# Load .env from backend/ so all API keys (SerpAPI, OpenAI, JWT) are available
_env_path = Path(__file__).resolve().parent / ".env"
try:
    from dotenv import load_dotenv
    load_dotenv(_env_path)
except ImportError:
    pass

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from db import Base, engine
import models  # noqa: F401 - register tables with Base.metadata
from routers import auth, jobs, apply, resume, ai, subscription, chat

# Create all tables when the app starts
Base.metadata.create_all(bind=engine)


def _ensure_users_plan_column():
    """If pathpilot.db was created by an older schema, add missing plan column."""
    with engine.connect() as conn:
        r = conn.execute(text("PRAGMA table_info(users)"))
        rows = r.fetchall()
        if not rows:
            return
        columns = [row[1] for row in rows]
        if "plan" not in columns:
            conn.execute(text("ALTER TABLE users ADD COLUMN plan VARCHAR(20) DEFAULT 'free' NOT NULL"))
            conn.commit()


_ensure_users_plan_column()

app = FastAPI(
    title="PathPilot API",
    description="AI-powered job search platform. Assisted Apply + Redirect only (no auto-submit).",
    version="1.0.0",
)


# CORS: required so the frontend (Next.js) can connect to this backend.
# Frontend runs on localhost:3000; backend on localhost:8000. Browser blocks cross-origin requests without CORS.
_CORS_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
]
_extra = (os.environ.get("CORS_ORIGINS") or "").strip()
if _extra:
    _CORS_ORIGINS = _CORS_ORIGINS + [o.strip() for o in _extra.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=600,
)

# /api prefix so frontend can call /api/auth/register, /api/jobs/search, etc.
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(jobs.router, prefix="/api/jobs", tags=["jobs"])
app.include_router(apply.router, prefix="/api/apply", tags=["apply"])
app.include_router(resume.router, prefix="/api/resume", tags=["resume"])
app.include_router(ai.router, prefix="/api/ai", tags=["ai"])
app.include_router(subscription.router, prefix="/api/subscription", tags=["subscription"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])


@app.get("/health")
def health():
    return {"status": "ok"}
