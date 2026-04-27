import os
import requests
from dotenv import load_dotenv

load_dotenv()

WHISPER_API_KEY = os.getenv('WHISPER_API_KEY', '')
ELEVENLABS_API_KEY = os.getenv('ELEVENLABS_API_KEY', '')

def transcribe_audio(audio_file_path):
    """
    Sends audio to Whisper API (OpenAI) for transcription.
    Fallback: returns a standard message.
    """
    if not WHISPER_API_KEY:
        return "Audio transcription fallback mock text. (Provide WHISPER_API_KEY)"

    try:
        url = "https://api.openai.com/v1/audio/transcriptions"
        headers = {
            "Authorization": f"Bearer {WHISPER_API_KEY}"
        }
        with open(audio_file_path, "rb") as f:
            files = {
                "file": f,
                "model": (None, "whisper-1")
            }
            response = requests.post(url, headers=headers, files=files, timeout=10)
            response.raise_for_status()
            return response.json().get('text', '')
    except Exception as e:
        print(f"[Whisper Error] {e}")
        return None # Null indicates failure, caller should rely on manual text input

def generate_tts(text_content):
    """
    Converts AI response to audio via ElevenLabs.
    Returns: URL or Base64. For simplicity and avoiding frontend complexity, 
    we will simulate the generation or return an audio stream URL/base64 if working.
    """
    if not ELEVENLABS_API_KEY:
        return None

    try:
        url = "https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM" # default voice
        headers = {
            "Accept": "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": ELEVENLABS_API_KEY
        }
        data = {
            "text": text_content,
            "model_id": "eleven_monolingual_v1",
            "voice_settings": {"stability": 0.5, "similarity_boost": 0.5}
        }
        
        # In a real app we'd save this to S3/disk and return URL. 
        # Here we simulate by just saying it succeeded if key is available, 
        # or we could base64 encode it. Base64 is reliable for immediate playback.
        import base64
        response = requests.post(url, headers=headers, json=data, timeout=10)
        response.raise_for_status()
        encoded = base64.b64encode(response.content).decode('utf-8')
        return f"data:audio/mpeg;base64,{encoded}"
    except Exception as e:
        print(f"[ElevenLabs Error] {e}")
        return None
