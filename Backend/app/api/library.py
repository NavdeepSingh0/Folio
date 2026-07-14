from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy import func
from sqlalchemy.orm import Session
from typing import List
import uuid

from ..models.database import get_db
from ..models import schema, pydantic_schemas
from app.utils.supabase_client import supabase

router = APIRouter(prefix="/api", tags=["Library"])

from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    token = credentials.credentials
    # Verify JWT with Supabase
    auth_response = supabase.auth.get_user(token)
    if not auth_response or not auth_response.user:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        
    user_email = auth_response.user.email
    # Find user by email in local DB, or create them if it's their first time syncing
    user = db.query(schema.User).filter(schema.User.email == user_email).first()
    if not user:
        user = schema.User(username=user_email.split('@')[0], email=user_email)
        db.add(user)
        db.commit()
        db.refresh(user)
        
    return user.id


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
        # Delete all files in this folder
        files = db.query(schema.File).filter(schema.File.folder_id == folder_id).all()
        for f in files:
            # Delete attachments from DB and Storage
            attachments = db.query(schema.Attachment).filter(schema.Attachment.file_id == f.id).all()
            for att in attachments:
                try:
                    supabase.storage.from_("studyforge-storage").remove([att.storage_path])
                except Exception:
                    pass
                db.delete(att)
            
            # Delete facts
            db.query(schema.Fact).filter(schema.Fact.file_id == f.id).delete()
            
            # Delete file
            db.delete(f)
            
    db.delete(db_folder)
    db.commit()
    return {"message": "Folder deleted successfully"}


@router.get("/folders/{folder_id}/files", response_model=List[pydantic_schemas.FileSummaryResponse])
def get_files_by_folder(folder_id: int, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    return db.query(schema.File).filter(
        schema.File.user_id == user_id,
        schema.File.folder_id == folder_id
    ).order_by(schema.File.created_at.desc()).all()

# ==========================================
# FILES ENDPOINTS (Library specific)
# ==========================================

@router.get("/files/unassigned", response_model=List[pydantic_schemas.FileSummaryResponse])
def get_unassigned_files(db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    return db.query(schema.File).filter(
        schema.File.user_id == user_id, 
        schema.File.folder_id == None
    ).order_by(schema.File.created_at.desc()).all()

@router.put("/files/{file_id}", response_model=pydantic_schemas.FileResponse)
def update_file(file_id: int, file_update: pydantic_schemas.FileUpdate, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    db_file = db.query(schema.File).filter(schema.File.id == file_id, schema.File.user_id == user_id).first()
    if not db_file:
        raise HTTPException(status_code=404, detail="File not found")
    
    update_data = file_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_file, key, value)
        
    db.commit()
    db.refresh(db_file)
    return db_file

@router.delete("/files/{file_id}")
def delete_file(file_id: int, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    db_file = db.query(schema.File).filter(schema.File.id == file_id, schema.File.user_id == user_id).first()
    if not db_file:
        raise HTTPException(status_code=404, detail="File not found")
        
    # Delete attachments from DB and Storage
    attachments = db.query(schema.Attachment).filter(schema.Attachment.file_id == file_id).all()
    for att in attachments:
        try:
            supabase.storage.from_("studyforge-storage").remove([att.storage_path])
        except Exception:
            pass
        db.delete(att)
    
    # Delete facts
    db.query(schema.Fact).filter(schema.Fact.file_id == file_id).delete()
    
    # Delete file
    db.delete(db_file)
    db.commit()
    return {"message": "File deleted successfully"}

@router.get("/files/{file_id}", response_model=pydantic_schemas.FileResponse)
def get_file(file_id: int, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    db_file = db.query(schema.File).filter(schema.File.id == file_id, schema.File.user_id == user_id).first()
    if not db_file:
        raise HTTPException(status_code=404, detail="File not found")
    return db_file

@router.get("/files", response_model=List[pydantic_schemas.FileSummaryResponse])
def get_all_files(db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    """Get all files for this user (assigned and unassigned), most recent first."""
    return db.query(schema.File).filter(
        schema.File.user_id == user_id
    ).order_by(schema.File.created_at.desc()).limit(20).all()

@router.get("/facts", response_model=List[pydantic_schemas.FactResponse])
def get_all_facts(db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    """Get all facts extracted from the user's files."""
    return db.query(schema.Fact).join(schema.File).filter(
        schema.File.user_id == user_id
    ).order_by(schema.Fact.created_at.desc()).all()

# ==========================================
# ATTACHMENTS ENDPOINTS
# ==========================================

@router.post("/files/{file_id}/attachments", response_model=pydantic_schemas.AttachmentResponse)
async def upload_attachment(
    file_id: int, 
    file: UploadFile = File(...), 
    db: Session = Depends(get_db), 
    user_id: int = Depends(get_current_user_id)
):
    # Verify file belongs to user
    db_file = db.query(schema.File).filter(schema.File.id == file_id, schema.File.user_id == user_id).first()
    if not db_file:
        raise HTTPException(status_code=404, detail="File not found")

    file_bytes = await file.read()
    file_ext = file.filename.split('.')[-1] if '.' in file.filename else ''
    storage_path = f"attachments/{user_id}/{file_id}/{uuid.uuid4()}.{file_ext}"

    # Upload to Supabase Storage
    try:
        supabase.storage.from_("studyforge-storage").upload(
            file=file_bytes,
            path=storage_path,
            file_options={"content-type": file.content_type}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload to storage: {str(e)}")

    # Save to DB
    new_attachment = schema.Attachment(
        file_id=file_id,
        filename=file.filename,
        file_type=file.content_type,
        file_size=len(file_bytes),
        storage_path=storage_path
    )
    db.add(new_attachment)
    db.commit()
    db.refresh(new_attachment)

    # Attach public URL to response
    res = supabase.storage.from_("studyforge-storage").get_public_url(storage_path)
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

    try:
        supabase.storage.from_("studyforge-storage").remove([attachment.storage_path])
    except Exception:
        pass

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
