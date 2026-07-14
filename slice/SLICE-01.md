# Slice 1 — Core Generation Pipeline

## Goal

Implement the first vertical slice of StudyForge.

This slice proves that the core product works end-to-end.

Do **not** build future slices.

Do **not** add extra features.

---

## Slice Scope

Screens involved:

* Welcome / Upload Workspace
* Document Processing & Configuration
* Generated Study Notes Preview

---

## User Flow

1. User opens the application.
2. User uploads a PDF.
3. User selects a note style.
4. User clicks **Generate**.
5. Backend extracts text from the PDF.
6. Backend sends the extracted content to the local Ollama model.
7. Ollama returns structured Markdown.
8. Frontend displays the Markdown preview.
9. User downloads the Markdown file.

---

## Backend Responsibilities

Implement only the APIs required for this slice.

Suggested endpoints:

* POST `/upload`
* POST `/generate`
* GET `/download`

Backend services:

* PDF extraction using PyMuPDF
* Markdown generation through Ollama
* Temporary file handling
* Markdown export

---

## Frontend Responsibilities

Implement only the screens required for this slice.

Required components:

* File Upload
* Note Style Selector
* Generate Button
* Progress Indicator
* Markdown Preview
* Download Button

Follow the design system defined in AGENTS.md.

---

## Out of Scope

Do NOT implement:

* PPTX support
* DOCX support
* User accounts
* Authentication
* Database history
* Recent projects
* Settings persistence
* Multiple models
* Flashcards
* Quiz generation
* Mermaid diagrams
* Search

These belong to future slices.

---

## Definition of Done

This slice is complete only when:

* PDF upload works.
* Text extraction works.
* Ollama receives the extracted content.
* Markdown is generated.
* Markdown preview renders.
* Markdown downloads successfully.
* Errors are handled gracefully.
* No placeholder or mock data remains.

---

## Risk Level

HIGH

---

## Fallback Plan

If the implementation exceeds the allocated time:

* Support PDF only.
* Use one hardcoded note template.
* Disable advanced formatting.
* Ship the complete end-to-end flow.

A working vertical slice is more important than feature completeness.

---

## Constraints

* Follow AGENTS.md exactly.
* Follow the established folder structure.
* Follow naming conventions.
* Do not modify Human Gated files.
* Do not begin Slice 2.
* If architectural uncertainty arises, stop and ask.
* When the Definition of Done is satisfied, stop immediately.

---

## Completion

When this slice is complete:

1. Append an entry to CONTEXT-LOG.md.
2. Report any deviations from the original plan.
3. State:

**Commit point reached — Slice 1 complete.**

Do not continue to Slice 2.
