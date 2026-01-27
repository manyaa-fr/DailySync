import os
import httpx
import json
from services.AI_prompt import build_daily_summary_prompt
from pathlib import Path
from dotenv import load_dotenv
# Ensure env is loaded
env_path = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(dotenv_path=env_path)

async def generate_ai_summary(context_data: dict) -> dict:
# print("🤖 Entered generate_ai_summary")
    print("🤖 Entered generate_ai_summary")

    api_key = os.getenv("API_KEY")
    print("API KEY LOADED:", bool(api_key))

    if not api_key:
        print("Error: API_KEY not found in environment variables")
        return None

    # List of models to try in order of preference/availability
    models = [
        "gemini-2.5-flash",
        "gemini-2.0-flash-lite-preview-02-05",
        "gemini-flash-latest",
        "gemini-1.5-flash"
    ]

    print(f"DEBUG: Generating AI summary with key ending in ...{api_key[-4:]}")

    prompt = build_daily_summary_prompt(context_data)
    # print("\n🧠 PROMPT BEING SENT TO GEMINI:\n")
    # print(prompt[:800])  # print first part only
    # print("\nEND PROMPT\n")

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"responseMimeType": "application/json"}
    }

    async with httpx.AsyncClient() as client:
        for model in models:
            gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
            
            try:
                print(f"🌍 Sending request to Gemini ({model})...")
                response = await client.post(gemini_url, json=payload, timeout=30.0)
                
                print(f"📨 Gemini ({model}) responded with status", response.status_code)

                if response.status_code == 200:
                    result = response.json()
                    if "candidates" in result and result["candidates"]:
                        text_content = result["candidates"][0]["content"]["parts"][0]["text"]
                        print(f"✅ AI RESPONSE RECEIVED from {model}")
                        return json.loads(text_content)
                    else:
                        print(f"Gemini ({model}) returned no candidates:", result)
                else:
                    print(f"Gemini ({model}) API Error:", response.text)
                    
            except Exception as e:
                print(f"Gemini ({model}) API Exception:", e)
            
            print(f"⚠️ Failed with {model}, trying next...")
            
        print("❌ All Gemini models failed.")
        return None