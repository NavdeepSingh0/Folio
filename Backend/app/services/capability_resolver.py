from app.config.capability_profiles import CAPABILITY_PROFILES, BlockType, CapabilityProfile

def resolve_capabilities(concept_type: BlockType) -> CapabilityProfile:
    """
    Deterministically resolves the educational capabilities required for a given concept type.
    """
    # Fallback to GENERAL if somehow an unknown type is passed
    return CAPABILITY_PROFILES.get(concept_type, CAPABILITY_PROFILES[BlockType.GENERAL])
