from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
import os
import threading
from typing import List

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
from app.renderers.markdown_renderer import MarkdownRenderer, render_advanced_practice
from app.models.database import save_project, get_project, update_project, update_cached_learning_object
from app.models.folio import LearningObject

import logging
logger = logging.getLogger(__name__)

router = APIRouter()

class GenerateRequest(BaseModel):
    file_path: str
    original_name: str
    model: str = "qwen3"


def _lazy_practice_pass(project_id: str, learning_objects: List[LearningObject], model_name: str):
    """
    Runs silently in a background daemon thread AFTER the job completes.
    Generates Advanced Practice questions for each topic and appends them
    to the markdown file on disk incrementally so the user sees them populate.
    """
    try:
        logger.info(f"[LazyPractice] Starting background practice pass for project {project_id}")
        adv_engine = AdvancedPracticeService(model_name=model_name)

        for topic in learning_objects:
            logger.info(f"[LazyPractice] Generating practice for: {topic.title}")
            practice = adv_engine.generate_practice(topic)
            topic.advanced_practice = practice

            # 1. Update the JSON cache table so the structured data isn't lost
            update_cached_learning_object(
                content_hash=topic.content_hash, 
                lo_json=topic.model_dump_json(), 
                title=topic.title
            )

            # 2. Update the Markdown on disk safely
            practice_md = render_advanced_practice(topic)
            if practice_md:
                # Re-fetch the latest markdown inside the loop to avoid race conditions
                # (Overwriting user edits if they modified notes while the LLM was thinking)
                latest_project = get_project(project_id)
                if latest_project:
                    current_markdown = latest_project.get("markdown_content", "")
                    topic_marker = f"## {topic.title}"
                    if topic_marker in current_markdown:
                        insert_pos = current_markdown.find("\n\n---\n\n", current_markdown.find(topic_marker))
                        if insert_pos != -1:
                            current_markdown = (
                                current_markdown[:insert_pos]
                                + "\n\n"
                                + practice_md.strip()
                                + current_markdown[insert_pos:]
                            )
                        else:
                            current_markdown += "\n\n" + practice_md.strip()

                        update_project(project_id, markdown_content=current_markdown)
                        logger.info(f"[LazyPractice] Saved practice for topic: {topic.title}")

        logger.info(f"[LazyPractice] Completed background practice pass for project {project_id}")
    except Exception as e:
        logger.error(f"[LazyPractice] Failed for project {project_id}: {e}")


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

        # Main Generation Engine (single LLM call for all topics)
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

        # Deterministic Revision Engine (instant — no LLM)
        revision_engine = RevisionEngine()
        total_obj = len(parse_result.learning_objects)

        for i, topic in enumerate(parse_result.learning_objects):
            update_job_stage(job_id, "Building Revision Materials", 60 + int(30 * (i / total_obj)))
            update_job_topic(job_id, topic.title, i + 1, total_obj)

            flashcards = revision_engine.flashcards(topic)
            revision_engine.mcqs(topic)
            revision_engine.recall(topic)
            revision_engine.cheatsheet(topic)
            update_job_stats(job_id, flashcards=len(flashcards))

            # Advanced Practice is deferred to a lazy background pass below

        # Compile final markdown (no Advanced Practice yet — added lazily later)
        markdown_renderer = MarkdownRenderer()
        full_markdown = markdown_renderer.render(parse_result.learning_objects)

        # Save to database — user gets their notes NOW
        save_project(
            title=outline.topic if outline else "Generated Notes",
            source_filename=request.original_name,
            study_style="university_notes",
            model=request.model,
            markdown_content=full_markdown,
            project_id=job_id,
            classification="Educational Content"
        )

        # === Complete job immediately so the UI transitions to StudyWorkspace ===
        update_job_stage(job_id, "Complete", 100)
        complete_job(job_id)
        logger.info(f"[Pipeline] Job {job_id} complete. Launching lazy practice pass in background.")

        # === Background thread quietly enriches the markdown with Advanced Practice questions ===
        t = threading.Thread(
            target=_lazy_practice_pass,
            args=(job_id, parse_result.learning_objects, request.model),
            daemon=True
        )
        t.start()

    except Exception as e:
        import traceback
        traceback.print_exc()
        logger.error(f"Job {job_id} failed: {e}")
        fail_job(job_id, str(e))


@router.post("/generate")
async def start_generation(request: GenerateRequest, background_tasks: BackgroundTasks):
    job = create_job()
    # Explicitly set to RUNNING so the UI timer starts immediately
    job.status = "RUNNING"
    background_tasks.add_task(run_generation_pipeline, job.id, request)
    return {"job_id": job.id}
