from app.config.capability_profiles import BlockType
from app.models.educational_signals import EducationalSignals
from app.config.educational_signal_profiles import SIGNAL_PROFILES
import copy

def build_signals(topic_type: BlockType, exam_hints: list[str]) -> EducationalSignals:
    """
    Deterministically builds EducationalSignals based on the type of concept
    and any hints provided from the document intelligence.
    """
    base_signals = SIGNAL_PROFILES.get(topic_type, SIGNAL_PROFILES[BlockType.GENERAL])
    signals = copy.deepcopy(base_signals)
    
    if not exam_hints:
        return signals
        
    hints_text = " ".join(exam_hints).lower()
    
    if "memorize" in hints_text or "remember" in hints_text:
        signals.memory_trick_would_help = True
        
    if "formula" in hints_text or "equation" in hints_text or "calculate" in hints_text:
        signals.formula_would_help_learning = True
        
    if "implement" in hints_text or "code" in hints_text or "program" in hints_text:
        signals.code_would_help_learning = True
        
    if "compare" in hints_text or "vs" in hints_text or "difference" in hints_text:
        signals.comparison_would_help_learning = True
        
    if "steps" in hints_text or "process" in hints_text:
        signals.algorithm_steps_would_help = True
        
    if "mistake" in hints_text or "careful" in hints_text or "warning" in hints_text:
        signals.common_mistakes_would_help = True
        
    return signals
