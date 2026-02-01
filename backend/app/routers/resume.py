"""Resume: upload/save, improve. Uses Resume model and AIUsage for limits."""
from datetime import date
from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session

from app.db import get_db
from app.auth import require_user
from app.models import User, Resume, AIUsage
from app.schemas import ResumeImproveRequest, ResumeImproveResponse
from app.plan_checks import check_resume_ai_allowed
from app.plans import get_user_plan, check_resume_ai_limit
from app.services import resume_ai as resume_ai_service

router = APIRouter(prefix="/api/resume", tags=["resume"])


@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(require_user),
):
    """Save uploaded resume (resume_text from file content, version_name from filename)."""
    content = ""
    try:
        content = (await file.read()).decode("utf-8", errors="replace")
    except Exception:
        pass
    rv = Resume(
        user_id=user.id,
        resume_text=content[:50000] if content else None,
        version_name=file.filename or "resume.txt",
    )
    db.add(rv)
    db.commit()
    return {"ok": True, "filename": file.filename}


@router.post("/improve", response_model=ResumeImproveResponse)
def improve(
    body: ResumeImproveRequest,
    db: Session = Depends(get_db),
    user: User = Depends(require_user),
):
    """Improve resume with AI. Enforces plan limit (resume_ai_per_month) via AIUsage."""
    check_resume_ai_allowed(db, user.id)

    result = resume_ai_service.improve_resume(body.resume_text, body.job_description)
    plan = get_user_plan(user.id, db)
    period = date.today().strftime("%Y-%m")

    # Increment AIUsage for resume_ai this month
    row = db.query(AIUsage).filter(
        AIUsage.user_id == user.id,
        AIUsage.feature == "resume_ai",
        AIUsage.period == period,
    ).first()
    if not row:
        row = AIUsage(user_id=user.id, feature="resume_ai", usage_count=0, period=period)
        db.add(row)
    row.usage_count = (row.usage_count or 0) + 1
    db.commit()

    from app.plan_checks import _get_resume_ai_used
    used = _get_resume_ai_used(db, user.id)
    _, remaining = check_resume_ai_limit(plan, used)
    generations_remaining = remaining if remaining is not None else 999

    section_feedback_raw = result.get("section_feedback") or {}
    section_feedback = {str(k): str(v) for k, v in section_feedback_raw.items()}
    return ResumeImproveResponse(
        improved_text=result["improved_text"],
        keyword_suggestions=result.get("keyword_suggestions") or [],
        section_feedback=section_feedback,
        generations_remaining=generations_remaining,
    )
