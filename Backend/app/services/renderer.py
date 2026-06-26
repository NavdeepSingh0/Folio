from typing import Protocol, List
from app.models.folio import LearningObject

class Renderer(Protocol):
    def render(self, objects: List[LearningObject]) -> str:
        ...

class MarkdownRenderer:
    def render(self, objects: List[LearningObject]) -> str:
        """Renders a collection of LearningObjects into Markdown."""
        markdown = ""
        for obj in objects:
            markdown += f"## {obj.title}\n\n"
            markdown += f"**Definition:** {obj.definition}\n\n"
            markdown += f"{obj.explanation}\n\n"
            
            if obj.example:
                markdown += f"> **Example:** {obj.example}\n\n"
                
            if obj.exam_tip:
                markdown += f"> [!TIP]\n> **Exam Focus:** {obj.exam_tip}\n\n"
                
            markdown += "---\n\n"
            
        return markdown
