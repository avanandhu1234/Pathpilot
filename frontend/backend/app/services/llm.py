"""LLM calls (OpenAI-compatible). Returns plain text. Mock when no key or on error."""
import logging
from app.config import settings

logger = logging.getLogger(__name__)


def complete(system: str, user: str, max_tokens: int = 1024) -> str:
    if not settings.openai_api_key or not settings.openai_api_key.strip():
        logger.warning("OPENAI_API_KEY not set; using mock LLM. Add OPENAI_API_KEY to backend/.env for real AI.")
        return _mock_complete(system, user)
    try:
        import openai
        client = openai.OpenAI(
            api_key=settings.openai_api_key,
            base_url=settings.openai_base_url or None,
        )
        r = client.chat.completions.create(
            model=settings.llm_model,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
            max_tokens=max_tokens,
        )
        if r.choices and r.choices[0].message.content:
            return r.choices[0].message.content.strip()
        logger.warning("OpenAI returned empty content; using mock.")
    except Exception as e:
        logger.exception("OpenAI API call failed: %s. Using mock response.", e)
    return _mock_complete(system, user)


def _mock_complete(system: str, user: str) -> str:
    return (
        "[Mock LLM] You asked about: "
        + (user[:200] if user else "nothing")
        + ". Configure OPENAI_API_KEY for real responses."
    )
