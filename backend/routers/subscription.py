"""Subscription: /me (plan + usage), mock-set-plan for dev."""
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from db import get_db
from models.user import User
from models.ai_usage import AIUsage
from models.application import Application
from schemas.subscription import SubscriptionMeResponse, SubscriptionUsage, MockSetPlanBody
from routers.auth import get_current_user

router = APIRouter()

PLAN_LIMITS = {
    "free": {"resume_ai": 2, "chat": 10, "redirects": 10, "jobs_saved": 10},
    "pro": {"resume_ai": 20, "chat": None, "redirects": 20, "jobs_saved": None},
    "premium": {"resume_ai": None, "chat": None, "redirects": None, "jobs_saved": None},
}

PLAN_DISPLAY = {"free": "Explorer", "pro": "PathPilot Pro", "premium": "Career Accelerator"}
PLAN_PRICE = {"free": (0, None), "pro": (1200, 9900), "premium": (2900, None)}  # cents


@router.get("/me", response_model=SubscriptionMeResponse)
def subscription_me(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Return current plan and usage for the frontend pricing page."""
    plan = (user.plan or "free").lower()
    if plan not in PLAN_LIMITS:
        plan = "free"
    limits = PLAN_LIMITS[plan]
    month = datetime.utcnow().strftime("%Y-%m")

    resume_ai_used = 0
    chat_used = 0
    for r in db.query(AIUsage).filter(AIUsage.user_id == user.id, AIUsage.month == month).all():
        if r.feature == "resume_ai":
            resume_ai_used = r.count or 0
        elif r.feature == "career_chat":
            chat_used = r.count or 0

    redirects_used = (
        db.query(func.count(Application.id))
        .filter(Application.user_id == user.id, Application.status == "redirected")
        .scalar()
        or 0
    )
    jobs_saved_count = db.query(func.count(Application.id)).filter(Application.user_id == user.id).scalar() or 0

    price_m, price_y = PLAN_PRICE.get(plan, (0, None))

    return SubscriptionMeResponse(
        plan=plan,
        plan_display_name=PLAN_DISPLAY.get(plan, plan),
        price_monthly_cents=price_m,
        price_yearly_cents=price_y,
        currency="USD",
        usage=SubscriptionUsage(
            resume_ai_used=resume_ai_used,
            resume_ai_limit=limits["resume_ai"],
            chat_messages_used=chat_used,
            chat_messages_limit=limits["chat"],
            redirects_used=redirects_used,
            redirects_limit=limits["redirects"],
            jobs_saved=jobs_saved_count,
            jobs_saved_limit=limits["jobs_saved"],
        ),
    )


@router.post("/mock-set-plan")
def subscription_mock_set_plan(
    body: MockSetPlanBody,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Dev-only: set user plan (free / pro / premium)."""
    plan = (body.plan or "free").lower()
    if plan not in ("free", "pro", "premium"):
        raise HTTPException(status_code=400, detail="Invalid plan")
    user.plan = plan
    db.commit()
    return {"ok": True, "plan": plan}
