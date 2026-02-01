# Freemium Pricing – Backend Integration

## Register subscription router

In **`app/main.py`** add:

```python
from app.routers import subscription
app.include_router(subscription.router)
```

## Where pricing checks live

| Feature | File | Where to add check |
|--------|------|--------------------|
| Resume AI limit | `app/routers/resume.py` | At start of `improve()`: `check_resume_ai_allowed(db, user.id)` |
| Chat messages limit | `app/routers/chat.py` | At start of `send_message()`: `check_chat_messages_allowed(db, user.id)` |
| Assisted Apply redirects | `app/routers/jobs.py` | In `record_action()` when `body.action == "redirected"`: `check_redirect_allowed(db, user.id)` |
| Job save limit (free: 10) | `app/routers/jobs.py` | Before storing new jobs in `search_jobs()`: if free plan and current job count >= 10, reject or truncate |
| AI job recommendations | `app/routers/jobs.py` | In `search_jobs()`: if free plan, skip LLM match scoring (or use basic score); optionally call `require_ai_job_recommendations(user.id)` to block and return 403 |

## Example (resume router)

```python
from app.plan_checks import check_resume_ai_allowed

@router.post("/improve", ...)
async def improve(body: ..., db: Session = Depends(get_db), user: User = Depends(require_user)):
    check_resume_ai_allowed(db, user.id)  # raises 403 with upgrade_url if limit reached
    # ... rest of improve logic
```

## Plan source (production)

Replace mock store in **`app/plans.py`**: `get_user_plan(user_id)` should read `User.subscription_plan` from DB (add column `subscription_plan` default `"free"`). Remove `_mock_plan_store` and `set_user_plan` or wire them to DB updates after payment.
