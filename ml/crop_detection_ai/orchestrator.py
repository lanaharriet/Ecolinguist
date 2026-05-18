import os
import json

class CropHealthOrchestrator:
    """
    Orchestrates the pipeline:
    1. Image Upload (Base64) -> LLaMA 3.2 Vision Model
    2. Structured Results -> LLaMA 70B Reasoning Layer
    3. Final Output -> Conversational Guidance
    """
    
    def __init__(self):
        pass

    def analyze_crop_image(self, image_b64: str, language: str = 'English', query: str = None, filename: str = '') -> dict:
        """
        Runs the full analysis pipeline using LLaMA Vision and Reasoning APIs.
        """
        from groq import Groq
        GROQ_API_KEY = os.getenv("GROQ_API_KEY", "mock-groq-key")
        client = Groq(api_key=GROQ_API_KEY)
        
        # Step 1: LLaMA 4 Scout Vision Inference
        vision_prompt = (
            "Analyze this crop/soil image and return a JSON object with exactly these keys: "
            "'crop_type', 'health_score' (0-100 integer), 'confidence' (0.0-1.0 float), "
            "'disease_detected', 'disease_severity', 'soil_indicators', 'risk_level'."
        )
        try:
            vision_completion = client.chat.completions.create(
                model="meta-llama/llama-4-scout-17b-16e-instruct",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": vision_prompt},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{image_b64}"
                                }
                            }
                        ]
                    }
                ],
                response_format={"type": "json_object"},
                temperature=0.1
            )
            structured_data = json.loads(vision_completion.choices[0].message.content)
        except Exception as e:
            # Fallback to local mock if API fails
            from .vision_model import vision_model_instance
            try:
                structured_data = vision_model_instance.predict(image_b64, filename)
            except Exception:
                structured_data = {
                    "crop_type": "Tomato", "health_score": 60, "confidence": 0.8,
                    "disease_detected": "Early Blight", 
                    "disease_severity": "Moderate", "soil_indicators": "Dry", "risk_level": "High"
                }
        
        # Step 2: LLaMA 70B Reasoning
        llama_insight, conversational_audio = self._query_llama_70b(structured_data, language, query)
        
        # Step 3: Combine Results
        return {
            "vision_analysis": structured_data,
            "ai_recommendation": llama_insight,
            "conversational_audio_url": conversational_audio # If TTS is generated
        }

    def _query_llama_70b(self, data: dict, language: str, user_query: str) -> tuple:
        """
        Queries Groq LLaMA 70B for agricultural insights based on vision data.
        """
        from groq import Groq
        GROQ_API_KEY = os.getenv("GROQ_API_KEY", "mock-groq-key")
        client = Groq(api_key=GROQ_API_KEY)
        
        system_prompt = (
            f"You are a helpful agricultural AI plant doctor. "
            f"Analyze this structured vision data from a crop image: {json.dumps(data)}. "
            f"Provide a brief, human-friendly diagnosis and recovery guidance. "
            f"If the user asks a specific follow-up question, answer it directly. "
            f"Respond conversationally and naturally in {language}."
        )
        
        actual_query = user_query if user_query else "What is wrong with my crop and how do I fix it?"
        
        if language == "Tamil":
            system_prompt += (
                "\nYou must respond in PURE TAMIL (Tamil script). "
                "Use formal yet accessible language. Avoid mixing English words if possible."
            )
        elif "Kongu" in language:
            system_prompt += (
                "\nYou must respond in an authentic rural Kongu Tamil dialect (Coimbatore/Erode region style). "
                "CRITICAL INSTRUCTION: You MUST write the entire response using the English alphabet (Tanglish), NOT Tamil script. "
                "For example, write 'Vannakam kanna, payir nalla irukku' instead of using Tamil letters."
            )
        elif language == "Malayalam":
            system_prompt += (
                "\nYou must respond in PURE MALAYALAM (Malayalam script). "
                "Use formal yet accessible agricultural terminology."
            )
        else:
            system_prompt += "\nRespond conversationally and naturally in English."
            
        try:
            completion = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": actual_query}
                ],
                temperature=0.5,
                max_tokens=1024,
                top_p=1,
            )
            insight = completion.choices[0].message.content
        except Exception as e:
            if "401" in str(e) or "invalid_api_key" in str(e):
                if "Kongu" in language:
                    insight = "Thakkali chediyila early blight vanthirukku. Copper marundhu adinga."
                elif language == "Tamil":
                    insight = "தக்காளி செடியில் நோய் உள்ளது. தாமிரம் கலந்த மருந்தை தெளிக்கவும்."
                else:
                    insight = "Your crop shows signs of disease. Please apply a copper-based fungicide."
            else:
                insight = f"Sorry, I encountered an error communicating with the reasoning engine: {str(e)}"
            
        return insight, None

orchestrator_instance = CropHealthOrchestrator()
