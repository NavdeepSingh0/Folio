from pydantic import BaseModel
from typing import List, Dict
from app.models.folio import ConceptOutline
from app.models.document_profile import PlannerInput, ExtractedDocument
from app.config.capability_profiles import CapabilityProfile
from app.config.educational_policy import CapabilityRule

class EducationalContext(BaseModel):
    concept: ConceptOutline
    capability_profile: CapabilityProfile
    educational_policy: Dict[str, CapabilityRule]
    exam_hints: List[str]
    document_metrics: Dict[str, float]
    source_slides_text: str
    full_document_text: str
    covers: List[str] = []

def build_educational_context(
    concept: ConceptOutline,
    capability_profile: CapabilityProfile,
    educational_policy: Dict[str, CapabilityRule],
    planner_input: PlannerInput,
    extracted_doc: ExtractedDocument
) -> EducationalContext:
    
    # Extract just the text for the source slides for this concept
    source_slides_text = ""
    if concept.slides:
        for slide_num in concept.slides:
            # Find the slide in the full document
            slide = next((s for s in extracted_doc.slides if s.slide_number == slide_num), None)
            if slide:
                source_slides_text += f"--- SLIDE {slide_num} ---\n{slide.text}\n\n"
                
    return EducationalContext(
        concept=concept,
        capability_profile=capability_profile,
        educational_policy=educational_policy,
        exam_hints=planner_input.exam_focus_hints,
        document_metrics=planner_input.document_profile.model_dump(),
        source_slides_text=source_slides_text,
        full_document_text=extracted_doc.to_string(),
        covers=concept.covers if hasattr(concept, 'covers') else []
    )
