"""
LLM calls (OpenAI-compatible). Uses OPENAI_API_KEY from env. Mock when no key or on error.
"""
import os
import logging

logger = logging.getLogger(__name__)


def _get_config() -> tuple[str | None, str | None, str]:
    key = (os.getenv("OPENAI_API_KEY") or "").strip()
    base_url = (os.getenv("OPENAI_BASE_URL") or "").strip() or None
    model = os.getenv("LLM_MODEL", "gpt-4o-mini")
    return key or None, base_url, model


def complete(system: str, user: str, max_tokens: int = 1024) -> str:
    """Single completion. Returns plain text."""
    api_key, base_url, model = _get_config()
    if not api_key:
        logger.debug("OPENAI_API_KEY not set; using mock LLM")
        return _mock_complete(system, user)
    try:
        from openai import OpenAI
        client = OpenAI(api_key=api_key, base_url=base_url)
        r = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
            max_tokens=max_tokens,
        )
        if r.choices and r.choices[0].message.content:
            return r.choices[0].message.content.strip()
    except Exception as e:
        logger.warning("OpenAI call failed: %s; using mock", e)
    return _mock_complete(system, user)


def chat_completion(messages: list[dict[str, str]], max_tokens: int = 1024) -> str:
    """Multi-turn chat. messages = [{"role": "user"|"assistant"|"system", "content": "..."}]"""
    api_key, base_url, model = _get_config()
    if not api_key:
        return _mock_complete("", messages[-1].get("content", "") if messages else "")
    try:
        from openai import OpenAI
        client = OpenAI(api_key=api_key, base_url=base_url)
        r = client.chat.completions.create(
            model=model,
            messages=messages,
            max_tokens=max_tokens,
        )
        if r.choices and r.choices[0].message.content:
            return r.choices[0].message.content.strip()
    except Exception as e:
        logger.warning("OpenAI chat failed: %s; using mock", e)
    return _mock_complete("", messages[-1].get("content", "") if messages else "")


def _mock_complete(system: str, user: str) -> str:
    return (
        "[Mock LLM] You asked: "
        + (user[:200] if user else "nothing")
        + ". Set OPENAI_API_KEY in .env for real responses."
    )
