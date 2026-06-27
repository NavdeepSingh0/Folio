# StudyForge Output Engine — Pipeline Decisions

This document tracks the permanent architectural decisions and production metrics for the StudyForge backend Output Engine.

## Output Engine Architecture
- **Engine Variant**: `TwoPassBatchEngine`
- **Pass 1 (Planning)**: `qwen3` analyzes text and produces a `ConceptOutline` with an `EducationalAnalysis` object mapping the true/false booleans for 11 specific educational traits.
- **Mapping**: Deterministic Python function maps booleans directly to capability requirements, preventing LLM hallucination of field names.
- **Pass 2 (Generation)**: `qwen3` receives a dynamic JSON schema generated from the requested capabilities. The parser accepts all 11 optional capabilities.
- **Caching**: Dynamic SQLite Cache (`learning_object_cache`) keyed by `content_hash`.
- **Renderer**: Pure Python functions outputting standard Markdown + Mermaid + GitHub Alerts.

## Production Metrics (Slice 10c Validation)
- **Model Used**: `qwen3`
- **Validation Document**: `Uploads/3.1.4.pptx` (19 pages, ~4300 characters)
- **Total Pipeline Execution Time**: ~159.11 seconds
- **Production Throughput**: ~0.01 LearningObjects per second (Heavily I/O and generation bound)
- **Capabilities Verified**:
  - Formulas (LaTeX format)
  - Code Examples
  - Algorithm Steps
  - Note/Tip/Warning Callouts
  - Textual Diagram fallback (when Mermaid fails validation)
