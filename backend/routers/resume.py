"""Resume: save, list, upload, improve (AI), score, generate, evaluate. Enforce usage limits."""
import json
from datetime import datetime
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from db import get_db
from models.resume import Resume
from models.ai_usage import AIUsage
from schemas.resume import (
    ResumeCreate,
    ResumeResponse,
    ResumeImproveRequest,
    ResumeImproveResponse,
    ResumeScoreRequest,
    ResumeScoreResponse,
    ResumeGenerateRequest,
    ResumeGenerateResponse,
    ResumeEvaluateRequest,
    ResumeEvaluateResponse,
    ResumeEvaluateCategory,
)
from routers.auth import get_current_user
from models.user import User
from services.resume_ai import improve_resume, generate_resume as ai_generate_resume, evaluate_resume as ai_evaluate_resume
from services.job_match import compute_match

router = APIRouter()
RESUME_AI_LIMITS = {"free": 2, "pro": 20, "premium": None}


@router.post("/save", response_model=ResumeResponse)
def resume_save(body: ResumeCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Save a resume for the current user."""
    r = Resume(
        user_id=user.id,
        resume_text=body.resume_text,
        version_name=body.version_name,
    )
    db.add(r)
    db.commit()
    db.refresh(r)
    return ResumeResponse.model_validate(r)


@router.get("/list", response_model=list[ResumeResponse])
def resume_list(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """List resumes for the current user."""
    resumes = db.query(Resume).filter(Resume.user_id == user.id).order_by(Resume.created_at.desc()).all()
    return [ResumeResponse.model_validate(r) for r in resumes]


@router.post("/upload")
async def resume_upload(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Accept file upload; extract text and save as resume."""
    content = await file.read()
    try:
        text = content.decode("utf-8", errors="replace")
    except Exception:
        text = "(binary file; paste resume text in Resume Builder to save)"
    r = Resume(
        user_id=user.id,
        resume_text=text[:50_000] if text else "",
        version_name=file.filename or "uploaded",
    )
    db.add(r)
    db.commit()
    db.refresh(r)
    return {"ok": True, "filename": file.filename}


def _resume_ai_usage(db: Session, user_id: int) -> int:
    month = datetime.utcnow().strftime("%Y-%m")
    row = db.query(AIUsage).filter(
        AIUsage.user_id == user_id,
        AIUsage.feature == "resume_ai",
        AIUsage.month == month,
    ).first()
    return (row.count or 0) if row else 0


@router.post("/improve", response_model=ResumeImproveResponse)
def resume_improve(
    body: ResumeImproveRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """
    Resume Builder: accept resume text + optional job description, generate improved resume via AI,
    save as new version, enforce usage limits.
    """
    limit = RESUME_AI_LIMITS.get((user.plan or "free").lower(), 2)
    used = _resume_ai_usage(db, user.id)
    if limit is not None and used >= limit:
        raise HTTPException(
            status_code=403,
            detail={"code": "plan_limit", "message": f"Resume AI limit reached ({limit}/month). Upgrade for more."},
        )

    try:
        result = improve_resume(body.resume_text, body.job_description)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Resume improve failed: {e!s}. Ensure OPENAI_API_KEY is set in backend/.env.",
        )
    version_name = body.version_name or f"improved_{datetime.utcnow().strftime('%Y%m%d_%H%M')}"
    r = Resume(
        user_id=user.id,
        resume_text=result["improved_text"][:50_000],
        version_name=version_name,
    )
    db.add(r)
    db.commit()
    db.refresh(r)

    month = datetime.utcnow().strftime("%Y-%m")
    usage_row = (
        db.query(AIUsage)
        .filter(AIUsage.user_id == user.id, AIUsage.feature == "resume_ai", AIUsage.month == month)
        .first()
    )
    if not usage_row:
        usage_row = AIUsage(user_id=user.id, feature="resume_ai", count=0, month=month)
        db.add(usage_row)
    usage_row.count = (usage_row.count or 0) + 1
    db.commit()

    remaining = None if limit is None else max(0, limit - usage_row.count)

    return ResumeImproveResponse(
        improved_text=result["improved_text"],
        keyword_suggestions=result["keyword_suggestions"],
        section_feedback=result["section_feedback"],
        resume_id=r.id,
        generations_remaining=remaining,
    )


@router.post("/score", response_model=ResumeScoreResponse)
def resume_score(
    body: ResumeScoreRequest,
    user: User = Depends(get_current_user),
):
    """Score resume relevance vs job description. No usage limit."""
    score, reasons = compute_match(
        body.resume_text,
        "Role",
        body.job_description,
    )
    return ResumeScoreResponse(score=score, reasons=reasons)


@router.post("/generate", response_model=ResumeGenerateResponse)
def resume_generate(
    body: ResumeGenerateRequest,
    user: User = Depends(get_current_user),
):
    """Generate full resume text from user-provided sections using OpenAI."""
    try:
        text = ai_generate_resume(
            full_name=body.full_name or "",
            email=body.email or "",
            phone=body.phone or "",
            location=body.location or "",
            summary=body.summary or "",
            experience=body.experience or "",
            education=body.education or "",
            skills=body.skills or "",
        )
        return ResumeGenerateResponse(resume_text=text)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Resume generation failed: {e!s}. Ensure OPENAI_API_KEY is set in backend/.env.",
        )


@router.post("/evaluate", response_model=ResumeEvaluateResponse)
def resume_evaluate(
    body: ResumeEvaluateRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Evaluate resume with OpenAI; optionally save resume and score to DB for dashboard."""
    try:
        result = ai_evaluate_resume(body.resume_text, body.job_description)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Resume evaluation failed: {e!s}. Ensure OPENAI_API_KEY is set in backend/.env.",
        )
    categories = [
        ResumeEvaluateCategory(name=c.get("name", ""), score=int(c.get("score", 0)), status=c.get("status", "good"))
        for c in result.get("categories", [])
    ]
    resume_id = None
    if body.save and body.resume_text.strip():
        score_details = json.dumps({
            "categories": result.get("categories", []),
            "feedback": result.get("feedback", []),
        })
        r = Resume(
            user_id=user.id,
            resume_text=body.resume_text[:50_000],
            version_name=f"evaluated_{datetime.utcnow().strftime('%Y%m%d_%H%M')}",
            overall_score=float(result.get("overall_score", 0)),
            score_details=score_details,
            evaluated_at=datetime.utcnow(),
        )
        db.add(r)
        db.commit()
        db.refresh(r)
        resume_id = r.id
    return ResumeEvaluateResponse(
        overall_score=result.get("overall_score", 0),
        categories=categories,
        feedback=result.get("feedback", []),
        resume_id=resume_id,
    )
