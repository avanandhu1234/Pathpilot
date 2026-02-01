"""JobMatch: user–job match score and reasons (e.g. for AI recommendations)."""
from datetime import datetime
from sqlalchemy import Column, Integer, Float, String, Text, DateTime, ForeignKey, JSON
from app.db import Base


class JobMatch(Base):
    __tablename__ = "job_matches"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    match_score = Column(Float, nullable=False)  # 0–100
    reasons = Column(JSON, default=list)  # or Text if JSON stored as string
    created_at = Column(DateTime, default=datetime.utcnow)
