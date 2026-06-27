from app.config.capability_profiles import CAPABILITY_PROFILES, BlockType, CapabilityProfile
from app.models.educational_signals import EducationalSignals
import copy

def resolve_capabilities(concept_type: BlockType, signals: EducationalSignals = None) -> CapabilityProfile:
    """
    Deterministically resolves the educational capabilities required for a given concept type.
    """
    # Fallback to GENERAL if somehow an unknown type is passed
    base_profile = CAPABILITY_PROFILES.get(concept_type, CAPABILITY_PROFILES[BlockType.GENERAL])
    profile = copy.deepcopy(base_profile)
    
    if signals:
        def upgrade_capability(cap_name: str, should_upgrade: bool):
            if should_upgrade and cap_name not in profile.required:
                profile.required.append(cap_name)
                if cap_name in profile.recommended: profile.recommended.remove(cap_name)
                if cap_name in profile.optional: profile.optional.remove(cap_name)

        upgrade_capability("formula", signals.formula_would_help_learning)
        upgrade_capability("code_example", signals.code_would_help_learning)
        upgrade_capability("diagram_description", signals.diagram_would_help_learning)
        upgrade_capability("algorithm_steps", signals.algorithm_steps_would_help)
        upgrade_capability("comparison_table", signals.comparison_would_help_learning)
        upgrade_capability("memory_trick", signals.memory_trick_would_help)
        upgrade_capability("common_mistakes", signals.common_mistakes_would_help)
        upgrade_capability("example", signals.real_world_example_would_help)

    return profile
