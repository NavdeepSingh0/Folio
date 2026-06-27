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

def run_revision_validation_v2():
    print("=" * 50)
    print("Starting Enhanced Revision Engine Validation (Slice 11B)")
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
        document_id="doc-rev-2",
        content_hash="hash-rev-2",
        model_name="qwen3"
    )
    
    if not parse_result.success or not parse_result.learning_objects:
        print("Generation failed.")
        return
        
    topic = parse_result.learning_objects[0]
    
    # 4. Revision Engine (Deterministic)
    print("[3/4] Running Deterministic Revision Engine...")
    det_engine = RevisionEngine(enable_enhancement=False)
    
    det_flashcards = det_engine.flashcards(topic)
    det_mcqs = det_engine.mcqs(topic)
    det_recall = det_engine.recall(topic)
    det_cheatsheet = det_engine.cheatsheet(topic)
    
    det_output = {
        "topic": topic.title,
        "flashcards": [fc.model_dump() for fc in det_flashcards],
        "mcqs": [mcq.model_dump() for mcq in det_mcqs],
        "recall_prompts": [rp.model_dump() for rp in det_recall],
        "cheatsheet": det_cheatsheet.model_dump()
    }
    
    with open("benchmark/revision_v2_deterministic.json", "w", encoding="utf-8") as f:
        json.dump(det_output, f, indent=2)

    # 5. Revision Engine (Enhanced)
    print("[4/4] Running Enhanced Revision Engine (LLM calls)...")
    enh_start = time.time()
    enh_engine = RevisionEngine(enable_enhancement=True)
    
    enh_flashcards = enh_engine.flashcards(topic)
    enh_mcqs = enh_engine.mcqs(topic)
    enh_recall = enh_engine.recall(topic)
    enh_cheatsheet = enh_engine.cheatsheet(topic) # Still deterministic
    enh_end = time.time()
    
    enh_output = {
        "topic": topic.title,
        "flashcards": [fc.model_dump() for fc in enh_flashcards],
        "mcqs": [mcq.model_dump() for mcq in enh_mcqs],
        "recall_prompts": [rp.model_dump() for rp in enh_recall],
        "cheatsheet": enh_cheatsheet.model_dump()
    }
    
    with open("benchmark/revision_v2_enhanced.json", "w", encoding="utf-8") as f:
        json.dump(enh_output, f, indent=2)

    print(f"\nValidation complete!")
    print(f"Enhancement Time: {enh_end - enh_start:.2f}s")
    print("Results saved to revision_v2_deterministic.json and revision_v2_enhanced.json")

if __name__ == "__main__":
    run_revision_validation_v2()
