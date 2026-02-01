from datetime import datetime
from pydantic import BaseModel


class ResumeCreate(BaseModel):
    resume_text: str
    version_name: str = "default"


class ResumeResponse(BaseModel):
    id: int
    user_id: int
    version_name: str | None
    created_at: datetime

    class Config:
        from_attributes = True


class ResumeImproveRequest(BaseModel):
    resume_text: str
    job_description: str | None = None
    version_name: str | None = None


class ResumeImproveResponse(BaseModel):
    improved_text: str
    keyword_suggestions: list[str] = []
    section_feedback: dict[str, str] = {}
    resume_id: int
    generations_remaining: int | None = None


class ResumeScoreRequest(BaseModel):
    resume_text: str
    job_description: str


class ResumeScoreResponse(BaseModel):
    score: float
    reasons: list[str] = []
