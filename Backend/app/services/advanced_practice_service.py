import json
import logging
from typing import Callable, Any
from langchain_ollama import OllamaLLM
from langchain_core.prompts import PromptTemplate
from app.models.folio import StudyTopic
from app.models.advanced_practice import (
    AdvancedPractice, AdvancedPracticeStatus,
    ConceptualQuestion, ComparisonQuestion, ScenarioQuestion,
    VivaQuestion, CodingChallenge, ExamPrediction
)
from app.prompts.advanced_practice_prompt import UNDERSTANDING_PROMPT, APPLICATION_PROMPT, ASSESSMENT_PROMPT
import json_repair

logger = logging.getLogger(__name__)

class AdvancedPracticeService:
    def __init__(self, model_name: str = "qwen3"):
        self.llm = OllamaLLM(model=model_name, format="json", temperature=0.2, num_ctx=4096, keep_alive=-1)

    def _invoke_llm(self, prompt: str, schema: str, topic_json: str) -> dict:
        template = PromptTemplate.from_template(prompt + "\n\nSTUDY TOPIC:\n{topic_json}\n\nReturn a valid JSON object matching this schema:\n" + schema)
        chain = template | self.llm
        try:
            res = chain.invoke({"topic_json": topic_json})
            if res.startswith("```json"):
                res = res[7:]
                if res.endswith("```"):
                    res = res[:-3]
            res = res.strip()
            return json_repair.loads(res)
        except Exception as e:
            logger.error(f"LLM generation failed: {e}")
            return {}

    def generate_practice(self, topic: StudyTopic, update_callback: Callable[[AdvancedPractice], None] = None) -> AdvancedPractice:
        practice = AdvancedPractice()
        topic_json = topic.model_dump_json(exclude={"content_hash", "created_at", "updated_at", "keywords", "source_slides"})
        count = 3 if len(topic.source_slides) > 2 else 1

        # 1. Understanding Pass
        understanding_schema = """
{{
  "conceptual_questions": [
    {{"question": "...", "answer": "...", "difficulty": "MEDIUM", "tags": ["tag1"]}}
  ],
  "comparison_questions": [
    {{"question": "...", "answer": "...", "difficulty": "HARD", "tags": ["tag1"]}}
  ]
}}
"""
        logger.info("Generating Understanding Practice...")
        try:
            und_data = self._invoke_llm(UNDERSTANDING_PROMPT.format(count=count), understanding_schema, topic_json)
            if "conceptual_questions" in und_data: 
                practice.conceptual_questions = [ConceptualQuestion(**q) for q in und_data["conceptual_questions"] if isinstance(q, dict)]
            if "comparison_questions" in und_data: 
                practice.comparison_questions = [ComparisonQuestion(**q) for q in und_data["comparison_questions"] if isinstance(q, dict)]
        except Exception as e:
            logger.error(f"Understanding pass failed: {e}")
            
        practice.status.understanding_complete = True
        if update_callback: update_callback(practice)

        # 2. Application Pass
        application_schema = """
{{
  "scenario_questions": [
    {{"scenario": "...", "expected_answer": "...", "difficulty": "MEDIUM", "tags": ["tag1"]}}
  ],
  "viva_questions": [
    {{"question": "...", "model_answer": "...", "difficulty": "HARD", "tags": ["tag1"]}}
  ]
}}
"""
        logger.info("Generating Application Practice...")
        try:
            app_data = self._invoke_llm(APPLICATION_PROMPT.format(count=count), application_schema, topic_json)
            if "scenario_questions" in app_data: 
                practice.scenario_questions = [ScenarioQuestion(**q) for q in app_data["scenario_questions"] if isinstance(q, dict)]
            if "viva_questions" in app_data: 
                practice.viva_questions = [VivaQuestion(**q) for q in app_data["viva_questions"] if isinstance(q, dict)]
        except Exception as e:
            logger.error(f"Application pass failed: {e}")
            
        practice.status.application_complete = True
        if update_callback: update_callback(practice)

        # 3. Assessment Pass
        assessment_schema = """
{{
  "coding_challenges": [
    {{"prompt": "...", "expected_topics": ["topic1"], "difficulty": "HARD", "tags": ["tag1"]}}
  ],
  "exam_predictions": [
    {{"marks": 10, "question": "...", "marking_scheme": ["1 mark for X"], "difficulty": "HARD", "tags": ["tag1"]}}
  ]
}}
"""
        logger.info("Generating Assessment Practice...")
        try:
            ass_data = self._invoke_llm(ASSESSMENT_PROMPT.format(count=count), assessment_schema, topic_json)
            if "coding_challenges" in ass_data: 
                practice.coding_challenges = [CodingChallenge(**q) for q in ass_data["coding_challenges"] if isinstance(q, dict)]
            if "exam_predictions" in ass_data: 
                practice.exam_predictions = [ExamPrediction(**q) for q in ass_data["exam_predictions"] if isinstance(q, dict)]
        except Exception as e:
            logger.error(f"Assessment pass failed: {e}")
            
        practice.status.assessment_complete = True
        if update_callback: update_callback(practice)

        return practice
