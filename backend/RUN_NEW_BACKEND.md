# PathPilot Backend (new structure)

Minimal backend at repo root: `main.py`, `db.py`, `models/`, `schemas/`, `routers/`, `services/`.

## Run

From the **backend** directory:

```bash
cd backend
source .venv/bin/activate   # or: .venv/bin/uvicorn ...
uvicorn main:app --reload
```

Or without activating venv:

```bash
cd backend
.venv/bin/uvicorn main:app --reload
```

- API: http://localhost:8000
- Docs: http://localhost:8000/docs
- Health: http://localhost:8000/health

## Database

- SQLite file: `pathpilot.db` (created in `backend/` when the server starts).
- Tables are created automatically on startup via `Base.metadata.create_all(bind=engine)` in `main.py`.

## Job search (SerpAPI)

- **GET /api/jobs/search** and **POST /api/jobs/search** fetch jobs from SerpAPI Google Jobs when `SERPAPI_KEY` is set.
- One search = one request: when the user searches on the Job Finder (or Assisted Apply), the backend calls SerpAPI once and returns the results.
- If `SERPAPI_KEY` is not set, mock job data is returned so the app still runs. Set it in the environment or a `.env` file:

  ```bash
  export SERPAPI_KEY=your_serpapi_key
  ```

  Get a key at [serpapi.com](https://serpapi.com/).

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/auth/register | Register |
| POST | /api/auth/login | Login |
| GET | /api/jobs/search | Job search (SerpAPI or mock) |
| POST | /jobs/save | Save a job |
| POST | /apply/redirect | Record redirect (no auto-submit) |
| POST | /resume/save | Save resume |
| GET | /resume/list | List resumes |
| POST | /ai/usage/increment | Increment AI usage |
| GET | /ai/usage/status | AI usage status |

## Legal

Assisted Apply only: we store `viewed` / `shortlisted` / `redirected`. We never auto-submit applications; the user submits on external job portals.
