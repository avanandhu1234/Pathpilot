# Linking Backend and Frontend (PathPilot)

The frontend talks to the backend over HTTP. Both must be running for full functionality.

## Quick start

**Terminal 1 – Backend**

```bash
cd backend
uvicorn main:app --reload
```

- API: http://localhost:8000  
- Docs: http://localhost:8000/docs  

**Terminal 2 – Frontend**

```bash
cd frontend
npm run dev
```

- App: http://localhost:3000  

The frontend uses `NEXT_PUBLIC_API_URL` (default `http://localhost:8000`). It’s set in `frontend/.env.local`.

## How they’re linked

| Frontend (Next.js) | Backend (FastAPI) |
|-------------------|-------------------|
| `lib/api.ts` → `getBaseUrl()` | CORS allows `*`; all routes under `/api/*` |
| Sign up / Sign in | `POST /api/auth/register`, `POST /api/auth/login` |
| Job Finder search | `POST /api/jobs/search` (mock results) |
| Quick Apply / Assisted Apply | `POST /api/jobs/action` (records redirect only) |
| Job list (Assisted Apply) | `GET /api/jobs/list` |
| Cover letter (stub) | `POST /api/jobs/cover-letter` |
| Resume upload | `POST /api/resume/upload` |
| Pricing / plan | `GET /api/subscription/me`, `POST /api/subscription/mock-set-plan` |

Auth: the frontend sends `Authorization: Bearer <token>` after login; the backend validates the JWT on protected routes.

## Changing the API URL

- **Local:** Edit `frontend/.env.local`:  
  `NEXT_PUBLIC_API_URL=http://localhost:8000`
- **Other host:** Set the same variable to your backend URL (e.g. `https://api.example.com`). Restart the Next.js dev server after changing env.
