import json
import logging
from fastapi import APIRouter, Depends, HTTPException, Form, File, UploadFile
from sqlalchemy.orm import Session
from typing import List, Optional
from google.genai import types
import PIL.Image

from ..models.database import get_db
from ..models import schema, pydantic_schemas
from ..services.ai_pipeline import get_client, get_model_name, thinking_config, AINotConfiguredError
from .library import get_current_user_id

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/chat", tags=["Chat"])

CHAT_MAX_OUTPUT_TOKENS = 8192


def _generate(contents) -> str:
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
    ]


@router.post("", response_model=dict)
async def chat_with_assistant(
    message: str = Form(...),
    session_id: Optional[int] = Form(None),
    file_id: Optional[int] = Form(None),
    attachments: List[UploadFile] = File(default=[]),
    db: Session = Depends(get_db), 
    user_id: int = Depends(get_current_user_id)
):
    """
    Stateful chat endpoint. If session_id is not provided, creates a new chat session.
    If file_id is provided on a NEW session, the entire markdown file is injected as the system context.
    Accepts multipart/form-data for file attachments.
    Returns {"session_id": int, "message": str}.
    """
    
    # 1. Fetch existing session, or prepare a new one (saved only after a successful AI reply)
    chat_session = None
    db_file = None
    if session_id:
        chat_session = db.query(schema.ChatSession).filter(
            schema.ChatSession.id == session_id, 
            schema.ChatSession.user_id == user_id
        ).first()
        if not chat_session:
            raise HTTPException(status_code=404, detail="Chat session not found")
        history = json.loads(chat_session.history or "[]")
    else:
        history = []
        if file_id:
            db_file = db.query(schema.File).filter(
                schema.File.id == file_id,
                schema.File.user_id == user_id
            ).first()
            # Inject file context if provided
            if db_file and db_file.markdown_content:
                system_prompt = f"You are a helpful study assistant. The user is currently reading this document:\n\n---\n{db_file.markdown_content}\n---\n\nAnswer all subsequent questions based heavily on this document."
                history.append({"role": "user", "parts": [system_prompt]})
                history.append({"role": "model", "parts": ["Understood. I have read the document and am ready to answer any questions about it."]})

    # Process attachments
    message_parts = [message]
    db_history_message = message
    
    for attachment in attachments:
        if attachment.filename:
            if attachment.filename.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
                try:
                    img = PIL.Image.open(attachment.file)
                    message_parts.append(img)
                    db_history_message += f"\n[Attached Image: {attachment.filename}]"
                except Exception:
                    logger.warning("Failed to process image attachment %s", attachment.filename, exc_info=True)
            else:
                try:
                    content = await attachment.read()
                    text = content.decode('utf-8', errors='ignore')
                    message_parts.append(f"\n\nAttached File ({attachment.filename}):\n{text}")
                    db_history_message += f"\n[Attached File: {attachment.filename}]"
                except Exception:
                    logger.warning("Failed to process text attachment %s", attachment.filename, exc_info=True)

    # 2. Call Gemini with prior history plus the new multimodal message
    contents = _history_to_contents(history) + [types.UserContent(parts=message_parts)]
    ai_response_text = _generate(contents)

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
    
    chat_session.history = json.dumps(history)
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
def get_chat_history(db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    """Retrieves all past chat sessions for the user."""
    return db.query(schema.ChatSession).filter(schema.ChatSession.user_id == user_id).order_by(schema.ChatSession.created_at.desc()).all()
