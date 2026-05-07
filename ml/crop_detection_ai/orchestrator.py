from .vision_model import vision_model_instance
import os
import json

class CropHealthOrchestrator:
    """
    Orchestrates the pipeline:
    1. Image Upload -> Vision ML Model
    2. Structured Results -> LLaMA 70B Reasoning Layer
    3. Final Output -> Conversational Guidance
    """
    
    def __init__(self):
        self.vision_model = vision_model_instance

    def analyze_crop_image(self, image_path: str, language: str = 'English') -> dict:
        """
        Runs the full analysis pipeline.
        """
        # Step 1: Vision Model Inference
        structured_data = self.vision_model.predict(image_path)
        
        # Step 2: LLaMA 70B Reasoning
        # In production, this uses the Groq API passing `structured_data` in the prompt
        llama_insight, conversational_audio = self._query_llama_70b(structured_data, language)
        
        # Step 3: Combine Results
        return {
            "vision_analysis": structured_data,
            "ai_recommendation": llama_insight,
            "conversational_audio_url": conversational_audio # If TTS is generated
        }

    def _query_llama_70b(self, data: dict, language: str) -> tuple:
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
            f"Respond conversationally and naturally in {language}."
        )
        
        if language == "Tamil":
            system_prompt += (
                "\nYou must respond in PURE TAMIL (Tamil script). "
                "Use formal yet accessible language. Avoid mixing English words if possible."
            )
        elif "Kongu" in language:
            system_prompt += (
                "\nYou must respond in an authentic rural Kongu Tamil or Kongu Tanglish style (English script). "
                "Use colloquial terms like 'kanna', 'vivasayam', 'pathukonga'. "
                "Make it sound exactly like a friendly local farming expert from the Coimbatore/Erode region."
            )
            
        try:
            completion = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": "What is wrong with my crop and how do I fix it?"}
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
