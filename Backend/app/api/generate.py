from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse
from typing import Optional
from app.services.document_structure_service import extract_structured_text
from app.services.generation_engine import LegacyEngine, TwoPassBatchEngine
from app.services.chunking_service import chunk_text
from app.services.preprocessing_service import clean_document

USE_TWO_PASS_ENGINE = True
import logging
import time
import json
import asyncio

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/generate")
async def generate_notes(
    file: UploadFile = File(...),
    style: str = Form("university_notes"),
    model: str = Form("gemini-1.5"),
    custom_instructions: Optional[str] = Form(None)
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
        
    if not (file.filename.lower().endswith(".pdf") or file.filename.lower().endswith(".pptx")):
        raise HTTPException(status_code=400, detail="Only PDF and PPTX files are supported")

    try:
        # Read file contents
        file_bytes = await file.read()
        
        start_total = time.time()
        
        # 1. Extract structural text
        start_extract = time.time()
        extracted_doc = extract_structured_text(file_bytes, file.filename)
        num_pages = extracted_doc.page_count
        extracted_text = extracted_doc.to_string()
        extract_time = time.time() - start_extract
        
        if not extracted_doc.slides:
            raise HTTPException(status_code=422, detail="Could not extract any text from the document.")

        # 2. Preprocess / Clean
        start_clean = time.time()
        cleaned_text = clean_document(extracted_text)
        clean_time = time.time() - start_clean
        
        # 3. Classify Document (Deferred to save to avoid blocking TTFT)
        classification = "Processing..."

        # 4. Count chunks for metadata (using same size as llm_service)
        start_chunk = time.time()
        # The TwoPassGenerationEngine uses 2500 by default, fallback to same metric logic
        chunks = chunk_text(cleaned_text, chunk_size=2500, chunk_overlap=100)
        chunk_time = time.time() - start_chunk
        num_chunks = len(chunks)

        pipeline_metrics = {
            "extract_time_sec": round(extract_time, 2),
            "clean_time_sec": round(clean_time, 2),
            "chunk_time_sec": round(chunk_time, 2)
        }

        # 5. Stream Generation
        if USE_TWO_PASS_ENGINE:
            engine = TwoPassBatchEngine()
            # The new engine expects ExtractedDocument, legacy expects string
            generate_input = extracted_doc 
        else:
            engine = LegacyEngine()
            generate_input = cleaned_text
            
        return StreamingResponse(
            engine.generate(generate_input, style, custom_instructions, model),
            media_type="text/plain",
            headers={
                "X-Document-Pages": str(num_pages),
                "X-Document-Chunks": str(num_chunks),
                "X-Classification": classification,
                "X-Pipeline-Metrics": json.dumps(pipeline_metrics),
                "Access-Control-Expose-Headers": "X-Document-Pages, X-Document-Chunks, X-Classification, X-Pipeline-Metrics"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating notes: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
