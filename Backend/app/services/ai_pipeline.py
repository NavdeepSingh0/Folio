import os
import json
import google.generativeai as genai
from typing import List, Dict, Any

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
if api_key and api_key != "your_gemini_key_here":
    genai.configure(api_key=api_key)

# We use Gemini 1.5 Flash for speed in formatting, and Pro for heavy analysis if needed
model = genai.GenerativeModel('gemini-1.5-flash')

def generate_markdown_notes(raw_text: str) -> str:
    """Takes raw OCR/PDF text and structures it into beautiful Markdown."""
    if not api_key or api_key == "your_gemini_key_here":
        # Mock response for hackathon if no API key is provided
        return f"# Generated Notes\n\nThis is a mocked response since no GEMINI_API_KEY is set.\n\nRaw text preview: {raw_text[:200]}..."

    prompt = f"""
    You are an expert study assistant. I am providing you with raw text extracted from a document.
    Please format this raw text into a beautifully structured Markdown document suitable for studying.
    
    Guidelines:
    1. Fix any OCR or extraction errors.
    2. Use appropriate headings (##, ###).
    3. Use bullet points for lists and bolding for key terms.
    4. Keep the content completely faithful to the original text (do not add outside information).
    5. Output ONLY the markdown. Do not wrap it in ```markdown tags.
    
    Raw Text:
    {raw_text}
    """
    
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Gemini Markdown Error: {e}")
        return f"# Error formatting document\n\n{raw_text}"


def extract_facts(raw_text: str) -> List[Dict[str, Any]]:
    """Extracts key concepts, definitions, and tags as structured JSON."""
    if not api_key or api_key == "your_gemini_key_here":
        return [
            {"concept": "Mock Concept", "description": "No API key found", "tags": "Mock, System"}
        ]
        
    prompt = f"""
    Extract the most important facts, concepts, or definitions from the following text.
    Return the result strictly as a JSON array of objects.
    Each object must have exactly these keys:
    - "concept" (string: the term or concept name)
    - "description" (string: clear, concise definition based on the text)
    - "tags" (string: comma-separated list of 1-3 relevant categories)
    
    Output ONLY valid JSON. No markdown formatting.
    
    Raw Text:
    {raw_text[:15000]} # Truncated for token limit in fact extraction if necessary
    """
    
    try:
        response = model.generate_content(prompt)
        # Clean up potential markdown formatting around JSON
        json_str = response.text.replace('```json', '').replace('```', '').strip()
        return json.loads(json_str)
    except Exception as e:
        print(f"Gemini Fact Extraction Error: {e}")
        return []
