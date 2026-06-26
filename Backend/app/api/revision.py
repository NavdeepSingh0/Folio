from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, List
from app.services.context_service import resolve_context
from app.services.revision_service import (
    generate_revision_sheet, generate_mind_map, generate_cheat_sheet,
    generate_expected_questions, generate_last_minute_revision
)

router = APIRouter()

class RevisionRequest(BaseModel):
    scope_type: str  # "file", "chapter", "unit", "collection", "custom"
    scope_id: Optional[str] = None
    custom_ids: Optional[List[str]] = None
    tool: str  # "revision_sheet", "mind_map", "cheat_sheet", "expected_questions", "last_minute"
    model: str = "qwen3"

@router.post("/generate")
async def api_generate_revision(request: RevisionRequest):
    try:
        context = resolve_context(request.scope_type, request.scope_id, request.custom_ids)
        if not context or context == "No context found.":
            raise HTTPException(status_code=400, detail="No documents found in the selected scope.")
            
        if request.tool == "revision_sheet":
            return StreamingResponse(generate_revision_sheet(context, request.model), media_type="text/plain")
        elif request.tool == "mind_map":
            return StreamingResponse(generate_mind_map(context, request.model), media_type="text/plain")
        elif request.tool == "cheat_sheet":
            return StreamingResponse(generate_cheat_sheet(context, request.model), media_type="text/plain")
        elif request.tool == "expected_questions":
            return StreamingResponse(generate_expected_questions(context, request.model), media_type="text/plain")
        elif request.tool == "last_minute":
            return StreamingResponse(generate_last_minute_revision(context, request.model), media_type="text/plain")
        else:
            raise HTTPException(status_code=400, detail="Unknown revision tool")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
