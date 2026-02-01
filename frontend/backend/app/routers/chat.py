"""Chat: career guidance (target role -> skills, tools, certifications, roadmap)."""
from datetime import date
from fastapi import APIRouter, Depends

from app.auth import optional_user
from app.db import get_db
from app.models import User, AIUsage
from app.schemas import CareerGuidanceRequest, CareerGuidanceResponse
from app.services.career_chat import get_guidance
from app.plan_checks import check_chat_messages_allowed

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.post("/guidance", response_model=CareerGuidanceResponse)
def guidance(
    body: CareerGuidanceRequest,
    user: User | None = Depends(optional_user),
    db=Depends(get_db),
):
    """Return skills, tools, certifications, learning roadmap for target role. Works with or without login. When logged in, enforces plan limit and tracks usage."""
    if user is not None:
        check_chat_messages_allowed(db, user.id)
    data = get_guidance(body.target_role)
    if user is not None and db is not None:
        period = date.today().strftime("%Y-%m")
        row = db.query(AIUsage).filter(
            AIUsage.user_id == user.id,
            AIUsage.feature == "career_chat",
            AIUsage.period == period,
        ).first()
        if not row:
            row = AIUsage(user_id=user.id, feature="career_chat", usage_count=1, period=period)
            db.add(row)
        else:
            row.usage_count = (row.usage_count or 0) + 1
        try:
            db.commit()
        except Exception:
            db.rollback()
            raise
    return CareerGuidanceResponse(
        skills_to_learn=data.get("skills_to_learn") or [],
        tools_technologies=data.get("tools_technologies") or [],
        certifications=data.get("certifications") or [],
        learning_roadmap=data.get("learning_roadmap") or [],
    )
