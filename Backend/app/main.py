from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from app.api.upload import router as upload_router
from app.api.generation import router as generation_router
from app.api.status import router as status_router
from app.api.projects import router as projects_router
from app.api.settings import router as settings_router
from app.api.study import router as study_router
from app.api.hierarchy import router as hierarchy_router
from app.api.revision import router as revision_router
from app.models.database import init_db

# Initialize database on startup
init_db()

app = FastAPI(title="StudyForge API")

# Configure CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload_router, prefix="/api", tags=["Upload"])
app.include_router(generation_router, prefix="/api", tags=["Generation"])
app.include_router(status_router, prefix="/api", tags=["Status"])
app.include_router(projects_router, prefix="/api", tags=["Projects"])
app.include_router(settings_router, prefix="/api", tags=["Settings"])
app.include_router(study_router, prefix="/api", tags=["Study"])
app.include_router(hierarchy_router, prefix="/api/hierarchy", tags=["Hierarchy"])
app.include_router(revision_router, prefix="/api/revision", tags=["Revision"])

@app.get("/api/status")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
