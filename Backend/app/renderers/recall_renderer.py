from typing import List
from app.models.folio import StudyTopic
from app.models.revision import RecallPrompt

class RecallRenderer:
    def render(self, topic: StudyTopic) -> List[RecallPrompt]:
        prompts = []
        
        # 1. Main Recall
        points = []
        if topic.definition:
            points.append(f"Definition: {topic.definition}")
        if topic.algorithm_steps:
            points.append("Steps:\n" + "\n".join([f"- {s}" for s in topic.algorithm_steps]))
        if topic.key_takeaways:
            points.append("Takeaways:\n" + "\n".join([f"- {t}" for t in topic.key_takeaways]))
            
        if points:
            prompts.append(RecallPrompt(
                topic_id=topic.id,
                prompt=f"Without looking, write down the key points (Definition, Steps, Takeaways) for {topic.title}.",
                expected_points=points
            ))
            
        return prompts
