from fastapi import APIRouter, UploadFile, File, HTTPException
import os
import shutil
import uuid
import time

router = APIRouter()

UPLOAD_DIR = "uploads"

# Ensure upload directory exists
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
        
    if not (file.filename.lower().endswith(".pdf") or file.filename.lower().endswith(".pptx")):
        raise HTTPException(status_code=400, detail="Only PDF and PPTX files are supported")

    # Generate a unique file name to avoid collisions
    file_id = str(uuid.uuid4())
    ext = os.path.splitext(file.filename)[1]
    safe_filename = f"{file_id}{ext}"
    file_path = os.path.join(UPLOAD_DIR, safe_filename)

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        return {
            "file_id": file_id,
            "file_path": file_path,
            "original_name": file.filename
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload file: {str(e)}")
