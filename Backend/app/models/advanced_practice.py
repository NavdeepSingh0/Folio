from pydantic import BaseModel
from typing import List

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

class AdvancedPractice(BaseModel):
    conceptual_questions: List[ConceptualQuestion]
    comparison_questions: List[ComparisonQuestion]
    scenario_questions: List[ScenarioQuestion]
    viva_questions: List[VivaQuestion]
    coding_challenges: List[CodingChallenge]
    exam_predictions: List[ExamPrediction]
