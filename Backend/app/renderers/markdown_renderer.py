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
    return f"**Formula:**\n$$\n{obj.formula.strip()}\n$$\n\n"

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
    c_qs = ap.get("conceptual_questions", [])
    if c_qs:
        sections.append("### Conceptual Questions")
        for i, q in enumerate(c_qs):
            sections.append(f"**Q{i+1}:** {q.get('question', '')}\n> {q.get('answer', '')}")
            
    # Comparison Questions
    comp_qs = ap.get("comparison_questions", [])
    if comp_qs:
        sections.append("### Comparison Questions")
        for i, q in enumerate(comp_qs):
            sections.append(f"**Q{i+1}:** {q.get('question', '')}\n> {q.get('answer', '')}")

    # Scenario Questions
    s_qs = ap.get("scenario_questions", [])
    if s_qs:
        sections.append("### Scenario Questions")
        for i, q in enumerate(s_qs):
            sections.append(f"**Scenario:** {q.get('scenario', '')}\n**Expected Answer:**\n> {q.get('expected_answer', '')}")
            
    # Viva Questions
    v_qs = ap.get("viva_questions", [])
    if v_qs:
        sections.append("### Viva Questions")
        for i, q in enumerate(v_qs):
            sections.append(f"**Q{i+1}:** {q.get('question', '')}\n> {q.get('model_answer', '')}")

    # Coding Challenges
    code_qs = ap.get("coding_challenges", [])
    if code_qs:
        sections.append("### Coding Challenges")
        for i, q in enumerate(code_qs):
            sections.append(f"**Challenge:** {q.get('prompt', '')}\n*(Expected Topics: {', '.join(q.get('expected_topics', []))})*")
            
    # Exam Predictions
    exam_qs = ap.get("exam_predictions", [])
    if exam_qs:
        sections.append("### Exam Predictions")
        for i, q in enumerate(exam_qs):
            scheme = "\n".join([f"  - {s}" for s in q.get('marking_scheme', [])])
            sections.append(f"**[{q.get('marks', 0)} Marks]** {q.get('question', '')}\n**Marking Scheme:**\n{scheme}")

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
