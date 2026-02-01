"""
Job search: SerpAPI first, then Adzuna (free API), then mock so frontend always gets jobs.
Uses SERPAPI_KEY or SERP_API_KEY; optional ADZUNA_APP_ID + ADZUNA_APP_KEY for fallback.
"""
import os
import logging
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)

# Load .env so API keys are available when this module is used
_env_path = Path(__file__).resolve().parent.parent / ".env"
try:
    from dotenv import load_dotenv
    load_dotenv(_env_path)
except ImportError:
    pass

# Normalized job dict: title, company, location, description, apply_url, optional salary, posted_date
JobDict = dict[str, Any]

# SerpAPI endpoint (reference uses search.json)
SERPAPI_SEARCH_URL = "https://serpapi.com/search.json"

# Max jobs returned per search (limit scraping)
MAX_JOBS_PER_SEARCH = 5


def search_jobs_mock(q: str, location: str) -> list[JobDict]:
    """Return mock job list (up to MAX_JOBS_PER_SEARCH). Keys: title, company, location, description, apply_url."""
    return [
        {
            "title": q or "Software Engineer",
            "company": "Acme Corp",
            "location": location or "New York, NY",
            "description": "Join our team. Set SERPAPI_KEY for real listings.",
            "apply_url": "https://example.com/apply",
        },
        {
            "title": q or "Developer",
            "company": "TechStart Inc",
            "location": location or "San Francisco, CA",
            "description": "Great opportunity. Configure SerpAPI for live data.",
            "apply_url": "https://example.com/jobs",
        },
        {
            "title": q or "Engineer",
            "company": "BuildCo",
            "location": location or "Austin, TX",
            "description": "Growth role. Add SERPAPI_KEY in .env for real job data.",
            "apply_url": "https://example.com/careers",
        },
        {
            "title": q or "Software Developer",
            "company": "DataFlow Inc",
            "location": location or "Seattle, WA",
            "description": "Remote-friendly. Use SerpAPI for live scraping.",
            "apply_url": "https://example.com/apply-now",
        },
        {
            "title": q or "Tech Lead",
            "company": "ScaleUp Labs",
            "location": location or "Boston, MA",
            "description": "Leadership opportunity. Real jobs when SERPAPI_KEY is set.",
            "apply_url": "https://example.com/join",
        },
    ][:MAX_JOBS_PER_SEARCH]


def _parse_serpapi_jobs(data: dict) -> list[JobDict]:
    """Parse SerpAPI Google Jobs response into list of normalized job dicts (reference: apply_link, detected_extensions)."""
    results: list[JobDict] = []
    jobs_results = data.get("jobs_results") or data.get("jobs") or []
    for job in jobs_results:
        if not isinstance(job, dict):
            continue
        title = (job.get("title") or "").strip() or "N/A"
        company = (job.get("company_name") or job.get("company") or "").strip() or "N/A"
        location = (job.get("location") or "").strip() or None
        description = job.get("description") or ""
        if isinstance(description, str) and len(description) > 500:
            description = description[:500] + "..."
        # Apply URL: reference order apply_link -> link -> apply_options[0].link
        apply_url = job.get("apply_link")
        if not apply_url and job.get("link"):
            apply_url = job.get("link")
        if not apply_url:
            apply_opts = job.get("apply_options")
            if apply_opts and isinstance(apply_opts, list) and len(apply_opts) > 0:
                first = apply_opts[0]
                if isinstance(first, dict) and first.get("link"):
                    apply_url = first.get("link")
        if not apply_url:
            apply_url = job.get("share_link")
        # Optional: salary and posted date from detected_extensions (reference)
        salary: str | None = None
        posted_date: str | None = None
        ext = job.get("detected_extensions")
        if isinstance(ext, dict):
            if ext.get("salary"):
                salary = str(ext["salary"])
            if ext.get("posted_at"):
                posted_date = str(ext["posted_at"])
        results.append({
            "title": title,
            "company": company,
            "location": location,
            "description": description or "",
            "apply_url": apply_url,
            "salary": salary,
            "posted_date": posted_date,
        })
    return results


def _search_serpapi(q: str, location: str) -> list[JobDict]:
    """Fetch from SerpAPI Google Jobs. Returns [] if key missing, request fails, or no jobs."""
    q_norm = (q or "Software Engineer").strip() or "Software Engineer"
    loc_norm = (location or "United States").strip() or "United States"

    api_key = (os.environ.get("SERPAPI_KEY") or os.environ.get("SERP_API_KEY") or "").strip()
    if not api_key:
        logger.info("job search: SERPAPI_KEY not set; skipping SerpAPI")
        return []

    try:
        import httpx
    except ImportError:
        logger.warning("job search: httpx not installed; pip install httpx")
        return []

    params: dict[str, Any] = {
        "engine": "google_jobs",
        "q": q_norm if q_norm else "jobs",
        "api_key": api_key,
        "hl": "en",
        "gl": "us",
    }
    if loc_norm:
        params["location"] = loc_norm
        if "germany" in loc_norm.lower() or "deutschland" in loc_norm.lower():
            params["gl"] = "de"

    try:
        with httpx.Client(timeout=30.0) as client:
            resp = client.get(SERPAPI_SEARCH_URL, params=params)
            resp.raise_for_status()
            data = resp.json()
    except httpx.HTTPStatusError as e:
        logger.warning("job search: SerpAPI HTTP %s - %s", e.response.status_code, (e.response.text or "")[:200])
        return []
    except Exception as e:
        logger.warning("job search: SerpAPI request failed: %s", e)
        return []

    err = data.get("error") if isinstance(data, dict) else None
    if err:
        logger.warning("job search: SerpAPI error in response: %s", err)
        return []

    status = (data.get("search_metadata") or {}).get("status")
    if status and status != "Success":
        logger.warning("job search: SerpAPI status %s", status)
        return []

    parsed = _parse_serpapi_jobs(data)
    if not parsed:
        logger.info("job search: SerpAPI returned no jobs for q=%r location=%r", q_norm, loc_norm)
        return []
    logger.info("job search: SerpAPI returned %d jobs", len(parsed))
    return parsed[:MAX_JOBS_PER_SEARCH]


