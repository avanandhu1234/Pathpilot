# PathPilot – Project Structure (for AI Agents & Developers)

This document gives a **structured view** of the repo so any AI agent or developer can navigate and extend it.

---

## 1. Project Overview

| Item | Description |
|------|-------------|
| **Name** | PathPilot (hackton repo) |
| **Purpose** | AI-powered job search & career platform: job search (SerpAPI/Adzuna), assisted apply (redirect only), resume builder, career guidance chatbot (Kyro), pricing/subscription. |
| **Stack** | **Frontend:** Next.js 16, React 19, TypeScript, Tailwind, Radix UI. **Backend:** FastAPI, SQLite, SQLAlchemy, Pydantic, JWT (python-jose + bcrypt). |
| **Auth** | JWT in `Authorization: Bearer <token>`; token stored in `localStorage` as `pathpilot_token`. |
| **API base** | Backend: `http://localhost:8000`. Frontend calls it via `NEXT_PUBLIC_API_URL` (default `http://localhost:8000`). All API routes are under `/api/*`. |

---

## 2. Repository Layout

```
hackton/
├── backend/                 # FastAPI app (Python)
│   ├── main.py              # App entry, CORS, router mounts
│   ├── db.py                # SQLAlchemy engine, Base, get_db
│   ├── auth_utils.py        # JWT create/verify, password hash (bcrypt)
│   ├── requirements.txt     # Python deps
│   ├── .env                 # Secrets (not committed). Copy from .env.example
│   ├── .env.example         # Env var template
│   ├── models/              # SQLAlchemy ORM
│   │   ├── user.py
│   │   ├── job.py
│   │   ├── application.py
│   │   ├── resume.py
│   │   ├── ai_usage.py
│   │   ├── conversation.py
│   │   └── __init__.py
│   ├── schemas/             # Pydantic request/response
│   │   ├── user.py, job.py, application.py, resume.py, chat.py, subscription.py, ai_usage.py
│   ├── routers/             # API route handlers
│   │   ├── auth.py          # /api/auth
│   │   ├── jobs.py          # /api/jobs
│   │   ├── apply.py         # /api/apply
│   │   ├── resume.py        # /api/resume
│   │   ├── ai.py            # /api/ai
│   │   ├── subscription.py  # /api/subscription
│   │   └── chat.py          # /api/chat
│   └── services/            # Business logic
│       ├── serpapi.py       # Job search: SerpAPI → Adzuna → mock
│       ├── job_match.py     # Match score vs resume
│       ├── llm.py           # OpenAI client
│       ├── resume_ai.py     # Resume improve/score
│       └── career_guidance.py / ai_service.py
├── frontend/                # Next.js app
│   ├── app/                 # App Router pages & API routes
│   │   ├── layout.tsx
│   │   ├── page.tsx         # Home
│   │   ├── sign-in/, sign-up/
│   │   ├── job-finder/      # Job search UI
│   │   ├── assisted-apply/  # Apply + cover letter
│   │   ├── career-guidance/ # Kyro chatbot tab
│   │   ├── resume-builder/, pricing/, etc.
│   │   └── api/kyro/        # Next.js API route for Kyro (OpenAI)
│   ├── components/         # Reusable UI (header, footer, kyro-chat, ui/*)
│   ├── contexts/           # auth-context.tsx (user, token, login/logout)
│   ├── lib/
│   │   ├── api.ts          # Backend API client (getBaseUrl, api.get/post, mapBackendJobToJob)
│   │   └── utils.ts
│   ├── .env.local          # NEXT_PUBLIC_API_URL, OPENAI_API_KEY (for Kyro)
│   └── package.json
├── PROJECT_STRUCTURE.md     # This file
├── LINKING.md
└── .vscode/launch.json
```

---

## 3. Backend API Reference

Base URL: `http://localhost:8000`. All routes below are prefixed with this base.

### 3.1 Health

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Returns `{"status":"ok"}`. No auth. |

### 3.2 Auth (`/api/auth`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Body: `{ email, password }`. Returns `{ access_token, token_type, user }`. |
| POST | `/api/auth/login` | Body: `{ email, password }`. Returns `{ access_token, token_type, user }`. |

