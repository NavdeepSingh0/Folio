import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.models.folio import LearningObject

def test():
    obj = LearningObject(
        stable_id="test-1",
        document_id="doc-1",
        topic_label="Test",
        content_hash="hash",
        title="Encapsulation",
        definition="Bundling data and methods.",
        explanation="It hides internal state.",
        example="A bank account class.",
        code_example="class BankAccount { private int balance; }",
        comparison_table=[{"Concept": "Encapsulation", "Details": "Hides data"}],
        diagram_description="graph TD\nA-->B"
    )
    print("Schema instantiated successfully!")
    print(f"Code Example: {obj.code_example}")
    print(f"Comparison Table: {obj.comparison_table}")

if __name__ == "__main__":
    test()
