# StudyForge Output Engine — Pipeline Decisions

This document tracks the permanent architectural decisions and production metrics for the StudyForge backend Output Engine.

## Output Engine Architecture
- **Engine Variant**: `TwoPassBatchEngine`
- **Pass 1 (Planning)**: `qwen3` analyzes text and produces a `ConceptOutline` with an `EducationalAnalysis` object mapping the true/false booleans for 11 specific educational traits.
- **Mapping**: Deterministic Python function maps booleans directly to capability requirements, preventing LLM hallucination of field names.
- **Pass 2 (Generation / Fast Pass)**: `qwen3` receives a dynamic JSON schema generated from the requested capabilities. The parser uses `json-repair` to fix syntax errors automatically before Pydantic validation.
- **Pass 3 (Advanced Practice / Lazy Pass)**: `qwen3` generates complex practice objects asynchronously via a daemon thread to prevent HTTP timeouts.
- **Caching & Persistence**: SQLite configured with `journal_mode=WAL` to allow simultaneous reads/writes during background generation.
- **Renderer**: Pure Python functions outputting standard Markdown + Mermaid + GitHub Alerts. (Latex `$` tags stripped prior to render to prevent KaTeX crashes).

## Production Metrics (Slice 10c Validation)
- **Model Used**: `qwen3`
- **Validation Document**: `Uploads/3.1.4.pptx` (19 pages, ~4300 characters)
- **Total Pipeline Execution Time**: ~159.11 seconds
- **Production Throughput**: ~0.01 LearningObjects per second (Heavily I/O and generation bound)
- **Capabilities Verified**:
  - Formulas (LaTeX format, syntax-escaped)
  - Code Examples
  - Algorithm Steps
  - Note/Tip/Warning Callouts
  - Textual Diagram fallback (when Mermaid fails validation)
  - Complex Comparison Tables (Using structured `headers`/`rows` dict mapping)
  - Resilient Advanced Practice (Arrays default to empty if LLM hallucination occurs)

## Primary Educational Entity: Study Topic
- **Date**: 2026-06-27 (Slice 10.6 & 10F)
- **Decision**: The engine considers `StudyTopic` the primary, unfragmented educational entity, wrapping sub-concepts (via `covers` array) instead of generating fragmented `LearningObject`s.
- **Reason**: Students study complete topics (e.g. "Bellman-Ford Algorithm"), not fragmented parts (e.g. studying "Time Complexity" completely disjoint from the algorithm). 
- **Implementation**: `LearningObject` remains the internal Pydantic implementation model to preserve code compatibility, while `StudyTopic` serves as the semantic alias. The Planner now actively outputs unified topics spanning multiple slides, and the Generator processes them holistically into comprehensive Markdown notes.

## Known Quality Limitations (Engine Freeze)
- **Image Ignorance**: The engine cannot currently understand images embedded in slides.
- **Diagram OCR**: The engine cannot OCR diagrams; it relies on text extraction.
- **Comparison Tables**: Generation of comparison tables heavily requires textual source material.
- **Formula Extraction**: Depends entirely on textual representation in the parsed slides.
- **Educational Supplementation**: Relies on the LLM's internal knowledge when source material is sparse.
