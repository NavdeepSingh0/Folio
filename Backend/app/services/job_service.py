from typing import Dict, Optional
import time
import uuid
from app.models.job import Job

# In-memory job registry for simplicity and speed.
# In a distributed production system, this would be Redis.
_jobs: Dict[str, Job] = {}

def _cleanup_old_jobs():
    # Remove jobs older than 24 hours (86400 seconds)
    now = time.time()
    stale_ids = [jid for jid, j in _jobs.items() if now - getattr(j, 'started_at', now) > 86400]
    for jid in stale_ids:
        del _jobs[jid]

def create_job() -> Job:
    _cleanup_old_jobs()
    job_id = str(uuid.uuid4())
    job = Job(
        id=job_id,
        status="PENDING",
        current_stage="Initializing",
        progress=0,
        started_at=time.time()
    )
    _jobs[job_id] = job
    return job

def get_job(job_id: str) -> Optional[Job]:
    return _jobs.get(job_id)

def update_job_stage(job_id: str, stage: str, progress: int):
    if job_id in _jobs:
        _jobs[job_id].current_stage = stage
        _jobs[job_id].progress = progress

def update_job_topic(job_id: str, topic_name: str, generated: int, total: int):
    if job_id in _jobs:
        _jobs[job_id].current_topic_name = topic_name
        _jobs[job_id].topics_generated = generated
        _jobs[job_id].total_topics = total

def complete_job(job_id: str):
    if job_id in _jobs:
        _jobs[job_id].status = "COMPLETED"
        _jobs[job_id].progress = 100
        _jobs[job_id].completed_at = time.time()

def fail_job(job_id: str, error: str):
    if job_id in _jobs:
        _jobs[job_id].status = "FAILED"
        _jobs[job_id].error = error
        _jobs[job_id].completed_at = time.time()

def update_job_stats(job_id: str, slides: int = 0, pages: int = 0, learning_objects: int = 0, flashcards: int = 0, practice_qs: int = 0):
    if job_id in _jobs:
        if slides: _jobs[job_id].slides_extracted += slides
        if pages: _jobs[job_id].pages_extracted += pages
        if learning_objects: _jobs[job_id].total_learning_objects += learning_objects
        if flashcards: _jobs[job_id].total_flashcards += flashcards
        if practice_qs: _jobs[job_id].total_practice_qs += practice_qs
