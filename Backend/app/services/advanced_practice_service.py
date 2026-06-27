import json
import logging
from langchain_ollama import OllamaLLM
from langchain_core.prompts import PromptTemplate
from app.models.folio import StudyTopic
from app.models.advanced_practice import AdvancedPractice
from app.prompts.advanced_practice_prompt import ADVANCED_PRACTICE_PROMPT

logger = logging.getLogger(__name__)

class AdvancedPracticeService:
    def __init__(self, model_name: str = "qwen3"):
        self.llm = OllamaLLM(model=model_name, format="json", temperature=0.4, keep_alive=-1)

    def generate_practice(self, topic: StudyTopic) -> AdvancedPractice:
        prompt = """
{system_prompt}

STUDY TOPIC:
{topic_json}

Return a valid JSON object matching this schema:
{{
  "conceptual_questions": [
    {{"question": "...", "answer": "...", "difficulty": "MEDIUM", "tags": ["tag1"]}}
  ],
  "comparison_questions": [
    {{"question": "...", "answer": "...", "difficulty": "HARD", "tags": ["tag1"]}}
  ],
  "scenario_questions": [
    {{"scenario": "...", "expected_answer": "...", "difficulty": "MEDIUM", "tags": ["tag1"]}}
  ],
  "viva_questions": [
    {{"question": "...", "model_answer": "...", "difficulty": "HARD", "tags": ["tag1"]}}
  ],
  "coding_challenges": [
    {{"prompt": "...", "expected_topics": ["topic1"], "difficulty": "HARD", "tags": ["tag1"]}}
  ],
  "exam_predictions": [
    {{"marks": 10, "question": "...", "marking_scheme": ["1 mark for X"], "difficulty": "HARD", "tags": ["tag1"]}}
  ]
}}
"""
        template = PromptTemplate.from_template(prompt)
        chain = template | self.llm
        
        try:
            res = chain.invoke({
                "system_prompt": ADVANCED_PRACTICE_PROMPT,
                "topic_json": topic.model_dump_json(exclude={"content_hash", "created_at", "updated_at", "keywords", "source_slides"})
            })
            
            # Strip markdown if present
            if res.startswith("```json"):
                res = res[7:]
                if res.endswith("```"):
                    res = res[:-3]
            res = res.strip()
            
            data = json.loads(res)
            return AdvancedPractice(**data)
        except Exception as e:
            logger.error(f"Failed to generate advanced practice: {e}")
            # Return empty practice if fails
            return AdvancedPractice(
                conceptual_questions=[],
                comparison_questions=[],
                scenario_questions=[],
                viva_questions=[],
                coding_challenges=[],
                exam_predictions=[]
            )
