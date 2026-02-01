"""Pydantic schemas for API."""
from pydantic import BaseModel, EmailStr, field_validator


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str | None = None

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str | None
    role: str
    plan: str = "free"  # free | pro | premium
    skills: list[str] = []
    experience_years: int = 0
    career_goals: str | None = None
    education: str | None = None

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class UserUpdate(BaseModel):
    full_name: str | None = None
    skills: list[str] | None = None
    experience_years: int | None = None
    career_goals: str | None = None
    education: str | None = None


class JobSearchParams(BaseModel):
    job_title: str
    location: str = ""
    remote: bool = False


class JobResponse(BaseModel):
    id: int
    company_name: str
    job_title: str
    location: str | None
    description: str | None
    application_url: str
    company_logo_url: str | None
    match_score: float
    matched_skills: list[str]
    posted_at: str | None

    class Config:
        from_attributes = True


class JobActionCreate(BaseModel):
    job_id: int
    action: str


class CoverLetterRequest(BaseModel):
    job_id: int


class ResumeImproveRequest(BaseModel):
    resume_text: str
    job_description: str | None = None


class ResumeImproveResponse(BaseModel):
    improved_text: str
    keyword_suggestions: list[str]
    section_feedback: dict
    generations_remaining: int


class ChatRequest(BaseModel):
    message: str
    session_id: int | None = None


class ChatResponse(BaseModel):
    session_id: int
    message: str
    full_messages: list


class CareerGuidanceRequest(BaseModel):
    target_role: str


class CareerGuidanceResponse(BaseModel):
    skills_to_learn: list[str]
    tools_technologies: list[str]
    certifications: list[str]
    learning_roadmap: list[str]
