from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
from app.utils.supabase_client import supabase

router = APIRouter(prefix="/api/auth", tags=["auth"])

class SignupRequest(BaseModel):
    email: str
    password: str
    secret_code: str

@router.post("/signup")
async def signup(req: SignupRequest):
    EXPECTED_CODE = os.environ.get("INVITE_CODE", "valhalla_2024")
    if req.secret_code != EXPECTED_CODE:
        raise HTTPException(status_code=403, detail="Thou art not worthy!")
    
    try:
        res = supabase.auth.sign_up({
            "email": req.email,
            "password": req.password
        })
        # If it succeeds, the user is created in Supabase
        return {"status": "success", "message": "Welcome to the realm."}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
