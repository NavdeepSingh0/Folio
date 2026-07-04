import logging
import sys
import os

sys.path.append(os.path.abspath('.'))

logging.basicConfig(level=logging.DEBUG, stream=sys.stdout)

from app.utils.parser import parse_generation_response
from app.services.educational_context_builder import EducationalContext
from app.services.planning_service import TopicConcept
from app.config.capability_profiles import CapabilityProfile

# Create a mock concept
class MockConcept:
    title = "Test"
    slides = []

class MockContext:
    concept = MockConcept()

print("Testing parsing of empty string...")
res = parse_generation_response("", [MockContext()], "doc", "hash")
print(f"Success: {res.success}, Stage: {res.stage}, Error: {res.error}")

print("Testing parsing of malformed json...")
res2 = parse_generation_response("{ learning_objects: [ }", [MockContext()], "doc", "hash")
print(f"Success: {res2.success}, Stage: {res2.stage}, Error: {res2.error}")
