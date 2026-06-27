import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.models.folio import LearningObject
from app.services.renderer import MarkdownRenderer

def run_tests():
    renderer = MarkdownRenderer()
    
    # Minimal Object
    minimal_obj = LearningObject(
        stable_id="min-1",
        document_id="doc-1",
        topic_label="Minimal",
        content_hash="hash",
        title="Minimalism",
        definition="The art of less.",
        explanation="This object has only the required fields. Everything else is null or empty. It should render cleanly without empty sections or weird spacing."
    )
    
    markdown_output = renderer.render([minimal_obj])
    
    with open("benchmark/minimal_output.md", "w", encoding="utf-8") as f:
        f.write(markdown_output)
        
    print("Minimal Test Completed. Output written to benchmark/minimal_output.md")
    print("\n--- OUTPUT PREVIEW ---")
    print(markdown_output)
    print("----------------------")

if __name__ == "__main__":
    run_tests()
