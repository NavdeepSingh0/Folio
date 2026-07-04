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
    if not obj.formula or not obj.formula.strip():
        return ""
    clean_formula = obj.formula.replace("$", "").strip()
    return f"**Formula:**\n$$\n{clean_formula}\n$$\n\n"

def render_algorithm_steps(obj: LearningObject) -> str:
    if not obj.algorithm_steps:
        return ""
    steps = "\n".join([f"{i+1}. {step}" for i, step in enumerate(obj.algorithm_steps)])
    return f"**Algorithm Steps:**\n{steps}\n\n"

def render_code_example(obj: LearningObject) -> str:
    if not obj.code_example:
        return ""
    code_text = obj.code_example.strip()
    lang = "text"
    if "public class" in code_text or "public static void" in code_text:
        lang = "java"
    elif "#include" in code_text or "cout <<" in code_text or "std::" in code_text:
        lang = "cpp"
    elif "def " in code_text or "import sys" in code_text:
        lang = "python"
    elif "SELECT " in code_text.upper() and "FROM " in code_text.upper():
        lang = "sql"
        
    return f"```{lang}\n{code_text}\n```\n\n"

def render_comparison_table(obj: LearningObject) -> str:
    if not obj.comparison_table or not obj.comparison_table.strip():
        return ""
    
    return f"**Comparison:**\n\n{obj.comparison_table}\n\n"

def render_mermaid_diagram(obj: LearningObject) -> str:
    if not obj.diagram_description:
        return ""
        
    content = obj.diagram_description.strip()
    valid_keywords = ["graph", "flowchart", "sequenceDiagram", "classDiagram", "stateDiagram", "journey", "gantt"]
    
    if any(content.startswith(kw) for kw in valid_keywords):
        return f"```mermaid\n{content}\n```\n\n"
    else:
        return f"> [!NOTE]\n> **Diagram Description:** {content}\n\n"

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

def render_advanced_practice(obj: LearningObject) -> str:
    if not obj.advanced_practice:
        return ""
    
    ap = obj.advanced_practice
    sections = []
    
    # Conceptual Questions
    if ap.conceptual_questions:
        sections.append("### Conceptual Questions")
        for i, q in enumerate(ap.conceptual_questions):
            sections.append(f"**Q{i+1}:** {q.question}\n> {q.answer}")
            
    # Comparison Questions
    if ap.comparison_questions:
        sections.append("### Comparison Questions")
        for i, q in enumerate(ap.comparison_questions):
            sections.append(f"**Q{i+1}:** {q.question}\n> {q.answer}")

    # Scenario Questions
    if ap.scenario_questions:
        sections.append("### Scenario Questions")
        for i, q in enumerate(ap.scenario_questions):
            sections.append(f"**Scenario:** {q.scenario}\n**Expected Answer:**\n> {q.expected_answer}")
            
    # Viva Questions
    if ap.viva_questions:
        sections.append("### Viva Questions")
        for i, q in enumerate(ap.viva_questions):
            sections.append(f"**Q{i+1}:** {q.question}\n> {q.model_answer}")

    # Coding Challenges
    if ap.coding_challenges:
        sections.append("### Coding Challenges")
        for i, q in enumerate(ap.coding_challenges):
            sections.append(f"**Challenge:** {q.prompt}\n*(Expected Topics: {', '.join(q.expected_topics)})*")
            
    # Exam Predictions
    if ap.exam_predictions:
        sections.append("### Exam Predictions")
        for i, q in enumerate(ap.exam_predictions):
            scheme = "\n".join([f"  - {s}" for s in q.marking_scheme])
            sections.append(f"**[{q.marks} Marks]** {q.question}\n**Marking Scheme:**\n{scheme}")

    if not sections:
        return ""
        
    return "## Advanced Practice\n\n" + "\n\n".join(sections) + "\n\n"


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
        render_key_takeaways(obj),
        render_advanced_practice(obj)
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
