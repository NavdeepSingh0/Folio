from app.models.folio import StudyTopic
from app.models.revision import CheatSheet

class CheatSheetRenderer:
    def render(self, topic: StudyTopic) -> CheatSheet:
        bullets = []
        if topic.definition:
            bullets.append(f"Definition: {topic.definition}")
            
        formulas = []
        if topic.formula:
            formulas.append(topic.formula)
            
        memory_tricks = []
        if topic.memory_trick:
            memory_tricks.append(topic.memory_trick)
            
        exam_focus = []
        if topic.exam_tip:
            exam_focus.append(topic.exam_tip)
        if topic.key_takeaways:
            exam_focus.extend(topic.key_takeaways)
            
        return CheatSheet(
            topic_id=topic.id,
            bullets=bullets,
            formulas=formulas,
            memory_tricks=memory_tricks,
            exam_focus=exam_focus
        )
