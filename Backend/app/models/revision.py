from pydantic import BaseModel, Field
from typing import List
import uuid

class Flashcard(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    topic_id: str
    front: str
    back: str
    difficulty: str = "medium"
    tags: List[str] = Field(default_factory=list)

class MCQ(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    topic_id: str
    question: str
    options: List[str]
    correct_answer: int
    explanation: str

class RecallPrompt(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    topic_id: str
    prompt: str
    expected_points: List[str]

class CheatSheet(BaseModel):
    topic_id: str
    bullets: List[str] = Field(default_factory=list)
    formulas: List[str] = Field(default_factory=list)
    memory_tricks: List[str] = Field(default_factory=list)
    exam_focus: List[str] = Field(default_factory=list)
