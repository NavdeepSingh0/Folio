from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
import os
import time

from app.services.job_service import create_job, update_job_stage, update_job_topic, complete_job, fail_job, get_job, update_job_stats
from app.services.parsers import DocumentParser
from app.services.document_intelligence import build_planner_input
from app.services.planning_service import generate_topic_outline
from app.services.capability_resolver import resolve_capabilities
from app.services.educational_context_builder import build_educational_context
from app.services.generation_service import generate_learning_objects
from app.config.capability_profiles import BlockType
from app.config.educational_policy import STANDARD_POLICY
from app.services.educational_signal_builder import build_signals
from app.services.revision_engine import RevisionEngine
from app.services.advanced_practice_service import AdvancedPracticeService
from app.renderers.markdown_renderer import MarkdownRenderer
from app.models.database import save_project

import logging
logger = logging.getLogger(__name__)

router = APIRouter()

class GenerateRequest(BaseModel):
    file_path: str
    original_name: str
    model: str = "qwen3"

def run_generation_pipeline(job_id: str, request: GenerateRequest):
    try:
        if not os.path.exists(request.file_path):
            fail_job(job_id, "File not found.")
            return

        update_job_stage(job_id, "Extracting Document", 10)
        
        parser = DocumentParser()
        with open(request.file_path, "rb") as f:
            extracted_doc = parser.parse(f.read(), request.original_name)

        if not extracted_doc.slides:
            fail_job(job_id, "Could not extract any text from the document.")
            return
            
        update_job_stats(job_id, slides=len(extracted_doc.slides))

        update_job_stage(job_id, "Document Intelligence", 20)
        planner_input = build_planner_input(extracted_doc)

        update_job_stage(job_id, "Planning Study Topics", 30)
        outline = generate_topic_outline(planner_input, model_name=request.model)

        total_topics = len(outline.concepts)
        adv_engine = AdvancedPracticeService()
        contexts = []

        for i, concept in enumerate(outline.concepts):
            update_job_topic(job_id, concept.title, i, total_topics)
            try:
                btype = BlockType(concept.type)
            except ValueError:
                btype = BlockType.GENERAL
                
            signals = build_signals(btype, planner_input.exam_focus_hints)
            cap_profile = resolve_capabilities(btype, signals=signals)
            ctx = build_educational_context(
                concept=concept,
                capability_profile=cap_profile,
                educational_policy=STANDARD_POLICY,
                planner_input=planner_input,
                extracted_doc=extracted_doc
            )
            contexts.append(ctx)

        update_job_stage(job_id, "Generating Educational Content", 40)
        
        # Generation Engine
        parse_result = generate_learning_objects(
            contexts=contexts,
            document_id=job_id, 
            content_hash=job_id, 
            model_name=request.model
        )
        
        if not parse_result.success or not parse_result.learning_objects:
            fail_job(job_id, "Failed to generate educational content.")
            return

        update_job_stats(job_id, learning_objects=len(parse_result.learning_objects))

        # Revision & Advanced Practice
        revision_engine = RevisionEngine()
        adv_engine = AdvancedPracticeService(model_name=request.model)
        
        # For simplicity, we process them one by one
        total_obj = len(parse_result.learning_objects)
        for i, topic in enumerate(parse_result.learning_objects):
            update_job_stage(job_id, "Building Revision Materials", 60 + int(30 * (i/total_obj)))
            update_job_topic(job_id, topic.title, i+1, total_obj)
            
            # 1. Deterministic Revision (Instant)
            flashcards = revision_engine.flashcards(topic)
            mcqs = revision_engine.mcqs(topic)
            recall = revision_engine.recall(topic)
            cheatsheet = revision_engine.cheatsheet(topic)
            
            update_job_stats(job_id, flashcards=len(flashcards))
            
            # 2. Advanced Practice (LLM Call)
            practice = adv_engine.generate_practice(topic)
            
            total_qs = (
                len(practice.conceptual_questions) + 
                len(practice.comparison_questions) + 
                len(practice.scenario_questions) + 
                len(practice.viva_questions) + 
                len(practice.coding_challenges)
            )
            update_job_stats(job_id, practice_qs=total_qs)
            
            # Attach for Markdown rendering
            topic.advanced_practice = practice.model_dump() if hasattr(practice, 'model_dump') else practice.dict()

        # Compile final markdown
        markdown_renderer = MarkdownRenderer()
        full_markdown = markdown_renderer.render(parse_result.learning_objects)

        # Save to database using the job_id as the project_id
        save_project(
            title=outline.topic if outline else "Generated Notes",
            source_filename=request.original_name,
            study_style="university_notes",
            model=request.model,
            markdown_content=full_markdown,
            project_id=job_id,
            classification="Educational Content"
        )

        update_job_stage(job_id, "Complete", 100)
        complete_job(job_id)

    except Exception as e:
        import traceback
        traceback.print_exc()
        logger.error(f"Job {job_id} failed: {e}")
        fail_job(job_id, str(e))


@router.post("/generate")
async def start_generation(request: GenerateRequest, background_tasks: BackgroundTasks):
    job = create_job()
    # explicitly set to RUNNING here so UI timer starts ticking
    job.status = "RUNNING" 
    background_tasks.add_task(run_generation_pipeline, job.id, request)
    return {"job_id": job.id}
