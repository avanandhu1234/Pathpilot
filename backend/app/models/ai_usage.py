"""AIUsage: track usage per user/feature/period for pricing limits."""
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from app.db import Base


class AIUsage(Base):
    __tablename__ = "ai_usage"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    feature = Column(String(32), nullable=False)  # resume_ai | career_chat
    usage_count = Column(Integer, default=0, nullable=False)
    period = Column(String(16), nullable=False)  # monthly (e.g. "2025-01")
    created_at = Column(DateTime, default=datetime.utcnow)
