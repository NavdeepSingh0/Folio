from typing import Protocol, List
from app.models.folio import LearningObject

def render_heading(obj: LearningObject) -> str:
    return f"## {obj.title}\n\n"

def render_prerequisites(obj: LearningObject) -> str:
    if not obj.prerequisites:
        return ""
    reqs = ", ".join(obj.prerequisites)
    return f"**Prerequisites:** {reqs}\n\n"

def render_definition(obj: LearningObject) -> str:
    return f"**Definition:** {obj.definition}\n\n"

def render_explanation(obj: LearningObject) -> str:
    return f"{obj.explanation}\n\n"

def render_formula(obj: LearningObject) -> str:
    if not obj.formula:
        return ""
    return f"**Formula:**\n```math\n{obj.formula}\n```\n\n"

def render_algorithm_steps(obj: LearningObject) -> str:
    if not obj.algorithm_steps:
        return ""
    steps = "\n".join([f"{i+1}. {step}" for i, step in enumerate(obj.algorithm_steps)])
    return f"**Algorithm Steps:**\n{steps}\n\n"

def render_code_example(obj: LearningObject) -> str:
    if not obj.code_example:
        return ""
    # Assuming code could be Java/C++ etc. Using text as default
    return f"```text\n{obj.code_example}\n```\n\n"

def render_comparison_table(obj: LearningObject) -> str:
    if not obj.comparison_table or len(obj.comparison_table) == 0:
        return ""
    
    # Extract headers from the first dictionary
    headers = list(obj.comparison_table[0].keys())
    if not headers:
        return ""
        
    markdown = f"| {' | '.join(headers)} |\n"
    markdown += f"|{'|'.join(['---' for _ in headers])}|\n"
    
    for row in obj.comparison_table:
        markdown += f"| {' | '.join([str(row.get(h, '')) for h in headers])} |\n"
        
    return markdown + "\n"

def render_mermaid_diagram(obj: LearningObject) -> str:
    if not obj.diagram_description:
        return ""
    return f"```mermaid\n{obj.diagram_description}\n```\n\n"

def render_example(obj: LearningObject) -> str:
    if not obj.example:
        return ""
    return f"> **Example:** {obj.example}\n\n"

def render_memory_trick(obj: LearningObject) -> str:
    if not obj.memory_trick:
        return ""
    return f"> [!NOTE]\n> **Memory Trick:** {obj.memory_trick}\n\n"

def render_common_mistakes(obj: LearningObject) -> str:
    if not obj.common_mistakes:
        return ""
    return f"> [!WARNING]\n> **Common Mistake:** {obj.common_mistakes}\n\n"

def render_exam_tip(obj: LearningObject) -> str:
    if not obj.exam_tip:
        return ""
    return f"> [!TIP]\n> **Exam Focus:** {obj.exam_tip}\n\n"

def render_key_takeaways(obj: LearningObject) -> str:
    if not obj.key_takeaways:
        return ""
    takeaways = "\n".join([f"- {t}" for t in obj.key_takeaways])
    return f"**Key Takeaways:**\n{takeaways}\n\n"


def render_object(obj: LearningObject) -> str:
    """Renders a single LearningObject into a Markdown fragment."""
    fragments = [
        render_heading(obj),
        render_prerequisites(obj),
        render_definition(obj),
        render_formula(obj),
        render_explanation(obj),
        render_algorithm_steps(obj),
        render_code_example(obj),
        render_comparison_table(obj),
        render_mermaid_diagram(obj),
        render_example(obj),
        render_memory_trick(obj),
        render_common_mistakes(obj),
        render_exam_tip(obj),
        render_key_takeaways(obj)
    ]
    # Filter out empty strings and join with no extra spacing (the functions already include trailing newlines)
    # Wait, the functions include \n\n, so we just ''.join() them.
    return "".join(fragments).strip()


class Renderer(Protocol):
    def render(self, objects: List[LearningObject]) -> str:
        ...

class MarkdownRenderer:
    def render(self, objects: List[LearningObject]) -> str:
        """Assembles a full document from multiple LearningObjects."""
        rendered_objects = [render_object(obj) for obj in objects]
        
        # The document assembler handles the dividers between objects,
        # so individual renderers can be reused elsewhere without stray dividers.
        return "\n\n---\n\n".join(rendered_objects) + "\n\n"
