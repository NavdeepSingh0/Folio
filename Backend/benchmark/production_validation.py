import sys
import os
import time
import json
import sqlite3
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.generation_engine import TwoPassBatchEngine
from app.services.parsers import DocumentParser
from app.models.database import DB_PATH

def run_validation():
    print("="*50)
    print("Starting Final Production Validation")
    print("="*50)
    
    # Clear cache
    conn = sqlite3.connect(DB_PATH)
    conn.execute("DELETE FROM learning_object_cache")
    conn.commit()
    conn.close()
    print("[1/4] Cache cleared.")
    
    # Ingest document
    parser = DocumentParser()
    filepath = "../Uploads/3.1.4.pptx"
    print(f"[2/4] Parsing {filepath}...")
    with open(filepath, "rb") as f:
        extracted_doc = parser.parse(f.read(), "3.1.4.pptx")
    print(f"Extracted {len(extracted_doc.slides)} slides.")
    
    # Generate
    engine = TwoPassBatchEngine()
    print("[3/4] Running Pipeline...")
    
    start_time = time.time()
    generator = engine.generate(extracted_doc, "benchmark", None, "qwen3")
    
    full_output = ""
    for chunk in generator:
        full_output += chunk
    
    generation_time = time.time() - start_time
    
    # Calculate Metrics
    print("[4/4] Calculating Metrics...")
    
    # Load all generated objects from cache (since we cleared it, it's just this run)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT learning_object_json FROM learning_object_cache")
    rows = cursor.fetchall()
    conn.close()
    
    objects = [json.loads(r[0]) for r in rows]
    total_objects = len(objects)
    ops = total_objects / generation_time if generation_time > 0 else 0
    
    caps = {
        "Definitions": sum(1 for o in objects if o.get("definition")),
        "Explanations": sum(1 for o in objects if o.get("explanation")),
        "Examples": sum(1 for o in objects if o.get("example")),
        "Code Examples": sum(1 for o in objects if o.get("code_example")),
        "Algorithm Steps": sum(1 for o in objects if o.get("algorithm_steps")),
        "Formulae": sum(1 for o in objects if o.get("formula")),
        "Comparison Tables": sum(1 for o in objects if o.get("comparison_table") and len(o.get("comparison_table")) > 0),
        "Memory Tricks": sum(1 for o in objects if o.get("memory_trick")),
        "Common Mistakes": sum(1 for o in objects if o.get("common_mistakes")),
        "Exam Tips": sum(1 for o in objects if o.get("exam_tip")),
        "Key Takeaways": sum(1 for o in objects if o.get("key_takeaways") and len(o.get("key_takeaways")) > 0),
        "Diagrams": sum(1 for o in objects if o.get("diagram_description")),
    }
    
    report = f"""# Production Validation Report

## Source Document
- File: {filepath}
- Slides Extracted: {len(extracted_doc.slides)}
- Pages: {extracted_doc.page_count}

## Timing Metrics
- Total Generation Time: {generation_time:.2f} seconds

## LearningObject Metrics
- Total Objects Generated: {total_objects}
- Objects per Second (Throughput): {ops:.2f} obj/sec

## Capability Usage
"""
    for cap, count in caps.items():
        report += f"- {cap}: {count}\n"
        
    report += f"""
## Renderer Statistics
- Markdown Size: {len(full_output)} characters

## Educational Evaluation
(To be evaluated by user based on output)

"""
    with open("benchmark/production_validation_v2_report.md", "w", encoding="utf-8") as f:
        f.write(report)
        
    with open("benchmark/production_validation_v2_output.md", "w", encoding="utf-8") as f:
        f.write(full_output)
        
    print(f"Validation complete! Total time: {generation_time:.2f}s")
    print(f"Generated {total_objects} objects at {ops:.2f} obj/sec")
    print("Results saved to production_validation_v2_report.md and production_validation_v2_output.md")

if __name__ == "__main__":
    run_validation()
