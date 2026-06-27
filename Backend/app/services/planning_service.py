import json
import logging
from langchain_ollama import OllamaLLM
from langchain_core.prompts import PromptTemplate
from app.models.folio import TopicOutline
from app.models.document_profile import PlannerInput

logger = logging.getLogger(__name__)

def generate_topic_outline(planner_input: PlannerInput, model_name: str = "qwen3") -> TopicOutline:
    """Pass 1: Reads a topic and outputs a strict JSON outline."""
    
    # Format hints
    hints_text = "\n".join(f"- {h}" for h in planner_input.exam_focus_hints)
    
    # Convert filtered slides into a readable text format for the LLM
    text_content = ""
    for s in planner_input.filtered_slides:
        text_content += f"--- SLIDE {s.slide_number} ({s.slide_type.value}) ---\n"
        if s.image_heavy:
            text_content += "[IMAGE HEAVY SLIDE - Visual details may be missing]\n"
        text_content += f"{s.text}\n\n"

    prompt = f"""
You are an expert curriculum planner (like a university professor). Read the following topic text and extract its core concepts.
For each concept, analyze its educational characteristics to help determine what teaching aids (formulas, diagrams, code, memory tricks) are appropriate based ON THE TEXT PROVIDED.

DOCUMENT PROFILE:
Total Slides: {planner_input.document_profile.total_slides}
Educational Slides: {planner_input.document_profile.educational_slides}
Quiz Slides: {planner_input.document_profile.quiz_slides}

EXAM FOCUS HINTS (Derived from quizzes/summaries):
{hints_text if hints_text else "None"}

Return ONLY a valid JSON object matching the exact schema below. Do not output any markdown formatting, backticks, or explanation.

SCHEMA:
{{
  "topic": "The overarching name of the topic",
  "exam_focus": "High, Medium, or Low",
  "concepts": [
    {{
      "title": "Name of concept 1",
      "slides": [1, 2],
      "educational_analysis": {{
        "contains_algorithm": true,
        "contains_formula": true,
        "contains_code": true,
        "contains_comparison": true,
        "contains_diagram": true,
        "requires_memorisation": true,
        "commonly_examined": true,
        "has_common_errors": true
      }}
    }}
  ]
}}
Note: "slides" MUST be an array of integers only. If a characteristic applies, set the boolean to true.


TOPIC TEXT:
{text_content}
"""
    try:
        llm = OllamaLLM(model=model_name, format="json", keep_alive=-1) # Using format="json" if supported by the model
        
        response = llm.invoke(prompt)
        
        # Clean up any potential markdown ticks the model might hallucinate despite instructions
        clean_json = response.strip()
        if clean_json.startswith("```json"):
            clean_json = clean_json[7:]
        if clean_json.endswith("```"):
            clean_json = clean_json[:-3]
            
        data = json.loads(clean_json.strip())
        return TopicOutline(**data)
        
    except Exception as e:
        logger.error(f"Planning pass failed: {e}")
        # Fallback to a generic outline if parsing fails
        return TopicOutline(
            topic="General Topic",
            exam_focus="Medium",
            concepts=[{"title": "Core Concepts", "slides": []}]
        )
