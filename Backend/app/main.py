from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os

# Import our custom routers
from app.api.library import router as library_router
from app.api.upload import router as upload_router
from app.api.auth import router as auth_router
from app.api.chat import router as chat_router
from app.models.database import engine, Base
from app.models import schema

# Create tables in the database (will not overwrite existing tables)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Folio Backend API")

# Configure CORS for frontend access
# CORS_ORIGINS: comma-separated list of allowed origins (defaults to local dev servers)
DEFAULT_CORS_ORIGINS = "http://localhost:3000,http://localhost:5173,http://localhost:8081"
cors_origins = [o.strip() for o in os.environ.get("CORS_ORIGINS", DEFAULT_CORS_ORIGINS).split(",") if o.strip()]
# A wildcard origin with credentials would reopen the original issue; drop it
if "*" in cors_origins:
    print("WARNING: '*' in CORS_ORIGINS is ignored because credentials are allowed")
    cors_origins = [o for o in cors_origins if o != "*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(library_router)
app.include_router(upload_router)
app.include_router(auth_router)
app.include_router(chat_router)

@app.get("/")
async def root():
    return {"message": "Welcome to Folio API"}

@app.get("/api/status")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
