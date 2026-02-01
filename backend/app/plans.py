"""
Freemium plan limits and feature gating for PathPilot.
Currency: EUR (€). Plans: free (Explorer), pro (PathPilot Pro), premium (Career Accelerator).

Where to add pricing checks:
- jobs.py: search_jobs -> Free: no AI match scoring (or basic); list_jobs / job count -> Free: max 10 saved; record_action(redirected) -> check monthly redirect limit.
- resume.py: improve -> check resume_ai_per_month limit; generations_remaining uses this.
- chat.py: send_message -> check chat_messages_per_month limit.
- dashboard.py: optional - filter or cap data by plan.
"""

from typing import TypedDict

# Plan identifiers (stored on user or mock)
PLAN_FREE = "free"
PLAN_PRO = "pro"
PLAN_PREMIUM = "premium"

# Order for "at least" checks (premium > pro > free)
PLAN_ORDER = {PLAN_FREE: 0, PLAN_PRO: 1, PLAN_PREMIUM: 2}


class PlanLimits(TypedDict):
    resume_ai_per_month: int | None  # None = unlimited
    chat_messages_per_month: int | None
    assisted_apply_redirects_per_month: int | None
    job_save_limit: int | None
    ai_job_recommendations: bool
    resume_tailoring_per_job: bool
    priority_match_scoring: bool
    skill_gap_analysis: bool
    unlimited_resume_versions: bool
    career_roadmap: bool
    ai_mock_interview: bool


PLAN_LIMITS: dict[str, PlanLimits] = {
    PLAN_FREE: {
        "resume_ai_per_month": 2,
        "chat_messages_per_month": 10,
        "assisted_apply_redirects_per_month": 10,
        "job_save_limit": 10,
        "ai_job_recommendations": False,
        "resume_tailoring_per_job": False,
        "priority_match_scoring": False,
        "skill_gap_analysis": False,
        "unlimited_resume_versions": False,
        "career_roadmap": False,
        "ai_mock_interview": False,
    },
    PLAN_PRO: {
        "resume_ai_per_month": 20,
        "chat_messages_per_month": None,  # unlimited (fair use)
        "assisted_apply_redirects_per_month": 20,
        "job_save_limit": None,  # no hard limit for pro
        "ai_job_recommendations": True,
        "resume_tailoring_per_job": True,
        "priority_match_scoring": True,
        "skill_gap_analysis": True,
        "unlimited_resume_versions": False,
        "career_roadmap": False,
        "ai_mock_interview": False,
    },
    PLAN_PREMIUM: {
        "resume_ai_per_month": None,
        "chat_messages_per_month": None,
        "assisted_apply_redirects_per_month": None,
        "job_save_limit": None,
        "ai_job_recommendations": True,
        "resume_tailoring_per_job": True,
        "priority_match_scoring": True,
        "skill_gap_analysis": True,
        "unlimited_resume_versions": True,
        "career_roadmap": True,
        "ai_mock_interview": True,
    },
}

# Mock plan store for hackathon (when db not passed). Prefer User.plan from DB.
_mock_plan_store: dict[int, str] = {}


def get_user_plan(user_id: int, db=None) -> str:
    """Return plan for user. From DB if db provided, else mock store. Default free."""
    if db is not None:
        from app.models import User
        user = db.query(User).filter(User.id == user_id).first()
        return user.plan if user else PLAN_FREE
    return _mock_plan_store.get(user_id, PLAN_FREE)


def set_user_plan(user_id: int, plan: str, db=None) -> None:
    """Set plan: update DB if db provided, else mock store (hackathon)."""
    if db is not None:
        from app.models import User
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            user.plan = plan
            db.commit()
        return
    _mock_plan_store[user_id] = plan


PLAN_DISPLAY = {
    PLAN_FREE: {
        "name": "Explorer",
        "price_monthly_cents": 0,
        "price_yearly_cents": 0,
        "currency": "EUR",
    },
    PLAN_PRO: {
        "name": "PathPilot Pro",
        "price_monthly_cents": 1200,  # €12
        "price_yearly_cents": 9900,   # €99
        "currency": "EUR",
    },
    PLAN_PREMIUM: {
        "name": "Career Accelerator",
        "price_monthly_cents": 2900,  # €29
        "price_yearly_cents": None,
        "currency": "EUR",
    },
}


def get_plan_limits(plan: str) -> PlanLimits:
    """Return limits for a plan. Default to free if unknown."""
    return PLAN_LIMITS.get(plan, PLAN_LIMITS[PLAN_FREE]).copy()


def has_plan_at_least(user_plan: str, required: str) -> bool:
    """True if user's plan is at least the required tier (e.g. pro >= free)."""
    return PLAN_ORDER.get(user_plan, 0) >= PLAN_ORDER.get(required, 0)


def check_resume_ai_limit(plan: str, used_this_month: int) -> tuple[bool, int | None]:
    """Returns (allowed, remaining). remaining is None if unlimited."""
    limits = get_plan_limits(plan)
    cap = limits["resume_ai_per_month"]
    if cap is None:
        return True, None
    remaining = max(0, cap - used_this_month)
    return remaining > 0, remaining


def check_chat_messages_limit(plan: str, used_this_month: int) -> tuple[bool, int | None]:
    limits = get_plan_limits(plan)
    cap = limits["chat_messages_per_month"]
    if cap is None:
        return True, None
    remaining = max(0, cap - used_this_month)
    return remaining > 0, remaining


def check_redirect_limit(plan: str, used_this_month: int) -> tuple[bool, int | None]:
    limits = get_plan_limits(plan)
    cap = limits["assisted_apply_redirects_per_month"]
    if cap is None:
        return True, None
    remaining = max(0, cap - used_this_month)
    return remaining > 0, remaining


def check_job_save_limit(plan: str, current_saved: int) -> tuple[bool, int | None]:
    limits = get_plan_limits(plan)
    cap = limits["job_save_limit"]
    if cap is None:
        return True, None
    remaining = max(0, cap - current_saved)
    return current_saved < cap, remaining
