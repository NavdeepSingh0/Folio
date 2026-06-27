from typing import Protocol, Generator, Optional
import json
import logging
from app.services.llm_service import generate_markdown_notes_stream
from app.services.parsers import DocumentParser
from app.services.document_intelligence import build_planner_input
from app.services.planning_service import generate_topic_outline
from app.services.generation_service import generate_learning_objects
from app.services.capability_resolver import resolve_capabilities
from app.services.educational_context_builder import build_educational_context
from app.config.capability_profiles import BlockType
from app.config.educational_policy import STANDARD_POLICY
from app.services.renderer import MarkdownRenderer
from app.models.folio import LearningObject
from app.models.database import get_cached_learning_objects, cache_learning_object
import time

logger = logging.getLogger(__name__)

class GenerationEngine(Protocol):
    def generate(self, text: str, style: str, custom_instructions: Optional[str], model: str) -> Generator[str, None, None]:
        ...

class LegacyEngine:
    def generate(self, text: str, style: str, custom_instructions: Optional[str], model: str) -> Generator[str, None, None]:
        # Streams letter by letter directly from the LLM
        for token in generate_markdown_notes_stream(text, style, custom_instructions, model):
            yield token

class TwoPassSequentialEngine:
    # Not used by default anymore, kept for backwards comp / Variant A testing
    pass

class TwoPassBatchEngine:
    def generate(self, doc, style: str, custom_instructions: Optional[str], model: str) -> Generator[str, None, None]:
        # Step 1: Document Intelligence
        planner_input = build_planner_input(doc)
        
        if not planner_input.filtered_slides:
            yield ""
            return
            
        renderer = MarkdownRenderer()
        
        # Process the entire document as a single "topic" for the planner
        content_hash = LearningObject.compute_hash(planner_input.model_dump_json()) + "_v3"
        
        # Check SQLite Cache
        cached_jsons = get_cached_learning_objects(content_hash)
        
        if cached_jsons:
            logger.info("Cache hit for document")
            objects = [LearningObject(**json.loads(j)) for j in cached_jsons]
            yield renderer.render(objects)
            return
            
        logger.info("Cache miss. Running Two-Pass Batch Engine.")
        # Pass 1: Planning
        outline = generate_topic_outline(planner_input, model_name=model)
        
        # Build Educational Contexts for each concept
        contexts = []
        for concept in outline.concepts:
            try:
                btype = BlockType(concept.type)
            except ValueError:
                btype = BlockType.GENERAL
            
            cap_profile = resolve_capabilities(btype)
            ctx = build_educational_context(concept, cap_profile, STANDARD_POLICY, planner_input, doc)
            contexts.append(ctx)
        
        # Pass 2: Generation (Variant C)
        parse_result = generate_learning_objects(
            contexts=contexts,
            document_id="temp-doc", 
            content_hash=content_hash,
            model_name=model
        )
        
        if not parse_result.success:
            logger.error(f"Generation failed at stage: {parse_result.stage}. Reason: {parse_result.error}")
            yield f"\n\n> [!WARNING]\n> Failed to generate content for this section. Error: {parse_result.error}\n\n"
            return
            
        objects = parse_result.learning_objects
        
        # Cache the new objects
        for obj in objects:
            cache_learning_object(content_hash, obj.model_dump_json())
            
        # Render to markdown on-demand and yield the block
        yield renderer.render(objects)
