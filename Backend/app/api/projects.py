from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.models.database import (
    save_project, get_projects, get_project, update_project, move_project, delete_project
)
from app.services.embeddings_service import generate_document_embeddings_json

router = APIRouter()

class SaveProjectRequest(BaseModel):
    title: str
    source_filename: str
    study_style: str
    model: str
    markdown_content: str
    chapter_id: Optional[str] = None
    pages: int = 0
    chunks: int = 0
    generation_time: float = 0.0

class UpdateProjectRequest(BaseModel):
    title: Optional[str] = None
    markdown_content: Optional[str] = None

class MoveProjectRequest(BaseModel):
    chapter_id: Optional[str] = None

@router.post("/projects/save")
async def api_save_project(request: SaveProjectRequest):
    try:
        embedding_json = generate_document_embeddings_json(request.markdown_content)
        return save_project(
            title=request.title,
            source_filename=request.source_filename,
            study_style=request.study_style,
            model=request.model,
            markdown_content=request.markdown_content,
            chapter_id=request.chapter_id,
            pages=request.pages,
            chunks=request.chunks,
            generation_time=request.generation_time,
            embedding=embedding_json
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/projects")
async def api_get_projects():
    try:
        return get_projects()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/projects/{project_id}")
async def api_get_project(project_id: str):
    try:
        project = get_project(project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        return project
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/projects/{project_id}")
async def api_update_project(project_id: str, request: UpdateProjectRequest):
    try:
        embedding_json = None
        if request.markdown_content is not None:
            embedding_json = generate_document_embeddings_json(request.markdown_content)
            
        success = update_project(
            project_id, 
            title=request.title, 
            markdown_content=request.markdown_content, 
            embedding=embedding_json
        )
        if not success:
            raise HTTPException(status_code=404, detail="Project not found")
        return {"status": "success"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/projects/{project_id}/move")
async def api_move_project(project_id: str, request: MoveProjectRequest):
    try:
        success = move_project(project_id, request.chapter_id)
        if not success:
            raise HTTPException(status_code=404, detail="Project not found")
        return {"status": "success"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/projects/{project_id}")
async def api_delete_project(project_id: str):
    try:
        success = delete_project(project_id)
        if not success:
            raise HTTPException(status_code=404, detail="Project not found")
        return {"status": "success"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
