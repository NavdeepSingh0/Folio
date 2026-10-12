import io
import json
import logging
from fastapi import APIRouter, Depends, HTTPException, Form, File, UploadFile, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from google.genai import types
import PIL.Image

from ..models.database import get_db
from ..models import schema, pydantic_schemas
from ..services.ai_pipeline import (
    get_client, get_model_name, thinking_config, AINotConfiguredError,
    build_chat_system_instruction, CHAT_HISTORY_TURNS,
)
from ..utils.limits import (
    MAX_CHAT_IMAGE_BYTES, MAX_CHAT_TEXT_ATTACHMENT_BYTES, MAX_CHAT_TEXT_CHARS, MAX_IMAGE_PIXELS, read_limited,
)
from .library import get_current_user_id

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/chat", tags=["Chat"])

CHAT_MAX_OUTPUT_TOKENS = 8192
LEGACY_DOC_PREFIX = "You are a helpful study assistant. The user is currently reading this document:\n\n---\n"
PIL.Image.MAX_IMAGE_PIXELS = MAX_IMAGE_PIXELS


def _generate(contents, system_instruction: Optional[str] = None) -> str:
    """Calls Gemini and returns the text, mapping failures to HTTP errors."""
    try:
        client = get_client()
    except AINotConfiguredError:
        raise HTTPException(status_code=503, detail="AI assistant is not configured on the server")

    model = get_model_name()
    try:
        response = client.models.generate_content(
            model=model,
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                max_output_tokens=CHAT_MAX_OUTPUT_TOKENS,
                thinking_config=thinking_config(model),
            ),
        )
    except Exception:
        logger.exception("Gemini chat request failed (model=%s)", model)
        raise HTTPException(status_code=502, detail="AI assistant request failed. Please try again.")

    if not response.text:
        logger.error("Gemini chat returned an empty response (model=%s)", model)
        raise HTTPException(status_code=502, detail="AI assistant returned an empty response. Please try again.")
    return response.text


def _history_to_contents(history: list) -> list:
    """Converts stored history ({role, parts: [str]}) into Gemini content objects."""
    return [
        types.Content(role=item["role"], parts=[types.Part(text=str(p)) for p in item.get("parts", [])])
        for item in history
        if item.get("role") in ("user", "model")
    ]


def _split_context(history: list) -> tuple[Optional[int], Optional[str], list]:
    """
    Separates the document context from the conversation turns.
    New sessions store a leading {"role": "context", "file_id": N} marker.
    Legacy sessions stored the whole document as a fake first user/model turn pair.
    Returns (file_id, legacy_document_text, conversation_turns).
    """
    if history and history[0].get("role") == "context":
        return history[0].get("file_id"), None, history[1:]
    if (
        len(history) >= 2
        and history[0].get("role") == "user"
        and history[1].get("role") == "model"
        and str((history[0].get("parts") or [""])[0]).startswith(LEGACY_DOC_PREFIX)
    ):
        legacy = str(history[0]["parts"][0])[len(LEGACY_DOC_PREFIX):]
        return None, legacy, history[2:]
    return None, None, history


def _read_image(attachment: UploadFile) -> PIL.Image.Image:
    """Reads a chat image with a byte cap and decompression-bomb protection."""
    data = read_limited(attachment.file, MAX_CHAT_IMAGE_BYTES)
    if data is None:
        raise HTTPException(status_code=413, detail=f"Image {attachment.filename} exceeds the 10 MB limit")
    try:
        PIL.Image.open(io.BytesIO(data)).verify()
        img = PIL.Image.open(io.BytesIO(data))
        img.load()
    except PIL.Image.DecompressionBombError:
        raise HTTPException(status_code=400, detail=f"Image {attachment.filename} is too large to process")
    return img


