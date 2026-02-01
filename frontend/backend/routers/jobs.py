"""Jobs: same-day reuse from DB, then JSON, then SerpAPI/Adzuna; save, list, action. No auto-submit."""
import logging
from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from db import get_db

logger = logging.getLogger(__name__)
from models.job import Job
from models.application import Application
from models.resume import Resume
from models.search_session import SearchSession, JobMatch
from schemas.job import (
    JobCreate,
    JobResponse,
    JobSearchBody,
    JobSearchResultResponse,
    JobActionBody,
    CoverLetterBody,
)
from routers.auth import get_current_user, get_current_user_optional
from models.user import User
from services.serpapi import search_jobs
from services.job_match import compute_match
from services.job_storage import load_jobs_from_json, filter_jobs

router = APIRouter()


def _upsert_job(db: Session, j: dict, source: str) -> Job | None:
    """Normalize and store job; return existing or new Job row. Returns None on DB error."""
    try:
        title = (j.get("title") or "").strip() or "Job"
        company = (j.get("company") or "").strip() or "Company"
        existing = db.query(Job).filter(Job.title == title, Job.company == company).first()
        if existing:
            return existing
        job = Job(
            title=title,
            company=company,
            location=j.get("location"),
            description=j.get("description") or None,
            apply_url=j.get("apply_url"),
            source=source,
        )
        db.add(job)
        db.commit()
        db.refresh(job)
        return job
    except Exception as e:
        logger.warning("_upsert_job failed for title=%r company=%r: %s", j.get("title"), j.get("company"), e)
        db.rollback()
        return None


def _get_user_resume_text(db: Session, user_id: int | None) -> str | None:
    if not user_id:
        return None
    r = db.query(Resume).filter(Resume.user_id == user_id).order_by(Resume.created_at.desc()).first()
    return r.resume_text if r else None


def _job_search_from_json(db: Session, q: str, location: str, user_id: int | None) -> list[JobSearchResultResponse]:
    """Load jobs from data/jobs.json, filter by q/location, return as JobSearchResultResponse with match_score."""
    try:
        all_jobs = load_jobs_from_json()
    except Exception as e:
        logger.warning("job search: load from JSON failed: %s", e)
        return []
    if not all_jobs:
        return []
    filtered = filter_jobs(all_jobs, q or "", location or "")
    if not filtered:
        return []
    resume_text = _get_user_resume_text(db, user_id)
    out: list[JobSearchResultResponse] = []
    for j in filtered:
        try:
            match_score, reasons = compute_match(
                resume_text,
                j.get("title") or "",
                j.get("description") or "",
            )
        except Exception:
            match_score, reasons = 0.0, []
        out.append(
            JobSearchResultResponse(
                id=int(j.get("id") or len(out) + 1),
                title=(j.get("title") or "").strip() or "Job",
                company=(j.get("company") or "").strip() or "Company",
                location=j.get("location"),
                description=j.get("description"),
                apply_url=j.get("apply_url"),
                source=j.get("source"),
                match_score=match_score,
                reasons=reasons,
                salary=j.get("salary"),
                posted_date=j.get("posted_date"),
            )
        )
    logger.info("job search: serving %d jobs from JSON", len(out))
    return out


def _get_same_day_session_jobs(db: Session, q: str, location: str, user_id: int | None) -> list[JobSearchResultResponse] | None:
    """If a search_session exists for (q, location) today, return jobs from job_matches. Else None."""
    q_norm = (q or "").strip() or "Software Engineer"
    loc_norm = (location or "").strip()
    today_start = datetime.combine(date.today(), datetime.min.time())
    try:
        session = (
            db.query(SearchSession)
            .filter(
                SearchSession.query == q_norm,
                SearchSession.location == loc_norm,
                SearchSession.created_at >= today_start,
            )
            .order_by(SearchSession.created_at.desc())
            .first()
        )
        if not session:
            return None
        matches = db.query(JobMatch).filter(JobMatch.search_session_id == session.id).all()
        job_ids = [m.job_id for m in matches]
        if not job_ids:
            return None
        jobs = db.query(Job).filter(Job.id.in_(job_ids)).all()
        job_by_id = {j.id: j for j in jobs}
        resume_text = _get_user_resume_text(db, user_id)
        out: list[JobSearchResultResponse] = []
        for jid in job_ids:
            job = job_by_id.get(jid)
            if not job:
                continue
            try:
                match_score, reasons = compute_match(resume_text, job.title, job.description)
            except Exception:
                match_score, reasons = 0.0, []
            out.append(
                JobSearchResultResponse(
                    id=job.id,
                    title=job.title,
                    company=job.company,
                    location=job.location,
                    description=job.description,
                    apply_url=job.apply_url,
                    source=job.source,
                    match_score=match_score,
                    reasons=reasons,
                    salary=None,
                    posted_date=None,
                )
            )
        logger.info("job search: reusing same-day session, %d jobs", len(out))
        return out if out else None
    except Exception as e:
        logger.warning("job search: same-day lookup failed: %s", e)
        return None


