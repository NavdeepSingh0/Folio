from pydantic import BaseModel
from typing import Optional

class Job(BaseModel):
    id: str
    status: str # "PENDING", "RUNNING", "COMPLETED", "FAILED"
    current_stage: str # e.g. "Uploading Document", "Analyzing Slides"
    progress: int # 0 to 100
    started_at: float
    completed_at: Optional[float] = None
    current_topic_name: Optional[str] = None
    topics_generated: int = 0
    total_topics: int = 0
    error: Optional[str] = None
    
    # Live stats
    slides_extracted: int = 0
    pages_extracted: int = 0
    total_learning_objects: int = 0
    total_flashcards: int = 0
    total_practice_qs: int = 0
