"""
Jobs: search, list, save, match, and apply/redirect (tracking only – no auto-submit).
Uses Job (global) + Application (user actions: viewed / shortlisted / redirected).
"""
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel as PydanticBaseModel

from app.db import get_db
from app.auth import require_user
from app.models import User, Job, Application
from app.schemas import JobSearchParams, JobResponse
from app.services.serpapi_jobs import search_jobs as serpapi_search
from app.plan_checks import check_redirect_allowed, check_job_save_allowed
from app.services.llm import complete


def _job_to_response(job: Job, job_id_override: int | None = None) -> JobResponse:
    """Map Job model to frontend JobResponse (company_name, job_title, application_url)."""
    return JobResponse(
        id=job_id_override or job.id,
        company_name=job.company,
        job_title=job.title,
        location=job.location,
        description=job.description,
        application_url=job.apply_url or "",
        company_logo_url=None,
        match_score=0.0,
        matched_skills=[],
        posted_at=None,
    )


class JobPayload(PydanticBaseModel):
    """Optional payload when saving/redirecting from search (job not yet in DB)."""
    company_name: str
    job_title: str
    location: str | None = None
    description: str | None = None
    application_url: str = ""
    company_logo_url: str | None = None
    match_score: float = 0.0
    matched_skills: list[str] = []
    posted_at: str | None = None


class ActionBody(PydanticBaseModel):
    job_id: int = 0
    action: str  # viewed | shortlisted | redirected
    job: JobPayload | None = None


class CoverLetterBody(PydanticBaseModel):
    job_id: int
    job: JobPayload | None = None  # When job_id is 0, pass job details for cover letter generation


router = APIRouter(prefix="/api/jobs", tags=["jobs"])


@router.post("/search", response_model=list[JobResponse])
def search_jobs(
    body: JobSearchParams,
    db: Session = Depends(get_db),
    user: User = Depends(require_user),
):
    """Search jobs (SerpAPI or mock). Returns list; save via POST /action with action=shortlisted."""
    raw = serpapi_search(body.job_title, body.location, body.remote)
    out = []
    for i, r in enumerate(raw):
        out.append(JobResponse(
            id=0,
            company_name=r["company_name"],
            job_title=r["job_title"],
            location=r.get("location"),
            description=r.get("description"),
            application_url=r.get("application_url") or "",
            company_logo_url=r.get("company_logo_url"),
            match_score=0.8 - (i * 0.05),
            matched_skills=[],
            posted_at=r.get("posted_at"),
        ))
    return out


@router.get("/list", response_model=list[JobResponse])
def list_jobs(
    db: Session = Depends(get_db),
    user: User = Depends(require_user),
):
    """List jobs the user has an application record for (saved / viewed / redirected)."""
    job_ids = [r[0] for r in db.query(Application.job_id).filter(
        Application.user_id == user.id
    ).distinct().all()]
    if not job_ids:
        return []
    jobs = db.query(Job).filter(Job.id.in_(job_ids)).order_by(Job.created_at.desc()).all()
    return [_job_to_response(j) for j in jobs]


@router.post("/cover-letter")
def cover_letter(
    body: CoverLetterBody,
    db: Session = Depends(get_db),
    user: User = Depends(require_user),
):
    """Generate cover letter for a job. Use job_id for saved jobs, or job_id=0 with job payload for search results."""
    job_title = ""
    company = ""
    description = ""
    if body.job_id == 0 and body.job:
        job_title = body.job.job_title
        company = body.job.company_name
        description = (body.job.description or "")[:1500]
    else:
        app = db.query(Application).filter(
            Application.user_id == user.id,
            Application.job_id == body.job_id,
        ).first()
        if not app:
            raise HTTPException(status_code=404, detail="Job not found")
        job = db.query(Job).filter(Job.id == body.job_id).first()
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        job_title = job.title
        company = job.company
        description = (job.description or "")[:1500]
    if not job_title and not company:
        raise HTTPException(status_code=400, detail="Provide job_id for a saved job or job payload when job_id is 0")
    text = complete(
        "You are a career coach. Write a short, professional cover letter.",
        f"Job: {job_title} at {company}. Description: {description}",
        max_tokens=600,
    )
    return {"text": text}


@router.post("/action")
def record_action(
    body: ActionBody,
    db: Session = Depends(get_db),
    user: User = Depends(require_user),
):
    """
    Record viewed / shortlisted / redirected (legal: tracking only, no auto-submit).
    When job_id is 0, pass job payload to create Job and Application.
    """
    if body.action == "redirected":
        check_redirect_allowed(db, user.id)

    job_id = body.job_id
    job = db.query(Job).filter(Job.id == body.job_id).first() if body.job_id else None

    if (body.job_id == 0 or not job) and body.job and body.action in ("shortlisted", "redirected"):
        check_job_save_allowed(db, user.id)
        j = body.job
        new_job = Job(
            title=j.job_title,
            company=j.company_name,
            location=j.location,
            description=j.description,
            apply_url=j.application_url or "",
            source="SerpAPI",
        )
        db.add(new_job)
        db.commit()
        db.refresh(new_job)
        job_id = new_job.id
    elif (body.job_id == 0 or not job) and body.action in ("shortlisted", "redirected"):
        check_job_save_allowed(db, user.id)
        new_job = Job(
            title="Applied via search",
            company="Unknown",
            apply_url="",
            source="SerpAPI",
        )
        db.add(new_job)
        db.commit()
        db.refresh(new_job)
        job_id = new_job.id
    elif job:
        job_id = job.id
    elif body.job_id and not job:
        raise HTTPException(status_code=404, detail="Job not found")
    else:
        raise HTTPException(status_code=400, detail="Provide job_id or job payload")

    redirected_at = datetime.utcnow() if body.action == "redirected" else None
    app = Application(
        user_id=user.id,
        job_id=job_id,
        status=body.action,
        redirected_at=redirected_at,
    )
    db.add(app)
    db.commit()
    return {"ok": True}
