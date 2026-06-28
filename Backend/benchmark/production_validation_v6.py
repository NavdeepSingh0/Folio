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
    
    t_start = time.time()
    parser = DocumentParser()
    with open(filepath, "rb") as f:
        extracted_doc = parser.parse(f.read(), "3.1.3.pptx")
    t_extraction = time.time() - t_start
    print(f"Extracted {len(extracted_doc.slides)} slides in {t_extraction:.2f}s.")
    
    # 3. Pipeline
    print("[3/5] Running Pipeline...")
    t_start = time.time()
    planner_input = build_planner_input(extracted_doc)
    t_intelligence = time.time() - t_start
    
    t_start = time.time()
    outline = generate_topic_outline(planner_input, model_name="qwen3")
    t_planning = time.time() - t_start
    
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
        
    t_start = time.time()
    parse_result = generate_learning_objects(
        contexts=contexts,
        document_id="doc-v6",
        content_hash="hash-v6",
        model_name="qwen3"
    )
    t_study_topic = time.time() - t_start

    # 4. Advanced Practice
    print("[4/5] Simulating background Advanced Practice...")
    adv_engine = AdvancedPracticeService(model_name="qwen3")
    t_start = time.time()
    t_adv_total = 0
    t_adv_und = 0
    t_adv_app = 0
    t_adv_ass = 0
    
    for topic in parse_result.learning_objects:
        # Pass a tracking callback to capture internal timings if desired, 
        # or simply rely on the external wrap.
        def tracking_callback(practice):
            pass # We'll just time the whole generation call for now
            
        t_obj_start = time.time()
        practice = adv_engine.generate_practice(topic, update_callback=tracking_callback)
        t_adv_total += (time.time() - t_obj_start)
        topic.advanced_practice = practice
    
    # 5. Render
    print("[5/5] Rendering Markdown...")
    t_start = time.time()
    renderer = MarkdownRenderer()
    final_markdown = renderer.render(parse_result.learning_objects) if parse_result.success else "Generation Failed."
    t_render = time.time() - t_start
    
    end_time = time.time()
    total_time = t_extraction + t_intelligence + t_planning + t_study_topic + t_adv_total + t_render
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
```text
Document Extraction       {t_extraction:.2f}s
Document Intelligence     {t_intelligence:.2f}s
Planner                   {t_planning:.2f}s
Study Topic               {t_study_topic:.2f}s
Markdown                  {t_render:.2f}s
Advanced Practice         {t_adv_total:.2f}s

Total Generation Time     {total_time:.2f}s
```

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