def _save_search_session(db: Session, q: str, location: str, job_ids: list[int]) -> None:
    """Create search_sessions and job_matches for reuse."""
    try:
        session = SearchSession(query=(q or "").strip() or "Software Engineer", location=(location or "").strip())
        db.add(session)
        db.commit()
        db.refresh(session)
        for jid in job_ids:
            db.add(JobMatch(search_session_id=session.id, job_id=jid))
        db.commit()
    except Exception as e:
        logger.warning("job search: save session failed: %s", e)
        db.rollback()


def _job_search_workflow(db: Session, q: str, location: str, user_id: int | None) -> list[JobSearchResultResponse]:
    """
    1) Same-day reuse: if DB has search_sessions for (q, location) today, return those jobs (no scrape).
    2) Else data/jobs.json (filter by q/location); upsert to DB and save session for reuse.
    3) Else SerpAPI/Adzuna; upsert and save session. Never raises: returns [] on failure.
    """
    logger.info("job search start: q=%r location=%r user_id=%s", q, location, user_id)
    q_norm = (q or "").strip() or "Software Engineer"
    loc_norm = (location or "").strip()

    # 1) Check DB for same-day search (no re-scrape)
    from_db = _get_same_day_session_jobs(db, q_norm, loc_norm, user_id)
    if from_db:
        return from_db

    # 2) JSON first (real data with apply links)
    from_json = _job_search_from_json(db, q_norm, loc_norm, user_id)
    if from_json:
        # Persist to DB and create session so same-day reuse works next time
        job_ids_created: list[int] = []
        for r in from_json:
            job = _upsert_job(
                db,
                {
                    "title": r.title,
                    "company": r.company,
                    "location": r.location,
                    "description": r.description,
                    "apply_url": r.apply_url,
                    "salary": r.salary,
                    "posted_date": r.posted_date,
                },
                r.source or "json",
            )
            if job:
                job_ids_created.append(job.id)
        if job_ids_created:
            _save_search_session(db, q_norm, loc_norm, job_ids_created)
        return from_json

    # 3) Live API (SerpAPI/Adzuna)
    try:
        raw = search_jobs(q_norm, loc_norm)
    except Exception as e:
        logger.warning("search_jobs raised: %s; returning []", e)
        return []

    if not raw:
        logger.info("job search: empty raw list, returning []")
        return []

    is_live = any(
        j.get("apply_url") and "example.com" not in str(j.get("apply_url", ""))
        for j in raw
    )
    source = "serpapi" if is_live else "mock"
    logger.info("job search: using %s, %d raw results", source, len(raw))

    resume_text = _get_user_resume_text(db, user_id)
    out: list[JobSearchResultResponse] = []
    job_ids_for_session: list[int] = []
    for i, j in enumerate(raw):
        job = _upsert_job(db, j, source)
        if job is not None:
            job_ids_for_session.append(job.id)
            try:
                match_score, reasons = compute_match(
                    resume_text,
                    job.title,
                    job.description,
                )
            except Exception as e:
                logger.warning("compute_match failed for job id=%s: %s", job.id, e)
                match_score, reasons = 0.0, []
            out.append(
                JobSearchResultResponse(
                    id=job.id,
                    title=job.title,
                    company=job.company,
                    location=job.location,
                    description=job.description,
                    apply_url=job.apply_url,
                    source=job.source,
                    match_score=match_score,
                    reasons=reasons,
                    salary=j.get("salary"),
                    posted_date=j.get("posted_date"),
                )
            )
        else:
            # DB upsert failed: still return job from raw so the UI shows results
            try:
                match_score, reasons = compute_match(
                    resume_text,
                    j.get("title") or "",
                    j.get("description") or "",
                )
            except Exception:
                match_score, reasons = 0.0, []
            out.append(
                JobSearchResultResponse(
                    id=-(i + 1),  # synthetic id so Apply can create job via body.job
                    title=(j.get("title") or "").strip() or "Job",
                    company=(j.get("company") or "").strip() or "Company",
                    location=j.get("location"),
                    description=j.get("description"),
                    apply_url=j.get("apply_url"),
                    source=source,
                    match_score=match_score,
                    reasons=reasons,
                    salary=j.get("salary"),
                    posted_date=j.get("posted_date"),
                )
            )
    if job_ids_for_session:
        _save_search_session(db, q_norm, loc_norm, job_ids_for_session)
    logger.info("job search done: returning %d jobs", len(out))
    return out


