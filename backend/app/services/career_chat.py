"""Career guidance: target role -> skills, tools, certifications, roadmap. Uses OpenAI when OPENAI_API_KEY is set."""
import json
import re
from app.services.llm import complete


def _extract_json(text: str) -> dict | None:
    """Extract JSON object from LLM output (handles ```json ... ``` or raw JSON)."""
    text = text.strip()
    # Try raw parse first
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    # Look for ```json ... ``` or ``` ... ```
    for pattern in (r"```(?:json)?\s*(\{.*?\})\s*```", r"(\{.*\})", r"(\{[\s\S]*\})"):
        match = re.search(pattern, text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(1).strip())
            except json.JSONDecodeError:
                continue
    return None


def get_guidance(target_role: str) -> dict:
    """Returns {skills_to_learn, tools_technologies, certifications, learning_roadmap}."""
    system = (
        "You are a career coach. Reply with valid JSON only. Use exactly these keys: "
        '"skills_to_learn" (array of 4-6 skill names), "tools_technologies" (array of 4-6 tools/tech), '
        '"certifications" (array of 3-5 cert names), "learning_roadmap" (array of 4-6 short step strings). '
        "Be specific to the target role. Output only the JSON object, no markdown or explanation."
    )
    user = f"Target role: {target_role}. Give concrete, actionable guidance as JSON."
    out = complete(system, user, max_tokens=1024)
    data = _extract_json(out)
    if data and isinstance(data, dict):
        return {
            "skills_to_learn": data.get("skills_to_learn") if isinstance(data.get("skills_to_learn"), list) else [],
            "tools_technologies": data.get("tools_technologies") if isinstance(data.get("tools_technologies"), list) else [],
            "certifications": data.get("certifications") if isinstance(data.get("certifications"), list) else [],
            "learning_roadmap": data.get("learning_roadmap") if isinstance(data.get("learning_roadmap"), list) else [],
        }
    return {
        "skills_to_learn": ["Communication", "Technical skills", "Leadership"],
        "tools_technologies": ["Relevant tools for " + target_role],
        "certifications": ["Industry certification"],
        "learning_roadmap": [
            "1. Assess current skills",
            "2. Fill gaps with courses",
            "3. Build portfolio",
            "4. Network and apply",
        ],
    }
