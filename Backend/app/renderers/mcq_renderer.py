from typing import List
from app.models.folio import StudyTopic
from app.models.revision import MCQ
import random

class MCQRenderer:
    def render(self, topic: StudyTopic) -> List[MCQ]:
        mcqs = []
        
        # 1. Basic Definition MCQ
        if topic.definition:
            distractors = ["A fundamentally different theory.", "An unrelated process step.", "A common misconception."]
            
            if topic.common_mistakes:
                distractors[0] = topic.common_mistakes
                
            if topic.comparison_table and len(topic.comparison_table) > 10:
                # Try to pull some comparison headers or values as distractors
                distractors[1] = "Something related to the comparison table"
                    
            options = [topic.definition] + distractors
            random.shuffle(options)
            correct_idx = options.index(topic.definition)
            
            mcqs.append(MCQ(
                topic_id=topic.id,
                question=f"Which of the following best defines {topic.title}?",
                options=options,
                correct_answer=correct_idx,
                explanation=f"The correct definition is: {topic.definition}"
            ))
            
        return mcqs
