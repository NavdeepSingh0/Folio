import sys
import os
import json
import time
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.models.database import DB_PATH
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
import sqlite3

def run_revision_validation():
    print("=" * 50)
    print("Starting Revision Engine Validation (Slice 11)")
    print("=" * 50)
    
    # 1. Clear cache
    conn = sqlite3.connect(DB_PATH)
    conn.execute("DELETE FROM learning_object_cache")
    conn.commit()
    conn.close()
    
    # 2. Parse Document
    filepath = "../Uploads/3.1.4.pptx"
    print(f"[1/4] Parsing {filepath}...")
    start_time = time.time()
    
    parser = DocumentParser()
    with open(filepath, "rb") as f:
        extracted_doc = parser.parse(f.read(), "3.1.4.pptx")
        
    # 3. Pipeline
    print("[2/4] Generating Study Topic...")
    planner_input = build_planner_input(extracted_doc)
    outline = generate_topic_outline(planner_input, model_name="qwen3")
    
    contexts = []
    for concept in outline.concepts:
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
        
    parse_result = generate_learning_objects(
        contexts=contexts,
        document_id="doc-rev",
        content_hash="hash-rev",
        model_name="qwen3"
    )
    
    if not parse_result.success or not parse_result.learning_objects:
        print("Generation failed.")
        return
        
    topic = parse_result.learning_objects[0]
    
    # 4. Revision Engine
    print("[3/4] Running Revision Engine...")
    rev_start_time = time.time()
    engine = RevisionEngine()
    
    flashcards = engine.flashcards(topic)
    mcqs = engine.mcqs(topic)
    recall = engine.recall(topic)
    cheatsheet = engine.cheatsheet(topic)
    rev_end_time = time.time()
    
    print("[4/4] Saving output...")
    
    output = {
        "topic": topic.title,
        "flashcards": [fc.model_dump() for fc in flashcards],
        "mcqs": [mcq.model_dump() for mcq in mcqs],
        "recall_prompts": [rp.model_dump() for rp in recall],
        "cheatsheet": cheatsheet.model_dump()
    }
    
    with open("benchmark/revision_validation_output.json", "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2)
        
    total_time = time.time() - start_time
    print(f"\nValidation complete! Total time: {total_time:.2f}s")
    print(f"Revision Engine Time (0 LLM calls): {rev_end_time - rev_start_time:.4f}s")
    print(f"Generated:")
    print(f" - {len(flashcards)} Flashcards")
    print(f" - {len(mcqs)} MCQs")
    print(f" - {len(recall)} Recall Prompts")
    print(f" - 1 Cheat Sheet")
    print("Results saved to revision_validation_output.json")

if __name__ == "__main__":
    run_revision_validation()
