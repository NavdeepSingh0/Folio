from fastapi import APIRouter, HTTPException, BackgroundTasks, UploadFile, File
from pydantic import BaseModel
from typing import List, Optional
from app.models.database import (
    save_project, get_projects, get_project, update_project, move_project, delete_project,
    get_cached_learning_objects
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
    classification: Optional[str] = None
    pipeline_metrics: Optional[str] = None

class UpdateProjectRequest(BaseModel):
    title: Optional[str] = None
    markdown_content: Optional[str] = None

class MoveProjectRequest(BaseModel):
    chapter_id: Optional[str] = None

@router.post("/projects/save")
async def api_save_project(background_tasks: BackgroundTasks, request: SaveProjectRequest):
    try:
        # Save quickly without blocking on embeddings if not provided
        # In the context of generation, embeddings are computed later or backgrounded.
        saved_project = save_project(
            title=request.title,
            source_filename=request.source_filename,
            study_style=request.study_style,
            model=request.model,
            markdown_content=request.markdown_content,
            chapter_id=request.chapter_id,
            pages=request.pages,
            chunks=request.chunks,
            generation_time=request.generation_time,
            embedding=None, # Will be set in background if needed
            classification=request.classification,
            pipeline_metrics=request.pipeline_metrics
        )
        
        # Dispatch background task to embed and classify if needed
        # We classify the generated markdown since we don't have the original text here, 
        # but it still correctly categorizes the document's domain.
        if request.classification == "Processing...":
            background_tasks.add_task(background_process_import, saved_project["id"], request.markdown_content)
            
        return saved_project
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from app.services.preprocessing_service import classify_document

def background_process_import(project_id: str, text: str):
    try:
        classification = classify_document(text)
        embedding_json = generate_document_embeddings_json(text)
        update_project(project_id, classification=classification, embedding=embedding_json)
    except Exception as e:
        print(f"Background import task failed: {e}")

@router.post("/projects/import")
async def api_import_project(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    try:
        content = await file.read()
        text = content.decode("utf-8")
        
        # Determine title from first H1 or filename
        title = file.filename
        for line in text.split('\n'):
            if line.startswith('# '):
                title = line[2:].strip()
                break
                
        # Save quickly without blocking on LLMs
        saved_project = save_project(
            title=title,
            source_filename=file.filename,
            study_style="imported",
            model="imported",
            markdown_content=text,
            chapter_id=None,
            pages=0,
            chunks=len(text.split('\n\n')),
            generation_time=0.0,
            embedding=None,
            classification="Processing...",
            pipeline_metrics='{"imported": true}'
        )
        
        # Schedule slow classification and embedding tasks
        background_tasks.add_task(background_process_import, saved_project["id"], text)
        
        # Ensure markdown_content is returned for the frontend to render immediately
        saved_project["markdown_content"] = text
        return saved_project
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

@router.get("/projects/{project_id}/learning_objects")
async def api_get_project_learning_objects(project_id: str):
    try:
        # The content_hash for the job's learning objects is the job_id (project_id)
        cached_jsons = get_cached_learning_objects(project_id)
        import json
        return [json.loads(lo) for lo in cached_jsons]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/projects/{project_id}")
async def api_update_project(project_id: str, request: UpdateProjectRequest):
    try:
        embedding_json = None
        if request.markdown_content is not None:
            # Fetch existing embedding for incremental processing
            import sqlite3
            from app.models.database import DB_PATH
            conn = sqlite3.connect(DB_PATH)
            c = conn.cursor()
            c.execute('SELECT embedding FROM projects WHERE id = ?', (project_id,))
            row = c.fetchone()
            conn.close()
            
            existing_emb = row[0] if row else None
            embedding_json = generate_document_embeddings_json(request.markdown_content, existing_emb)
            
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
