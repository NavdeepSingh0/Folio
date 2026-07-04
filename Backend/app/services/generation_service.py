import json
import logging
from typing import List
from langchain_core.prompts import PromptTemplate
from app.models.folio import LearningObject, generate_stable_id
from app.utils.parser import parse_generation_response, ParseResult
from app.services.educational_context_builder import EducationalContext
from app.config.generation_principles import PRINCIPLES_PROMPT
from app.services.gemini_service import generate_text
import uuid
import datetime

logger = logging.getLogger(__name__)

def generate_learning_objects(
    contexts: List[EducationalContext], 
    document_id: str, 
    content_hash: str, 
    model_name: str = "gemini-1.5"
) -> ParseResult:
    """Pass 2 (Variant C): Single LLM call wrapped in root object."""
    
    # Construct concept details and collect unique capabilities
    concept_instructions = []
    all_requested_caps = set()
    for ctx in contexts:
        req = ", ".join(ctx.capability_profile.required)
        rec = ", ".join(ctx.capability_profile.recommended)
        opt = ", ".join(ctx.capability_profile.optional)
        
        all_requested_caps.update(ctx.capability_profile.required)
        all_requested_caps.update(ctx.capability_profile.recommended)
        all_requested_caps.update(ctx.capability_profile.optional)
        
        hints = "\n  -> EXAM HINTS: " + ", ".join(ctx.exam_hints) if ctx.exam_hints else ""
        covers = "\n  -> COVERS: " + ", ".join(ctx.covers) if ctx.covers else ""
        
        concept_instructions.append(
            f"- CONCEPT: {ctx.concept.title}\n"
            f"  -> REQUIRED FIELDS: {req}\n"
            f"  -> RECOMMENDED FIELDS: {rec} (Fill whenever possible)\n"
            f"  -> OPTIONAL FIELDS: {opt} (Fill only if strictly supported by source)"
            f"{hints}"
            f"{covers}"
        )
        
    concept_details = "\n".join(concept_instructions)
    
    schema_fields = [
        '"title": "The exact concept title"',
        '"definition": "A precise, one-sentence definition"',
        '"explanation": "A clear, structured explanation"'
    ]
    if "example" in all_requested_caps: schema_fields.append('"example": "Extract a conceptual example (Do NOT put code here)"')
    if "exam_tip" in all_requested_caps: schema_fields.append('"exam_tip": "Extract the exam tip"')
    if "code_example" in all_requested_caps: schema_fields.append('"code_example": "Extract implementation snippets, Java/C++/Python code, and syntax demonstrations here"')
    if "algorithm_steps" in all_requested_caps: schema_fields.append('"algorithm_steps": ["extract step 1", "extract step 2"]')
    if "formula" in all_requested_caps: schema_fields.append('"formula": "Extract the LaTeX formula (or null)"')
    if "comparison_table" in all_requested_caps: schema_fields.append('"comparison_table": "Extract a markdown formatted table (or null)"')
    if "diagram_description" in all_requested_caps: schema_fields.append('"diagram_description": "Extract the diagram syntax (or null)"')
    if "memory_trick" in all_requested_caps: schema_fields.append('"memory_trick": "Extract the memory trick (or null)"')
    if "common_mistakes" in all_requested_caps: schema_fields.append('"common_mistakes": "A single string explaining common mistakes (or null)"')
    if "prerequisites" in all_requested_caps: schema_fields.append('"prerequisites": ["extract prerequisite 1"] (or null)')
    if "key_takeaways" in all_requested_caps: schema_fields.append('"key_takeaways": ["extract takeaway 1"] (or null)')
    
    schema_str = ",\n      ".join(schema_fields)
    
    # Build policy string
    policy_str = ""
    if contexts:
        policy = contexts[0].educational_policy
        for cap, rule in policy.items():
            if cap in all_requested_caps:
                desc = []
                if rule.target_words: desc.append(f"Target ~{rule.target_words} words.")
                if not rule.allow_model_knowledge: desc.append("DO NOT hallucinate; strictly rely on source.")
                if rule.supplement: desc.append("Supplement source sparsely if needed.")
                if getattr(rule, "quality_expectation", None): desc.append(f"Expectation: {rule.quality_expectation}")
                if desc:
                    policy_str += f"- {cap}: {' '.join(desc)}\n"
                    
    full_document_text = contexts[0].full_document_text if contexts else ""
    
    prompt = """
You are an expert educator and lecturer. Read the FULL DOCUMENT TEXT.
I need you to extract and supplement educational content specifically for the following concepts. 

{principles_prompt}

CRITICAL INSTRUCTIONS:
1. For each concept, I have listed Required, Recommended, and Optional capabilities. Follow them strictly.
2. DO NOT embed formulas, algorithm steps, code, memory tricks, or common mistakes inside the `explanation` field. 
3. If the text contains a formula, put it ONLY in the `formula` field. If it has steps, put them ONLY in `algorithm_steps`.
4. Any field NOT requested for a concept should be set to null.
5. You must comprehensively cover all sub-topics listed under the COVERS section for each concept. Integrate them fluidly into the fields.

EDUCATIONAL POLICY:
{policy_str}

CONCEPTS TO TEACH:
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

FULL DOCUMENT TEXT:
{full_document_text}
"""
    template = PromptTemplate.from_template(prompt)
    prompt_text = template.format(
        full_document_text=full_document_text,
        concept_details=concept_details,
        schema_str=schema_str,
        policy_str=policy_str,
        principles_prompt=PRINCIPLES_PROMPT
    )

    try:
        response = generate_text(
            prompt_text,
            model_name=model_name,
            temperature=0.1,
            max_output_tokens=2048
        )
        
        # Two-stage parse
        parse_result = parse_generation_response(response, contexts, document_id, content_hash)
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
