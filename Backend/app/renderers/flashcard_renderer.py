from typing import List
from app.models.folio import StudyTopic
from app.models.revision import Flashcard

class FlashcardRenderer:
    def render(self, topic: StudyTopic) -> List[Flashcard]:
        cards = []
        
        # 1. Definition card
        if topic.definition:
            cards.append(Flashcard(
                topic_id=topic.id,
                front=f"What is {topic.title}?",
                back=topic.definition,
                tags=["definition"]
            ))
            
        # 2. Algorithm Steps card
        if topic.algorithm_steps:
            steps_str = "\n".join([f"{i+1}. {step}" for i, step in enumerate(topic.algorithm_steps)])
            cards.append(Flashcard(
                topic_id=topic.id,
                front=f"What are the steps of {topic.title}?",
                back=steps_str,
                tags=["algorithm"]
            ))
            
        # 3. Memory Trick card
        if topic.memory_trick:
            cards.append(Flashcard(
                topic_id=topic.id,
                front=f"How can you remember {topic.title}?",
                back=topic.memory_trick,
                tags=["memory"]
            ))
            
        # 4. Common Mistakes card
        if topic.common_mistakes:
            cards.append(Flashcard(
                topic_id=topic.id,
                front=f"What is a common mistake regarding {topic.title}?",
                back=topic.common_mistakes,
                tags=["mistakes"]
            ))
            
        # 5. Exam Tip card
        if topic.exam_tip:
            cards.append(Flashcard(
                topic_id=topic.id,
                front=f"What is an important exam tip for {topic.title}?",
                back=topic.exam_tip,
                tags=["exam_tip"]
            ))
            
        return cards
