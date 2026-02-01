"""Job search via SerpAPI or mock results."""
from app.config import settings

def search_jobs(job_title: str, location: str = "", remote: bool = False) -> list[dict]:
    """Return list of job dicts: company_name, job_title, location, description, application_url, etc."""
    if not settings.serpapi_key:
        return _mock_jobs(job_title, location, remote)
    try:
        from serpapi import GoogleSearch
        params = {
            "api_key": settings.serpapi_key,
            "engine": "google_jobs",
            "q": job_title,
            "location": location or "United States",
        }
        search = GoogleSearch(params)
        data = search.get_dict()
        jobs = data.get("jobs_results") or data.get("jobs_results") or []
        out = []
        # Limit to 5 results for testing; increase [:5] for production
        for j in (jobs or [])[:5]:
            out.append({
                "company_name": j.get("company_name") or "Company",
                "job_title": j.get("title") or job_title,
                "location": (j.get("job_location") or location or "").strip(),
                "description": (j.get("description") or "")[:2000],
                "application_url": j.get("apply_link") or j.get("link") or "",
                "company_logo_url": None,
                "posted_at": None,
                "external_id": str(j.get("job_id") or id(j)),
            })
        return out
    except Exception:
        return _mock_jobs(job_title, location, remote)


def _mock_jobs(job_title: str, location: str, remote: bool) -> list[dict]:
    return [
        {
            "company_name": "Acme Corp",
            "job_title": job_title or "Software Engineer",
            "location": location or "Remote" if remote else "New York, NY",
            "description": "Join our team. Set SERPAPI_KEY for real job listings.",
            "application_url": "https://example.com/apply",
            "company_logo_url": None,
            "posted_at": None,
            "external_id": "mock-1",
        },
        {
            "company_name": "TechStart Inc",
            "job_title": job_title or "Developer",
            "location": location or "San Francisco, CA",
            "description": "Great opportunity. Configure SerpAPI for live data.",
            "application_url": "https://example.com/jobs",
            "company_logo_url": None,
            "posted_at": None,
            "external_id": "mock-2",
        },
    ]
