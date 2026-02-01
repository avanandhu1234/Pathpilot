from pydantic import BaseModel


class AIUsageIncrement(BaseModel):
    feature: str  # resume_ai / career_chat


class AIUsageStatus(BaseModel):
    feature: str
    count: int
    month: str
