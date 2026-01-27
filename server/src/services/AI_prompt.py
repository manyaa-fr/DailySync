def build_daily_summary_prompt(payload: dict) -> str:
    return f"""
You are generating a daily developer standup summary.

Rules:
- Do NOT invent work.
- Do NOT estimate time.
- Use stats exactly as provided.
- If data is missing, mention it explicitly.

Input:
{payload}

Output JSON ONLY:
{{
  "score": number (0-10),
  "summary": string,
  "highlights": string[],
  "gaps": string[]
}}
"""  