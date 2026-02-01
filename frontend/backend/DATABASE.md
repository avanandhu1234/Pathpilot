# Backend Database (SQLite + SQLAlchemy)

## Structure

- **`app/db.py`** – Engine, `SessionLocal`, `Base`, `get_db` (dependency). Same interface works for PostgreSQL via `DATABASE_URL`.
- **`app/database.py`** – Re-exports from `db.py` for backward compatibility.
- **`app/models/`** – One file per entity: `User`, `Job`, `JobMatch`, `Application`, `Resume`, `AIUsage`.
- **`app/schemas.py`** – Pydantic Create/Read/Update schemas for API.

## Tables

| Table         | Purpose |
|---------------|---------|
| **users**     | id, email, hashed_password, full_name, role, plan (free/pro/premium), skills, experience_years, career_goals, education, created_at |
| **jobs**      | Global listings: id, title, company, location, description, apply_url, source, created_at (no user_id) |
| **job_matches** | user_id, job_id, match_score (0–100), reasons (JSON) |
| **applications** | **Tracking only (no auto-apply)**. user_id, job_id, status (viewed/shortlisted/redirected), redirected_at, created_at |
| **resumes**   | user_id, resume_text, version_name, created_at |
| **ai_usage**  | user_id, feature (resume_ai/career_chat), usage_count, period (YYYY-MM), created_at |

Tables are created on startup via `Base.metadata.create_all(bind=engine)` in `main.py`.

## API ↔ DB

- **POST /api/auth/register** → inserts `User` (plan=free).
- **POST /api/auth/login** → validates against `User`.
- **POST /api/jobs/search** → SerpAPI/mock; no DB write.
- **GET /api/jobs/list** → Jobs for which the user has an `Application` row.
- **POST /api/jobs/action** → Creates/gets `Job`, inserts `Application` with status (viewed/shortlisted/redirected); sets `redirected_at` when status=redirected.
- **POST /api/resume/upload** → inserts `Resume`.
- **POST /api/resume/improve** → checks limit via `AIUsage`, increments `AIUsage` for `resume_ai` this month.
- **POST /api/chat/guidance** → optional auth; can increment `AIUsage` for `career_chat` if you add a limit check.
- **GET /api/subscription/me** → plan from `User.plan` (or mock); usage from `AIUsage` + `Application`.
- **POST /api/subscription/mock-set-plan** → updates `User.plan` in DB.

## Legal (Assisted Apply)

- **No auto-submit.** `applications` only records user actions: viewed, shortlisted, redirected.
- **redirected** = user chose “Apply” and was sent to `apply_url`; we do not submit forms or store false “applied” statuses.

## Where pricing limits are enforced

- **Resume AI** – `app/plan_checks.py`: `check_resume_ai_allowed(db, user_id)` in `app/routers/resume.py` before improve.
- **Redirects (Assisted Apply)** – `check_redirect_allowed(db, user_id)` in `app/routers/jobs.py` before recording action=redirected.
- **Job save limit** – `check_job_save_allowed(db, user_id)` in `app/routers/jobs.py` before creating Job + Application.
- **Chat messages** – `check_chat_messages_allowed(db, user_id)` in chat router if you add a message endpoint.
- Plan is read from **`User.plan`** when `db` is passed to `get_user_plan(user_id, db)`; otherwise mock store (hackathon).

## Scaling to PostgreSQL

Set `DATABASE_URL=postgresql://user:pass@host/dbname`. Remove SQLite-specific `connect_args` in `db.py` if needed (already conditional on `"sqlite" in settings.database_url`).
