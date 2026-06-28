import sys
import os
import time
import json
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.models.database import DB_PATH
from app.services.parsers import DocumentParser
from app.services.document_intelligence import build_planner_input
from app.services.planning_service import generate_topic_outline
from app.services.capability_resolver import resolve_capabilities
from app.services.educational_context_builder import build_educational_context
from app.services.generation_service import generate_learning_objects
from app.services.advanced_practice_service import AdvancedPracticeService
from app.renderers.markdown_renderer import MarkdownRenderer, render_advanced_practice
from app.config.capability_profiles import BlockType
from app.config.educational_policy import STANDARD_POLICY
from app.services.educational_signal_builder import build_signals
import sqlite3

def run_v6_validation():
    print("=" * 50)
    print("Starting Final Production Validation V6 (3.1.3.pptx Benchmark)")
    print("=" * 50)
    
    # 1. Clear cache
    conn = sqlite3.connect(DB_PATH)
    conn.execute("DELETE FROM learning_object_cache")
    conn.commit()
    conn.close()
    print("[1/5] Cache cleared.")
    
    # 2. Parse Document
    filepath = "../Uploads/3.1.3.pptx"
    print(f"[2/5] Parsing {filepath}...")
    start_time = time.time()
    
    parser = DocumentParser()
    with open(filepath, "rb") as f:
        extracted_doc = parser.parse(f.read(), "3.1.3.pptx")
        
    print(f"Extracted {len(extracted_doc.slides)} slides.")
    
    # 3. Pipeline
    print("[3/5] Running Pipeline...")
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
        document_id="doc-v6",
        content_hash="hash-v6",
        model_name="qwen3"
    )

    # 4. Advanced Practice
    print("[4/5] Simulating background Advanced Practice...")
    adv_engine = AdvancedPracticeService(model_name="qwen3")
    for topic in parse_result.learning_objects:
        practice = adv_engine.generate_practice(topic)
        topic.advanced_practice = practice
    
    # 5. Render
    print("[5/5] Rendering Markdown...")
    renderer = MarkdownRenderer()
    final_markdown = renderer.render(parse_result.learning_objects) if parse_result.success else "Generation Failed."
    
    end_time = time.time()
    total_time = end_time - start_time
    num_objs = len(parse_result.learning_objects) if parse_result.success else 0
    throughput = num_objs / total_time if total_time > 0 else 0
    
    # Calculate Capabilities
    caps = {
        "Definitions": 0, "Explanations": 0, "Examples": 0,
        "Code": 0, "Algorithm": 0, "Formula": 0,
        "Comparison": 0, "Memory": 0, "Mistakes": 0,
        "Exam": 0, "Takeaways": 0, "Diagrams": 0
    }
    
    if parse_result.success:
        for obj in parse_result.learning_objects:
            if obj.definition: caps["Definitions"] += 1
            if obj.explanation: caps["Explanations"] += 1
            if obj.example: caps["Examples"] += 1
            if obj.code_example: caps["Code"] += 1
            if obj.algorithm_steps: caps["Algorithm"] += 1
            if obj.formula: caps["Formula"] += 1
            if obj.comparison_table: caps["Comparison"] += 1
            if obj.memory_trick: caps["Memory"] += 1
            if obj.common_mistakes: caps["Mistakes"] += 1
            if obj.exam_tip: caps["Exam"] += 1
            if obj.key_takeaways: caps["Takeaways"] += 1
            if obj.diagram_description: caps["Diagrams"] += 1
            
    # Write Report
    report = f"""# Production Validation Report V6 (3.1.3.pptx)

## Source Document
- File: {filepath}
- Slides Extracted: {len(extracted_doc.slides)}
- Pages: {extracted_doc.page_count}

## Timing Metrics
- Total Generation Time (including Advanced Practice): {total_time:.2f} seconds

## StudyTopic Metrics
- Total Topics Generated: {num_objs}
- Topics per Second (Throughput): {throughput:.2f} obj/sec

## Capability Usage
- Definitions: {caps["Definitions"]}
- Explanations: {caps["Explanations"]}
- Examples: {caps["Examples"]}
- Code Examples: {caps["Code"]}
- Algorithm Steps: {caps["Algorithm"]}
- Formulae: {caps["Formula"]}
- Comparison Tables: {caps["Comparison"]}
- Memory Tricks: {caps["Memory"]}
- Common Mistakes: {caps["Mistakes"]}
- Exam Tips: {caps["Exam"]}
- Key Takeaways: {caps["Takeaways"]}
- Diagrams: {caps["Diagrams"]}

## Renderer Statistics
- Markdown Size: {len(final_markdown)} characters

"""

    with open("benchmark/production_validation_v6_report.md", "w", encoding="utf-8") as f:
        f.write(report)
        
    with open("benchmark/production_validation_v6_output.md", "w", encoding="utf-8") as f:
        f.write(final_markdown)
        
    print(f"Validation complete! Total time: {total_time:.2f}s")
    print(f"Generated {num_objs} StudyTopics at {throughput:.2f} obj/sec")
    print("Results saved to production_validation_v6_report.md and production_validation_v6_output.md")

if __name__ == "__main__":
    run_v6_validation()
