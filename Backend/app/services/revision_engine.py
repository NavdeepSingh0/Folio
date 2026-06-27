from typing import List
from app.models.folio import StudyTopic
from app.models.revision import Flashcard, MCQ, RecallPrompt, CheatSheet
from app.renderers.flashcard_renderer import FlashcardRenderer
from app.renderers.mcq_renderer import MCQRenderer
from app.renderers.recall_renderer import RecallRenderer
from app.renderers.cheatsheet_renderer import CheatSheetRenderer

class RevisionEngine:
    def __init__(self):
        self.flashcard_renderer = FlashcardRenderer()
        self.mcq_renderer = MCQRenderer()
        self.recall_renderer = RecallRenderer()
        self.cheatsheet_renderer = CheatSheetRenderer()
        
    def flashcards(self, topic: StudyTopic) -> List[Flashcard]:
        return self.flashcard_renderer.render(topic)
        
    def mcqs(self, topic: StudyTopic) -> List[MCQ]:
        return self.mcq_renderer.render(topic)
        
    def recall(self, topic: StudyTopic) -> List[RecallPrompt]:
        return self.recall_renderer.render(topic)
        
    def cheatsheet(self, topic: StudyTopic) -> CheatSheet:
        return self.cheatsheet_renderer.render(topic)
