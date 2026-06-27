import json
import logging
from langchain_ollama import OllamaLLM
from langchain_core.prompts import PromptTemplate
from app.models.folio import TopicOutline

logger = logging.getLogger(__name__)

def generate_topic_outline(topic_text: str, model_name: str = "qwen3") -> TopicOutline:
    """Pass 1: Reads a topic and outputs a strict JSON outline."""
    
    prompt = """
You are an expert curriculum planner. Read the following topic text and extract its core concepts.
Return ONLY a valid JSON object matching the exact schema below. Do not output any markdown formatting, backticks, or explanation.

SCHEMA:
{{
  "topic": "The overarching name of the topic",
  "exam_focus": "High, Medium, or Low",
  "concepts": [
    {{
      "title": "Name of concept 1",
      "slides": [1, 2] 
    }}
  ]
}}
Note: "slides" MUST be an array of integers only. Do not put strings in the slides array. If unknown, use an empty array [].

TOPIC TEXT:
{text}
"""
    try:
        llm = OllamaLLM(model=model_name, format="json") # Using format="json" if supported by the model
        template = PromptTemplate.from_template(prompt)
        chain = template | llm
        
        response = chain.invoke({"text": topic_text})
        
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
