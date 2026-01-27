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
    """
    Generates a daily summary using Google Gemini API.
    Returns a dict with keys: score, summary, highlights, gaps
    """
    api_key = os.getenv("API_KEY")
    
    if not api_key:
        print("Error: API_KEY not found in environment variables")
        return None

    # Using gemini-1.5-flash for speed and efficiency
    gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"

    print(f"DEBUG: Generating AI summary with key ending in ...{api_key[-4:] if api_key else 'None'}")

    prompt = build_daily_summary_prompt(context_data)
    
    payload = {
        "contents": [{
            "parts": [{"text": prompt}]
        }],
        "generationConfig": {
            "responseMimeType": "application/json"
        }
    }
    
    async with httpx.AsyncClient() as client:
        try:
            # Set a reasonable timeout for AI generation
            print("DEBUG: Sending request to Gemini...")
            response = await client.post(gemini_url, json=payload, timeout=30.0)
            
            if response.status_code != 200:
                print(f"Gemini API Error Status: {response.status_code}")
                print(f"Response: {response.text}")
                return None
                
            result = response.json()
            
            # Extract text from Gemini response
            # Response structure: candidates[0].content.parts[0].text
            if "candidates" in result and result["candidates"]:
                text_content = result["candidates"][0]["content"]["parts"][0]["text"]
                print("DEBUG: Successfully generated summary")
                return json.loads(text_content)
            else:
                print("Gemini API returned no candidates")
                print(f"Full result: {result}")
                return None
                
        except Exception as e:
            print(f"Gemini API Exception: {e}")
            return None
