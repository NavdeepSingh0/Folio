from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# --- Folders ---
class FolderBase(BaseModel):
    name: str
    color: Optional[str] = "bg-slate-500/10 text-slate-600"
    is_pinned: Optional[bool] = False

class FolderCreate(FolderBase):
    pass

class FolderUpdate(BaseModel):
    name: Optional[str] = None
    is_pinned: Optional[bool] = None

class FolderResponse(FolderBase):
    id: int
    user_id: int
    created_at: datetime
    notes_count: int = 0

    class Config:
        from_attributes = True

# --- Files ---
class FileBase(BaseModel):
    name: str
    folder_id: Optional[int] = None
    status: Optional[str] = "pending"

class FileCreate(FileBase):
    original_filename: str
    file_size: str
    
class FileUpdate(BaseModel):
    name: Optional[str] = None
    folder_id: Optional[int] = None

class FileResponse(FileBase):
    id: int
    user_id: int
    original_filename: str
    file_size: str
    markdown_content: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# --- Facts ---
class FactResponse(BaseModel):
    id: int
    file_id: int
    concept: str
    description: str
    tags: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# --- Attachments ---
class AttachmentResponse(BaseModel):
    id: int
    file_id: int
    filename: str
    file_type: str
    file_size: int
    storage_path: str
    public_url: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class AttachmentUpdate(BaseModel):
    filename: str

# --- Chat ---
class ChatMessage(BaseModel):
    role: str # "user" or "model"
    content: str

class ChatRequest(BaseModel):
    session_id: Optional[int] = None
    file_id: Optional[int] = None
    message: str

class ChatContextRequest(BaseModel):
    file_id: int
    highlighted_text: str
    surrounding_text: Optional[str] = None
    question: Optional[str] = None

class ChatSessionResponse(BaseModel):
    id: int
    user_id: int
    title: str
    subject: Optional[str]
    messages_count: int
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True
