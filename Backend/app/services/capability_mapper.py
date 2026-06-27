from typing import List
from app.models.folio import EducationalAnalysis

def map_capabilities(analysis: EducationalAnalysis) -> List[str]:
    """
    Deterministically maps educational analysis booleans to renderer capabilities.
    The generator should ALWAYS provide definition, explanation, and example.
    """
    capabilities = ["definition", "explanation", "example"]
    
    if not analysis:
        return capabilities
        
    if analysis.contains_algorithm:
        capabilities.append("algorithm_steps")
        
    if analysis.contains_formula:
        capabilities.append("formula")
        
    if analysis.contains_code:
        capabilities.append("code_example")
        
    if analysis.contains_comparison:
        capabilities.append("comparison_table")
        
    if analysis.contains_diagram:
        capabilities.append("diagram_description")
        
    if analysis.requires_memorisation:
        capabilities.append("memory_trick")
        
    if analysis.commonly_examined:
        capabilities.append("exam_tip")
        
    if analysis.has_common_errors:
        capabilities.append("common_mistakes")
        
    # Prereqs and takeaways can be considered globally applicable for rich notes, 
    # but we'll stick to mapping specific signals to keep it lean.
    capabilities.append("key_takeaways")
        
    return capabilities
