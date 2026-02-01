"""
Subscription and plan endpoints. Mock plan state for hackathon (no payment gateway).
GET /api/subscription/me -> plan, usage. POST /api/subscription/mock-set-plan -> set plan for demo.
"""

from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel

from app.db import get_db
from app.auth import require_user
from app.plans import (
    PLAN_FREE,
    PLAN_PRO,
    PLAN_PREMIUM,
    get_plan_limits,
    PLAN_DISPLAY,
    get_user_plan,
    set_user_plan,
)

router = APIRouter(prefix="/api/subscription", tags=["subscription"])


class MockSetPlanBody(BaseModel):
    plan: str  # "free" | "pro" | "premium"


class UsageResponse(BaseModel):
    resume_ai_used: int
    resume_ai_limit: int | None
    chat_messages_used: int
    chat_messages_limit: int | None
    redirects_used: int
    redirects_limit: int | None
    jobs_saved: int
    jobs_saved_limit: int | None


class SubscriptionMeResponse(BaseModel):
    plan: str
    plan_display_name: str
    price_monthly_cents: int | None
    price_yearly_cents: int | None
    currency: str
    usage: UsageResponse


@router.get("/me", response_model=SubscriptionMeResponse)
def get_my_subscription(
    db: Session = Depends(get_db),
    user=Depends(require_user),
):
    """Return current plan and usage for the authenticated user."""
    plan = get_user_plan(user.id, db)
    display = PLAN_DISPLAY.get(plan, PLAN_DISPLAY[PLAN_FREE])
    limits = get_plan_limits(plan)

    # Usage from DB: AIUsage (resume_ai, career_chat), Application (redirects, jobs)
    resume_ai_used = 0
    chat_messages_used = 0
    redirects_used = 0
    jobs_saved = 0
    try:
        from app.models import AIUsage, Application
        period = date.today().strftime("%Y-%m")
        r = db.query(func.sum(AIUsage.usage_count)).filter(
            AIUsage.user_id == user.id,
            AIUsage.feature == "resume_ai",
            AIUsage.period == period,
        ).scalar()
        resume_ai_used = int(r or 0)
        c = db.query(func.sum(AIUsage.usage_count)).filter(
            AIUsage.user_id == user.id,
            AIUsage.feature == "career_chat",
            AIUsage.period == period,
        ).scalar()
        chat_messages_used = int(c or 0)
        redirects_used = db.query(Application).filter(
            Application.user_id == user.id,
            Application.status == "redirected",
        ).count()
        jobs_saved = db.query(Application).filter(Application.user_id == user.id).count()
    except Exception:
        pass

    return SubscriptionMeResponse(
        plan=plan,
        plan_display_name=display["name"],
        price_monthly_cents=display.get("price_monthly_cents"),
        price_yearly_cents=display.get("price_yearly_cents"),
        currency=display.get("currency", "EUR"),
        usage=UsageResponse(
            resume_ai_used=resume_ai_used,
            resume_ai_limit=limits.get("resume_ai_per_month"),
            chat_messages_used=chat_messages_used,
            chat_messages_limit=limits.get("chat_messages_per_month"),
            redirects_used=redirects_used,
            redirects_limit=limits.get("assisted_apply_redirects_per_month"),
            jobs_saved=jobs_saved,
            jobs_saved_limit=limits.get("job_save_limit"),
        ),
    )


@router.post("/mock-set-plan")
def mock_set_plan(
    body: MockSetPlanBody,
    db: Session = Depends(get_db),
    user=Depends(require_user),
):
    """[Hackathon] Set plan for current user without payment. Remove in production."""
    if body.plan not in (PLAN_FREE, PLAN_PRO, PLAN_PREMIUM):
        raise HTTPException(status_code=400, detail="Invalid plan")
    set_user_plan(user.id, body.plan, db)
    return {"ok": True, "plan": body.plan}


# Optional: list plans for pricing page
@router.get("/plans")
def list_plans():
    """Return plan definitions for pricing page (no auth required)."""
    return {
        "plans": [
            {
                "id": PLAN_FREE,
                **PLAN_DISPLAY[PLAN_FREE],
                "limits": get_plan_limits(PLAN_FREE),
            },
            {
                "id": PLAN_PRO,
                **PLAN_DISPLAY[PLAN_PRO],
                "limits": get_plan_limits(PLAN_PRO),
            },
            {
                "id": PLAN_PREMIUM,
                **PLAN_DISPLAY[PLAN_PREMIUM],
                "limits": get_plan_limits(PLAN_PREMIUM),
            },
        ],
    }
