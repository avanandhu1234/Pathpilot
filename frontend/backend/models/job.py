from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime

from db import Base


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    company = Column(String(255), nullable=False)
    location = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    apply_url = Column(String(1024), nullable=True)
    source = Column(String(64), default="serpapi", nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