def search_jobs(q: str, location: str) -> list[JobDict]:
    """
    Fetch job listings: try SerpAPI first, then Adzuna (free API), then mock.
    Frontend always gets jobs. Set SERPAPI_KEY for SerpAPI; ADZUNA_APP_ID + ADZUNA_APP_KEY for Adzuna fallback.
    """
    q_norm = (q or "Software Engineer").strip() or "Software Engineer"
    loc_norm = (location or "United States").strip() or "United States"

    jobs = _search_serpapi(q_norm, loc_norm)
    if jobs:
        return jobs

    jobs = _search_adzuna(q_norm, loc_norm)
    if jobs:
        return jobs

    logger.info("job search: using mock data (set SERPAPI_KEY or ADZUNA_APP_ID+ADZUNA_APP_KEY for real jobs)")
    return search_jobs_mock(q_norm, loc_norm)


def _search_adzuna(q: str, location: str) -> list[JobDict]:
    """Fetch jobs from Adzuna API (free). Country from location or default 'us'. Returns [] on failure."""
    try:
        import httpx
    except ImportError:
        return []
    app_id = (os.environ.get("ADZUNA_APP_ID") or "").strip()
    app_key = (os.environ.get("ADZUNA_APP_KEY") or "").strip()
    if not app_id or not app_key:
        return []

    # Adzuna country: gb, us, etc. Default us; use gb if location suggests UK
    country = "us"
    loc_lower = (location or "").lower()
    if "uk" in loc_lower or "united kingdom" in loc_lower or "london" in loc_lower or "gb" in loc_lower:
        country = "gb"
    elif "de" in loc_lower or "germany" in loc_lower or "berlin" in loc_lower:
        country = "de"
    elif "at" in loc_lower or "austria" in loc_lower:
        country = "at"

    url = f"https://api.adzuna.com/v1/api/jobs/{country}/search/1"
    params: dict[str, Any] = {
        "app_id": app_id,
        "app_key": app_key,
        "results_per_page": min(MAX_JOBS_PER_SEARCH, 20),
        "what": (q or "software engineer").strip() or "jobs",
    }
    if location and country == "us":
        params["where"] = (location or "").strip()[:100]
    elif location and country == "gb":
        params["where"] = (location or "").strip()[:100]

    try:
        with httpx.Client(timeout=20.0) as client:
            resp = client.get(url, params=params)
            resp.raise_for_status()
            data = resp.json()
    except Exception as e:
        logger.warning("job search: Adzuna request failed: %s", e)
        return []

    results = data.get("results") if isinstance(data, dict) else []
    if not isinstance(results, list):
        return []

    out: list[JobDict] = []
    for r in results[:MAX_JOBS_PER_SEARCH]:
        if not isinstance(r, dict):
            continue
        company = r.get("company")
        company_name = company.get("display_name", "Company") if isinstance(company, dict) else "Company"
        loc = r.get("location")
        loc_str = loc.get("display_name") if isinstance(loc, dict) and loc else None
        if not loc_str and location:
            loc_str = location
        salary_min = r.get("salary_min")
        salary_max = r.get("salary_max")
        salary_str: str | None = None
        sym = "£" if country == "gb" else "€" if country in ("de", "at") else "$"
        if isinstance(salary_min, (int, float)) and isinstance(salary_max, (int, float)):
            salary_str = f"{sym}{salary_min:,.0f} - {sym}{salary_max:,.0f}"
        elif isinstance(salary_min, (int, float)):
            salary_str = f"From {sym}{salary_min:,.0f}"
        posted = r.get("created") or ""
        if isinstance(posted, str) and len(posted) > 10:
            posted = posted[:10]
        out.append({
            "title": (r.get("title") or "Job").strip() or "Job",
            "company": (company_name or "Company").strip() or "Company",
            "location": (loc_str or "").strip() or None,
            "description": (r.get("description") or "")[:500] or "",
            "apply_url": r.get("redirect_url") or "",
            "salary": salary_str,
            "posted_date": posted or None,
        })
    if out:
        logger.info("job search: Adzuna returned %d jobs", len(out))
    return out
