"""Resume improvement via LLM. Returns improved text + keyword suggestions + section feedback."""
import json
import re
from services.llm import complete


def improve_resume(resume_text: str, job_description: str | None = None) -> dict:
    """
    Returns {improved_text, keyword_suggestions (list), section_feedback (dict)}.
    """
    job_ctx = f"\nTarget job description (optional):\n{job_description[:3000]}" if job_description else ""
    system = (
        "You are a resume expert. Improve the resume for clarity and ATS. "
        "Reply with ONLY the improved resume text, no preamble or explanation."
    )
    user = f"Resume to improve:\n{resume_text[:8000]}{job_ctx}"
    improved = complete(system, user, max_tokens=2048)

    system2 = (
        "You are a resume expert. Reply with valid JSON only: "
        '{"keyword_suggestions": ["keyword1", "keyword2", ...], "section_feedback": {"summary": "feedback", "experience": "feedback", "skills": "feedback"}}. '
        "Give 5-8 keyword suggestions and brief section_feedback. No markdown."
    )
    user2 = f"Resume:\n{resume_text[:4000]}"
    extra = complete(system2, user2, max_tokens=512)
    keyword_suggestions: list[str] = []
    section_feedback: dict[str, str] = {}
    try:
        text = extra.strip()
        if "```" in text:
            text = re.sub(r"```(?:json)?\s*", "", text).replace("```", "").strip()
        data = json.loads(text)
        keyword_suggestions = data.get("keyword_suggestions") or []
        section_feedback = data.get("section_feedback") or {}
    except Exception:
        keyword_suggestions = ["skills", "achievements", "quantify results"]
        section_feedback = {"summary": "Consider a strong summary.", "experience": "Use bullet points."}

    return {
        "improved_text": improved,
        "keyword_suggestions": keyword_suggestions[:15],
        "section_feedback": section_feedback,
    }
