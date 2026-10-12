import os
import re
import uuid
import logging
from fastapi import APIRouter, Depends, UploadFile, File, BackgroundTasks, HTTPException
from sqlalchemy.orm import Session

from ..models.database import get_db
from ..models import schema, pydantic_schemas
from ..services.document_parser import extract_text_from_file, DocumentParseError, SUPPORTED_EXTENSIONS
from ..services.ai_pipeline import extract_facts, AIError
from .library import get_current_user_id

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["Upload"])

UPLOAD_DIR = os.path.abspath("uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

MAX_UPLOAD_BYTES = 50 * 1024 * 1024  # 50 MB, matches the limit advertised in the UI
CHUNK_SIZE = 1024 * 1024
MAX_STATUS_REASON_LEN = 120


def failed_status(reason: str) -> str:
    """Status string for a failed file: 'failed: <short reason>'."""
    return f"failed: {reason[:MAX_STATUS_REASON_LEN]}"


def sanitize_filename(filename: str) -> str:
    """Strips directory parts and unsafe characters from a client-supplied filename."""
    name = os.path.basename((filename or "").replace("\\", "/"))
    name = re.sub(r"[^A-Za-z0-9._-]", "_", name).lstrip(".")
    return name[:200] or "file"


def build_upload_path(filename: str) -> str:
    """Returns a unique path inside UPLOAD_DIR for the given client filename."""
    stored_name = f"{uuid.uuid4().hex}_{sanitize_filename(filename)}"
    path = os.path.realpath(os.path.join(UPLOAD_DIR, stored_name))
    if os.path.commonpath([path, os.path.realpath(UPLOAD_DIR)]) != os.path.realpath(UPLOAD_DIR):
        raise HTTPException(status_code=400, detail="Invalid file name")
    return path


def extract_facts_background(db_file_id: int, raw_text: str):
    """Background task: extract facts via AI and mark the file complete or failed."""
    db = next(get_db())
    try:
        db_file = db.query(schema.File).filter(schema.File.id == db_file_id).first()
        if not db_file:
            return
        try:
            facts_data = extract_facts(raw_text)
        except AIError as e:
            logger.warning("Fact extraction failed for file %s: %s", db_file_id, e)
            db_file.status = failed_status(str(e))
            db.commit()
            return
        except Exception:
            logger.exception("Unexpected fact extraction error for file %s", db_file_id)
            db_file.status = failed_status("Fact extraction failed")
            db.commit()
            return

        for fact_item in facts_data:
            db.add(schema.Fact(
                file_id=db_file.id,
                concept=fact_item.get("concept", "Unknown"),
                description=fact_item.get("description", ""),
                tags=fact_item.get("tags", "")
            ))
        db_file.status = "complete"
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
    original_name = os.path.basename((file.filename or "").replace("\\", "/"))
    if not original_name:
        raise HTTPException(status_code=400, detail="File name is required")

    ext = os.path.splitext(original_name)[1].lower()
    if ext not in SUPPORTED_EXTENSIONS:
        supported = ", ".join(sorted(SUPPORTED_EXTENSIONS))
        raise HTTPException(status_code=400, detail=f"Unsupported file type '{ext or 'none'}'. Supported: {supported}")

    # Save file to disk, enforcing the size limit while streaming
    file_path = build_upload_path(original_name)
    file_size_bytes = 0
    try:
        with open(file_path, "wb") as buffer:
            while chunk := file.file.read(CHUNK_SIZE):
                file_size_bytes += len(chunk)
                if file_size_bytes > MAX_UPLOAD_BYTES:
                    raise HTTPException(status_code=413, detail="File is too large (max 50 MB)")
                buffer.write(chunk)
    except HTTPException:
        os.remove(file_path)
        raise

    file_size_mb = file_size_bytes / (1024 * 1024)
    size_str = f"{file_size_mb:.1f} MB" if file_size_mb >= 1 else f"{file_size_bytes / 1024:.0f} KB"

    base_name = os.path.splitext(original_name)[0]

    # Extract text immediately — no AI, just parse the file
    status = "processing"
    raw_text = None
    try:
        raw_text = extract_text_from_file(file_path)
    except DocumentParseError as e:
        logger.warning("Text extraction failed for upload %s: %s", original_name, e)
        status = failed_status(str(e))
    except Exception:
        logger.exception("Unexpected text extraction error for upload %s", original_name)
        status = failed_status("Could not read this file")

    if status == "processing" and not (raw_text or "").strip():
        # Nothing to extract facts from (e.g. images or empty documents)
        status = "complete"

    db_file = schema.File(
        user_id=user_id,
        name=base_name,
        original_filename=original_name,
        file_size=size_str,
        markdown_content=raw_text or None,   # Store immediately — viewer renders it
        status=status
    )
    db.add(db_file)
    db.commit()
    db.refresh(db_file)

    # Background: AI fact extraction (needs GEMINI_API_KEY; failure marks the file failed)
    if status == "processing":
        background_tasks.add_task(extract_facts_background, db_file.id, raw_text)

    return db_file
