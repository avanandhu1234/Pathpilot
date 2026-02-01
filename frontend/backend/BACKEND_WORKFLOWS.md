# PathPilot Backend – Data Flow & Workflows

## 1) Job Search & Job Discovery

**Flow:**
1. Frontend calls **GET /api/jobs/search?q=...&location=...** (or POST /api/jobs/search with body).
2. Backend calls **SerpAPI** (Google Jobs); if no key, returns mock data.
3. Raw results are **normalized** (title, company, location, description, apply_url).
4. Each job is **stored** in `jobs` (upsert by title+company) so we have stable IDs for apply.
5. If user is **authenticated**, latest resume is loaded and **match_score + reasons** are computed (keyword overlap vs job title/description).
6. Response: list of **JobSearchResultResponse** (id, title, company, location, description, apply_url, source, **match_score**, **reasons**).

**Endpoints:** GET/POST `/api/jobs/search`, GET `/api/jobs/list`, POST `/api/jobs/save`, POST `/api/jobs/action`.

---

## 2) Career Guidance AI Chatbot

**Flow:**
1. Frontend sends **POST /api/ai/chat** with `{ message, conversation_id? }`.
2. Backend loads **user profile** (latest resume excerpt) and **conversation history**.
3. **Plan limit** is checked (free=10 messages/month, pro/premium=unlimited); if over, 403.
4. **Prompt** = system (career coach + user profile) + history + new user message.
5. **LLM** (OpenAI-compatible) returns assistant reply.
6. **User message** and **assistant message** are stored in `messages`; **usage** (career_chat) incremented in `ai_usage`.
7. Response: **ChatResponse** (conversation_id, message_id, content, usage_remaining).

**Endpoints:** POST `/api/ai/chat`, GET `/api/ai/conversations`, GET `/api/ai/conversations/{id}/messages`, POST/GET `/api/ai/usage/*`.

---

## 3) Resume Builder

**Flow:**
1. **Improve:** Frontend sends **POST /api/resume/improve** with `{ resume_text, job_description?, version_name? }`.
2. **Plan limit** checked (free=2/month, pro=20, premium=unlimited); if over, 403.
3. **LLM** returns improved text + keyword_suggestions + section_feedback (second call for JSON).
4. **New version** saved in `resumes`; **resume_ai** usage incremented.
5. Response: **ResumeImproveResponse** (improved_text, keyword_suggestions, section_feedback, resume_id, generations_remaining).
6. **Score:** POST **/api/resume/score** with resume_text + job_description → **ResumeScoreResponse** (score 0–100, reasons). No usage limit.

**Endpoints:** POST `/api/resume/save`, GET `/api/resume/list`, POST `/api/resume/upload`, POST `/api/resume/improve`, POST `/api/resume/score`.

---

## 4) Assisted Apply (Legal – Redirect Only)

**Flow:**
1. **No auto-apply.** Backend never submits applications; it only **logs status** and returns **apply_url**.
2. **POST /api/apply/redirect** or **POST /api/apply/status** with `{ job_id, status: "viewed"|"shortlisted"|"redirected" }`.
3. Backend ensures job exists; **upserts** row in `applications` (user_id, job_id, status, redirected_at when status=redirected).
4. Response includes **apply_url** so frontend can **open it in a new tab**; user applies on the official site.
5. **GET /api/apply/list** returns user’s applications (tracking only).

**Endpoints:** POST `/api/apply/redirect`, POST `/api/apply/status`, GET `/api/apply/list`.

---

## Tech Summary

- **DB:** SQLite, SQLAlchemy ORM (`users`, `jobs`, `applications`, `resumes`, `ai_usage`, `conversations`, `messages`).
- **Auth:** JWT (Bearer); optional auth for job search (match_score when logged in).
- **Limits:** Enforced in backend per plan (free/pro/premium) for career_chat and resume_ai.
- **LLM:** `services/llm.py` (OpenAI-compatible); env: OPENAI_API_KEY, OPENAI_BASE_URL, LLM_MODEL.
- **SerpAPI:** `services/serpapi.py`; env: SERPAPI_KEY.
