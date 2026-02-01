import json
from datetime import datetime
from pydantic import BaseModel, field_validator


class ResumeCreate(BaseModel):
    resume_text: str
    version_name: str = "default"


class ResumeResponse(BaseModel):
    id: int
    user_id: int
    version_name: str | None
    created_at: datetime
    overall_score: float | None = None
    score_details: dict | list | None = None
    evaluated_at: datetime | None = None

    @field_validator("score_details", mode="before")
    @classmethod
    def parse_score_details(cls, v):
        if v is None or isinstance(v, (dict, list)):
            return v
        if isinstance(v, str) and v.strip():
            try:
                return json.loads(v)
            except Exception:
                return None
        return None

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


class ResumeGenerateRequest(BaseModel):
    full_name: str = ""
    email: str = ""
    phone: str = ""
    location: str = ""
    summary: str = ""
    experience: str = ""
    education: str = ""
    skills: str = ""


class ResumeGenerateResponse(BaseModel):
    resume_text: str


class ResumeEvaluateRequest(BaseModel):
    resume_text: str
    job_description: str | None = None
    save: bool = True


class ResumeEvaluateCategory(BaseModel):
    name: str
    score: int
    status: str


class ResumeEvaluateResponse(BaseModel):
    overall_score: int
    categories: list[ResumeEvaluateCategory]
    feedback: list[str] = []
    resume_id: int | None = None
