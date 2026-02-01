"""
Database setup for PathPilot.
SQLite engine, session, base. Tables auto-create on first use (no manual migrations).
Reads DATABASE_URL from environment. For Vercel, use /tmp or persistent storage.
"""
import os
from pathlib import Path

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./pathpilot.db")
# Vercel serverless: writable dir is /tmp; persist path when not in serverless
if "VERCEL" in os.environ and DATABASE_URL.startswith("sqlite"):
    # Use /tmp so DB exists for the duration of the function (no persistence across invocations)
    DATABASE_URL = "sqlite:////tmp/pathpilot.db"
else:
    # Ensure directory exists for relative path
    if DATABASE_URL.startswith("sqlite:///./"):
        db_path = Path(DATABASE_URL.replace("sqlite:///./", ""))
        db_path.parent.mkdir(parents=True, exist_ok=True)

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    echo=False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

_tables_created = False


def ensure_tables():
    """Create all tables if missing (auto-init, no manual migration)."""
    global _tables_created
    if _tables_created:
        return
    try:
        import models  # noqa: F401 - register models with Base
        Base.metadata.create_all(bind=engine)
        # Migration: add plan column to users if missing
        with engine.connect() as conn:
            r = conn.execute(text("PRAGMA table_info(users)"))
            rows = r.fetchall()
            if rows:
                columns = [row[1] for row in rows]
                if "plan" not in columns:
                    conn.execute(text("ALTER TABLE users ADD COLUMN plan VARCHAR(20) DEFAULT 'free' NOT NULL"))
                    conn.commit()
            r = conn.execute(text("PRAGMA table_info(resumes)"))
            rows = r.fetchall()
            if rows:
                columns = [row[1] for row in rows]
                if "overall_score" not in columns:
                    conn.execute(text("ALTER TABLE resumes ADD COLUMN overall_score REAL"))
                    conn.commit()
                if "score_details" not in columns:
                    conn.execute(text("ALTER TABLE resumes ADD COLUMN score_details TEXT"))
                    conn.commit()
                if "evaluated_at" not in columns:
                    conn.execute(text("ALTER TABLE resumes ADD COLUMN evaluated_at DATETIME"))
                    conn.commit()
        _tables_created = True
    except Exception:
        pass


def get_db_session():
    """Return a DB session (for serverless). Call ensure_tables(); use session; then session.close()."""
    ensure_tables()
    return SessionLocal()


def get_db():
    """Dependency that yields a DB session; close after request. Calls ensure_tables on first use."""
    ensure_tables()
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
