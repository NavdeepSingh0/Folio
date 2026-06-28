from pydantic import BaseModel, Field
from typing import List, Optional, Literal

class ConceptualQuestion(BaseModel):
    question: str
    answer: str
    difficulty: str
    tags: List[str]

class ComparisonQuestion(BaseModel):
    question: str
    answer: str
    difficulty: str
    tags: List[str]

class ScenarioQuestion(BaseModel):
    scenario: str
    expected_answer: str
    difficulty: str
    tags: List[str]

class VivaQuestion(BaseModel):
    question: str
    model_answer: str
    difficulty: str
    tags: List[str]

class CodingChallenge(BaseModel):
    prompt: str
    expected_topics: List[str]
    difficulty: str
    tags: List[str]

class ExamPrediction(BaseModel):
    marks: int
    question: str
    marking_scheme: List[str]
    difficulty: str
    tags: List[str]

class AdvancedPracticeStatus(BaseModel):
    understanding_complete: bool = False
    application_complete: bool = False
    assessment_complete: bool = False

class AdvancedPractice(BaseModel):
    status: AdvancedPracticeStatus = Field(default_factory=AdvancedPracticeStatus)
    conceptual_questions: List[ConceptualQuestion] = Field(default_factory=list)
    comparison_questions: List[ComparisonQuestion] = Field(default_factory=list)
    scenario_questions: List[ScenarioQuestion] = Field(default_factory=list)
    viva_questions: List[VivaQuestion] = Field(default_factory=list)
    coding_challenges: List[CodingChallenge] = Field(default_factory=list)
    exam_predictions: List[ExamPrediction] = Field(default_factory=list)
