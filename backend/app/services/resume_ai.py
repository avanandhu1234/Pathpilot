"""Resume improvement via LLM."""
from app.services.llm import complete

def improve_resume(resume_text: str, job_description: str | None = None) -> dict:
    """Returns {improved_text, keyword_suggestions (list), section_feedback (dict)}."""
    job_ctx = f"\nTarget job description (optional):\n{job_description}" if job_description else ""
    system = (
        "You are a resume expert. Improve the resume for clarity and ATS. "
        "Reply with ONLY the improved resume text, no preamble."
    )
    user = f"Resume to improve:\n{resume_text[:8000]}{job_ctx}"
    improved = complete(system, user, max_tokens=2048)

    system2 = "You are a resume expert. List 5-8 keyword suggestions as a JSON array of strings, and section_feedback as a JSON object with keys like 'summary', 'experience', 'skills' and short feedback strings. Reply with valid JSON only: {\"keyword_suggestions\": [...], \"section_feedback\": {...}}"
    user2 = f"Resume:\n{resume_text[:4000]}"
    extra = complete(system2, user2, max_tokens=512)
    keyword_suggestions = []
    section_feedback = {}
    try:
        import json
        # Try to parse JSON from the response (might be wrapped in markdown)
        text = extra.strip()
        if "```" in text:
            text = text.split("```")[1].replace("json", "").strip()
        data = json.loads(text)
        keyword_suggestions = data.get("keyword_suggestions") or []
        section_feedback = data.get("section_feedback") or {}
    except Exception:
        keyword_suggestions = ["keywords", "skills", "achievements"]
        section_feedback = {"summary": "Consider a strong summary.", "experience": "Use bullet points."}

    return {
        "improved_text": improved,
        "keyword_suggestions": keyword_suggestions[:15],
        "section_feedback": section_feedback,
    }