@router.get("/search", response_model=list[JobSearchResultResponse])
def jobs_search_get(
    q: str = "",
    location: str = "",
    db: Session = Depends(get_db),
    user: User | None = Depends(get_current_user_optional),
) -> list[JobSearchResultResponse]:
    """
    Job Search & Discovery: GET /jobs/search.
    Backend fetches jobs via SerpAPI, normalizes, stores in DB, computes match_score per user, returns list with reasons.
    Optional auth: if logged in, match_score uses latest resume. Never raises: returns [] on failure.
    """
    try:
        return _job_search_workflow(db, q, location, user.id if user else None)
    except Exception as e:
        logger.exception("jobs_search_get failed: %s", e)
        return []


@router.post("/search", response_model=list[JobSearchResultResponse])
def jobs_search_post(
    body: JobSearchBody,
    db: Session = Depends(get_db),
    user: User | None = Depends(get_current_user_optional),
) -> list[JobSearchResultResponse]:
    """POST search (frontend compatibility). Same workflow as GET /search. Never raises: returns [] on failure."""
    try:
        q = (body.job_title or "").strip() or "Software Engineer"
        location = (body.location or "").strip()
        return _job_search_workflow(db, q, location, user.id if user else None)
    except Exception as e:
        logger.exception("jobs_search_post failed: %s", e)
        return []


@router.get("/list", response_model=list[JobResponse])
def jobs_list(db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> list[JobResponse]:
    """Return jobs the user has an application (redirect/shortlist) for. Returns [] if none or on DB error."""
    try:
        apps = db.query(Application).filter(Application.user_id == user.id).all()
        job_ids = [a.job_id for a in apps]
        if not job_ids:
            return []
        jobs = db.query(Job).filter(Job.id.in_(job_ids)).all()
        return [JobResponse.model_validate(j) for j in jobs]
    except Exception as e:
        logger.exception("jobs_list failed: %s", e)
        return []


@router.post("/save", response_model=JobResponse)
def jobs_save(body: JobCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Save a job to the database. Does not submit applications."""
    job = Job(
        title=body.title,
        company=body.company,
        location=body.location,
        description=body.description,
        apply_url=body.apply_url,
        source=body.source,
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return JobResponse.model_validate(job)


@router.post("/action")
def jobs_action(
    body: JobActionBody,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """
    Record Quick Apply / redirect. If job_id is from mock search (no DB row), pass job payload
    to create job first then application. We ONLY store status=redirected; no auto-submit.
    """
    job_id = body.job_id
    job = db.query(Job).filter(Job.id == job_id).first()

    if not job and body.job:
        # Mock search result: create job in DB then application
        j = body.job
        job = Job(
            title=j.title,
            company=j.company,
            location=j.location,
            description=j.description,
            apply_url=j.apply_url,
            source=j.source or "frontend",
        )
        db.add(job)
        db.commit()
        db.refresh(job)
        job_id = job.id
    elif not job:
        raise HTTPException(status_code=404, detail="Job not found")

    app = Application(
        user_id=user.id,
        job_id=job_id,
        status="redirected",
        redirected_at=datetime.utcnow(),
    )
    db.add(app)
    db.commit()
    return {"ok": True, "message": "Redirect recorded. User applies on external portal."}


@router.post("/cover-letter")
def jobs_cover_letter(body: CoverLetterBody, user: User = Depends(get_current_user)):
    """Stub: return mock cover letter. Replace with AI service later."""
    company = body.company_name or "the company"
    title = body.job_title or "the role"
    return {
        "text": f"Dear Hiring Team at {company},\n\nI am writing to express my interest in the {title} position. "
        "This is a placeholder cover letter. Connect an AI service for personalized generation.\n\nSincerely,\n[Your Name]",
    }
