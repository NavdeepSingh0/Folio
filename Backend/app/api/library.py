from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy import func
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
import logging
import hashlib
from datetime import datetime, timedelta, timezone

from ..models.database import get_db
from ..models import schema, pydantic_schemas
from app.utils.supabase_client import supabase
from app.services.image_extraction import extract_inline_images, store_attachment

from app.utils.auth_deps import get_current_user_id  # re-exported for other routers
from app.utils.limits import MAX_ATTACHMENT_BYTES, ATTACHMENT_EXTENSIONS, read_limited

router = APIRouter(prefix="/api", tags=["Library"])
logger = logging.getLogger(__name__)
STORAGE_BUCKET = "studyforge-storage"


STUCK_PROCESSING_AFTER = timedelta(minutes=15)


def content_hash(markdown: Optional[str]) -> str:
    """SHA-256 hex of the exact stored markdown; the save-conflict revision token."""
    return hashlib.sha256((markdown or "").encode("utf-8")).hexdigest()


def sweep_stuck_processing(db: Session, user_id: Optional[int] = None) -> None:
    """Marks files left in 'processing' (e.g. by a restart mid-upload) as failed.

    Uses created_at because files has no updated_at column; adding an updated_at
    migration is the long-term fix. Re-extracting facts after edits is out of scope.
    """
    cutoff = datetime.now(timezone.utc) - STUCK_PROCESSING_AFTER
    query = db.query(schema.File).filter(
        schema.File.status == "processing",
        schema.File.created_at < cutoff,
    )
    if user_id is not None:
        query = query.filter(schema.File.user_id == user_id)
    if query.update({"status": "failed: interrupted"}, synchronize_session=False):
        db.commit()


def _remove_from_storage(paths: List[str]) -> None:
    """Removes objects in one storage call; failures are logged, not raised."""
    if not paths:
        return
    try:
        supabase.storage.from_(STORAGE_BUCKET).remove(paths)
    except Exception:
        logger.warning("Failed to remove %d object(s) from storage", len(paths), exc_info=True)


def _delete_files_bulk(db: Session, file_ids: List[int]) -> None:
    """Deletes files with their attachments (DB and storage) and facts. Caller commits."""
    if not file_ids:
        return
    paths = [p for (p,) in db.query(schema.Attachment.storage_path).filter(schema.Attachment.file_id.in_(file_ids)).all()]
    _remove_from_storage(paths)
    db.query(schema.Attachment).filter(schema.Attachment.file_id.in_(file_ids)).delete(synchronize_session=False)
    db.query(schema.Fact).filter(schema.Fact.file_id.in_(file_ids)).delete(synchronize_session=False)
    db.query(schema.File).filter(schema.File.id.in_(file_ids)).delete(synchronize_session=False)

# ==========================================
# FOLDERS ENDPOINTS
# ==========================================

