from fastapi import APIRouter, HTTPException
from app.services.job_service import get_job
from app.models.job import Job

router = APIRouter()

@router.get("/status/{job_id}", response_model=Job)
async def get_job_status(job_id: str):
    job = get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job
