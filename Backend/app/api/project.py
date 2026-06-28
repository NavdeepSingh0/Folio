from fastapi import APIRouter, HTTPException
from app.models.database import get_project, get_cached_learning_objects
import json

router = APIRouter()

@router.get("/project/{project_id}")
async def get_project_full(project_id: str):
    project = get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # In a full implementation, we would query the database for 
    # Revision and Advanced Practice JSONs associated with this project.
    # For now, we return the base project data and markdown content.
    
    # We can also fetch the cached LearningObjects if they share the same content_hash 
    # (assuming content_hash was saved to project or project_id was used as content_hash)
    learning_objects_json = get_cached_learning_objects(project_id) 
    
    study_topics = []
    for lo_json in learning_objects_json:
        try:
            study_topics.append(json.loads(lo_json))
        except:
            pass

    return {
        "project": project,
        "study_topics": study_topics,
        # TODO: Add revision and advanced practice when schema is updated
        "revision": None, 
        "advanced_practice": None
    }
