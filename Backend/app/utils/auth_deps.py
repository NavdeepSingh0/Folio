"""
Auth dependency: resolves the bearer token to a local user id.

If SUPABASE_JWT_SECRET (Supabase dashboard > Project Settings > API > JWT Secret) is set,
HS256 tokens are verified locally with no network call. If it is unset, or a token is not
HS256, it falls back to supabase.auth.get_user. Results are cached briefly either way.
"""
import base64
import hashlib
import hmac
import json
import os
import threading
import time

from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from ..models.database import get_db
from ..models import schema
from .supabase_client import supabase

security = HTTPBearer()

CACHE_TTL_SECONDS = 300
_lock = threading.Lock()
_token_cache: dict[str, tuple[str, float]] = {}  # token hash -> (email, expires_at)
_user_cache: dict[str, tuple[int, float]] = {}   # email -> (user_id, expires_at)


def _unauthorized() -> HTTPException:
    return HTTPException(status_code=401, detail="Invalid authentication credentials")


def _b64decode(segment: str) -> bytes:
    return base64.urlsafe_b64decode(segment + "=" * (-len(segment) % 4))


def _decode_local(token: str, secret: str) -> dict | None:
    """Verifies an HS256 JWT. Returns claims, None if not HS256 (use fallback), raises 401 if invalid."""
    try:
        header_b64, payload_b64, sig_b64 = token.split(".")
        header = json.loads(_b64decode(header_b64))
    except Exception:
        raise _unauthorized()
    if header.get("alg") != "HS256":
        return None
    expected = hmac.new(secret.encode(), f"{header_b64}.{payload_b64}".encode(), hashlib.sha256).digest()
    try:
        valid = hmac.compare_digest(expected, _b64decode(sig_b64))
        claims = json.loads(_b64decode(payload_b64))
    except Exception:
        raise _unauthorized()
    if not valid:
        raise _unauthorized()
    aud = claims.get("aud")
    if aud != "authenticated" and not (isinstance(aud, list) and "authenticated" in aud):
        raise _unauthorized()
    exp = claims.get("exp")
    if not isinstance(exp, (int, float)) or exp <= time.time():
        raise _unauthorized()
    return claims


def _email_from_token(token: str) -> str:
    secret = os.environ.get("SUPABASE_JWT_SECRET")
    if secret:
        claims = _decode_local(token, secret)
        if claims is not None:
            email = claims.get("email")
            if not email:
                raise _unauthorized()
            return email

    key = hashlib.sha256(token.encode()).hexdigest()
    now = time.time()
    with _lock:
        hit = _token_cache.get(key)
        if hit and hit[1] > now:
            return hit[0]

    try:
        auth_response = supabase.auth.get_user(token)
    except Exception:
        raise _unauthorized()
    if not auth_response or not auth_response.user or not auth_response.user.email:
        raise _unauthorized()
    email = auth_response.user.email

    expires = now + CACHE_TTL_SECONDS
    try:  # never cache past the token's own expiry
        token_exp = json.loads(_b64decode(token.split(".")[1])).get("exp")
        if isinstance(token_exp, (int, float)):
            expires = min(expires, token_exp)
    except Exception:
        pass
    with _lock:
        _token_cache[key] = (email, expires)
    return email


def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    user_email = _email_from_token(credentials.credentials)

    now = time.time()
    with _lock:
        hit = _user_cache.get(user_email)
        if hit and hit[1] > now:
            return hit[0]

    # Find user by email in local DB, or create them if it's their first time syncing
    user = db.query(schema.User).filter(schema.User.email == user_email).first()
    if not user:
        user = schema.User(username=user_email.split('@')[0], email=user_email)
        db.add(user)
        db.commit()
        db.refresh(user)

    with _lock:
        _user_cache[user_email] = (user.id, now + CACHE_TTL_SECONDS)
    return user.id
