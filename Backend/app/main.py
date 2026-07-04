from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Import our custom routers
from app.api.library import router as library_router
from app.api.upload import router as upload_router

app = FastAPI(title="StudyForge Backend API")

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(library_router)
app.include_router(upload_router)

@app.get("/")
async def root():
    return {"message": "Welcome to StudyForge API"}

@app.get("/api/status")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
