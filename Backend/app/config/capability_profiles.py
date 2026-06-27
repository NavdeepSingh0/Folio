from enum import Enum
from pydantic import BaseModel
from typing import List

class BlockType(str, Enum):
    ALGORITHM = "algorithm"
    DEFINITION = "definition"
    PROCESS = "process"
    COMPARISON = "comparison"
    FORMULA = "formula"
    CODE_CONCEPT = "code_concept"
    THEORY = "theory"
    GENERAL = "general"

class CapabilityProfile(BaseModel):
    required: List[str] = []
    recommended: List[str] = []
    optional: List[str] = []

CAPABILITY_PROFILES = {
    BlockType.ALGORITHM: CapabilityProfile(
        required=["definition", "explanation", "algorithm_steps", "exam_tip", "key_takeaways"],
        recommended=["formula", "memory_trick", "common_mistakes"],
        optional=["comparison_table", "code_example", "diagram_description", "example"]
    ),
    BlockType.DEFINITION: CapabilityProfile(
        required=["definition", "explanation", "exam_tip"],
        recommended=["example", "memory_trick", "key_takeaways"],
        optional=["comparison_table", "common_mistakes"]
    ),
    BlockType.PROCESS: CapabilityProfile(
        required=["definition", "explanation", "algorithm_steps", "exam_tip"],
        recommended=["example", "diagram_description", "key_takeaways"],
        optional=["common_mistakes", "memory_trick"]
    ),
    BlockType.COMPARISON: CapabilityProfile(
        required=["definition", "explanation", "comparison_table", "key_takeaways"],
        recommended=["example", "exam_tip"],
        optional=["memory_trick"]
    ),
    BlockType.FORMULA: CapabilityProfile(
        required=["definition", "explanation", "formula", "exam_tip"],
        recommended=["example", "common_mistakes"],
        optional=["algorithm_steps", "key_takeaways"]
    ),
    BlockType.CODE_CONCEPT: CapabilityProfile(
        required=["definition", "explanation", "code_example", "exam_tip"],
        recommended=["example", "common_mistakes", "key_takeaways"],
        optional=["algorithm_steps", "comparison_table"]
    ),
    BlockType.THEORY: CapabilityProfile(
        required=["definition", "explanation", "key_takeaways"],
        recommended=["example", "memory_trick", "exam_tip"],
        optional=["comparison_table", "common_mistakes", "diagram_description"]
    ),
    BlockType.GENERAL: CapabilityProfile(
        required=["definition", "explanation"],
        recommended=["example", "key_takeaways", "exam_tip"],
        optional=["memory_trick", "common_mistakes", "comparison_table", "formula", "algorithm_steps", "code_example", "diagram_description"]
    )
}
