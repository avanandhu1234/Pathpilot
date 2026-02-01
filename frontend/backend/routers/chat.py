"""
Career guidance: single-shot "get guidance for target role".
Frontend Career Guidance page calls POST /api/chat/guidance with { target_role }.
Uses OpenAI via services/career_guidance when OPENAI_API_KEY is set.
"""
from fastapi import APIRouter
from pydantic import BaseModel

from services.career_guidance import get_guidance

router = APIRouter()


class GuidanceRequest(BaseModel):
    target_role: str


class GuidanceResponse(BaseModel):
    skills_to_learn: list[str]
    tools_technologies: list[str]
    certifications: list[str]
    learning_roadmap: list[str]


@router.post("/guidance", response_model=GuidanceResponse)
def career_guidance(body: GuidanceRequest):
    """
    Get career guidance for a target role: skills, tools, certifications, learning roadmap.
    Uses OpenAI when OPENAI_API_KEY is set; otherwise returns default guidance.
    """
    result = get_guidance(body.target_role.strip() or "Professional")
    return GuidanceResponse(
        skills_to_learn=result["skills_to_learn"],
        tools_technologies=result["tools_technologies"],
        certifications=result["certifications"],
        learning_roadmap=result["learning_roadmap"],
    )
