"""Dashboard: stats from real DB (Application, Resume)."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db import get_db
from app.auth import require_user
from app.models import User, Application, Resume

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/stats")
def dashboard_stats(
    db: Session = Depends(get_db),
    user: User = Depends(require_user),
):
    """Return basic counts: jobs (applications), applications sent (redirected), resumes."""
    jobs_count = db.query(Application).filter(Application.user_id == user.id).count()
    applications_count = db.query(Application).filter(
        Application.user_id == user.id,
        Application.status == "redirected",
    ).count()
    resumes_count = db.query(Resume).filter(Resume.user_id == user.id).count()
    return {
        "jobs_saved": jobs_count,
        "applications_sent": applications_count,
        "resumes_uploaded": resumes_count,
    }
