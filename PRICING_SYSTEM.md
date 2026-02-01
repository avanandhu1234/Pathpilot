# PathPilot Freemium Pricing System

Currency: **EUR (€)**. No payment gateway in this implementation; subscription state is **mocked** for hackathon.

---

## Plans

| Plan | Name | Price | Key limits |
|------|------|-------|------------|
| **free** | Explorer | €0/month | Resume AI: 2/mo, Chat: 10 msgs/mo, Redirects: 10/mo, Jobs saved: 10, No AI job recommendations |
| **pro** | PathPilot Pro | €12/month or €99/year | Resume AI: 20/mo, Chat: unlimited (fair use), Redirects: 20/mo, AI recommendations, skill gap analysis |
| **premium** | Career Accelerator | €29/month | Everything in Pro + unlimited redirects & resume AI, career roadmap, AI mock interview |

---

## Where pricing checks live

### Backend (FastAPI)

- **`app/plans.py`**  
  Plan limits (constants), `get_user_plan(user_id)`, `set_user_plan(user_id, plan)` (mock), and helpers: `check_resume_ai_limit`, `check_chat_messages_limit`, `check_redirect_limit`, `check_job_save_limit`, `has_plan_at_least`.

- **`app/plan_checks.py`**  
  Feature gating: `check_resume_ai_allowed(db, user_id)`, `check_chat_messages_allowed(db, user_id)`, `check_redirect_allowed(db, user_id)`, `check_job_save_allowed(db, user_id)`, `require_ai_job_recommendations(user_id)`. Each raises **HTTP 403** with `detail: { code: "plan_limit" | "feature_locked", message, upgrade_url: "/pricing" }` when the user is over limit or on free plan for a Pro/Premium feature.

- **`app/routers/subscription.py`**  
  - `GET /api/subscription/me` – current plan and usage (requires auth).  
  - `POST /api/subscription/mock-set-plan` – body `{ plan: "free"|"pro"|"premium" }` to set plan for demo (no payment).  
  - `GET /api/subscription/plans` – list plan definitions for the pricing page (no auth).

- **Routers that must enforce limits**  
  - **`app/routers/resume.py`** – at start of `improve()`: call `check_resume_ai_allowed(db, user.id)`.  
  - **`app/routers/chat.py`** – at start of `send_message()`: call `check_chat_messages_allowed(db, user.id)`.  
  - **`app/routers/jobs.py`** – in `record_action()` when `action == "redirected"`: call `check_redirect_allowed(db, user.id)`; for free plan job save limit, enforce before storing more than 10 jobs; for AI job recommendations, skip or gate with `require_ai_job_recommendations(user.id)` in `search_jobs()`.

See **`backend/PRICING_INTEGRATION.md`** for exact code locations and how to register the subscription router in `main.py`.

### Frontend

- **`app/pricing/page.tsx`**  
  Pricing page: 3 plans (Explorer, PathPilot Pro, Career Accelerator) in EUR, Pro highlighted as “Most Popular”, feature comparison table, upgrade CTAs. For signed-in users, “Demo: set your plan” calls `POST /api/subscription/mock-set-plan` to switch plan without payment.

- **`lib/api.ts`**  
  Types: `PlanId`, `SubscriptionMeResponse`, `SubscriptionUsage`. Helpers: `isUpgradeRequiredError(err)`, `getUpgradeUrl(err)` for 403 responses with `detail.code === "plan_limit"` or `"feature_locked"`.

- **`components/upgrade-prompt.tsx`**  
  Modal shown when the API returns a plan-limit or feature-locked error: title, message, “View plans” (→ `/pricing`) and “Maybe later”.

- **Usage of upgrade prompt**  
  - **Resume Builder** – after “Improve with AI” fails with 403 (resume AI limit).  
  - **Assisted Apply** – after “Apply” (redirect) fails with 403 (redirect limit).  
  You can reuse the same pattern on Career Guidance chat when `/api/chat/message` returns 403 (chat message limit).

---

## Flow

1. User hits a limit or a Pro/Premium-only feature (e.g. resume AI, redirect, chat message).  
2. Backend runs the right `check_*_allowed` or `require_ai_job_recommendations` and returns **403** with `detail: { code, message, upgrade_url }`.  
3. Frontend catches the error, uses `isUpgradeRequiredError(err)`; if true, shows `<UpgradePrompt />` with the message and link to `/pricing`.  
4. User can go to Pricing, see plans and comparison table, and (for demo) use “Mock set plan” to switch to Pro or Premium without payment.

No payment gateway is implemented; plan state is stored in memory in `app/plans._mock_plan_store` (key: user id, value: plan). For production, replace with `User.subscription_plan` and real billing.