### 3.3 Jobs (`/api/jobs`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/jobs/search?q=&location=` | Job search (SerpAPI → Adzuna → mock). Optional auth for match score. |
| POST | `/api/jobs/search` | Body: `{ job_title?, location?, remote? }`. Same as GET. |
| GET | `/api/jobs/list` | Jobs linked to user (applications). **Auth required.** |
| POST | `/api/jobs/save` | Save job. **Auth required.** |
| POST | `/api/jobs/action` | Body: `{ job_id, action: "redirected", job? }`. Record apply redirect. **Auth required.** |
| POST | `/api/jobs/cover-letter` | Stub cover letter. **Auth required.** |

### 3.4 Apply (`/api/apply`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/apply/redirect` | Record redirect; returns `apply_url`. **Auth required.** |
| POST | `/api/apply/status` | Log status (viewed/shortlisted/redirected). **Auth required.** |
| GET | `/api/apply/list` | List user applications. **Auth required.** |

### 3.5 Resume (`/api/resume`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/resume/save` | Save resume text. **Auth required.** |
| GET | `/api/resume/list` | List user resumes. **Auth required.** |
| POST | `/api/resume/upload` | Upload file (PDF/DOC/TXT). **Auth required.** |
| POST | `/api/resume/improve` | AI improve resume. **Auth required.** |
| POST | `/api/resume/score` | Score resume vs job description. **Auth required.** |

### 3.6 AI (`/api/ai`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/ai/usage/increment` | Increment usage counter. **Auth required.** |
| GET | `/api/ai/usage/status` | List usage by feature. **Auth required.** |
| POST | `/api/ai/chat` | Career guidance chat (multi-turn). **Auth required.** |
| GET | `/api/ai/conversations` | List conversations. **Auth required.** |
| GET | `/api/ai/conversations/{id}/messages` | Messages for conversation. **Auth required.** |

### 3.7 Subscription (`/api/subscription`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/subscription/me` | User plan + AI usage. **Auth required.** |
| POST | `/api/subscription/mock-set-plan` | Dev: set plan. **Auth required.** |

### 3.8 Chat (`/api/chat`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/chat/guidance` | Career guidance (single). **Auth required.** |

---

## 4. Frontend–Backend Contract

- **Auth:** After login/register, frontend stores `access_token` in `localStorage` as `pathpilot_token` and sends `Authorization: Bearer <token>` on requests (via `lib/api.ts`). Backend uses `get_current_user` or `get_current_user_optional` from `routers/auth.py`.
- **Job search response:** Backend returns a list of objects: `id`, `title`, `company`, `location`, `description`, `apply_url`, `source`, `match_score`, `reasons`, `salary`, `posted_date`. Frontend maps them in `lib/api.ts` with `mapBackendJobToJob()` to `JobResponse` (e.g. `job_title`, `company_name`, `application_url`, `posted_at`, `salary`, `matched_skills` from `reasons`).
- **CORS:** Backend allows origins `http://localhost:3000`, `http://localhost:3001`, `http://127.0.0.1:3000`, `http://127.0.0.1:3001`. Extra origins via env `CORS_ORIGINS` (comma-separated). Frontend uses `credentials: "include"` in `lib/api.ts`.

---

## 5. Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `SECRET_KEY` | Yes | JWT signing secret. |
| `DATABASE_URL` | Yes | SQLite: `sqlite:///./pathpilot.db`. |
| `SERPAPI_KEY` | No | SerpAPI key for Google Jobs. If missing/empty, job search tries Adzuna then mock. |
| `ADZUNA_APP_ID` | No | Adzuna App ID (fallback job source). |
| `ADZUNA_APP_KEY` | No | Adzuna App Key. |
| `RAPIDAPI_KEY` | No | RapidAPI key for Indeed (indeed12.p.rapidapi.com) — additional job source. |
| `OPENAI_API_KEY` | No | OpenAI for LLM (chat, resume improve). |
| `OPENAI_BASE_URL` | No | Optional OpenAI base URL. |
| `LLM_MODEL` | No | Default `gpt-4o-mini`. |
| `CORS_ORIGINS` | No | Extra CORS origins, comma-separated. |

