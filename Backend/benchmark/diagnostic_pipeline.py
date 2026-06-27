import sys
import os
import json
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.planning_service import generate_topic_outline
from app.services.generation_service import generate_learning_objects
from app.services.capability_mapper import map_capabilities
from app.services.renderer import render_object
from app.models.document_profile import ExtractedDocument, ExtractedSlide
from app.services.document_intelligence import build_planner_input

MOCK_SLIDES = [
    ExtractedSlide(slide_number=1, text="Administrative: Welcome to OS101. Office hours are MWF."),
    ExtractedSlide(slide_number=2, text="Learning Objectives: Understand deadlock avoidance."),
    ExtractedSlide(slide_number=3, text="Banker's Algorithm\nThe Banker's Algorithm is a resource allocation and deadlock avoidance algorithm.\nIt tests for safety by simulating the allocation for predetermined maximum possible amounts of all resources."),
    ExtractedSlide(slide_number=4, text="Formula: Need[i, j] = Max[i, j] - Allocation[i, j]"),
    ExtractedSlide(slide_number=5, text="Algorithm Steps:\n1. Let Work and Finish be vectors of length m and n.\n2. Find an index i such that both Finish[i] == false and Need_i <= Work.\n3. If no such i exists, go to step 4.\n4. Work = Work + Allocation_i; Finish[i] = true; Go to step 2.\n5. If Finish[i] == true for all i, then the system is in a safe state."),
    ExtractedSlide(slide_number=6, text="Example: Suppose 5 processes and 3 resource types. We calculate the safe sequence."),
    ExtractedSlide(slide_number=7, text="Quiz: Q1. What happens if no safe sequence exists?\nA. Deadlock\nB. Safe"),
    ExtractedSlide(slide_number=8, text="Summary: We covered Banker's Algorithm which needs O(m*n^2) time.")
]

def run_diagnostic():
    print("="*50)
    print("STAGE 0: DOCUMENT INTELLIGENCE")
    print("="*50)
    
    mock_doc = ExtractedDocument(slides=MOCK_SLIDES, page_count=len(MOCK_SLIDES))
    planner_input = build_planner_input(mock_doc)
    
    print("\nDOCUMENT PROFILE:")
    print(json.dumps(planner_input.document_profile.model_dump(), indent=4))
    
    print("\nEXAM FOCUS HINTS:")
    for h in planner_input.exam_focus_hints:
        print(f"- {h}")
        
    print(f"\nFILTERED SLIDES FOR PLANNER ({len(planner_input.filtered_slides)} slides):")
    for s in planner_input.filtered_slides:
        print(f"[{s.slide_type.value}] Slide {s.slide_number} (Conf: {s.confidence})")

    print("\n" + "="*50)
    print("STAGE 1: PLANNER")
    print("="*50)
    
    # 1. Planner Output
    outline = generate_topic_outline(planner_input, "qwen3")
    
    # Extract the single concept (Banker's Algorithm)
    concept = outline.concepts[0] if outline.concepts else None
    
    print("\nRAW PLANNER JSON:")
    if concept:
        print(json.dumps(concept.model_dump(), indent=4))
    else:
        print("Planner returned no concepts!")
        return
    
    print("\n" + "="*50)
    print("STAGE 2: EDUCATIONAL ANALYSIS & CAPABILITY MAPPER")
    print("="*50)
    
    # 2 & 3. Educational Analysis -> Capability Mapping
    analysis = concept.educational_analysis
    capabilities = map_capabilities(analysis)
    
    print("\nCapabilities Selected By Python:")
    for cap in capabilities:
        print(f"* {cap}")
        
    print("\n" + "="*50)
    print("STAGE 3: GENERATOR")
    print("="*50)
    
    # 4. Generator JSON
    # Join filtered text for generator
    generator_text = "\n\n---\n\n".join(s.text for s in planner_input.filtered_slides)
    # Call the generation service
    parse_result = generate_learning_objects(generator_text, outline, "diagnostic_doc", "hash", "qwen3")
    learning_objects = parse_result.learning_objects
    
    if not learning_objects:
        print("ERROR: Generator returned no objects.")
        print(parse_result.error)
        return
        
    obj = learning_objects[0]
    
    print("\nRAW GENERATED LEARNING OBJECT JSON:")
    # Print exactly what the generator populated (which is the model dump)
    print(json.dumps(obj.model_dump(), indent=4))
    
    print("\n" + "="*50)
    print("STAGE 4: RENDERER")
    print("="*50)
    
    # 5. Final Markdown
    markdown = render_object(obj)
    
    print("\nRENDERED MARKDOWN:")
    print(markdown)
    
if __name__ == "__main__":
    run_diagnostic()
