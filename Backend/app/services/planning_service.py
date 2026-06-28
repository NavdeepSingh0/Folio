import json
import logging
from langchain_ollama import OllamaLLM
from langchain_core.prompts import PromptTemplate
from app.models.folio import TopicOutline
from app.models.document_profile import PlannerInput
import json_repair

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
You will extract distinct concepts, identify their type from a fixed list, and estimate your confidence in this extraction.

CRITICAL INSTRUCTIONS ON GRANULARITY:
- A Study Topic represents one comprehensive study session.
- Do NOT output fragmented concepts (e.g. separating "Bellman Ford", "Time Complexity", "Applications").
- Group sub-concepts into the `covers` array of a single parent topic. (e.g. `covers: ["Definition", "Edge Relaxation", "Time Complexity", "Applications"]`).
- Only generate multiple topics if the lecture introduces completely independent topics (e.g., "Bellman Ford Algorithm" and "Dijkstra's Algorithm").

Allowed Concept Types: "algorithm", "definition", "process", "comparison", "formula", "code_concept", "theory", "general"

DOCUMENT PROFILE:
Total Slides: {planner_input.document_profile.total_slides}
Educational Slides: {planner_input.document_profile.educational_slides}
Quiz Slides: {planner_input.document_profile.quiz_slides}

EXAM FOCUS HINTS (Derived from quizzes/summaries):
{hints_text if hints_text else "None"}

Return ONLY a valid JSON object matching the exact schema below. Do not output any markdown formatting, backticks, or explanation.

OUTPUT FORMAT (STRICT JSON):
{{
  "topic": "The overarching theme",
  "exam_focus": "High/Medium/Low",
  "concepts": [
    {{
      "title": "Topic Name (e.g., Bellman Ford Algorithm)",
      "type": "algorithm",
      "confidence": 0.95,
      "covers": ["Time Complexity", "Applications", "Negative Cycle Detection"],
      "slides": [3, 4, 5]
    }}
  ]
}}
Note: "slides" MUST be an array of integers only. "type" MUST be one of the allowed types. "confidence" is a float between 0.0 and 1.0.


TOPIC TEXT:
{text_content}
"""
    try:
        llm = OllamaLLM(model=model_name, format="json", temperature=0.1, num_ctx=4096, keep_alive=-1) # Using format="json" if supported by the model
        
        response = llm.invoke(prompt)
        
        # Clean up any potential markdown ticks the model might hallucinate despite instructions
        clean_json = response.strip()
        if clean_json.startswith("```json"):
            clean_json = clean_json[7:]
        if clean_json.endswith("```"):
            clean_json = clean_json[:-3]
            
        data = json_repair.loads(clean_json.strip())
        return TopicOutline(**data)
        
    except Exception as e:
        logger.error(f"Planning pass failed: {e}")
        # Fallback to a generic outline if parsing fails
        return TopicOutline(
            topic="General Topic",
            exam_focus="Medium",
            concepts=[{"title": "Core Concepts", "type": "general", "confidence": 0.5, "slides": []}]
        )
