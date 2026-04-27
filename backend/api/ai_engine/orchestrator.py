import os
import json
import requests
from dotenv import load_dotenv
from .prompts import SYSTEM_PROMPT, build_user_prompt
import traceback

load_dotenv()

GROQ_API_KEY = os.getenv('LLAMA_API_KEY', '')

def get_fallback_response(error_message):
    return {
        "status": "Moderate",
        "issues_identified": f"Fallback mode active: AI service unavailable. ({error_message[:50]})",
        "recommendations": "Consult local agricultural extension officer. Monitor crop closely.",
        "step_by_step_guidance": "1. Review weather forecasts manually.\n2. Ensure adequate watering.\n3. Keep records of symptoms.",
        "loss_prediction": "Unknown"
    }

def orchestrate_crop_report(crop_type, user_query, weather_data, extracted_pdf_text=""):
    """
    Central AI Orchestrator:
    - Combines crop info, weather, user text, and PDF extract.
    - Prompts LLaMA via Groq API.
    - Forces strict JSON extraction.
    - Provides robust fault tolerance.
    """
    if not GROQ_API_KEY:
        return get_fallback_response("API Key missing")

    user_prompt = build_user_prompt(crop_type, user_query, weather_data, extracted_pdf_text)
    
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    data = {
        "model": "llama3-70b-8192",
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt}
        ],
        "temperature": 0.2
    }
    
    try:
        response = requests.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=data, timeout=15)
        response.raise_for_status()
        content = response.json()['choices'][0]['message']['content'].strip()
        
        # Enforce structured output parsing
        parsed = extract_json(content)
        return validate_structure(parsed)
    except Exception as e:
        print(f"[Orchestrator Error] {e}\n{traceback.format_exc()}")
        return get_fallback_response(str(e))

def extract_json(content):
    try:
        # If wrapped in markdown block
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0]
        elif "```" in content:
            content = content.split("```")[1].split("```")[0]
            
        return json.loads(content.strip())
    except Exception:
        # Fallback raw parsing attempt
        try:
            start = content.find('{')
            end = content.rfind('}') + 1
            return json.loads(content[start:end])
        except:
            raise ValueError("Failed to parse JSON structure from LLM.")

def validate_structure(data):
    required_keys = ["status", "issues_identified", "recommendations", "step_by_step_guidance", "loss_prediction"]
    for key in required_keys:
        if key not in data:
            data[key] = "N/A"
    return data
