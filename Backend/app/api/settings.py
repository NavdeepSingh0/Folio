from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import json
import os

router = APIRouter()

SETTINGS_PATH = "data/settings.json"

DEFAULT_SETTINGS = {
    "default_model": "gemini-1.5",
    "default_style": "university_notes"
}

class SettingsRequest(BaseModel):
    default_model: str
    default_style: str

def load_settings() -> dict:
    if not os.path.exists(SETTINGS_PATH):
        return DEFAULT_SETTINGS
        
    try:
        with open(SETTINGS_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except:
        return DEFAULT_SETTINGS

def save_settings_to_disk(settings: dict):
    os.makedirs(os.path.dirname(SETTINGS_PATH), exist_ok=True)
    with open(SETTINGS_PATH, "w", encoding="utf-8") as f:
        json.dump(settings, f, indent=4)

@router.get("/settings")
async def api_get_settings():
    return load_settings()

@router.post("/settings")
async def api_save_settings(request: SettingsRequest):
    settings = {
        "default_model": request.default_model,
        "default_style": request.default_style
    }
    save_settings_to_disk(settings)
    return settings
