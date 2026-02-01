"""
Assisted Apply (LEGAL ONLY).
- NO auto application, NO form submission.
- Only redirect users to official job URL.
- Log status: viewed / shortlisted / redirected.
"""
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from db import get_db
from models.application import Application
from models.job import Job
from schemas.application import ApplicationRedirectCreate, ApplicationStatusUpdate, ApplicationResponse
from routers.auth import get_current_user
from models.user import User

router = APIRouter()
ALLOWED_STATUSES = {"viewed", "shortlisted", "redirected"}


def _get_or_create_application(db: Session, user_id: int, job_id: int) -> Application | None:
    app = db.query(Application).filter(
        Application.user_id == user_id,
        Application.job_id == job_id,
    ).first()
    return app


@router.post("/redirect")
def apply_redirect(
    body: ApplicationRedirectCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """
    Record that the user was redirected to the external job portal.
    LEGAL: We ONLY store status=redirected. We NEVER submit applications.
    Frontend opens job.apply_url in a new tab; user applies on the official site.
    """
    job = db.query(Job).filter(Job.id == body.job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    app = _get_or_create_application(db, user.id, body.job_id)
    if app:
        app.status = "redirected"
        app.redirected_at = datetime.utcnow()
        db.commit()
    else:
        app = Application(
            user_id=user.id,
            job_id=body.job_id,
            status="redirected",
            redirected_at=datetime.utcnow(),
        )
        db.add(app)
        db.commit()
    return {
        "ok": True,
        "message": "Redirect recorded. User applies on external portal.",
        "apply_url": job.apply_url,
    }


@router.post("/status")
def apply_status(
    body: ApplicationStatusUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """
    Log status: viewed / shortlisted / redirected.
    LEGAL: No auto-apply. Only track; frontend redirects to apply_url when status=redirected.
    """
    if body.status not in ALLOWED_STATUSES:
        raise HTTPException(status_code=400, detail=f"status must be one of {ALLOWED_STATUSES}")
    job = db.query(Job).filter(Job.id == body.job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    app = _get_or_create_application(db, user.id, body.job_id)
    if app:
        app.status = body.status
        if body.status == "redirected":
            app.redirected_at = datetime.utcnow()
        db.commit()
    else:
        app = Application(
            user_id=user.id,
            job_id=body.job_id,
            status=body.status,
            redirected_at=datetime.utcnow() if body.status == "redirected" else None,
        )
        db.add(app)
        db.commit()
    return {
        "ok": True,
        "status": body.status,
        "apply_url": job.apply_url if body.status == "redirected" else None,
    }


@router.get("/list", response_model=list[ApplicationResponse])
def apply_list(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """List user's applications (viewed/shortlisted/redirected). Safe tracking only."""
    apps = db.query(Application).filter(Application.user_id == user.id).order_by(Application.created_at.desc()).all()
    return [
        ApplicationResponse(
            id=a.id,
            job_id=a.job_id,
            status=a.status,
            redirected_at=a.redirected_at.isoformat() if a.redirected_at else None,
        )
        for a in apps
    ]
