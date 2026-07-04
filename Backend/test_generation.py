import asyncio
import os
import sys

# Ensure backend directory is in path
sys.path.append(os.path.abspath('.'))

from app.services.generation_service import generate_learning_objects
from app.models.hierarchy import EducationalContext, ConceptNode, PolicyRule

ctx = EducationalContext(
    concept=ConceptNode(title="Test Concept", type="definition"),
    capability_profile=type("MockCapProfile", (), {"required": ["definition"], "recommended": [], "optional": []})(),
    exam_hints=["Hint 1"],
    covers=["Sub 1"],
    educational_policy={"definition": PolicyRule(target_words=50, allow_model_knowledge=True, supplement=False)},
    full_document_text="Test Document content here."
)

res = generate_learning_objects(
    contexts=[ctx],
    document_id="test_doc",
    content_hash="test_hash",
    model_name="gemini-2.5-flash"
)

print(f"Success: {res.success}")
print(f"Error: {res.error}")
print(f"Stage: {res.stage}")
print(f"Learning Objects Count: {len(res.learning_objects)}")
print("Raw Output:")
print(res.raw_output)
