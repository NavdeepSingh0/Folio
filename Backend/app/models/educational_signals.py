from pydantic import BaseModel

class EducationalSignals(BaseModel):
    """
    Decouples the derivation of requirements from the deterministic resolver.
    Indicates whether a specific educational element would help a student learn
    a particular concept type.
    """
    formula_would_help_learning: bool = False
    code_would_help_learning: bool = False
    algorithm_steps_would_help: bool = False
    comparison_would_help_learning: bool = False
    diagram_would_help_learning: bool = False
    memory_trick_would_help: bool = False
    common_mistakes_would_help: bool = False
    real_world_example_would_help: bool = False
