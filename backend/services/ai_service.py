import os
import json
import re

# ─────────────────────────────────────────────
# AI Task Breaker Service
# Supports: Groq (default), Anthropic, OpenAI
# Set AI_PROVIDER in .env to switch
# ─────────────────────────────────────────────

AI_PROVIDER = os.environ.get("AI_PROVIDER", "groq").lower()

SYSTEM_PROMPT = (
    "You are a productivity assistant. Break the given task into 5–8 clear, "
    "actionable, beginner-friendly steps. Return ONLY valid JSON with keys "
    '"title" (string) and "steps" (array of strings). '
    "Do not include any extra text, markdown, or code fences."
)

FALLBACK_STEPS = [
    "Define the goal and scope clearly",
    "Research any required background knowledge",
    "Break the task into smaller sub-tasks",
    "Start with the easiest sub-task first",
    "Review progress and adjust your plan",
    "Complete remaining sub-tasks one by one",
    "Do a final review and mark the task done",
]


def _parse_json_response(raw: str, task_title: str) -> dict:
    """Safely extract JSON from AI response."""
    cleaned = re.sub(r"```(?:json)?|```", "", raw).strip()
    try:
        data = json.loads(cleaned)
        return {
            "title": data.get("title", task_title),
            "steps": data.get("steps", FALLBACK_STEPS),
        }
    except (json.JSONDecodeError, Exception):
        return {"title": task_title, "steps": FALLBACK_STEPS}


def break_task_groq(task: str) -> dict:
    """Call Groq API to break a task into steps."""
    try:
        from groq import Groq
        client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
        response = client.chat.completions.create(
            model=os.environ.get("GROQ_MODEL", "llama3-8b-8192"),
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f'Break this task into steps: "{task}"'},
            ],
            max_tokens=1024,
        )
        raw = response.choices[0].message.content
        return _parse_json_response(raw, task)
    except Exception as e:
        print(f"[AI ERROR - Groq] {e}")
        return {"title": task, "steps": FALLBACK_STEPS}


def break_task_anthropic(task: str) -> dict:
    """Call Anthropic Claude API to break a task into steps."""
    try:
        import anthropic
        client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))
        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1024,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": f'Break this task into steps: "{task}"'}],
        )
        raw = message.content[0].text
        return _parse_json_response(raw, task)
    except Exception as e:
        print(f"[AI ERROR - Anthropic] {e}")
        return {"title": task, "steps": FALLBACK_STEPS}


def break_task_openai(task: str) -> dict:
    """Call OpenAI API to break a task into steps."""
    try:
        from openai import OpenAI
        client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f'Break this task into steps: "{task}"'},
            ],
            max_tokens=1024,
        )
        raw = response.choices[0].message.content
        return _parse_json_response(raw, task)
    except Exception as e:
        print(f"[AI ERROR - OpenAI] {e}")
        return {"title": task, "steps": FALLBACK_STEPS}


def break_task(task: str) -> dict:
    """Main entry point — routes to the configured AI provider."""
    if not task or not task.strip():
        return {"title": "Unnamed Task", "steps": FALLBACK_STEPS}

    task = task.strip()

    if AI_PROVIDER == "openai":
        return break_task_openai(task)
    elif AI_PROVIDER == "anthropic":
        return break_task_anthropic(task)
    else:
        return break_task_groq(task)