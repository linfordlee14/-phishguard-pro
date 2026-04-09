import os
import json
from openai import OpenAI


# --- Provider clients ---

def get_openrouter_client():
    return OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=os.environ.get("OPENROUTER_API_KEY", ""),
        default_headers={
            "HTTP-Referer": "https://phishguard-pro.vercel.app",
            "X-Title": "PhishGuard Pro"
        }
    )


def get_gemini_client():
    return OpenAI(
        base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
        api_key=os.environ.get("GEMINI_API_KEY", "")
    )


# --- Core AI call with fallback ---

def ai_chat(messages: list, max_tokens: int = 500) -> str:
    """
    Try OpenRouter first (with its own built-in fallback chain).
    If OpenRouter fails entirely, fall back to Gemini.
    If both fail, return a graceful error string.
    """
    # OpenRouter: primary model with built-in fallback to free model
    openrouter_key = os.environ.get("OPENROUTER_API_KEY", "")
    if openrouter_key:
        try:
            client = get_openrouter_client()
            response = client.chat.completions.create(
                model="openai/gpt-4o-mini",   # cheap and fast
                messages=messages,
                max_tokens=max_tokens,
                extra_body={
                    "models": [
                        "openai/gpt-4o-mini",
                        "google/gemini-2.0-flash-exp:free",
                        "meta-llama/llama-3.2-3b-instruct:free"
                    ]
                }
            )
            content = response.choices[0].message.content or ""
            return content.strip()
        except Exception as e:
            print(f"⚠️ OpenRouter failed: {e} — trying Gemini fallback")

    # Gemini: fallback
    gemini_key = os.environ.get("GEMINI_API_KEY", "")
    if gemini_key:
        try:
            client = get_gemini_client()
            response = client.chat.completions.create(
                model="gemini-2.0-flash",
                messages=messages,
                max_tokens=max_tokens
            )
            content = response.choices[0].message.content or ""
            return content.strip()
        except Exception as e:
            print(f"❌ Gemini fallback also failed: {e}")

    return "AI analysis temporarily unavailable. Please try again shortly."


# --- Feature functions ---

SA_CYBERSECURITY_SYSTEM = """You are a cybersecurity analyst specialising in 
South African SMB security awareness. You write in clear, plain English for 
non-technical business owners. You understand the South African context including 
POPIA compliance, local banking threats (FNB, Standard Bank, ABSA, Nedbank), 
SARS phishing, and local delivery scams."""


def generate_risk_narrative(campaigns: list, employees: list) -> str:
    high_risk = [e for e in employees if e.get("riskScore") == "high"]
    avg_click = sum(
        c.get("stats", {}).get("clicked", 0) / max(c.get("stats", {}).get("sent", 1), 1)
        for c in campaigns
    ) / max(len(campaigns), 1) * 100
    most_recent_rate = 0
    if campaigns:
        latest_campaign = campaigns[-1]
        latest_stats = latest_campaign.get("stats", {})
        most_recent_rate = latest_stats.get("clicked", 0) / max(latest_stats.get("sent", 1), 1) * 100

    messages = [
        {"role": "system", "content": SA_CYBERSECURITY_SYSTEM},
        {"role": "user", "content": f"""
Analyse this organisation's phishing simulation data and write a 2-3 sentence 
risk narrative for the IT manager's dashboard.

Data:
- Last {len(campaigns)} campaigns average click rate: {avg_click:.1f}%
- High-risk employees: {len(high_risk)} out of {len(employees)} total
- High-risk departments: {list(set(e.get('department','') for e in high_risk))}
- Most recent campaign click rate: {most_recent_rate:.1f}%

Write the narrative in second person ("Your team..."). 
End with one specific recommended action.
Keep it under 60 words.
"""}
    ]
    return generate_risk_narrative_with_messages(messages)


def generate_risk_narrative_with_messages(messages):
    return ai_chat(messages, max_tokens=150)


