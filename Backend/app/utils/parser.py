from pydantic import BaseModel
from typing import Literal, List, Optional
import json
import logging
from app.models.folio import LearningObject

logger = logging.getLogger(__name__)

class ParseResult(BaseModel):
    success: bool
    stage: Literal["syntax", "schema", "success"]
    learning_objects: List[LearningObject]
    error: Optional[str]
    raw_output: str

def parse_generation_response(raw_response: str, outline, document_id: str, content_hash: str) -> ParseResult:
    """
    Two-stage parser for LLM generation response.
    Stage 1: Syntax Recovery
    Stage 2: Schema Validation
    """
    clean_json = raw_response.strip()
    
    # STAGE 1: Syntax Recovery
    try:
        # Fast path
        if clean_json.startswith("```json"):
            clean_json = clean_json[7:]
        if clean_json.endswith("```"):
            clean_json = clean_json[:-3]
            
        clean_json = clean_json.strip()
        
        # We expect Variant C which is a dict with "learning_objects" key.
        # But let's handle if it returns a list directly or a dict.
        start_idx = clean_json.find('{')
        end_idx = clean_json.rfind('}')
        if start_idx != -1 and end_idx != -1:
            clean_json = clean_json[start_idx:end_idx+1]
        
        data = json.loads(clean_json)
        
        if isinstance(data, dict) and "learning_objects" in data:
            data_list = data["learning_objects"]
        elif isinstance(data, list):
            data_list = data
        else:
            raise ValueError("Parsed JSON does not contain 'learning_objects' array.")
            
    except Exception as e:
        logger.error(f"Syntax parsing failed: {e}")
        return ParseResult(
            success=False,
            stage="syntax",
            learning_objects=[],
            error=str(e),
            raw_output=raw_response
        )
        
    # STAGE 2: Schema Validation
    learning_objects = []
    slides_map = {c.title.lower(): c.slides for c in outline.concepts}
    
    try:
        for item in data_list:
            if not isinstance(item, dict):
                continue
                
            title = item.get("title", "Unknown Concept")
            slides = slides_map.get(title.lower(), [])
            
            # Using LearningObject pydantic model to validate
            lo = LearningObject(
                stable_id=title.lower().replace(" ", "-"), # simplified id generation
                document_id=document_id,
                topic_label=outline.topic,
                content_hash=content_hash,
                title=title,
                definition=item.get("definition", ""),
                explanation=item.get("explanation", ""),
                example=item.get("example"),
                exam_tip=item.get("exam_tip"),
                code_example=item.get("code_example"),
                algorithm_steps=item.get("algorithm_steps"),
                formula=item.get("formula"),
                comparison_table=item.get("comparison_table"),
                diagram_description=item.get("diagram_description"),
                memory_trick=item.get("memory_trick"),
                common_mistakes=item.get("common_mistakes"),
                prerequisites=item.get("prerequisites"),
                key_takeaways=item.get("key_takeaways"),
                source_slides=slides
            )
            learning_objects.append(lo)
    except Exception as e:
        logger.error(f"Schema validation failed: {e}")
        return ParseResult(
            success=False,
            stage="schema",
            learning_objects=[],
            error=str(e),
            raw_output=raw_response
        )

    return ParseResult(
        success=True,
        stage="success",
        learning_objects=learning_objects,
        error=None,
        raw_output=raw_response
    )
