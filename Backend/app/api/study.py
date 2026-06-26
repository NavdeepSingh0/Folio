from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional

from app.services.study_assistant_service import (
    generate_flashcards_stream,
    generate_questions_stream,
    generate_summary_stream,
    generate_keywords_stream,
    generate_formula_sheet_stream,
    explain_simpler_stream
)

router = APIRouter(prefix="/study", tags=["Study Assistant"])

class StudyRequest(BaseModel):
    text: str
    model: str = "llama3.2"
    option: Optional[str] = None  # for difficulty or duration

@router.post("/flashcards")
async def api_flashcards(req: StudyRequest):
    return StreamingResponse(generate_flashcards_stream(req.text, req.model), media_type="text/plain")

@router.post("/questions")
async def api_questions(req: StudyRequest):
    difficulty = req.option or "Medium"
    return StreamingResponse(generate_questions_stream(req.text, difficulty, req.model), media_type="text/plain")

@router.post("/summary")
async def api_summary(req: StudyRequest):
    duration = req.option or "5-minute"
    return StreamingResponse(generate_summary_stream(req.text, duration, req.model), media_type="text/plain")

@router.post("/keywords")
async def api_keywords(req: StudyRequest):
    return StreamingResponse(generate_keywords_stream(req.text, req.model), media_type="text/plain")

@router.post("/formulas")
async def api_formulas(req: StudyRequest):
    return StreamingResponse(generate_formula_sheet_stream(req.text, req.model), media_type="text/plain")

@router.post("/explain")
async def api_explain(req: StudyRequest):
    return StreamingResponse(explain_simpler_stream(req.text, req.model), media_type="text/plain")