def generate_campaign_debrief(campaign_name: str, stats: dict) -> str:
    click_rate = stats.get("clicked", 0) / max(stats.get("sent", 1), 1) * 100
    report_rate = stats.get("reported", 0) / max(stats.get("sent", 1), 1) * 100
    training_rate = stats.get("trainingCompleted", 0) / max(stats.get("clicked", 1), 1) * 100

    messages = [
        {"role": "system", "content": SA_CYBERSECURITY_SYSTEM},
        {"role": "user", "content": f"""
Write a 2-paragraph executive debrief for a South African SMB CEO/MD.
This is for a phishing simulation campaign called "{campaign_name}".

Results:
- Emails sent: {stats.get('sent', 0)}
- Click rate: {click_rate:.1f}% (industry benchmark: 30%)
- Reporting rate: {report_rate:.1f}%
- Training completion: {training_rate:.1f}%

Paragraph 1: Summarise what happened in plain language.
Paragraph 2: Explain POPIA risk context and recommended next step.
Keep it under 120 words total. Professional but not alarmist.
"""}
    ]
    return ai_chat(messages, max_tokens=250)


def generate_phishing_template(brand: str, scenario: str, difficulty: str) -> dict:
    messages = [
        {"role": "system", "content": """You are a senior cybersecurity trainer in South Africa creating realistic 
phishing simulation emails for AUTHORISED security awareness training.

Rules:
- Use REAL South African brands: FNB, ABSA, Nedbank, Standard Bank, Capitec, SARS, Home Affairs, Vodacom, MTN, Cell C, Takealot, Checkers, Pick n Pay, DHL, Aramex, Discovery, Old Mutual
- The FROM address must use a convincing-but-wrong domain (e.g. fnb-alerts@fnb-secure-verify.co.za not fnb.co.za)
- Include a clickable link element that uses a suspicious URL pattern
- Write in South African English (use "cheers", "kindly", "please revert")
- The email must be self-contained and complete — not truncated
- Red flags must be SPECIFIC to THIS email's content, not generic
"""}, 
        {"role": "user", "content": f"""
Create a realistic South African phishing email simulation.

Brand: {brand}
Scenario: {scenario}
Difficulty: {difficulty} (easy = obvious red flags, hard = very subtle)

Return ONLY valid JSON in this exact format:
{{
  "subject": "email subject line",
  "htmlContent": "<p>HTML email body here</p>",
  "redFlags": ["red flag 1", "red flag 2", "red flag 3"]
}}
"""}
    ]
    raw = ai_chat(messages, max_tokens=600)
    try:
        start = raw.find("{")
        end = raw.rfind("}")
        clean = raw[start:end + 1].strip() if start != -1 and end != -1 and end > start else raw.strip()
        return json.loads(clean)
    except Exception:
        return {
            "subject": f"Urgent: Action required on your {brand} account",
            "htmlContent": f"<p>Dear Customer,</p><p>Your {brand} account requires immediate attention.</p><p><a href='#'>Click here to verify</a></p>",
            "redFlags": ["Generic greeting", "Urgent language", "Suspicious link"]
        }


def copilot_chat(message: str, context: dict) -> str:
    system = f"""You are Security Copilot, an expert cybersecurity 
assistant embedded inside PhishGuard Pro — a phishing simulation 
platform for South African SMBs.

Organisation context:
- Average click rate: {context.get('avgClickRate', 'unknown')}%
- Employee count: {context.get('employeeCount', 'unknown')}
- Last campaign: {context.get('lastCampaign', 'none yet')}

Your role:
- Give specific, actionable security advice
- Reference South African context (POPIA, local banks, SARS scams)
- Be concise — max 3 sentences per response unless the user asks for more
- Never be alarmist — be calm, expert, and reassuring
- If asked to write something (report paragraph, email), write it directly
- If asked about click rates, compare to the SA benchmark of ~32%

You are NOT a general chatbot. Stay focused on cybersecurity and 
this organisation's phishing awareness data."""

    messages = [
        {"role": "system", "content": system},
        {"role": "user", "content": message}
    ]
    return ai_chat(messages, max_tokens=300)
