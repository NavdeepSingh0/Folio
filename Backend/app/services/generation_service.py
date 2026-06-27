import json
import logging
from typing import List
from langchain_ollama import OllamaLLM
from langchain_core.prompts import PromptTemplate
from app.models.folio import TopicOutline, LearningObject, generate_stable_id
from app.utils.parser import parse_generation_response, ParseResult
from app.services.capability_mapper import map_capabilities
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
    llm = OllamaLLM(model=model_name, format="json", temperature=0.1, keep_alive=-1)
    
    # Construct concept details and collect unique capabilities
    concept_instructions = []
    all_requested_caps = set()
    for c in outline.concepts:
        caps = map_capabilities(c.educational_analysis)
        all_requested_caps.update(caps)
        cap_str = ", ".join(caps) if caps else "None"
        concept_instructions.append(
            f"- CONCEPT: {c.title}\n"
            f"  -> REQUIRED FIELDS TO EXTRACT: {cap_str}\n"
            f"  -> DO NOT leave these fields null! You must extract them from the text."
        )
        
    concept_details = "\n".join(concept_instructions)
    
    schema_fields = [
        '"title": "The exact concept title"',
        '"definition": "A precise, one-sentence definition"',
        '"explanation": "A clear, structured explanation"'
    ]
    if "example" in all_requested_caps: schema_fields.append('"example": "Extract the example from the text (or null)"')
    if "exam_tip" in all_requested_caps: schema_fields.append('"exam_tip": "Extract the exam tip (or null)"')
    if "code_example" in all_requested_caps: schema_fields.append('"code_example": "Extract the source code (or null)"')
    if "algorithm_steps" in all_requested_caps: schema_fields.append('"algorithm_steps": ["extract step 1", "extract step 2"] (or null)')
    if "formula" in all_requested_caps: schema_fields.append('"formula": "Extract the LaTeX formula (or null)"')
    if "comparison_table" in all_requested_caps: schema_fields.append('"comparison_table": [{"col1": "val", "col2": "val"}] (or null)')
    if "diagram_description" in all_requested_caps: schema_fields.append('"diagram_description": "Extract the diagram syntax (or null)"')
    if "memory_trick" in all_requested_caps: schema_fields.append('"memory_trick": "Extract the memory trick (or null)"')
    if "common_mistakes" in all_requested_caps: schema_fields.append('"common_mistakes": "Extract common mistakes (or null)"')
    if "prerequisites" in all_requested_caps: schema_fields.append('"prerequisites": ["extract prerequisite 1"] (or null)')
    if "key_takeaways" in all_requested_caps: schema_fields.append('"key_takeaways": ["extract takeaway 1"] (or null)')
    
    schema_str = ",\n      ".join(schema_fields)
    
    prompt = """
You are an expert educator. Read the TOPIC TEXT.
I need you to extract the educational content specifically for the following concepts. 

CRITICAL INSTRUCTIONS:
1. For each concept, I have listed "Requested Capabilities". You MUST extract and populate those specific fields in the JSON.
2. DO NOT embed formulas, algorithm steps, code, memory tricks, or common mistakes inside the `explanation` field. 
3. If the text contains a formula, put it ONLY in the `formula` field. If it has steps, put them ONLY in `algorithm_steps`.
4. Any field NOT in the "Requested Capabilities" list should be set to null.

CONCEPTS TO EXTRACT:
{concept_details}

Return ONE valid JSON object matching the exact schema below. Do NOT output any conversational text.

SCHEMA:
{{
  "learning_objects": [
    {{
      {schema_str}
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
            "concept_details": concept_details,
            "schema_str": schema_str
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
