"""
Match score and reasons for job discovery.
Uses user's latest resume text (keywords) vs job title/description.
"""
from __future__ import annotations

import re
from typing import Any


def _normalize_text(text: str | None) -> str:
    if not text:
        return ""
    return re.sub(r"\s+", " ", text.lower().strip())


def _extract_keywords(text: str, min_len: int = 3) -> set[str]:
    """Simple word tokenization; drop very short and common words."""
    stop = {"the", "and", "for", "with", "you", "your", "this", "that", "are", "was", "have", "has", "from", "can", "will", "all", "any", "not", "but", "its", "may", "new", "one", "our", "out", "use", "via"}
    normalized = _normalize_text(text)
    words = re.findall(r"[a-z0-9]+", normalized)
    return {w for w in words if len(w) >= min_len and w not in stop}


def compute_match(resume_text: str | None, job_title: str, job_description: str | None) -> tuple[float, list[str]]:
    """
    Return (match_score 0-100, reasons).
    If no resume, returns (0, []).
    """
    if not resume_text or not resume_text.strip():
        return 0.0, []

    resume_kw = _extract_keywords(resume_text)
    job_text = f"{job_title} {job_description or ''}"
    job_kw = _extract_keywords(job_text)

    if not job_kw:
        return 0.0, []

    overlap = resume_kw & job_kw
    ratio = len(overlap) / len(job_kw) if job_kw else 0
    # Score 0-100: overlap ratio and absolute overlap count
    score = min(100.0, (ratio * 60) + (min(len(overlap), 15) * 2.5))

    reasons: list[str] = []
    if overlap:
        sample = sorted(overlap)[:5]
        reasons.append(f"Your resume matches keywords: {', '.join(sample)}")
    if ratio >= 0.2:
        reasons.append("Strong keyword alignment with job description")
    if ratio >= 0.1:
        reasons.append("Some skills match the role")

    return round(score, 1), reasons
