from pydantic import BaseModel


class SubscriptionUsage(BaseModel):
    resume_ai_used: int = 0
    resume_ai_limit: int | None = 2
    chat_messages_used: int = 0
    chat_messages_limit: int | None = 10
    redirects_used: int = 0
    redirects_limit: int | None = 10
    jobs_saved: int = 0
    jobs_saved_limit: int | None = 10


class SubscriptionMeResponse(BaseModel):
    plan: str
    plan_display_name: str
    price_monthly_cents: int | None = None
    price_yearly_cents: int | None = None
    currency: str = "USD"
    usage: SubscriptionUsage


class MockSetPlanBody(BaseModel):
    plan: str  # free / pro / premium