@router.post("", response_model=dict)
def chat_with_assistant(
    message: str = Form(...),
    session_id: Optional[int] = Form(None),
    file_id: Optional[int] = Form(None),
    attachments: List[UploadFile] = File(default=[]),
    db: Session = Depends(get_db), 
    user_id: int = Depends(get_current_user_id)
):
    """
    Stateful chat endpoint. If session_id is not provided, creates a new chat session.
    If file_id is provided on a NEW session, the markdown file (inline images stripped,
    size capped) is sent as the system instruction on every turn of that session.
    Only the last CHAT_HISTORY_TURNS messages are sent to the model.
    Accepts multipart/form-data for file attachments.
    Returns {"session_id": int, "message": str}.
    """
    # 1. Fetch existing session, or prepare a new one (saved only after a successful AI reply)
    chat_session = None
    db_file = None
    legacy_doc = None
    if session_id:
        chat_session = db.query(schema.ChatSession).filter(
            schema.ChatSession.id == session_id, 
            schema.ChatSession.user_id == user_id
        ).first()
        if not chat_session:
            raise HTTPException(status_code=404, detail="Chat session not found")
        stored = json.loads(chat_session.history or "[]")
        context_file_id, legacy_doc, history = _split_context(stored)
        prefix = stored[:len(stored) - len(history)]  # context marker or legacy turns, kept as-is
    else:
        history = []
        prefix = []
        context_file_id = file_id

    system_instruction = None
    if context_file_id:
        db_file = db.query(schema.File).filter(
            schema.File.id == context_file_id,
            schema.File.user_id == user_id
        ).first()
        # A new session for a missing or foreign file is an error, not general chat
        if db_file is None and chat_session is None:
            raise HTTPException(status_code=404, detail="File not found")
        if db_file and db_file.markdown_content:
            system_instruction = build_chat_system_instruction(db_file.markdown_content)
            if chat_session is None:
                prefix = [{"role": "context", "file_id": db_file.id}]
    elif legacy_doc:
        system_instruction = build_chat_system_instruction(legacy_doc)

    # Process attachments
    message_parts = [message]
    db_history_message = message
    for attachment in attachments:
        if attachment.filename:
            if attachment.filename.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
                try:
                    img = _read_image(attachment)
                    message_parts.append(img)
                    db_history_message += f"\n[Attached Image: {attachment.filename}]"
                except HTTPException:
                    raise
                except Exception:
                    logger.warning("Failed to process image attachment %s", attachment.filename, exc_info=True)
            else:
                try:
                    content = attachment.file.read(MAX_CHAT_TEXT_ATTACHMENT_BYTES)
                    text = content.decode('utf-8', errors='ignore')[:MAX_CHAT_TEXT_CHARS]
                    message_parts.append(f"\n\nAttached File ({attachment.filename}):\n{text}")
                    db_history_message += f"\n[Attached File: {attachment.filename}]"
                except Exception:
                    logger.warning("Failed to process text attachment %s", attachment.filename, exc_info=True)

    # 2. Call Gemini with recent history plus the new multimodal message
    recent = history[-CHAT_HISTORY_TURNS:]
    contents = _history_to_contents(recent) + [types.UserContent(parts=message_parts)]
    ai_response_text = _generate(contents, system_instruction)

    # 3. Persist (strings only in history)
    if chat_session is None:
        file_name = db_file.name if db_file else "General Knowledge"
        chat_session = schema.ChatSession(
            user_id=user_id,
            title=f"Chat regarding {file_name}",
            subject=file_name,
            history="[]",
            messages_count=0
        )
        db.add(chat_session)

    history.append({"role": "user", "parts": [db_history_message]})
    history.append({"role": "model", "parts": [ai_response_text]})
    
    chat_session.history = json.dumps(prefix + history)
    chat_session.messages_count = (chat_session.messages_count or 0) + 2  # user + model
    db.commit()
    db.refresh(chat_session)
    
    return {
        "session_id": chat_session.id,
        "message": ai_response_text
    }


@router.post("/context", response_model=dict)
def highlight_to_ask(
    request: pydantic_schemas.ChatContextRequest, 
    db: Session = Depends(get_db), 
    user_id: int = Depends(get_current_user_id)
):
    """
    Context-aware endpoint. Takes a highlighted snippet and returns an explanation.
    Does not require a persistent chat session (stateless).
    Returns {"response": str}.
    """
    db_file = db.query(schema.File).filter(
        schema.File.id == request.file_id,
        schema.File.user_id == user_id
    ).first()
    if not db_file:
        raise HTTPException(status_code=404, detail="File not found")
        
    prompt = f"""
    The user is studying a document titled '{db_file.name}'.
    They highlighted this specific text:
    "{request.highlighted_text}"
    """
    
    if request.surrounding_text:
        prompt += f"\nFor context, here is the surrounding text:\n{request.surrounding_text}"
        
    if request.question:
        prompt += f"\n\nThe user's specific question is: {request.question}"
    else:
        prompt += "\n\nPlease explain this highlighted text clearly, defining any complex terms."
        
    return {"response": _generate(prompt)}


@router.get("/history", response_model=List[pydantic_schemas.ChatSessionResponse])
def get_chat_history(
    limit: int = Query(200, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    """Retrieves one page of past chat sessions for the user, newest first."""
    return db.query(schema.ChatSession).filter(
        schema.ChatSession.user_id == user_id
    ).order_by(
        schema.ChatSession.created_at.desc(),
        schema.ChatSession.id.desc(),
    ).offset(offset).limit(limit).all()
