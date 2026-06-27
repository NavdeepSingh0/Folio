import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.models.folio import LearningObject
from app.services.renderer import MarkdownRenderer

def run_tests():
    renderer = MarkdownRenderer()
    
    # 1. Programming Concept
    prog_obj = LearningObject(
        stable_id="prog-1",
        document_id="doc-1",
        topic_label="Programming",
        content_hash="hash",
        title="Exception Handling (try-catch)",
        definition="A mechanism to handle runtime errors to maintain normal application flow.",
        explanation="In Java, exceptions disrupt the flow of execution. Using try-catch blocks allows developers to catch these exceptions and handle them gracefully without crashing the program.",
        code_example="try {\n    int result = 10 / 0;\n} catch (ArithmeticException e) {\n    System.out.println(\"Cannot divide by zero\");\n}",
        common_mistakes="Forgetting to catch specific exceptions before generic Exception.",
        exam_tip="Remember that 'finally' blocks execute regardless of whether an exception was caught or not."
    )
    
    # 2. Theory Concept
    theory_obj = LearningObject(
        stable_id="theory-1",
        document_id="doc-1",
        topic_label="Theory",
        content_hash="hash",
        title="Software Development Life Cycle (SDLC)",
        definition="A process used by the software industry to design, develop and test high-quality software.",
        explanation="SDLC aims to produce high-quality software that meets or exceeds customer expectations, reaches completion within times and cost estimates. It consists of multiple phases like Planning, Defining, Designing, Building, Testing, and Deployment.",
        comparison_table=[
            {"Phase": "Planning", "Goal": "Analyze requirements"},
            {"Phase": "Designing", "Goal": "Create architecture"},
            {"Phase": "Building", "Goal": "Write code"}
        ],
        key_takeaways=["SDLC reduces complexity", "Improves software quality", "Helps in project management"]
    )
    
    # 3. Algorithm Concept
    algo_obj = LearningObject(
        stable_id="algo-1",
        document_id="doc-1",
        topic_label="Algorithms",
        content_hash="hash",
        title="Banker's Algorithm",
        definition="A resource allocation and deadlock avoidance algorithm.",
        explanation="It tests for safety by simulating the allocation for predetermined maximum possible amounts of all resources, and then makes an 's-state' check to test for possible activities, before deciding whether allocation should be allowed to continue.",
        algorithm_steps=[
            "Let Work and Finish be vectors of length m and n, respectively.",
            "Find an index i such that both Finish[i] == false and Need_i <= Work.",
            "If no such i exists, go to step 4.",
            "Work = Work + Allocation_i; Finish[i] = true; Go to step 2.",
            "If Finish[i] == true for all i, then the system is in a safe state."
        ],
        formula="Need[i, j] = Max[i, j] - Allocation[i, j]",
        memory_trick="Think of a real bank never loaning out more money than it has."
    )
    
    markdown_output = renderer.render([prog_obj, theory_obj, algo_obj])
    
    with open("benchmark/acceptance_test_output.md", "w", encoding="utf-8") as f:
        f.write(markdown_output)
        
    print("Renderer Acceptance Tests Completed. Output written to benchmark/acceptance_test_output.md")

if __name__ == "__main__":
    run_tests()