### Frontend (`frontend/.env.local`)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | No | Backend URL. Default `http://localhost:8000`. |
| `OPENAI_API_KEY` | No | For Kyro chatbot (`app/api/kyro/route.ts`). |

---

## 6. How to Run

1. **Backend**
   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate   # or .venv\Scripts\activate on Windows
   pip install -r requirements.txt
   cp .env.example .env       # then edit .env with keys
   uvicorn main:app --reload
   ```
   Backend: http://localhost:8000. Docs: http://localhost:8000/docs.

2. **Frontend**
   ```bash
   cd frontend
   npm install   # or pnpm install
   npm run dev   # or pnpm dev (port 3001 per package.json)
   ```
   Frontend: http://localhost:3001 (or 3000 if you change the script).

---

## 7. Job data: JSON file (real data with application links)

Jobs are **served from a JSON file first** so Job Finder and Assisted Apply show real data with application links.

- **File:** `backend/data/jobs.json` — array of job objects: `id`, `title`, `company`, `location`, `description`, `apply_url`, `salary`, `posted_date`, `source`.
- **Population:** Run the fetch script (uses SerpAPI, Adzuna, and RapidAPI Indeed from `.env`):
  ```bash
  cd backend && python scripts/fetch_jobs_to_json.py
  ```
  This fetches jobs from: (1) SerpAPI/Adzuna for several (query, location) pairs, (2) RapidAPI Indeed (`indeed12.p.rapidapi.com`) for a list of companies (Ubisoft, Google, Microsoft, etc.). Results are deduped and written to `data/jobs.json`.
- **API behavior:** `GET/POST /api/jobs/search` first loads from `data/jobs.json`, filters by query/location, and returns jobs (with match_score when user is logged in). If the file is empty or missing, the backend falls back to live SerpAPI/Adzuna/mock.
- **Used by:** Job Finder page, Assisted Apply page, and anywhere the app calls `/api/jobs/search` — same API, same response shape (`mapBackendJobToJob` in `frontend/lib/api.ts`).

---

## 8. Key Flows (for context)

- **Job search:** User enters query/location → Frontend `POST /api/jobs/search` → Backend loads `data/jobs.json`, filters by q/location (or falls back to SerpAPI/Adzuna) → Response list with `apply_url`, salary, posted_date → Frontend shows cards with real data and application links.
- **Auth:** Sign up / Sign in → `POST /api/auth/register` or `/api/auth/login` → Backend returns JWT → Frontend stores token in `localStorage`, AuthContext updates → Subsequent requests send `Authorization: Bearer <token>`.
- **Assisted apply:** User clicks Apply → Frontend `POST /api/jobs/action` with `job_id` and optional `job` payload → Backend records application (redirect) and may create job if from search → Frontend opens `application_url` in new tab.
- **Career chat:** In-app Kyro uses Next.js `app/api/kyro/route.ts` (OpenAI). Backend `/api/ai/chat` is used for career guidance with history stored in DB.

---

## 9. Quick Reference for AI Agents

- **Add a new API route:** Add handler in the right file under `backend/routers/`, then ensure it’s mounted in `backend/main.py` (already under `/api/<name>`).
- **Change job search source:** Edit `backend/services/serpapi.py` (`_search_serpapi`, `_search_adzuna`, `search_jobs_mock`, and the `search_jobs` orchestration).
- **Change frontend API base URL:** Set `NEXT_PUBLIC_API_URL` in `frontend/.env.local`; used in `frontend/lib/api.ts` via `getBaseUrl()`.
- **Add a new page:** Add a folder under `frontend/app/<route>/page.tsx`; use `lib/api.ts` for backend calls and `contexts/auth-context` for auth.
- **Database:** SQLite file `backend/pathpilot.db`. Models in `backend/models/`. Migrations: optional; `main.py` runs `Base.metadata.create_all` and a small plan-column migration on startup.

Use this file as the single structured view for the project when working with any AI agent or new developer.
