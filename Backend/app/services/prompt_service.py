from langchain_core.prompts import PromptTemplate

# Define the core templates
TEMPLATES = {
    "university_notes": "a structured university-level lecture summary. Include main concepts, definitions, formulas (if any), and key takeaways. Use academic tone.",
    "beginner_friendly": "a beginner-friendly summary. Explain complex topics using simple analogies. Break down the material so a high schooler could understand it.",
    "revision_notes": "highly condensed revision notes. Focus entirely on bullet points, crucial facts, and fast-recall information. Remove all fluff.",
    "cheat_sheet": "a dense, single-page cheat sheet format. Group by topics, emphasize critical terms, and prioritize formulas/rules over explanations.",
    "interview_prep": "an interview preparation guide. Format as expected interview questions derived from the text, followed by concise, strong answers."
}

def build_prompt_template(style: str, custom_instructions: str = None) -> PromptTemplate:
    """Builds a PromptTemplate incorporating the chosen style and custom instructions."""
    
    # Fallback to university_notes if style is not recognized
    style_guidance = TEMPLATES.get(style, TEMPLATES["university_notes"])
    
    base_prompt = f"""
    You are an expert study assistant. I will provide you with extracted text from a document.
    Your task is to convert this raw text into {style_guidance}.
    """
    
    if custom_instructions and custom_instructions.strip():
        base_prompt += f"\n\nUSER'S CUSTOM INSTRUCTIONS:\n{custom_instructions.strip()}\n(Ensure you strictly follow these instructions above all else)."
        
    base_prompt += """
    
    Output ONLY the final markdown content. Do not include any conversational filler.
    
    RAW TEXT TO PROCESS:
    {text}
    """
    
    return PromptTemplate.from_template(base_prompt)
