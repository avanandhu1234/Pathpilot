#!/usr/bin/env python3
"""
Fetch jobs using SerpAPI or Adzuna (from .env) and save to backend/data/jobs.json.
Run from repo root: python backend/scripts/fetch_jobs_to_json.py
Or from backend: python scripts/fetch_jobs_to_json.py (after setting PYTHONPATH or installing).
"""
import sys
from pathlib import Path

# Add backend to path so we can import from services
_backend = Path(__file__).resolve().parent.parent
if str(_backend) not in sys.path:
    sys.path.insert(0, str(_backend))

# Load .env before importing serpapi
_env = _backend / ".env"
try:
    from dotenv import load_dotenv
    load_dotenv(_env)
except ImportError:
    pass

from services.serpapi import search_jobs
from services.job_storage import save_jobs_to_json, load_jobs_from_json, get_jobs_path
from services.rapidapi_indeed import fetch_company_jobs


# (query, location) pairs to fetch. Uses SerpAPI first, then Adzuna, then mock.
SEARCH_PAIRS = [
    ("Software Engineer", "United States"),
    ("Data Analyst", "United States"),
    ("Developer", "United States"),
    ("Software Engineer", "Berlin, Germany"),
    ("Data Scientist", "United Kingdom"),
]

# Companies to fetch from RapidAPI Indeed (additional source).
INDEED_COMPANIES = ["Ubisoft", "Google", "Microsoft", "Amazon", "Meta", "Apple", "Netflix"]


def _add_job(all_jobs: list[dict], seen: set, j: dict, source: str = "api") -> None:
    title = (j.get("title") or "").strip()
    company = (j.get("company") or "").strip()
    key = (title.lower(), company.lower())
    if key in seen:
        return
    seen.add(key)
    all_jobs.append({
        "id": len(all_jobs) + 1,
        "title": title or "Job",
        "company": company or "Company",
        "location": j.get("location"),
        "description": (j.get("description") or "")[:1000],
        "apply_url": j.get("apply_url") or "",
        "salary": j.get("salary"),
        "posted_date": j.get("posted_date"),
        "source": source,
    })


def main():
    seen: set[tuple[str, str]] = set()  # (title.lower(), company.lower()) for dedupe
    all_jobs: list[dict] = []

    for q, loc in SEARCH_PAIRS:
        print(f"Fetching: q={q!r} location={loc!r}")
        raw = search_jobs(q, loc)
        for j in raw:
            source = "serpapi" if (j.get("apply_url") or "").startswith("http") and "example.com" not in (j.get("apply_url") or "") else "api"
            _add_job(all_jobs, seen, j, source=source)
        if not raw:
            print("  No results")
        else:
            print(f"  Got {len(raw)} results, total unique so far: {len(all_jobs)}")

    # RapidAPI Indeed: company jobs (additional source)
    locality = "us"
    for company in INDEED_COMPANIES:
        print(f"Fetching Indeed: company={company!r} locality={locality!r}")
        raw = fetch_company_jobs(company, locality=locality, start=1)
        for j in raw:
            _add_job(all_jobs, seen, j, source="indeed")
        if not raw:
            print("  No results")
        else:
            print(f"  Got {len(raw)} results, total unique so far: {len(all_jobs)}")

    if not all_jobs:
        print("No jobs collected. Check SERPAPI_KEY, ADZUNA_APP_ID/ADZUNA_APP_KEY, or RAPIDAPI_KEY in backend/.env")
        sys.exit(1)

    path = get_jobs_path()
    save_jobs_to_json(all_jobs)
    print(f"Saved {len(all_jobs)} jobs to {path}")
    # Verify
    loaded = load_jobs_from_json()
    print(f"Verified: {len(loaded)} jobs in file.")


if __name__ == "__main__":
    main()
