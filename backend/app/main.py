"""PathPilot API - FastAPI app."""
import logging
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db import engine, Base, get_db
from app import models  # noqa: F401 - register all models with Base.metadata
from app.routers import auth, jobs, resume, chat, dashboard, subscription
from app.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create all tables on startup (SQLite / PostgreSQL)
Base.metadata.create_all(bind=engine)

CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
]


def preflight_app(app):
    """ASGI wrapper: handle OPTIONS with 200 at the wire level (before Starlette)."""

    async def asgi(scope, receive, send):
        if scope["type"] == "http" and scope["method"] == "OPTIONS":
            origin_b = next((v for k, v in scope.get("headers", []) if k == b"origin"), b"")
            origin = origin_b.decode("utf-8", errors="replace")
            allow_origin = origin if origin in CORS_ORIGINS else CORS_ORIGINS[0]
            await send({
                "type": "http.response.start",
                "status": 200,
                "headers": [
                    (b"access-control-allow-origin", allow_origin.encode()),
                    (b"access-control-allow-methods", b"GET, POST, PUT, PATCH, DELETE, OPTIONS"),
                    (b"access-control-allow-headers", b"*"),
                    (b"access-control-allow-credentials", b"true"),
                    (b"access-control-max-age", b"86400"),
                ],
            })
            await send({"type": "http.response.body", "body": b""})
            return
        await app(scope, receive, send)

    return asgi


app = FastAPI(
    title="PathPilot API",
    description="AI-powered job search and career platform.",
    version="1.0.0",
)


@app.on_event("startup")
def startup():
    """Log whether .env API keys are loaded (no secrets printed)."""
    env_path = Path(__file__).resolve().parent.parent / ".env"
    logger.info(" .env path: %s (exists: %s)", env_path, env_path.exists())
    logger.info(
        " Config: OPENAI_API_KEY=%s, SERPAPI_KEY=%s",
        "set" if (settings.openai_api_key and settings.openai_api_key.strip()) else "not set",
        "set" if (settings.serpapi_key and settings.serpapi_key.strip()) else "not set",
    )


app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

app.include_router(auth.router)
app.include_router(jobs.router)
app.include_router(resume.router)
app.include_router(chat.router)
app.include_router(dashboard.router)
app.include_router(subscription.router)


@app.get("/")
def root():
    return {"app": "PathPilot", "docs": "/docs", "health": "ok"}


@app.get("/health")
def health():
    return {"status": "ok"}


# Handle OPTIONS (CORS preflight) at ASGI level so it always returns 200
app = preflight_app(app)
