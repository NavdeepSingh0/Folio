# Slice 2 — Intelligent Note Generation

## Goal

Transform the basic document-to-Markdown pipeline into a configurable study note generator.

The objective of this slice is to improve the quality of generated notes rather than adding unrelated features.

Do **not** implement future workspace features.

---

## Slice Scope

Screens involved:

* Document Processing & Configuration
* Generated Study Notes Preview

---

## User Flow

1. User uploads a PDF or PPTX.
2. User selects a study style.
3. User optionally enters custom instructions.
4. User clicks **Generate**.
5. Backend builds a structured prompt based on the selected style.
6. Ollama generates notes using the selected prompt template.
7. Notes are displayed in the preview.

---

## Backend Responsibilities

Implement:

* Prompt template system
* Multiple study styles
* Prompt builder service
* Better document chunking before sending to Ollama
* Configurable generation parameters

Suggested services:

* `prompt_service.py`
* `chunking_service.py`

---

## Frontend Responsibilities

Implement:

* Study Style selector
* Custom Instructions textbox
* Generation settings panel
* Improved loading state
* Better markdown preview formatting

---

## Study Styles

Support the following templates:

* University Notes
* Beginner Friendly
* Revision Notes
* Cheat Sheet
* Interview Preparation

Each style should generate a different prompt while using the same extracted document.

---

## Out of Scope

Do NOT implement:

* Authentication
* Project history
* OCR
* Flashcards
* Quiz generation
* Search
* Multiple Ollama models
* Database persistence

---

## Definition of Done

This slice is complete only when:

* Users can choose a study style.
* Different styles produce noticeably different outputs.
* Prompt generation is modular and reusable.
* Long documents are chunked appropriately before generation.
* Custom instructions influence the output.
* Markdown preview correctly renders all generated formats.
* Users have the option to delete a workspace or file.

---

## Risk Level

MEDIUM

---

## Fallback Plan

If prompt templating becomes too complex:

* Keep five predefined prompt templates.
* Skip advanced chunk merging.
* Process the document as a single context if it fits within the selected model's limits.

---

## Constraints

* Follow AGENTS.md.
* Preserve Slice 1 functionality.
* Do not refactor working code unless necessary.
* Do not introduce unnecessary abstractions.
* Keep prompt templates separated from business logic.

---

## Completion

When this slice is complete:

1. Append an entry to CONTEXT-LOG.md.
2. Report any architectural decisions.
3. State:

**Commit point reached — Slice 2 complete.**
