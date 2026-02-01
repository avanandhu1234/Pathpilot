from sqlalchemy import Column, Integer, String, ForeignKey

from db import Base


class AIUsage(Base):
    __tablename__ = "ai_usage"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    feature = Column(String(32), nullable=False)  # resume_ai / career_chat
    count = Column(Integer, default=0, nullable=False)
    month = Column(String(7), nullable=False)  # e.g. 2025-01
