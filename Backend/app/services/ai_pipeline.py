import os
import logging
from functools import lru_cache
from typing import List, Dict, Any

from google import genai
from google.genai import types
from pydantic import BaseModel

logger = logging.getLogger(__name__)

# Default to a current GA flash model; override with GEMINI_MODEL in .env
DEFAULT_GEMINI_MODEL = "gemini-2.5-flash"
PLACEHOLDER_KEY = "your_gemini_key_here"
REQUEST_TIMEOUT_MS = 120_000
FACTS_MAX_OUTPUT_TOKENS = 8192
FACTS_INPUT_CHAR_LIMIT = 15000


class AIError(Exception):
    """Base error for AI calls. str(e) is a short, user-safe reason."""


class AINotConfiguredError(AIError):
    """Raised when GEMINI_API_KEY is missing."""


class FactOut(BaseModel):
    concept: str
    description: str
    tags: str


def _api_key() -> str | None:
    key = os.getenv("GEMINI_API_KEY")
    if not key or key == PLACEHOLDER_KEY:
        return None
    return key


def get_model_name() -> str:
    return os.getenv("GEMINI_MODEL") or DEFAULT_GEMINI_MODEL


@lru_cache(maxsize=1)
def _build_client(api_key: str) -> genai.Client:
    return genai.Client(
        api_key=api_key,
        http_options=types.HttpOptions(timeout=REQUEST_TIMEOUT_MS),
    )


def get_client() -> genai.Client:
    """Returns a shared Gemini client, created on first use (not at import)."""
    key = _api_key()
    if not key:
        raise AINotConfiguredError("AI is not configured (GEMINI_API_KEY is not set)")
    return _build_client(key)


def thinking_config(model: str) -> types.ThinkingConfig:
    """Keep thinking off/minimal so it doesn't eat the output token budget."""
    if model.startswith("gemini-2.5"):
        return types.ThinkingConfig(thinking_budget=0)
    return types.ThinkingConfig(thinking_level=types.ThinkingLevel.LOW)


def extract_facts(raw_text: str) -> List[Dict[str, Any]]:
    """Extracts key concepts, definitions, and tags as structured JSON.

    Raises AIError (or a subclass) on any failure; never returns mock data.
    """
    client = get_client()
    model = get_model_name()

    prompt = f"""
    Extract the most important facts, concepts, or definitions from the following text.
    For each one provide:
    - "concept": the term or concept name
    - "description": a clear, concise definition based on the text
    - "tags": a comma-separated list of 1-3 relevant categories

    Raw Text:
    {raw_text[:FACTS_INPUT_CHAR_LIMIT]}
    """

    try:
        response = client.models.generate_content(
            model=model,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=list[FactOut],
                max_output_tokens=FACTS_MAX_OUTPUT_TOKENS,
                thinking_config=thinking_config(model),
            ),
        )
    except Exception as e:
        logger.exception("Gemini fact extraction request failed (model=%s)", model)
        raise AIError("AI service request failed") from e

    parsed = response.parsed
    if not isinstance(parsed, list):
        finish = None
        if response.candidates:
            finish = response.candidates[0].finish_reason
        logger.error("Gemini fact extraction returned no parseable JSON (finish_reason=%s)", finish)
        raise AIError("AI returned an invalid response")

    return [fact.model_dump() for fact in parsed]
