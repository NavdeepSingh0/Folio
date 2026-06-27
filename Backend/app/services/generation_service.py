import json
import logging
from typing import List
from langchain_ollama import OllamaLLM
from langchain_core.prompts import PromptTemplate
from app.models.folio import TopicOutline, LearningObject, generate_stable_id
from app.utils.parser import parse_generation_response, ParseResult
import uuid
import datetime

logger = logging.getLogger(__name__)

def generate_learning_objects(
    topic_text: str, 
    outline: TopicOutline, 
    document_id: str, 
    content_hash: str, 
    model_name: str = "qwen3"
) -> ParseResult:
    """Pass 2 (Variant C): Single LLM call wrapped in root object."""
    
    # Enforce temp 0.1 and json mode for reliability
    llm = OllamaLLM(model=model_name, format="json", temperature=0.1)
    
    concept_titles = [c.title for c in outline.concepts]
    
    prompt = """
You are an expert educator. Read the TOPIC TEXT.
I need you to extract the educational content specifically for the following concepts:
{concept_titles}

Return ONE valid JSON object matching the exact schema below. Do NOT output any conversational text.

SCHEMA:
{{
  "learning_objects": [
    {{
      "title": "The exact concept title",
      "definition": "A precise, one-sentence definition",
      "explanation": "A clear, structured explanation",
      "example": "A concrete example (or null)",
      "exam_tip": "A specific tip for exams (or null)"
    }}
  ]
}}

TOPIC TEXT:
{text}
"""
    template = PromptTemplate.from_template(prompt)
    chain = template | llm
    
    try:
        response = chain.invoke({
            "text": topic_text, 
            "concept_titles": ", ".join(concept_titles)
        })
        
        # Two-stage parse
        parse_result = parse_generation_response(response, outline, document_id, content_hash)
        return parse_result
            
    except Exception as e:
        logger.error(f"Generation pass failed for topic array: {e}")
        return ParseResult(
            success=False,
            stage="syntax",
            learning_objects=[],
            error=str(e),
            raw_output=""
        )
