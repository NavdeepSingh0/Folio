from typing import Dict
from app.config.capability_profiles import BlockType
from app.models.educational_signals import EducationalSignals

# This maps a given concept type to the educational elements that inherently
# help a student learn that type of concept.
SIGNAL_PROFILES: Dict[str, EducationalSignals] = {
    BlockType.ALGORITHM: EducationalSignals(
        formula_would_help_learning=True,
        code_would_help_learning=True,
        algorithm_steps_would_help=True,
        memory_trick_would_help=True,
        common_mistakes_would_help=True,
        comparison_would_help_learning=False,
        diagram_would_help_learning=True,
        real_world_example_would_help=True
    ),
    BlockType.CODE_CONCEPT: EducationalSignals(
        formula_would_help_learning=False,
        code_would_help_learning=True,
        algorithm_steps_would_help=False,
        memory_trick_would_help=True,
        common_mistakes_would_help=True,
        comparison_would_help_learning=False,
        diagram_would_help_learning=False,
        real_world_example_would_help=True
    ),
    BlockType.FORMULA: EducationalSignals(
        formula_would_help_learning=True,
        code_would_help_learning=False,
        algorithm_steps_would_help=True, # Steps to solve
        memory_trick_would_help=True,
        common_mistakes_would_help=True,
        comparison_would_help_learning=False,
        diagram_would_help_learning=False,
        real_world_example_would_help=True
    ),
    BlockType.THEORY: EducationalSignals(
        formula_would_help_learning=False,
        code_would_help_learning=False,
        algorithm_steps_would_help=False,
        memory_trick_would_help=True,
        common_mistakes_would_help=True,
        comparison_would_help_learning=True, # Theory often requires distinguishing concepts
        diagram_would_help_learning=True,
        real_world_example_would_help=True
    ),
    BlockType.COMPARISON: EducationalSignals(
        formula_would_help_learning=False,
        code_would_help_learning=False,
        algorithm_steps_would_help=False,
        memory_trick_would_help=True,
        common_mistakes_would_help=True,
        comparison_would_help_learning=True,
        diagram_would_help_learning=False,
        real_world_example_would_help=True
    ),
    BlockType.PROCESS: EducationalSignals(
        formula_would_help_learning=False,
        code_would_help_learning=False,
        algorithm_steps_would_help=True,
        memory_trick_would_help=True,
        common_mistakes_would_help=True,
        comparison_would_help_learning=False,
        diagram_would_help_learning=True,
        real_world_example_would_help=True
    ),
    BlockType.DEFINITION: EducationalSignals(
        formula_would_help_learning=False,
        code_would_help_learning=False,
        algorithm_steps_would_help=False,
        memory_trick_would_help=True,
        common_mistakes_would_help=False,
        comparison_would_help_learning=False,
        diagram_would_help_learning=False,
        real_world_example_would_help=True
    ),
    BlockType.GENERAL: EducationalSignals(
        formula_would_help_learning=False,
        code_would_help_learning=False,
        algorithm_steps_would_help=False,
        memory_trick_would_help=True,
        common_mistakes_would_help=False,
        comparison_would_help_learning=False,
        diagram_would_help_learning=False,
        real_world_example_would_help=True
    ),
}
