"""
Application: user actions on jobs. LEGAL: viewed / shortlisted / redirected only.
We NEVER auto-submit; user submits on external job portal.
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey

from db import Base


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    status = Column(String(32), nullable=False)  # viewed / shortlisted / redirected
    redirected_at = Column(DateTime, nullable=True)  # set when status = redirected
    created_at = Column(DateTime, default=datetime.utcnow)
