from langchain_core.prompts import PromptTemplate

# Define the core templates
TEMPLATES = {
    "university_notes": "a structured university-level lecture summary. Use Markdown headers (##) and bullet points. Include main concepts and definitions. Do NOT write prose paragraphs.",
    "beginner_friendly": "a beginner-friendly summary. Explain complex topics using simple analogies. Break down the material so a high schooler could understand it.",
    "revision_notes": "highly condensed revision notes. Focus ENTIRELY on short bullet points and fast-recall facts. Remove all fluff.",
    "cheat_sheet": "a dense, single-page cheat sheet. Emphasize critical terms, formulas, and rules. Maximize information density.",
    "interview_prep": "an interview preparation guide. Format as expected interview questions derived from the text, followed by concise answers."
}

def build_prompt_template(style: str, custom_instructions: str = None) -> PromptTemplate:
    """Builds a PromptTemplate incorporating the chosen style and custom instructions."""
    
    # Fallback to university_notes if style is not recognized
    style_guidance = TEMPLATES.get(style, TEMPLATES["university_notes"])
    
    base_prompt = f"""
    You are an expert study assistant. I will provide you with raw text extracted from a document.
    Your task is to convert this raw text into {style_guidance}.
    """
    
    if custom_instructions and custom_instructions.strip():
        base_prompt += f"\n\nUSER'S CUSTOM INSTRUCTIONS:\n{custom_instructions.strip()}\n(Ensure you strictly follow these instructions above all else)."
        
    base_prompt += """
    
    CRITICAL RULES:
    1. Output ONLY the final markdown content. Do not include any conversational filler (e.g. "Here are the notes:").
    2. Do NOT write an introduction or a conclusion. Jump straight into the content.
    3. YOUR OUTPUT MUST BE CONCISE. Do not hallucinate filler content. Output length must be strictly proportional to input length. Max {max_words} words.
    
    RAW TEXT TO PROCESS:
    {text}
    """
    
    return PromptTemplate.from_template(base_prompt)
