from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
import hmac
import logging
from app.utils.supabase_client import supabase

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/auth", tags=["auth"])

class SignupRequest(BaseModel):
    email: str
    password: str
    secret_code: str

@router.post("/signup")
def signup(req: SignupRequest):
    # INVITE_CODE must be set in the environment; signup fails closed when it is missing
    EXPECTED_CODE = os.environ.get("INVITE_CODE")
    # Compare bytes so non-ASCII input is rejected with 403 instead of raising TypeError
    if not EXPECTED_CODE or not hmac.compare_digest(req.secret_code.encode("utf-8"), EXPECTED_CODE.encode("utf-8")):
        raise HTTPException(status_code=403, detail="Thou art not worthy!")
    
    try:
        res = supabase.auth.sign_up({
            "email": req.email,
            "password": req.password
        })
        # If it succeeds, the user is created in Supabase
        return {"status": "success", "message": "Welcome to the realm."}
    except Exception:
        # Log the real error server-side; return a generic message to the client
        logger.exception("Signup failed")
        raise HTTPException(status_code=400, detail="Signup failed")
