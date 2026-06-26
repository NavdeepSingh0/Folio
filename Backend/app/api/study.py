from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, List

from app.models.database import get_projects
from app.services.context_service import resolve_context
from app.services.study_assistant_service import unified_generate_stream
from app.services.embeddings_service import search_knowledge_base

router = APIRouter(prefix="/study", tags=["Study Assistant"])

class UnifiedStudyRequest(BaseModel):
    type: str
    difficulty: Optional[str] = "Medium"
    quantity: Optional[str] = "5"
    length: Optional[str] = "Medium"
    language: Optional[str] = "English"
    context_type: str
    context_id: Optional[str] = None
    custom_ids: Optional[List[str]] = None
    text: Optional[str] = None
    model: str = "llama3.2"

class SearchRequest(BaseModel):
    query: str
    mode: str = "knowledge"

@router.post("/generate")
async def api_generate(req: UnifiedStudyRequest):
    try:
        # Resolve context text
        if req.context_type in ["selection", "custom"] and req.text:
            context_text = req.text
        elif req.context_type == "workspace":
            # Just grab everything by using a custom list of all project IDs
            all_projs = get_projects()
            all_ids = [p["id"] for p in all_projs]
            context_text = resolve_context("custom", custom_ids=all_ids)
        else:
            context_text = resolve_context(req.context_type, req.context_id, req.custom_ids)
            
        if not context_text or context_text == "No context found.":
            context_text = "No context provided. The user selected an empty context."
            
        return StreamingResponse(
            unified_generate_stream(
                type_str=req.type,
                difficulty=req.difficulty,
                quantity=req.quantity,
                length=req.length,
                language=req.language,
                context_text=context_text,
                model_name=req.model,
                custom_prompt=req.text if req.type == "custom" else None
            ),
            media_type="text/plain"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/search")
async def api_search(req: SearchRequest):
    try:
        projects = get_projects()
        
        if req.mode == "filename":
            query_lower = req.query.lower()
            filtered = [p for p in projects if query_lower in p["title"].lower()]
            results = [{
                "project_id": p["id"], 
                "project_title": p["title"], 
                "text": "Matched by filename",
                "similarity": 1.0
            } for p in filtered[:10]]
            return {"results": results}
        else:
            # Semantic Knowledge Search
            results = search_knowledge_base(req.query, projects, top_k=5)
            return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
