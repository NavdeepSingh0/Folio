import os
import re
import logging
import threading
from typing import List, Dict, Any, Optional

import httpx
from json_repair import repair_json
from pydantic import BaseModel, ValidationError

logger = logging.getLogger(__name__)

# NVIDIA's hosted API is OpenAI-compatible. Override any of these in .env.
DEFAULT_NVIDIA_MODEL = "nvidia/nemotron-3-ultra-550b-a55b"
DEFAULT_NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1"
PLACEHOLDER_KEY = "your_nvidia_key_here"
REQUEST_TIMEOUT_SECONDS = 120
FACTS_MAX_OUTPUT_TOKENS = 8192
FACTS_INPUT_CHAR_LIMIT = 15000
CHAT_DOC_CHAR_LIMIT = 60_000
CHAT_HISTORY_TURNS = 20

_MD_DATA_IMAGE_RE = re.compile(r"!\[[^\]]*\]\(\s*data:[^)]*\)", re.IGNORECASE)
_HTML_DATA_IMAGE_RE = re.compile(r"<img\b[^>]*\bsrc\s*=\s*[\"']?data:[^>]*>", re.IGNORECASE)


def strip_data_uris(md: str) -> str:
    """Replaces inline base64 images (markdown or <img>) with a short placeholder."""
    md = _MD_DATA_IMAGE_RE.sub("[image]", md)
    return _HTML_DATA_IMAGE_RE.sub("[image]", md)


def build_chat_system_instruction(document_md: str) -> str:
    """Builds the chat system instruction from a document, without inline images and capped in size."""
    doc = strip_data_uris(document_md)
    if len(doc) > CHAT_DOC_CHAR_LIMIT:
        doc = doc[:CHAT_DOC_CHAR_LIMIT] + "\n\n[Document truncated]"
    return (
        "You are a helpful study assistant. The user is currently reading this document:"
        f"\n\n---\n{doc}\n---\n\nAnswer all questions based heavily on this document."
    )


class AIError(Exception):
    """Base error for AI calls. str(e) is a short, user-safe reason."""


class AINotConfiguredError(AIError):
    """Raised when NVIDIA_API_KEY is missing."""


class FactOut(BaseModel):
    concept: str
    description: str
    tags: str


def _api_key() -> Optional[str]:
    key = os.getenv("NVIDIA_API_KEY")
    if not key or key == PLACEHOLDER_KEY:
        return None
    return key


def get_model_name() -> str:
    return os.getenv("NVIDIA_MODEL") or DEFAULT_NVIDIA_MODEL


def _base_url() -> str:
    return (os.getenv("NVIDIA_BASE_URL") or DEFAULT_NVIDIA_BASE_URL).rstrip("/")


_client: Optional[httpx.Client] = None
_client_lock = threading.Lock()


def get_client() -> httpx.Client:
    """Returns a shared HTTP client, created on first use (not at import).

    Raises AINotConfiguredError if NVIDIA_API_KEY is not set.
    """
    global _client
    key = _api_key()
    if not key:
        raise AINotConfiguredError("AI is not configured (NVIDIA_API_KEY is not set)")
    with _client_lock:
        if _client is None:
            _client = httpx.Client(
                base_url=_base_url(),
                headers={"Authorization": f"Bearer {key}"},
                timeout=httpx.Timeout(REQUEST_TIMEOUT_SECONDS, connect=10),
            )
        return _client


def chat_completion(
    messages: List[Dict[str, Any]],
    max_tokens: int,
    temperature: float = 0.3,
) -> str:
    """Sends an OpenAI-style chat completion and returns the reply text.

    Thinking is switched off: this model's reasoning tokens count against
    max_tokens and would otherwise eat the output budget. Raises AIError
    (str(e) is user-safe) on any failure; never returns an empty string.
    """
    client = get_client()
    model = get_model_name()
    payload = {
        "model": model,
        "messages": messages,
        "max_tokens": max_tokens,
        "temperature": temperature,
        "chat_template_kwargs": {"enable_thinking": False},
    }

    try:
        response = client.post("/chat/completions", json=payload)
        response.raise_for_status()
        data = response.json()
    except httpx.HTTPStatusError as e:
        logger.error("NVIDIA request failed (model=%s): HTTP %s %s", model, e.response.status_code, e.response.text[:300])
        if e.response.status_code in (401, 403):
            raise AIError("AI service rejected the API key") from e
        if e.response.status_code == 429:
            raise AIError("AI service is rate limited, try again shortly") from e
        raise AIError("AI service request failed") from e
    except (httpx.HTTPError, ValueError) as e:
        logger.exception("NVIDIA request failed (model=%s)", model)
        raise AIError("AI service request failed") from e

    try:
        choice = data["choices"][0]
        text = (choice["message"].get("content") or "").strip()
    except (KeyError, IndexError, TypeError, AttributeError) as e:
        logger.error("NVIDIA returned an unexpected response shape (model=%s)", model)
        raise AIError("AI returned an invalid response") from e

    if not text:
        logger.error("NVIDIA returned empty content (model=%s, finish_reason=%s)", model, choice.get("finish_reason"))
        raise AIError("AI returned an empty response")
    return text


def extract_facts(raw_text: str) -> List[Dict[str, Any]]:
    """Extracts key concepts, definitions, and tags as structured JSON.

    Raises AIError (or a subclass) on any failure; never returns mock data.
    """
    prompt = f"""Extract the most important facts, concepts, or definitions from the following text.
Return ONLY a JSON array, with no prose and no code fences. Each element must be an object with:
- "concept": the term or concept name
- "description": a clear, concise definition based on the text
- "tags": a comma-separated string of 1-3 relevant categories

Raw Text:
{raw_text[:FACTS_INPUT_CHAR_LIMIT]}
"""
    reply = chat_completion(
        [{"role": "user", "content": prompt}],
        max_tokens=FACTS_MAX_OUTPUT_TOKENS,
        temperature=0.1,
    )

    # repair_json tolerates code fences and minor syntax slips from the model
    try:
        parsed = repair_json(reply, return_objects=True)
    except Exception as e:
        logger.error("Fact extraction reply could not be parsed")
        raise AIError("AI returned an invalid response") from e

    # Some replies wrap the array, e.g. {"facts": [...]}
    if isinstance(parsed, dict):
        parsed = next((v for v in parsed.values() if isinstance(v, list)), None)
    if not isinstance(parsed, list):
        logger.error("Fact extraction returned no JSON array")
        raise AIError("AI returned an invalid response")

    facts: List[Dict[str, Any]] = []
    for item in parsed:
        if isinstance(item, dict) and isinstance(item.get("tags"), list):
            item = {**item, "tags": ", ".join(str(t) for t in item["tags"])}
        try:
            facts.append(FactOut.model_validate(item).model_dump())
        except ValidationError:
            continue  # skip malformed entries instead of failing the whole upload
    if not facts:
        raise AIError("AI returned no usable facts")
    return facts
