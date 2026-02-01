"""
Job JSON storage: load/save jobs to data/jobs.json. Used so Job Finder and Assisted Apply
serve real job data with application links from a single JSON file.
"""
import json
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

# Path: backend/data/jobs.json
_JOBS_DIR = Path(__file__).resolve().parent.parent / "data"
JOBS_JSON_PATH = _JOBS_DIR / "jobs.json"

# Max jobs to return from JSON per search (limit response size)
MAX_JOBS_FROM_JSON = 100


def get_jobs_path() -> Path:
    """Return the path to jobs.json. Ensures data dir exists."""
    _JOBS_DIR.mkdir(parents=True, exist_ok=True)
    return JOBS_JSON_PATH


def load_jobs_from_json() -> list[dict]:
    """
    Load jobs from data/jobs.json. Each job dict has: id, title, company, location,
    description, apply_url, salary, posted_date, source.
    Returns [] if file missing, invalid, or empty.
    """
    path = get_jobs_path()
    if not path.exists():
        return []
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except (json.JSONDecodeError, OSError) as e:
        logger.warning("job_storage: could not load %s: %s", path, e)
        return []
    if not isinstance(data, list):
        return []
    return [j for j in data if isinstance(j, dict)]


def save_jobs_to_json(jobs: list[dict]) -> bool:
    """Save job list to data/jobs.json. Each job must have id, title, company, apply_url, etc."""
    path = get_jobs_path()
    try:
        with open(path, "w", encoding="utf-8") as f:
            json.dump(jobs, f, ensure_ascii=False, indent=2)
        logger.info("job_storage: saved %d jobs to %s", len(jobs), path)
        return True
    except OSError as e:
        logger.warning("job_storage: could not save %s: %s", path, e)
        return False


def filter_jobs(jobs: list[dict], q: str, location: str) -> list[dict]:
    """
    Filter jobs by query (title, company, description) and location (substring, case-insensitive).
    If q/location empty, no filter on that field. Returns up to MAX_JOBS_FROM_JSON.
    """
    q_norm = (q or "").strip().lower()
    loc_norm = (location or "").strip().lower()
    out: list[dict] = []
    for j in jobs:
        title = (j.get("title") or "").lower()
        company = (j.get("company") or "").lower()
        desc = (j.get("description") or "").lower()
        loc = (j.get("location") or "").lower()
        if q_norm and q_norm not in title and q_norm not in company and q_norm not in desc:
            continue
        if loc_norm and loc_norm not in loc:
            continue
        out.append(j)
        if len(out) >= MAX_JOBS_FROM_JSON:
            break
    return out
