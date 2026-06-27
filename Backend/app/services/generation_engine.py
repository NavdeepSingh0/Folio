from typing import Protocol, Generator, Optional
import json
import logging
from app.services.llm_service import generate_markdown_notes_stream
from app.services.parsers import DocumentParser
from app.services.chunking_service import chunk_text
from app.services.planning_service import generate_topic_outline
from app.services.generation_service import generate_learning_objects
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
    def generate(self, text: str, style: str, custom_instructions: Optional[str], model: str) -> Generator[str, None, None]:
        # Step 1: Topic Segmentation (previously "chunking")
        topics = chunk_text(text, chunk_size=2500, chunk_overlap=100)
        
        if not topics:
            yield ""
            return
            
        renderer = MarkdownRenderer()
        
        for i, topic_text in enumerate(topics):
            content_hash = LearningObject.compute_hash(topic_text)
            
            # Check SQLite Cache
            cached_jsons = get_cached_learning_objects(content_hash)
            
            if cached_jsons:
                logger.info(f"Cache hit for topic {i}")
                objects = [LearningObject(**json.loads(j)) for j in cached_jsons]
                # Render to markdown on-demand
                yield renderer.render(objects)
                continue
                
            logger.info(f"Cache miss for topic {i}. Running Two-Pass Batch Engine.")
            # Pass 1: Planning
            outline = generate_topic_outline(topic_text, model_name=model)
            
            # Pass 2: Generation (Variant C)
            parse_result = generate_learning_objects(
                topic_text=topic_text, 
                outline=outline, 
                document_id="temp-doc", 
                content_hash=content_hash,
                model_name=model
            )
            
            if not parse_result.success:
                logger.error(f"Generation failed at stage: {parse_result.stage}. Reason: {parse_result.error}")
                yield f"\n\n> [!WARNING]\n> Failed to generate content for this section. Error: {parse_result.error}\n\n"
                continue
                
            objects = parse_result.learning_objects
            
            # Cache the new objects
            for obj in objects:
                cache_learning_object(content_hash, obj.model_dump_json())
                
            # Render to markdown on-demand and yield the block
            yield renderer.render(objects)
            
            # Yield a separator between topics if not the last one
            if i < len(topics) - 1:
                yield "\n\n---\n\n"
