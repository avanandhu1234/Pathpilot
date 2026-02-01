from pydantic import BaseModel


class JobSearchQuery(BaseModel):
    q: str = ""
    location: str = ""


class JobSearchBody(BaseModel):
    """Body for POST /jobs/search (frontend compatibility)."""
    job_title: str | None = None
    location: str | None = None
    remote: bool | None = None


class JobCreate(BaseModel):
    title: str
    company: str
    location: str | None = None
    description: str | None = None
    apply_url: str | None = None
    source: str = "serpapi"


class JobResponse(BaseModel):
    id: int
    title: str
    company: str
    location: str | None
    description: str | None
    apply_url: str | None
    source: str | None

    class Config:
        from_attributes = True


class JobSearchResultResponse(BaseModel):
    """Job list with match_score and reasons for discovery (SerpAPI: salary, posted_date when available)."""
    id: int
    title: str
    company: str
    location: str | None
    description: str | None
    apply_url: str | None
    source: str | None
    match_score: float = 0.0
    reasons: list[str] = []
    salary: str | None = None
    posted_date: str | None = None


class JobActionBody(BaseModel):
    """Body for POST /jobs/action (Quick Apply / redirect)."""
    job_id: int
    action: str = "redirected"
    job: JobCreate | None = None


class CoverLetterBody(BaseModel):
    """Body for POST /jobs/cover-letter (stub)."""
    job_id: int
    job_title: str | None = None
    company_name: str | None = None