@router.get("/folders", response_model=List[pydantic_schemas.FolderResponse])
def get_folders(db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    folders = db.query(
        schema.Folder,
        func.count(schema.File.id).label("notes_count")
    ).outerjoin(
        schema.File,
        (schema.File.folder_id == schema.Folder.id) & (schema.File.user_id == user_id)
    ).filter(
        schema.Folder.user_id == user_id
    ).group_by(
        schema.Folder.id
    ).order_by(
        schema.Folder.created_at.desc()
    ).all()

    return [
        {
            "id": folder.id,
            "user_id": folder.user_id,
            "name": folder.name,
            "color": folder.color,
            "is_pinned": folder.is_pinned,
            "created_at": folder.created_at,
            "notes_count": notes_count,
        }
        for folder, notes_count in folders
    ]

@router.post("/folders", response_model=pydantic_schemas.FolderResponse)
def create_folder(folder: pydantic_schemas.FolderCreate, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    db_folder = schema.Folder(**folder.model_dump(), user_id=user_id)
    db.add(db_folder)
    db.commit()
    db.refresh(db_folder)
    
    response = db_folder.__dict__
    response["notes_count"] = 0
    return response

@router.put("/folders/{folder_id}", response_model=pydantic_schemas.FolderResponse)
def update_folder(folder_id: int, folder_update: pydantic_schemas.FolderUpdate, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    db_folder = db.query(schema.Folder).filter(schema.Folder.id == folder_id, schema.Folder.user_id == user_id).first()
    if not db_folder:
        raise HTTPException(status_code=404, detail="Folder not found")
    
    update_data = folder_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_folder, key, value)
        
    db.commit()
    db.refresh(db_folder)
    
    response = db_folder.__dict__
    response["notes_count"] = db.query(schema.File).filter(schema.File.folder_id == db_folder.id).count()
    return response

@router.delete("/folders/{folder_id}")
def delete_folder(folder_id: int, keep_notes: bool = True, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    db_folder = db.query(schema.Folder).filter(schema.Folder.id == folder_id, schema.Folder.user_id == user_id).first()
    if not db_folder:
        raise HTTPException(status_code=404, detail="Folder not found")
        
    if keep_notes:
        # Unassign all files in this folder before deleting
        db.query(schema.File).filter(schema.File.folder_id == folder_id).update({"folder_id": None})
    else:
        # Delete all files in this folder with bulk queries instead of per-file loops
        file_ids = [fid for (fid,) in db.query(schema.File.id).filter(schema.File.folder_id == folder_id).all()]
        _delete_files_bulk(db, file_ids)
            
    db.delete(db_folder)
    db.commit()
    return {"message": "Folder deleted successfully"}


@router.get("/folders/{folder_id}/files", response_model=List[pydantic_schemas.FileSummaryResponse])
def get_files_by_folder(
    folder_id: int,
    limit: int = Query(200, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    sweep_stuck_processing(db, user_id)
    return db.query(schema.File).filter(
        schema.File.user_id == user_id,
        schema.File.folder_id == folder_id
    ).order_by(schema.File.created_at.desc(), schema.File.id.desc()).offset(offset).limit(limit).all()

# ==========================================
# FILES ENDPOINTS (Library specific)
# ==========================================

@router.get("/files/unassigned", response_model=List[pydantic_schemas.FileSummaryResponse])
def get_unassigned_files(
    limit: int = Query(200, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    sweep_stuck_processing(db, user_id)
    return db.query(schema.File).filter(
        schema.File.user_id == user_id, 
        schema.File.folder_id == None
    ).order_by(schema.File.created_at.desc(), schema.File.id.desc()).offset(offset).limit(limit).all()

@router.put("/files/{file_id}", response_model=pydantic_schemas.FileUpdateResponse)
def update_file(file_id: int, file_update: pydantic_schemas.FileUpdate, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    db_file = db.query(schema.File).filter(schema.File.id == file_id, schema.File.user_id == user_id).first()
    if not db_file:
        raise HTTPException(status_code=404, detail="File not found")
    
    update_data = file_update.model_dump(exclude_unset=True)
    expected_hash = update_data.pop("expected_hash", None)
    # Optimistic concurrency without a schema change: compare content hashes
    if expected_hash is not None and expected_hash != content_hash(db_file.markdown_content):
        raise HTTPException(status_code=409, detail="Note changed on server")
    # Prevent moving a file into a folder owned by another user
    if update_data.get("folder_id") is not None:
        target_folder = db.query(schema.Folder).filter(schema.Folder.id == update_data["folder_id"], schema.Folder.user_id == user_id).first()
        if not target_folder:
            raise HTTPException(status_code=404, detail="Folder not found")
    if update_data.get("markdown_content"):
        update_data["markdown_content"] = extract_inline_images(db, user_id, file_id, update_data["markdown_content"])
    for key, value in update_data.items():
        setattr(db_file, key, value)
        
    db.commit()
    db.refresh(db_file)
    response = pydantic_schemas.FileUpdateResponse.model_validate(db_file)
    response.content_hash = content_hash(db_file.markdown_content)
    return response

@router.delete("/files/{file_id}")
def delete_file(file_id: int, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    db_file = db.query(schema.File).filter(schema.File.id == file_id, schema.File.user_id == user_id).first()
    if not db_file:
        raise HTTPException(status_code=404, detail="File not found")

    _delete_files_bulk(db, [file_id])
    db.commit()
    return {"message": "File deleted successfully"}

@router.get("/files/{file_id}", response_model=pydantic_schemas.FileResponse)
def get_file(file_id: int, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    db_file = db.query(schema.File).filter(schema.File.id == file_id, schema.File.user_id == user_id).first()
    if not db_file:
        raise HTTPException(status_code=404, detail="File not found")
    sweep_stuck_processing(db, user_id)
    db.refresh(db_file)
    response = pydantic_schemas.FileResponse.model_validate(db_file)
    response.content_hash = content_hash(db_file.markdown_content)
    return response

@router.get("/files", response_model=List[pydantic_schemas.FileSummaryResponse])
def get_all_files(
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    """Get one page of this user's files (assigned and unassigned), newest first.

    Clients page with limit/offset until a page shorter than limit arrives.
    """
    sweep_stuck_processing(db, user_id)
    return db.query(schema.File).filter(
        schema.File.user_id == user_id
    ).order_by(
        schema.File.created_at.desc(),
        schema.File.id.desc(),
    ).offset(offset).limit(limit).all()

@router.get("/facts", response_model=List[pydantic_schemas.FactResponse])
def get_all_facts(
    limit: int = Query(200, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    file_id: Optional[int] = None,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    """Get one page of facts extracted from the user's files, optionally for one file."""
    query = db.query(schema.Fact).join(schema.File).filter(schema.File.user_id == user_id)
    if file_id is not None:
        query = query.filter(schema.Fact.file_id == file_id)
    return query.order_by(schema.Fact.created_at.desc(), schema.Fact.id.desc()).offset(offset).limit(limit).all()

# ==========================================
# ATTACHMENTS ENDPOINTS
# ==========================================

@router.post("/files/{file_id}/attachments", response_model=pydantic_schemas.AttachmentResponse)
def upload_attachment(
    file_id: int, 
    file: UploadFile = File(...), 
    db: Session = Depends(get_db), 
    user_id: int = Depends(get_current_user_id)
):
    # Verify file belongs to user
    db_file = db.query(schema.File).filter(schema.File.id == file_id, schema.File.user_id == user_id).first()
    if not db_file:
        raise HTTPException(status_code=404, detail="File not found")

    file_ext = file.filename.split('.')[-1].lower() if file.filename and '.' in file.filename else ''
    if file_ext not in ATTACHMENT_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Unsupported attachment type")

    file_bytes = read_limited(file.file, MAX_ATTACHMENT_BYTES)
    if file_bytes is None:
        raise HTTPException(status_code=413, detail="Attachment exceeds the 20 MB limit")
    storage_path = f"attachments/{user_id}/{file_id}/{uuid.uuid4()}.{file_ext}"

    # Upload to Supabase Storage and save to DB
    try:
        new_attachment, res = store_attachment(
            db, user_id, file_id, file.filename, file.content_type, file_bytes, storage_path
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload to storage: {str(e)}")

    response_data = pydantic_schemas.AttachmentResponse.model_validate(new_attachment)
    response_data.public_url = res

    return response_data

@router.get("/files/{file_id}/attachments", response_model=List[pydantic_schemas.AttachmentResponse])
def get_attachments(file_id: int, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    # Verify file belongs to user
    db_file = db.query(schema.File).filter(schema.File.id == file_id, schema.File.user_id == user_id).first()
    if not db_file:
        raise HTTPException(status_code=404, detail="File not found")

    attachments = db.query(schema.Attachment).filter(schema.Attachment.file_id == file_id).all()
    
    # Inject public URLs
    result = []
    for att in attachments:
        res = pydantic_schemas.AttachmentResponse.model_validate(att)
        res.public_url = supabase.storage.from_("studyforge-storage").get_public_url(att.storage_path)
        result.append(res)
        
    return result

@router.delete("/attachments/{attachment_id}")
def delete_attachment(attachment_id: int, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    attachment = db.query(schema.Attachment).join(schema.File).filter(
        schema.Attachment.id == attachment_id,
        schema.File.user_id == user_id
    ).first()
    if not attachment:
        raise HTTPException(status_code=404, detail="Attachment not found")

    _remove_from_storage([attachment.storage_path])

    db.delete(attachment)
    db.commit()
    return {"message": "Attachment deleted successfully"}

@router.put("/attachments/{attachment_id}", response_model=pydantic_schemas.AttachmentResponse)
def update_attachment(attachment_id: int, update_data: pydantic_schemas.AttachmentUpdate, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    attachment = db.query(schema.Attachment).join(schema.File).filter(
        schema.Attachment.id == attachment_id,
        schema.File.user_id == user_id
    ).first()
    if not attachment:
        raise HTTPException(status_code=404, detail="Attachment not found")
        
    attachment.filename = update_data.filename
    db.commit()
    db.refresh(attachment)
    
    res = pydantic_schemas.AttachmentResponse.model_validate(attachment)
    res.public_url = supabase.storage.from_("studyforge-storage").get_public_url(attachment.storage_path)
    return res
