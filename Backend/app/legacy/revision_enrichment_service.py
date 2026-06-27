import json
import logging
from typing import List
from langchain_ollama import OllamaLLM
from langchain_core.prompts import PromptTemplate
from app.models.folio import StudyTopic
import re
from app.models.revision import Flashcard, MCQ, RecallPrompt
from app.prompts.revision_prompts import ENHANCE_FLASHCARDS_PROMPT, ENHANCE_MCQS_PROMPT, ENHANCE_RECALL_PROMPT

logger = logging.getLogger(__name__)

class RevisionEnrichmentService:
    def __init__(self, model_name: str = "qwen3"):
        self.llm = OllamaLLM(model=model_name, format="json", temperature=0.3, keep_alive=-1)

    def enhance_flashcards(self, topic: StudyTopic, base_flashcards: List[Flashcard]) -> List[Flashcard]:
        prompt = """
{system_prompt}

STUDY TOPIC:
{topic_json}

BASE FLASHCARDS:
{base_json}

Return a valid JSON object matching this schema:
{{
  "flashcards": [
    {{
      "id": "uuid string",
      "topic_id": "{topic_id}",
      "front": "question",
      "back": "answer",
      "difficulty": "medium",
      "tags": ["tag1", "tag2"]
    }}
  ]
}}
"""
        template = PromptTemplate.from_template(prompt)
        chain = template | self.llm
        
        try:
            res = chain.invoke({
                "system_prompt": ENHANCE_FLASHCARDS_PROMPT,
                "topic_json": topic.model_dump_json(exclude={"content_hash", "created_at", "updated_at", "keywords", "source_slides"}),
                "base_json": json.dumps([fc.model_dump() for fc in base_flashcards]),
                "topic_id": topic.id
            })
            
            # Strip markdown if present
            if res.startswith("```json"):
                res = res[7:]
                if res.endswith("```"):
                    res = res[:-3]
            res = res.strip()
            
            data = json.loads(res)
            enhanced = [Flashcard(**fc) for fc in data.get("flashcards", [])]
            return enhanced if enhanced else base_flashcards
        except Exception as e:
            logger.error(f"Failed to enhance flashcards: {e}")
            return base_flashcards

    def enhance_mcqs(self, topic: StudyTopic, base_mcqs: List[MCQ]) -> List[MCQ]:
        prompt = """
{system_prompt}

STUDY TOPIC:
{topic_json}

BASE MCQS:
{base_json}

Return a valid JSON object matching this schema:
{{
  "mcqs": [
    {{
      "id": "uuid string",
      "topic_id": "{topic_id}",
      "question": "question text",
      "options": ["opt1", "opt2", "opt3", "opt4"],
      "correct_answer": 0,
      "explanation": "Why this is correct"
    }}
  ]
}}
"""
        template = PromptTemplate.from_template(prompt)
        chain = template | self.llm
        
        try:
            res = chain.invoke({
                "system_prompt": ENHANCE_MCQS_PROMPT,
                "topic_json": topic.model_dump_json(exclude={"content_hash", "created_at", "updated_at", "keywords", "source_slides"}),
                "base_json": json.dumps([mcq.model_dump() for mcq in base_mcqs]),
                "topic_id": topic.id
            })
            
            if res.startswith("```json"):
                res = res[7:]
                if res.endswith("```"):
                    res = res[:-3]
            res = res.strip()
            
            data = json.loads(res)
            enhanced = [MCQ(**mcq) for mcq in data.get("mcqs", [])]
            return enhanced if enhanced else base_mcqs
        except Exception as e:
            logger.error(f"Failed to enhance MCQs: {e}")
            return base_mcqs

    def enhance_recall_prompts(self, topic: StudyTopic, base_prompts: List[RecallPrompt]) -> List[RecallPrompt]:
        prompt = """
{system_prompt}

STUDY TOPIC:
{topic_json}

BASE PROMPTS:
{base_json}

Return a valid JSON object matching this schema:
{{
  "prompts": [
    {{
      "id": "uuid string",
      "topic_id": "{topic_id}",
      "prompt": "scenario prompt text",
      "expected_points": ["point 1", "point 2"]
    }}
  ]
}}
"""
        template = PromptTemplate.from_template(prompt)
        chain = template | self.llm
        
        try:
            res = chain.invoke({
                "system_prompt": ENHANCE_RECALL_PROMPT,
                "topic_json": topic.model_dump_json(exclude={"content_hash", "created_at", "updated_at", "keywords", "source_slides"}),
                "base_json": json.dumps([p.model_dump() for p in base_prompts]),
                "topic_id": topic.id
            })
            
            if res.startswith("```json"):
                res = res[7:]
                if res.endswith("```"):
                    res = res[:-3]
            res = res.strip()
            
            data = json.loads(res)
            enhanced = [RecallPrompt(**p) for p in data.get("prompts", [])]
            return enhanced if enhanced else base_prompts
        except Exception as e:
            logger.error(f"Failed to enhance recall prompts: {e}")
            return base_prompts
