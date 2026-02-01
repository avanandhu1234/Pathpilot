"""App settings from env. Load .env from backend dir so OPENAI_API_KEY etc. are set."""
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# Load .env from backend/ so OPENAI_API_KEY, SERPAPI_KEY etc. are available
_env_path = BASE_DIR / ".env"
if _env_path.exists():
    from dotenv import load_dotenv
    load_dotenv(_env_path)


class Settings:
    secret_key: str = os.getenv("SECRET_KEY", "change-me-in-production")
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7  # 7 days
    database_url: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'pathpilot.db'}")
    openai_api_key: str | None = os.getenv("OPENAI_API_KEY")
    openai_base_url: str | None = os.getenv("OPENAI_BASE_URL")
    llm_model: str = os.getenv("LLM_MODEL", "gpt-4o-mini")
    serpapi_key: str | None = os.getenv("SERPAPI_KEY")
    resume_generations_per_day: int = int(os.getenv("RESUME_GENERATIONS_PER_DAY", "5"))


settings = Settings()
