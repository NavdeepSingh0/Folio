from pydantic import BaseModel
from typing import List, Optional
from enum import Enum

class EducationalAnalysis(BaseModel):
    contains_algorithm: bool = False
    contains_formula: bool = False
    contains_code: bool = False
    contains_comparison: bool = False
    contains_diagram: bool = False
    requires_memorisation: bool = False
    commonly_examined: bool = False
    has_common_errors: bool = False

class SlideType(str, Enum):
    CONTENT = "CONTENT"
    EXAMPLE = "EXAMPLE"
    COMPARISON = "COMPARISON"
    QUIZ = "QUIZ"
    LEARNING_OBJECTIVE = "LEARNING_OBJECTIVE"
    SUMMARY = "SUMMARY"
    REFERENCE = "REFERENCE"
    FORWARD_REFERENCE = "FORWARD_REFERENCE"
    RESOURCE = "RESOURCE"
    ADMINISTRATIVE = "ADMINISTRATIVE"
    IMAGE_HEAVY = "IMAGE_HEAVY"

class ExtractedSlide(BaseModel):
    slide_number: int
    text: str

class ExtractedDocument(BaseModel):
    slides: List[ExtractedSlide]
    page_count: int
    
    def to_string(self) -> str:
        return "\n\n---\n\n".join(s.text for s in self.slides)

class ClassifiedSlide(BaseModel):
    slide_number: int
    slide_type: SlideType
    text: str
    confidence: float
    image_heavy: bool
    educational_analysis: EducationalAnalysis = EducationalAnalysis()

class DocumentProfile(BaseModel):
    total_slides: int
    educational_slides: int
    quiz_slides: int
    image_heavy_slides: int
    administrative_slides: int
    educational_density: float

class PlannerInput(BaseModel):
    filtered_slides: List[ClassifiedSlide]
    exam_focus_hints: List[str]
    document_profile: DocumentProfile
