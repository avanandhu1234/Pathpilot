"""
RapidAPI Indeed: fetch company jobs from indeed12.p.rapidapi.com.
Uses RAPIDAPI_KEY or RAPIDAPI_INDEED_KEY from env.
Returns list of JobDict (title, company, location, description, apply_url, salary, posted_date).
"""
import os
import logging
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)

_env_path = Path(__file__).resolve().parent.parent / ".env"
try:
    from dotenv import load_dotenv
    load_dotenv(_env_path)
except ImportError:
    pass

JobDict = dict[str, Any]

RAPIDAPI_HOST = "indeed12.p.rapidapi.com"
RAPIDAPI_BASE = "https://indeed12.p.rapidapi.com"
MAX_JOBS_PER_COMPANY = 20


def _get_api_key() -> str:
    return (os.environ.get("RAPIDAPI_KEY") or os.environ.get("RAPIDAPI_INDEED_KEY") or "").strip()


def _normalize_job(raw: dict, company_name: str) -> JobDict:
    """Map Indeed-style fields to our JobDict."""
    title = (
        raw.get("job_title") or raw.get("title") or raw.get("position") or ""
    ).strip() or "Job"
    company = (raw.get("company_name") or raw.get("company") or company_name or "").strip() or "Company"
    location = raw.get("location") or raw.get("job_location") or raw.get("locality")
    if isinstance(location, dict):
        location = location.get("display_name") or location.get("name") or str(location)
    location = (location or "").strip() or None
    description = raw.get("job_description") or raw.get("description") or raw.get("snippet") or ""
    if isinstance(description, str) and len(description) > 1000:
        description = description[:1000] + "..."
    apply_url = raw.get("job_url") or raw.get("url") or raw.get("link") or raw.get("apply_url") or ""
    salary = raw.get("salary") or raw.get("salary_range")
    if salary is not None and not isinstance(salary, str):
        salary = str(salary)
    posted_date = raw.get("posted_date") or raw.get("posted") or raw.get("date")
    if posted_date is not None and not isinstance(posted_date, str):
        posted_date = str(posted_date)
    return {
        "title": title,
        "company": company,
        "location": location,
        "description": description or "",
        "apply_url": (apply_url or "").strip() or "",
        "salary": salary,
        "posted_date": posted_date,
    }


def fetch_company_jobs(
    company: str,
    locality: str = "us",
    start: int = 1,
) -> list[JobDict]:
    """
    Fetch jobs for one company from RapidAPI Indeed.
    GET /company/{company}/jobs?locality=us&start=1
    Returns [] if key missing, request fails, or no jobs.
    """
    api_key = _get_api_key()
    if not api_key:
        logger.info("rapidapi_indeed: RAPIDAPI_KEY not set; skipping")
        return []

    try:
        import httpx
    except ImportError:
        logger.warning("rapidapi_indeed: httpx not installed")
        return []

    company_slug = (company or "").strip().replace(" ", "%20")
    if not company_slug:
        return []
    url = f"{RAPIDAPI_BASE}/company/{company_slug}/jobs"
    params: dict[str, Any] = {"locality": locality or "us", "start": max(1, start)}
    headers = {
        "x-rapidapi-host": RAPIDAPI_HOST,
        "x-rapidapi-key": api_key,
    }

    try:
        with httpx.Client(timeout=25.0) as client:
            resp = client.get(url, params=params, headers=headers)
            resp.raise_for_status()
            data = resp.json()
    except httpx.HTTPStatusError as e:
        logger.warning("rapidapi_indeed: HTTP %s for company=%s - %s", e.response.status_code, company, e.response.text[:200])
        return []
    except Exception as e:
        logger.warning("rapidapi_indeed: request failed for company=%s: %s", company, e)
        return []

    # Indeed12 RapidAPI returns { "count", "hits": [...], "indeed_final_url", "next_start", "prev_start" }
    jobs_raw: list[dict] = []
    if isinstance(data, list):
        jobs_raw = data
    elif isinstance(data, dict):
        jobs_raw = data.get("hits") or data.get("jobs") or data.get("results") or data.get("data") or []
    if not isinstance(jobs_raw, list):
        return []

    out: list[JobDict] = []
    company_name = company_slug.replace("%20", " ")
    for r in jobs_raw[:MAX_JOBS_PER_COMPANY]:
        if not isinstance(r, dict):
            continue
        out.append(_normalize_job(r, company_name))
    if out:
        logger.info("rapidapi_indeed: got %d jobs for company=%s", len(out), company)
    return out
