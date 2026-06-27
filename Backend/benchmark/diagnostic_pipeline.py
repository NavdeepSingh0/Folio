import sys
import os
import json
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.planning_service import generate_topic_outline
from app.services.generation_service import generate_learning_objects
from app.services.capability_mapper import map_capabilities
from app.services.renderer import render_object

OS_TEXT = """
Banker's Algorithm
The Banker's Algorithm is a resource allocation and deadlock avoidance algorithm.
It tests for safety by simulating the allocation for predetermined maximum possible amounts of all resources.
Formula: Need[i, j] = Max[i, j] - Allocation[i, j]
Algorithm Steps:
1. Let Work and Finish be vectors of length m and n.
2. Find an index i such that both Finish[i] == false and Need_i <= Work.
3. If no such i exists, go to step 4.
4. Work = Work + Allocation_i; Finish[i] = true; Go to step 2.
5. If Finish[i] == true for all i, then the system is in a safe state.
Memory Trick: Think of a real bank never loaning out more money than it has.
Common Mistakes: Forgetting to update both Work and Finish vectors.
"""

def run_diagnostic():
    print("="*50)
    print("STAGE 1: PLANNER")
    print("="*50)
    
    # 1. Planner Output
    outline = generate_topic_outline(OS_TEXT, "qwen3")
    
    # Extract the single concept (Banker's Algorithm)
    concept = outline.concepts[0] if outline.concepts else None
    
    print("\nRAW PLANNER JSON:")
    print(json.dumps(concept.model_dump(), indent=4))
    
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
    # Call the generation service
    parse_result = generate_learning_objects(OS_TEXT, outline, "diagnostic_doc", "hash", "qwen3")
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
