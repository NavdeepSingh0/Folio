import json
import logging
from typing import List
from langchain_ollama import OllamaLLM
from langchain_core.prompts import PromptTemplate
from app.models.folio import TopicOutline, LearningObject, generate_stable_id
import uuid
import datetime

logger = logging.getLogger(__name__)

def generate_learning_objects(
    topic_text: str, 
    outline: TopicOutline, 
    document_id: str, 
    content_hash: str, 
    model_name: str = "qwen3"
) -> List[LearningObject]:
    """Pass 2: Takes the outline and text, generating LearningObjects for each concept."""
    
    llm = OllamaLLM(model=model_name, format="json")
    
    prompt = """
You are an expert educator. Read the TOPIC TEXT.
I need you to extract the educational content specifically for the concept: "{concept_title}".
Return ONLY a valid JSON object matching the exact schema below. Do not output any markdown formatting, backticks, or explanation.

TOKEN BUDGET:
- definition: 30-50 tokens
- explanation: 120-180 tokens
- example: 60-100 tokens
- exam_tip: 30-60 tokens

SCHEMA:
{
  "title": "The concept title",
  "definition": "A precise, one-sentence definition",
  "explanation": "A clear, structured explanation",
  "example": "A concrete example (or null)",
  "exam_tip": "A specific tip for exams (or null)"
}

TOPIC TEXT:
{text}
"""
    template = PromptTemplate.from_template(prompt)
    chain = template | llm
    
    learning_objects = []
    
    for concept in outline.concepts:
        try:
            response = chain.invoke({"text": topic_text, "concept_title": concept.title})
            
            clean_json = response.strip()
            if clean_json.startswith("```json"):
                clean_json = clean_json[7:]
            if clean_json.endswith("```"):
                clean_json = clean_json[:-3]
                
            data = json.loads(clean_json.strip())
            
            # Map into LearningObject
            lo = LearningObject(
                stable_id=generate_stable_id(concept.title),
                document_id=document_id,
                topic_label=outline.topic,
                content_hash=content_hash,
                title=data.get("title", concept.title),
                definition=data.get("definition", ""),
                explanation=data.get("explanation", ""),
                example=data.get("example"),
                exam_tip=data.get("exam_tip"),
                source_slides=concept.slides or []
            )
            learning_objects.append(lo)
            
        except Exception as e:
            logger.error(f"Generation pass failed for concept {concept.title}: {e}")
            # Skip or generate a dummy on failure
            pass
            
    return learning_objects
