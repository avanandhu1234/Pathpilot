"""SearchSession and JobMatch for same-day job search reuse (no re-scrape)."""
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey

from db import Base


class SearchSession(Base):
    __tablename__ = "search_sessions"

    id = Column(Integer, primary_key=True, index=True)
    query = Column(String(255), nullable=False)
    location = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class JobMatch(Base):
    __tablename__ = "job_matches"

    id = Column(Integer, primary_key=True, index=True)
    search_session_id = Column(Integer, ForeignKey("search_sessions.id"), nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
