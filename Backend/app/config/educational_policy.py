from pydantic import BaseModel
from typing import Dict, Optional

class CapabilityRule(BaseModel):
    required: bool
    target_words: Optional[int] = None
    supplement: bool = True
    allow_model_knowledge: bool = True
    strict_to_source: bool = False
    quality_expectation: Optional[str] = None

# The standard policy dictates how the generator should handle each capability
STANDARD_POLICY: Dict[str, CapabilityRule] = {
    "definition": CapabilityRule(
        required=True,
        target_words=35,
        supplement=True,
        allow_model_knowledge=True,
        strict_to_source=False
    ),
    "explanation": CapabilityRule(
        required=True,
        target_words=120,
        supplement=True,
        allow_model_knowledge=True,
        strict_to_source=False,
        quality_expectation="Teaching depth, prioritizing understanding over compression"
    ),
    "example": CapabilityRule(
        required=True,
        target_words=80,
        supplement=True,
        allow_model_knowledge=True,
        strict_to_source=False,
        quality_expectation="Real-world context, max 3 sentences"
    ),
    "code_example": CapabilityRule(
        required=False,
        target_words=None,
        supplement=True,
        allow_model_knowledge=True, # Allow model to write code for a concept
        strict_to_source=False,
        quality_expectation="Minimal complete implementation, no boilerplate"
    ),
    "algorithm_steps": CapabilityRule(
        required=False,
        target_words=None,
        supplement=True,
        allow_model_knowledge=True,
        strict_to_source=False
    ),
    "formula": CapabilityRule(
        required=False,
        target_words=None,
        supplement=False,
        allow_model_knowledge=False, # Formulas must be strictly accurate or from source
        strict_to_source=True,
        quality_expectation="Canonical mathematical notation"
    ),
    "comparison_table": CapabilityRule(
        required=False,
        target_words=None,
        supplement=True,
        allow_model_knowledge=True,
        strict_to_source=False
    ),
    "memory_trick": CapabilityRule(
        required=False,
        target_words=30,
        supplement=True,
        allow_model_knowledge=True,
        strict_to_source=False,
        quality_expectation="Analogy or genuine mnemonic (avoid creator-name mnemonics)"
    ),
    "common_mistakes": CapabilityRule(
        required=False,
        target_words=40,
        supplement=True,
        allow_model_knowledge=True,
        strict_to_source=False
    ),
    "exam_tip": CapabilityRule(
        required=False,
        target_words=40,
        supplement=True,
        allow_model_knowledge=True,
        strict_to_source=False,
        quality_expectation="Focus on highest scoring examination points"
    ),
    "key_takeaways": CapabilityRule(
        required=False,
        target_words=None,
        supplement=True,
        allow_model_knowledge=True,
        strict_to_source=False
    ),
    "diagram_description": CapabilityRule(
        required=False,
        target_words=None,
        supplement=False,
        allow_model_knowledge=False,
        strict_to_source=True
    )
}
