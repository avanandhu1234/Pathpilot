"""Resume improvement via LLM. Returns improved text + keyword suggestions + section feedback."""
import json
import re
from services.llm import complete


def generate_resume(
    full_name: str = "",
    email: str = "",
    phone: str = "",
    location: str = "",
    summary: str = "",
    experience: str = "",
    education: str = "",
    skills: str = "",
) -> str:
    """
    Generate a full resume from user-provided sections using OpenAI.
    Returns plain resume text (no preamble).
    """
    sections = []
    if full_name or email or phone or location:
        sections.append(
            f"Contact: {full_name or 'Name'}. "
            f"Email: {email or 'email@example.com'}. Phone: {phone or '—'}. Location: {location or '—'}."
        )
    if summary:
        sections.append(f"Professional Summary:\n{summary}")
    if experience:
        sections.append(f"Experience:\n{experience}")
    if education:
        sections.append(f"Education:\n{education}")
    if skills:
        sections.append(f"Skills:\n{skills}")
    if not sections:
        return (
            "Resume\n\n"
            "Add your contact details, summary, experience, education, and skills in the form, "
            "then click Generate Resume to create your resume with AI."
        )
    user_content = "\n\n".join(sections)
    system = (
        "You are a professional resume writer. Given the following information about a candidate, "
        "write a clear, professional resume. Use standard sections: Contact (or header), "
        "Professional Summary, Experience, Education, Skills. Format with clear headings and bullet points. "
        "Reply with ONLY the resume text, no preamble or explanation. Do not invent details; use only what is provided."
    )
    return complete(system, user_content[:6000], max_tokens=2048)


def evaluate_resume(resume_text: str, job_description: str | None = None) -> dict:
    """
    Evaluate resume quality with OpenAI. Returns overall_score (0-100), categories, and feedback.
    categories: list of {name, score, status} where status is "good"|"warning"|"poor".
    """
    job_ctx = f"\nTarget job (optional):\n{job_description[:2000]}" if job_description else ""
    system = (
        "You are a resume expert and ATS specialist. Evaluate the resume. "
        "Reply with valid JSON only, no markdown or code fence: "
        '{"overall_score": number 0-100, "categories": [{"name": "Content", "score": number 0-100, "status": "good"|"warning"|"poor"}, '
        '{"name": "Keywords", "score": number, "status": "..."}, {"name": "Formatting", "score": number, "status": "..."}, {"name": "Length", "score": number, "status": "..."}], '
        '"feedback": ["brief tip 1", "brief tip 2", ...]}. '
        "Give 4 categories and 3-5 short feedback tips. overall_score must be 0-100."
    )
    user_msg = f"Resume to evaluate:\n{resume_text[:6000]}{job_ctx}"
    raw = complete(system, user_msg, max_tokens=800)
    try:
        text = raw.strip()
        if "```" in text:
            text = re.sub(r"```(?:json)?\s*", "", text).replace("```", "").strip()
        data = json.loads(text)
        overall = max(0, min(100, int(data.get("overall_score", 0))))
        categories = data.get("categories") or []
        feedback = data.get("feedback") or []
        if not categories:
            categories = [
                {"name": "Content", "score": overall, "status": "good" if overall >= 70 else "warning"},
                {"name": "Keywords", "score": overall, "status": "good" if overall >= 70 else "warning"},
                {"name": "Formatting", "score": overall, "status": "good" if overall >= 70 else "warning"},
                {"name": "Length", "score": overall, "status": "good" if overall >= 70 else "warning"},
            ]
        return {
            "overall_score": overall,
            "categories": categories[:6],
            "feedback": feedback[:10],
        }
    except Exception:
        return {
            "overall_score": 70,
            "categories": [
                {"name": "Content", "score": 70, "status": "good"},
                {"name": "Keywords", "score": 65, "status": "warning"},
                {"name": "Formatting", "score": 75, "status": "good"},
                {"name": "Length", "score": 70, "status": "good"},
            ],
            "feedback": ["Evaluation could not be parsed. Review clarity and structure."],
        }


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
