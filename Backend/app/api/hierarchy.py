from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.models.database import (
    create_collection, get_collections, rename_collection, delete_collection,
    create_unit, get_units, rename_unit, move_unit, delete_unit,
    create_chapter, get_chapters, rename_chapter, move_chapter, delete_chapter
)

router = APIRouter()

class NameRequest(BaseModel):
    name: str

class CreateUnitRequest(BaseModel):
    name: str
    collection_id: str

class MoveUnitRequest(BaseModel):
    collection_id: str

class CreateChapterRequest(BaseModel):
    name: str
    unit_id: str

class MoveChapterRequest(BaseModel):
    unit_id: str

# --- Collections ---
@router.post("/collections")
async def api_create_collection(request: NameRequest):
    return create_collection(request.name)

@router.get("/collections")
async def api_get_collections():
    return get_collections()

@router.patch("/collections/{cid}")
async def api_rename_collection(cid: str, request: NameRequest):
    if not rename_collection(cid, request.name):
        raise HTTPException(404, "Collection not found")
    return {"status": "success"}

@router.delete("/collections/{cid}")
async def api_delete_collection(cid: str):
    if not delete_collection(cid):
        raise HTTPException(404, "Collection not found")
    return {"status": "success"}

# --- Units ---
@router.post("/units")
async def api_create_unit(request: CreateUnitRequest):
    return create_unit(request.name, request.collection_id)

@router.get("/units")
async def api_get_units():
    return get_units()

@router.patch("/units/{uid}")
async def api_rename_unit(uid: str, request: NameRequest):
    if not rename_unit(uid, request.name):
        raise HTTPException(404, "Unit not found")
    return {"status": "success"}

@router.post("/units/{uid}/move")
async def api_move_unit(uid: str, request: MoveUnitRequest):
    if not move_unit(uid, request.collection_id):
        raise HTTPException(404, "Unit not found")
    return {"status": "success"}

@router.delete("/units/{uid}")
async def api_delete_unit(uid: str):
    if not delete_unit(uid):
        raise HTTPException(404, "Unit not found")
    return {"status": "success"}

# --- Chapters ---
@router.post("/chapters")
async def api_create_chapter(request: CreateChapterRequest):
    return create_chapter(request.name, request.unit_id)

@router.get("/chapters")
async def api_get_chapters():
    return get_chapters()

@router.patch("/chapters/{cid}")
async def api_rename_chapter(cid: str, request: NameRequest):
    if not rename_chapter(cid, request.name):
        raise HTTPException(404, "Chapter not found")
    return {"status": "success"}

@router.post("/chapters/{cid}/move")
async def api_move_chapter(cid: str, request: MoveChapterRequest):
    if not move_chapter(cid, request.unit_id):
        raise HTTPException(404, "Chapter not found")
    return {"status": "success"}

@router.delete("/chapters/{cid}")
async def api_delete_chapter(cid: str):
    if not delete_chapter(cid):
        raise HTTPException(404, "Chapter not found")
    return {"status": "success"}
