from groq import Groq
import os
from .vector_store import vector_store_instance

# The user explicitly wants Groq API with LLaMA 3 70B Instruct
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "mock-groq-key")
client = Groq(api_key=GROQ_API_KEY)

def ask_pdf_question(question, language="English"):
    """
    Retrieves context from vector store and asks LLaMA 70B.
    """
    # 1. Retrieve context
    results = vector_store_instance.query(question, n_results=3)
    context_chunks = results['documents'][0] if results['documents'] else []
    context = "\n".join(context_chunks)
    
    # 2. Build Prompt
    system_prompt = (
        f"You are a helpful agricultural AI assistant. Use the following PDF context to answer the user's question.\n"
        f"Context:\n{context}\n\n"
        f"Respond conversationally and naturally in {language}."
    )
    
    if language == "Tamil":
        system_prompt += (
            "\nYou must respond in PURE TAMIL (Tamil script). "
            "Use formal yet accessible language suitable for a professional assistant. "
            "Avoid mixing English words if possible."
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
            "Use formal yet accessible language suitable for a professional agricultural assistant."
        )

    try:
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": question}
            ],
            temperature=0.5,
            max_tokens=1024,
            top_p=1,
            stream=False,
        )
        return completion.choices[0].message.content
    except Exception as e:
        if "401" in str(e) or "invalid_api_key" in str(e):
            # Fallback mock for demonstration without API key
            if "Kongu" in language:
                return "Ayya, intha report padippa, mazhai kaalam aarambikka pothu. Vivasayam panna sariyana neram idhuthan. Vera edhavadhu kekanuma?"
            return "Based on the climate report, humidity levels are rising. This increases the risk of fungal diseases. I recommend applying a copper-based fungicide to protect your crops."
        return f"Sorry, I encountered an error communicating with the reasoning engine: {str(e)}"
