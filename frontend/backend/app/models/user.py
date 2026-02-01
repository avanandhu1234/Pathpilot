"""User model: id, email, hashed_password, plan, created_at (+ optional for UserResponse)."""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, JSON
from app.db import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    role = Column(String(50), default="user", nullable=False)
    plan = Column(String(20), default="free", nullable=False)  # free | pro | premium
    skills = Column(JSON, default=list)  # optional, for UserResponse
    experience_years = Column(Integer, default=0)
    career_goals = Column(Text, nullable=True)
    education = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
