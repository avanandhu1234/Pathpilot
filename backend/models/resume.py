from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float

from db import Base


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    resume_text = Column(Text, nullable=True)
    version_name = Column(String(255), default="default", nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    # OpenAI evaluation: stored so dashboard can show latest score
    overall_score = Column(Float, nullable=True)
    score_details = Column(Text, nullable=True)  # JSON: categories, feedback
    evaluated_at = Column(DateTime, nullable=True)
