# PathPilot – Vercel Deployment (Shipment-Ready)

This project works when deployed to Vercel with **no manual commands**. Backend logic runs via API routes (serverless); the app works by visiting the deployed URL.

---

## Architecture

- **Frontend:** Next.js (in `frontend/`). Deploy with **Root Directory** = `frontend`.
- **Backend logic:** Python in `frontend/backend/` (copy of repo `backend/`). Used by serverless functions.
- **API (serverless):** `frontend/api/` – Python handlers run automatically when `/api/*` is requested.
- **Database:** SQLite. Auto-initializes on first request; tables auto-create. On Vercel, DB path is `/tmp/pathpilot.db` (per-invocation; for persistent data use Vercel Postgres or external DB).

---

## Deploy to Vercel

1. **Connect repo** to Vercel (GitHub/GitLab/Bitbucket).
2. **Root Directory:** Set to `frontend`.
3. **Build:** Vercel uses Next.js preset; build = `npm run build`, output = `.next`.
4. **Environment variables:** In Vercel project → Settings → Environment Variables, add:
   - `SECRET_KEY` – JWT signing secret
   - `DATABASE_URL` – optional; default SQLite in /tmp
   - `SERPAPI_KEY` – job search (SerpAPI)
   - `ADZUNA_APP_ID`, `ADZUNA_APP_KEY` – optional job fallback
   - `RAPIDAPI_KEY` – optional Indeed source
   - `OPENAI_API_KEY` – optional for AI features
5. **Do not set** `NEXT_PUBLIC_API_URL` in production so the frontend uses same-origin `/api` (serverless).
6. Deploy. No `uvicorn` or other manual commands.

---

## How It Works

- User visits `https://your-app.vercel.app`.
- **Search Jobs:** Frontend calls `POST /api/jobs/search` → Vercel runs `frontend/api/jobs/search.py` → backend logic (same-day reuse, then JSON, then SerpAPI) → JSON response → UI shows jobs with application links.
- **Auth, Resume, Apply:** For full parity with the FastAPI backend, add more handlers under `frontend/api/` (e.g. `api/auth/login.py`, `api/auth/register.py`) or host the FastAPI app elsewhere and set `NEXT_PUBLIC_API_URL` to that URL.

---

## Job Search Logic (Automatic)

When `/api/jobs/search` is called:

1. **Same-day reuse:** Check DB for `search_sessions` with same (query, location) and `created_at` today. If found, return jobs from `job_matches` (no scrape).
2. **Else:** Load from `data/jobs.json` (filter by query/location); if results, upsert to DB, create search_session + job_matches, return.
3. **Else:** Call SerpAPI/Adzuna, normalize, upsert jobs, create search_session + job_matches, return.

---

## Local Development

- **Option A – Vercel Dev:** `cd frontend && vercel dev` – runs Next.js and Python serverless locally.
- **Option B – Separate backend:** Run FastAPI with `cd backend && uvicorn main:app --reload`, set `NEXT_PUBLIC_API_URL=http://localhost:8000` in `frontend/.env.local`, run `cd frontend && npm run dev`.

---

## Required Tables (Auto-Created)

- `users`
- `jobs`
- `search_sessions`
- `job_matches`
- `applications`
- `resumes`
- `ai_usage`
- `conversations`, `messages`

All created by `backend/db.py` `ensure_tables()` on first use (no manual migration).
