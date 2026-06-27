import sys
import os
import json
import sqlite3
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.parsers import DocumentParser
from app.services.document_intelligence import build_planner_input
from app.services.planning_service import generate_topic_outline
from app.services.capability_resolver import resolve_capabilities
from app.services.educational_context_builder import build_educational_context
from app.services.generation_service import generate_learning_objects
from app.services.renderer import MarkdownRenderer
from app.config.capability_profiles import BlockType
from app.config.educational_policy import STANDARD_POLICY
from app.models.database import DB_PATH

def run_diagnostics():
    filepath = "../Uploads/3.1.4.pptx"
    print(f"Parsing {filepath}...")
    
    parser = DocumentParser()
    with open(filepath, "rb") as f:
        extracted_doc = parser.parse(f.read(), "3.1.4.pptx")
        
    print("Running Document Intelligence...")
    planner_input = build_planner_input(extracted_doc)
    
    doc_intel_report = "### Document Intelligence Classification\n"
    for slide in planner_input.filtered_slides:
        doc_intel_report += f"- Slide {slide.slide_number} -> {slide.slide_type.value} (Confidence: {slide.confidence})\n"
        
    print("Running Planner...")
    outline = generate_topic_outline(planner_input, model_name="qwen3")
    
    planner_report = "### Raw Planner Output\n```json\n" + outline.model_dump_json(indent=2) + "\n```\n"
    
    print("Running Generation (this may take a bit)...")
    contexts = []
    for concept in outline.concepts:
        try:
            btype = BlockType(concept.type)
        except ValueError:
            btype = BlockType.GENERAL
        cap_profile = resolve_capabilities(btype)
        ctx = build_educational_context(concept, cap_profile, STANDARD_POLICY, planner_input, extracted_doc)
        contexts.append(ctx)
        
    parse_result = generate_learning_objects(
        contexts=contexts,
        document_id="temp-doc",
        content_hash="diag_hash",
        model_name="qwen3"
    )
    
    generation_report = "### Learning Object Generation Output\n```json\n" + parse_result.raw_output + "\n```\n"
    
    print("Running Renderer...")
    renderer = MarkdownRenderer()
    final_markdown = renderer.render(parse_result.learning_objects) if parse_result.success else "Failed to parse generation output."
    markdown_report = "### Final Markdown Output\n```markdown\n" + final_markdown + "\n```\n"
    
    conclusion = """### Conclusion
Based on the diagnostics, we can observe whether the planner successfully consolidated the concept into 1-2 learning objects, and whether forward references were properly filtered.
    """
    
    full_report = f"# Slice 10.5b Diagnostic Report\n\n{doc_intel_report}\n{planner_report}\n{generation_report}\n{markdown_report}\n{conclusion}"
    
    with open("benchmark/diagnostic_report.md", "w", encoding="utf-8") as f:
        f.write(full_report)
        
    print("Diagnostic report saved to benchmark/diagnostic_report.md")

if __name__ == "__main__":
    run_diagnostics()
