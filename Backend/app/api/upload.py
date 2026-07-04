import os
import shutil
from fastapi import APIRouter, Depends, UploadFile, File, BackgroundTasks
from sqlalchemy.orm import Session

from ..models.database import get_db
from ..models import schema, pydantic_schemas
from ..services.document_parser import extract_text_from_file
from ..services.ai_pipeline import extract_facts
from .library import get_current_user_id

router = APIRouter(prefix="/api", tags=["Upload"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


def extract_facts_background(db_file_id: int, raw_text: str):
    """Background task: extract facts via AI (optional, needs Gemini key)."""
    db = next(get_db())
    db_file = db.query(schema.File).filter(schema.File.id == db_file_id).first()
    if not db_file:
        return
    try:
        facts_data = extract_facts(raw_text)
        for fact_item in facts_data:
            new_fact = schema.Fact(
                file_id=db_file.id,
                concept=fact_item.get("concept", "Unknown"),
                description=fact_item.get("description", ""),
                tags=fact_item.get("tags", "")
            )
            db.add(new_fact)
        db_file.status = "complete"
        db.commit()
    except Exception as e:
        db_file.status = f"failed: {str(e)}"
        db.commit()
    finally:
        db.close()


@router.post("/upload", response_model=pydantic_schemas.FileResponse)
def upload_file(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    # Save file to disk
    file_path = os.path.join(UPLOAD_DIR, f"{user_id}_{file.filename}")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    file_size_bytes = os.path.getsize(file_path)
    file_size_mb = file_size_bytes / (1024 * 1024)
    size_str = f"{file_size_mb:.1f} MB" if file_size_mb >= 1 else f"{file_size_bytes / 1024:.0f} KB"

    base_name = os.path.splitext(file.filename)[0]

    # Extract text immediately — no AI, just parse the file
    # .md files → raw markdown, .pdf → extracted text, etc.
    try:
        raw_text = extract_text_from_file(file_path)
    except Exception as e:
        raw_text = f"Could not extract text from this file: {str(e)}"

    db_file = schema.File(
        user_id=user_id,
        name=base_name,
        original_filename=file.filename,
        file_size=size_str,
        markdown_content=raw_text,   # Store immediately — viewer renders it
        status="processing"
    )
    db.add(db_file)
    db.commit()
    db.refresh(db_file)

    # Background: AI fact extraction (optional, needs GEMINI_API_KEY)
    background_tasks.add_task(extract_facts_background, db_file.id, raw_text)

    return db_file
