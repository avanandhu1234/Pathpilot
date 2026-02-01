/**
 * API client for PathPilot. On Vercel: use same-origin "" so /api/* hits serverless.
 * Local: use NEXT_PUBLIC_API_URL (default http://localhost:8000) for FastAPI backend.
 */
export function getBaseUrl(): string {
  if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
  }
  // Vercel / same-origin: no API URL = use relative /api (serverless)
  if (typeof window !== "undefined" && typeof process !== "undefined" && process.env.NODE_ENV === "production") {
    return "";
  }
  return "http://localhost:8000";
}

let authToken: string | null =
  typeof window !== "undefined" ? localStorage.getItem("pathpilot_token") : null;

export function setAuthToken(token: string | null) {
  authToken = token;
  if (typeof window !== "undefined") {
    if (token) localStorage.setItem("pathpilot_token", token);
    else localStorage.removeItem("pathpilot_token");
  }
}

export function getAuthToken(): string | null {
  return authToken;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public detail?: string | Record<string, unknown>
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function getToken(): string | null {
  if (authToken) return authToken;
  if (typeof window !== "undefined") return localStorage.getItem("pathpilot_token");
  return null;
}

async function request<T>(
  path: string,
  options: Omit<RequestInit, "body"> & { body?: object; formData?: FormData } = {}
): Promise<T> {
  const { body, formData, ...rest } = options;
  const url = `${getBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (!formData) headers["Content-Type"] = "application/json";

  const init: RequestInit = {
    ...rest,
    headers: { ...headers, ...(rest.headers as Record<string, string>) },
  };
  if (formData) init.body = formData;
  else if (body != null) init.body = JSON.stringify(body);
  // Cross-origin: backend uses allow_credentials=True, so browser requires credentials: include
  init.credentials = "include";

  const res = await fetch(url, init);
  let data: unknown;
  const ct = res.headers.get("content-type");
  if (ct?.includes("application/json")) {
    try {
      data = await res.json();
    } catch {
      data = null;
    }
  } else {
    data = await res.text();
  }

  if (!res.ok) {
    const detail =
      typeof data === "object" && data !== null && "detail" in data
        ? (data as { detail?: string | Record<string, unknown> }).detail
        : String(data);
    throw new ApiError(
      typeof detail === "string" ? detail : "Request failed",
      res.status,
      detail as string | Record<string, unknown> | undefined
    );
  }
  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  post: <T>(path: string, body?: object) => request<T>(path, { method: "POST", body }),
  postForm: <T>(path: string, formData: FormData) =>
    request<T>(path, { method: "POST", formData }),
  patch: <T>(path: string, body?: object) => request<T>(path, { method: "PATCH", body }),
};

/** Matches backend User (id, email, plan). Extra fields optional for compatibility. */
export interface UserResponse {
  id: number;
  email: string;
  plan?: string;
  full_name?: string | null;
  role?: string;
  skills?: string[];
  experience_years?: number;
  career_goals?: string | null;
  education?: string | null;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: UserResponse;
}

export interface JobResponse {
  id: number;
  company_name: string;
  job_title: string;
  location: string | null;
  description: string | null;
  application_url: string;
  company_logo_url: string | null;
  match_score: number;
  matched_skills: string[];
  posted_at: string | null;
  salary: string | null;
}

/** Backend job search returns title, company, apply_url, match_score, reasons, salary, posted_date. Use mapBackendJobToJob to convert. */
export interface BackendJobResponse {
  id: number;
  title: string;
  company: string;
  location: string | null;
  description: string | null;
  apply_url: string | null;
  source?: string | null;
  match_score?: number;
  reasons?: string[];
  salary?: string | null;
  posted_date?: string | null;
}

export function mapBackendJobToJob(b: BackendJobResponse): JobResponse {
  return {
    id: b.id,
    job_title: b.title,
    company_name: b.company,
    location: b.location ?? null,
    description: b.description ?? null,
    application_url: b.apply_url ?? "",
    company_logo_url: null,
    match_score: typeof b.match_score === "number" ? b.match_score : 0,
    matched_skills: Array.isArray(b.reasons) ? b.reasons : [],
    posted_at: b.posted_date ?? b.posted_at ?? null,
    salary: b.salary ?? null,
  };
}

export interface ResumeImproveResponse {
  improved_text: string;
  keyword_suggestions: string[];
  section_feedback: Record<string, string>;
  generations_remaining: number;
}

export interface ResumeGenerateResponse {
  resume_text: string;
}

export interface ResumeEvaluateCategory {
  name: string;
  score: number;
  status: string;
}

export interface ResumeEvaluateResponse {
  overall_score: number;
  categories: ResumeEvaluateCategory[];
  feedback: string[];
  resume_id: number | null;
}

export interface ResumeWithScore {
  id: number;
  user_id: number;
  version_name: string | null;
  created_at: string;
  overall_score: number | null;
  score_details: { categories?: unknown[]; feedback?: string[] } | null;
  evaluated_at: string | null;
}

export interface CareerGuidanceResponse {
  skills_to_learn: string[];
  tools_technologies: string[];
  certifications: string[];
  learning_roadmap: string[];
}

// Subscription / pricing
export type PlanId = "free" | "pro" | "premium";

export interface SubscriptionUsage {
  resume_ai_used: number;
  resume_ai_limit: number | null;
  chat_messages_used: number;
  chat_messages_limit: number | null;
  redirects_used: number;
  redirects_limit: number | null;
  jobs_saved: number;
  jobs_saved_limit: number | null;
}

export interface SubscriptionMeResponse {
  plan: PlanId;
  plan_display_name: string;
  price_monthly_cents: number | null;
  price_yearly_cents: number | null;
  currency: string;
  usage: SubscriptionUsage;
}

/** Turn any thrown error into a short message for the UI (search failed, backend unreachable, etc.). */
export function getApiErrorMessage(err: unknown, fallback = "Request failed"): string {
  if (err instanceof ApiError) {
    const d = err.detail
    if (typeof d === "string") return d
    if (d && typeof d === "object" && "message" in d && typeof (d as { message: unknown }).message === "string")
      return (d as { message: string }).message
    if (d && typeof d === "object" && "detail" in d) return getApiErrorMessage((d as { detail: unknown }).detail, fallback)
    return err.message || fallback
  }
  if (err instanceof TypeError && (err.message === "Failed to fetch" || err.message?.includes("fetch"))) {
    const base = typeof getBaseUrl === "function" ? getBaseUrl() : "http://localhost:8000"
    return `Cannot reach the backend at ${base}. (1) Start it: cd backend && uvicorn main:app --reload  (2) Open ${base}/docs in your browser to confirm it's running.`
  }
  if (err instanceof Error && err.message) return err.message
  return fallback
}

/** True if error is plan limit / feature locked (show upgrade prompt). */
export function isUpgradeRequiredError(err: unknown): err is ApiError & { detail?: { code?: string } } {
  if (!(err instanceof ApiError)) return false;
  const d = err.detail as { code?: string } | undefined;
  return d?.code === "plan_limit" || d?.code === "feature_locked";
}

/** Upgrade URL from error detail or default. */
export function getUpgradeUrl(err: unknown): string {
  const d = err instanceof ApiError && typeof err.detail === "object" && err.detail !== null && "upgrade_url" in err.detail
    ? (err.detail as { upgrade_url?: string }).upgrade_url
    : undefined;
  return d || "/pricing";
}
