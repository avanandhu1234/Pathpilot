"""
Feature gating: raise HTTPException 403 when plan limit is reached.
Use in routers before performing the action.

Where to add calls:
- resume.py improve(): check_resume_ai_allowed(db, user_id)
- chat.py send_message(): check_chat_messages_allowed(db, user_id)
- jobs.py record_action(redirected): check_redirect_allowed(db, user_id)
- jobs.py search_jobs(): if free plan, skip AI match scoring or return basic scores
- jobs.py list_jobs / job count: check_job_save_limit before storing more than 10 for free
"""

from datetime import date
from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.plans import (
    get_plan_limits,
    check_resume_ai_limit,
    check_chat_messages_limit,
    check_redirect_limit,
    check_job_save_limit,
    has_plan_at_least,
    PLAN_PRO,
)
from app.plans import get_user_plan

UPGRADE_MESSAGE = "Upgrade your plan to continue. Visit the Pricing page."


def _get_resume_ai_used(db: Session, user_id: int) -> int:
    try:
        from app.models import AIUsage
        period = date.today().strftime("%Y-%m")
        r = db.query(func.sum(AIUsage.usage_count)).filter(
            AIUsage.user_id == user_id,
            AIUsage.feature == "resume_ai",
            AIUsage.period == period,
        ).scalar()
        return int(r or 0)
    except Exception:
        return 0


def _get_chat_messages_used(db: Session, user_id: int) -> int:
    try:
        from app.models import AIUsage
        period = date.today().strftime("%Y-%m")
        r = db.query(func.sum(AIUsage.usage_count)).filter(
            AIUsage.user_id == user_id,
            AIUsage.feature == "career_chat",
            AIUsage.period == period,
        ).scalar()
        return int(r or 0)
    except Exception:
        return 0


def _get_redirects_used(db: Session, user_id: int) -> int:
    try:
        from app.models import Application
        return db.query(Application).filter(
            Application.user_id == user_id,
            Application.status == "redirected",
        ).count()
    except Exception:
        return 0


def _get_jobs_saved(db: Session, user_id: int) -> int:
    try:
        from app.models import Application
        return db.query(Application).filter(Application.user_id == user_id).count()
    except Exception:
        return 0


def check_resume_ai_allowed(db: Session, user_id: int) -> None:
    plan = get_user_plan(user_id, db)
    used = _get_resume_ai_used(db, user_id)
    allowed, remaining = check_resume_ai_limit(plan, used)
    if not allowed:
        raise HTTPException(
            status_code=403,
            detail={
                "code": "plan_limit",
                "message": "Resume AI monthly limit reached. " + UPGRADE_MESSAGE,
                "upgrade_url": "/pricing",
            },
        )


def check_chat_messages_allowed(db: Session, user_id: int) -> None:
    plan = get_user_plan(user_id, db)
    used = _get_chat_messages_used(db, user_id)
    allowed, remaining = check_chat_messages_limit(plan, used)
    if not allowed:
        raise HTTPException(
            status_code=403,
            detail={
                "code": "plan_limit",
                "message": "Career chat monthly limit reached. " + UPGRADE_MESSAGE,
                "upgrade_url": "/pricing",
            },
        )


def check_redirect_allowed(db: Session, user_id: int) -> None:
    plan = get_user_plan(user_id, db)
    used = _get_redirects_used(db, user_id)
    allowed, remaining = check_redirect_limit(plan, used)
    if not allowed:
        raise HTTPException(
            status_code=403,
            detail={
                "code": "plan_limit",
                "message": "Assisted Apply redirect limit reached. " + UPGRADE_MESSAGE,
                "upgrade_url": "/pricing",
            },
        )


def check_job_save_allowed(db: Session, user_id: int) -> None:
    plan = get_user_plan(user_id, db)
    current = _get_jobs_saved(db, user_id)
    allowed, remaining = check_job_save_limit(plan, current)
    if not allowed:
        raise HTTPException(
            status_code=403,
            detail={
                "code": "plan_limit",
                "message": "Job save limit reached. " + UPGRADE_MESSAGE,
                "upgrade_url": "/pricing",
            },
        )


def require_ai_job_recommendations(user_id: int, db: Session | None = None) -> None:
    """Call before applying AI match scoring. Free plan gets no AI recommendations."""
    plan = get_user_plan(user_id, db)
    if not has_plan_at_least(plan, PLAN_PRO):
        raise HTTPException(
            status_code=403,
            detail={
                "code": "feature_locked",
                "message": "AI job recommendations are available on Pro and above. " + UPGRADE_MESSAGE,
                "upgrade_url": "/pricing",
            },
        )
