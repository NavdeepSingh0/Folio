from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse
from typing import Optional
from app.services.document_structure_service import extract_structured_text
from app.services.llm_service import generate_markdown_notes_stream
from app.services.chunking_service import chunk_text
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/generate")
async def generate_notes(
    file: UploadFile = File(...),
    style: str = Form("university_notes"),
    model: str = Form("llama3.2"),
    custom_instructions: Optional[str] = Form(None)
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
        
    if not (file.filename.lower().endswith(".pdf") or file.filename.lower().endswith(".pptx")):
        raise HTTPException(status_code=400, detail="Only PDF and PPTX files are supported")

    try:
        # Read file contents
        file_bytes = await file.read()
        
        # 1. Extract structural text
        extracted_text, num_pages = extract_structured_text(file_bytes, file.filename)
        
        if not extracted_text.strip():
            raise HTTPException(status_code=422, detail="Could not extract any text from the document.")

        chunks = chunk_text(extracted_text)
        num_chunks = len(chunks)

        # 2. Return the generator wrapped in a StreamingResponse
        # text/plain will let the browser stream the raw text chunks directly to the fetch reader.
        return StreamingResponse(
            generate_markdown_notes_stream(extracted_text, style, custom_instructions, model),
            media_type="text/plain",
            headers={
                "X-Document-Pages": str(num_pages),
                "X-Document-Chunks": str(num_chunks),
                "Access-Control-Expose-Headers": "X-Document-Pages, X-Document-Chunks"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating notes: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
