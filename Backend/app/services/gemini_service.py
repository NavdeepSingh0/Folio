import logging
import re
from typing import Any, Dict, Iterator, Optional

import google.genai as genai

logger = logging.getLogger(__name__)

DEFAULT_GEMINI_MODEL = "gemini-2.5-flash"  # use latest Gemini model by default


def _build_client(api_key: Optional[str] = None) -> genai.Client:
    import os
    api_key = api_key or os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    kwargs = {}
    if api_key:
        kwargs["api_key"] = api_key
    return genai.Client(**kwargs)

def _build_openrouter_client(api_key: Optional[str] = None):
    import os
    import openai
    api_key = api_key or os.environ.get("OPENROUTER_API_KEY")
    return openai.OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=api_key,
    )


def _clean_response(response: str) -> str:
    text = response.strip()
    text = re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL)
    if text.startswith("```json"):
        text = text[7:]
    if text.endswith("```"):
        text = text[:-3]
    return text.strip()


def generate_text(
    prompt: str,
    model_name: Optional[str] = None,
    api_key: Optional[str] = None,
    max_output_tokens: int = 1024,
    temperature: float = 0.1,
    **kwargs: Any,
) -> str:
    model_name = model_name or DEFAULT_GEMINI_MODEL
    
    # Handle OpenRouter models
    if "/" in model_name or model_name == "gpt-oss-120b":
        client = _build_openrouter_client(api_key)
        try:
            response = client.chat.completions.create(
                model=model_name,
                messages=[{"role": "user", "content": prompt}],
                temperature=temperature,
                max_tokens=max_output_tokens,
                **kwargs
            )
            return _clean_response(response.choices[0].message.content or "")
        except Exception as exc:
            logger.error(f"OpenRouter text generation failed: {exc}")
            raise
            
    # Default to Gemini
    client = _build_client(api_key)
    if model_name in ["gemini-1.5", "gemini-1.5-flash", "gemini-1.5-pro", "gemini-3.1-pro", "qwen3"]:
        model_name = DEFAULT_GEMINI_MODEL
    try:
        response = client.models.generate_content(
            model=model_name,
            contents=prompt,
            config={
                "temperature": temperature,
                "max_output_tokens": max_output_tokens,
                **kwargs,
            },
        )
        return _clean_response(response.text)
    except Exception as exc:
        logger.error(f"Gemini text generation failed: {exc}")
        raise


def generate_text_stream(
    prompt: str,
    model_name: Optional[str] = None,
    api_key: Optional[str] = None,
    max_output_tokens: int = 1024,
    temperature: float = 0.1,
    **kwargs: Any,
) -> Iterator[str]:
    model_name = model_name or DEFAULT_GEMINI_MODEL
    
    # Handle OpenRouter models
    if "/" in model_name or model_name == "gpt-oss-120b":
        client = _build_openrouter_client(api_key)
        try:
            response_stream = client.chat.completions.create(
                model=model_name,
                messages=[{"role": "user", "content": prompt}],
                temperature=temperature,
                max_tokens=max_output_tokens,
                stream=True,
                **kwargs
            )
            for chunk in response_stream:
                if chunk.choices and chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
            return
        except Exception as exc:
            logger.error(f"OpenRouter streaming generation failed: {exc}")
            raise

    # Default to Gemini
    client = _build_client(api_key)
    if model_name in ["gemini-1.5", "gemini-1.5-flash", "gemini-1.5-pro", "gemini-3.1-pro", "qwen3"]:
        model_name = DEFAULT_GEMINI_MODEL
    try:
        for response in client.models.generate_content_stream(
            model=model_name,
            contents=prompt,
            config={
                "temperature": temperature,
                "max_output_tokens": max_output_tokens,
                **kwargs,
            },
        ):
            yield _clean_response(response.text)
    except Exception as exc:
        logger.error(f"Gemini streaming generation failed: {exc}")
        raise


def generate_json(
    prompt: str,
    model_name: Optional[str] = None,
    api_key: Optional[str] = None,
    max_output_tokens: int = 1024,
    temperature: float = 0.1,
    **kwargs: Any,
) -> str:
    return generate_text(
        prompt=prompt,
        model_name=model_name,
        api_key=api_key,
        max_output_tokens=max_output_tokens,
        temperature=temperature,
        **kwargs,
    )
