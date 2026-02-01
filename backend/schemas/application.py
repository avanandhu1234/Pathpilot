from pydantic import BaseModel


class ApplicationRedirectCreate(BaseModel):
    """Body for POST /apply/redirect. We only store status=redirected; no auto-submit."""
    job_id: int


class ApplicationStatusUpdate(BaseModel):
    """Body for POST /apply/status. Legal only: viewed / shortlisted / redirected."""
    job_id: int
    status: str  # viewed | shortlisted | redirected


class ApplicationResponse(BaseModel):
    id: int
    job_id: int
    status: str
    redirected_at: str | None

    class Config:
        from_attributes = True
