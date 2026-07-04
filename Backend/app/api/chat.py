import os
import json
from fastapi import APIRouter, Depends, HTTPException, Form, File, UploadFile
from sqlalchemy.orm import Session
from typing import List, Optional
import google.generativeai as genai
import PIL.Image

from ..models.database import get_db
from ..models import schema, pydantic_schemas
from .library import get_current_user_id

router = APIRouter(prefix="/api/chat", tags=["Chat"])

api_key = os.getenv("GEMINI_API_KEY")
if api_key and api_key != "your_gemini_key_here":
    genai.configure(api_key=api_key)

# We use Gemini 1.5 Pro for Chat for complex reasoning
model = genai.GenerativeModel('gemini-1.5-pro')


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
    """
    
    # 1. Fetch or Create Chat Session
    if session_id:
        chat_session = db.query(schema.ChatSession).filter(
            schema.ChatSession.id == session_id, 
            schema.ChatSession.user_id == user_id
        ).first()
        if not chat_session:
            raise HTTPException(status_code=404, detail="Chat session not found")
        history = json.loads(chat_session.history)
    else:
        # Create new session
        file_name = "General Knowledge"
        if file_id:
            db_file = db.query(schema.File).filter(schema.File.id == file_id).first()
            if db_file:
                file_name = db_file.name
                
        chat_session = schema.ChatSession(
            user_id=user_id,
            title=f"Chat regarding {file_name}",
            subject=file_name,
            history="[]"
        )
        db.add(chat_session)
        db.commit()
        db.refresh(chat_session)
        history = []
        
        # Inject file context if provided
        if file_id:
            db_file = db.query(schema.File).filter(schema.File.id == file_id).first()
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
                except Exception as e:
                    print("Failed to process image attachment:", e)
            else:
                try:
                    content = await attachment.read()
                    text = content.decode('utf-8', errors='ignore')
                    message_parts.append(f"\n\nAttached File ({attachment.filename}):\n{text}")
                    db_history_message += f"\n[Attached File: {attachment.filename}]"
                except Exception as e:
                    print("Failed to process text attachment:", e)

    # 2. Append User Message to DB History (Strings only)
    history.append({"role": "user", "parts": [db_history_message]})
    
    # 3. Call Gemini
    if not api_key or api_key == "your_gemini_key_here":
        ai_response_text = f"This is a mocked response to: '{message}'. Please set GEMINI_API_KEY in .env."
    else:
        try:
            # We start a chat object with the constructed history
            # The SDK handles the context implicitly
            chat = model.start_chat(history=history[:-1]) # exclude the message we just appended
            response = chat.send_message(message_parts)
            ai_response_text = response.text
        except Exception as e:
            ai_response_text = f"An error occurred: {str(e)}"
            
    # 4. Append AI Message and Save
    history.append({"role": "model", "parts": [ai_response_text]})
    
    chat_session.history = json.dumps(history)
    chat_session.messages_count += 2  # user + model
    db.commit()
    
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
    """
    db_file = db.query(schema.File).filter(schema.File.id == request.file_id).first()
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
        
    if not api_key or api_key == "your_gemini_key_here":
        return {"response": f"Mock context explanation for: {request.highlighted_text}"}
        
    try:
        response = model.generate_content(prompt)
        return {"response": response.text}
    except Exception as e:
        return {"response": f"Error: {str(e)}"}


@router.get("/history", response_model=List[pydantic_schemas.ChatSessionResponse])
def get_chat_history(db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    """Retrieves all past chat sessions for the user."""
    return db.query(schema.ChatSession).filter(schema.ChatSession.user_id == user_id).order_by(schema.ChatSession.created_at.desc()).all()
