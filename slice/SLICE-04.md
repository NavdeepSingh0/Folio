# Slice 4 — Intelligent Document Understanding

## Goal

Move beyond treating documents as plain text.

StudyForge should begin understanding the structure of academic material so that generated notes become significantly higher quality.

This slice improves document intelligence only.

Do not redesign the UI.

---

## Screens

- Processing Workspace
- Markdown Preview

(No new screens.)

---

## User Flow

1. User uploads PDF/PPTX.
2. Document is analyzed.
3. Structural elements are detected.
4. Extraction preserves hierarchy.
5. Notes are generated using the enriched structure.

---

# Feature 1 — Heading Detection

Instead of:

Chapter 1

Database Systems

Introduction

Random paragraphs...

Detect

# Database Systems

## Introduction

Automatically.

---

# Feature 2 — Lists

Convert

• Bullet lists

• Numbered lists

into proper Markdown.

---

# Feature 3 — Tables

Detect tables.

Generate Markdown tables.

If impossible,

summarize table contents.

Never output broken formatting.

---

# Feature 4 — Images

Instead of ignoring figures,

insert placeholders.

Example

[Figure: RAID Architecture]

or

[Diagram explaining Striping]

This gives context during revision.

---

# Feature 5 — Important Box Detection

Detect

Examples

Definition

Example

Important

Warning

Note

Tip

Convert to

> Definition

> Important

etc.

---

# Feature 6 — Quiz Detection

Many lecture slides end with

Quiz

Discussion

Think

Questions

Convert these into

## Self Test

instead of copying verbatim.

---

# Feature 7 — References

Collect all references into

## Further Reading

instead of scattering them.

---

# Backend

Implement

document_structure_service.py

Responsibilities

- Heading detection

- Table detection

- List detection

- Figure placeholder generation

- Metadata extraction

---

# Output Pipeline

PDF/PPT

↓

Extraction

↓

Structure Analysis

↓

Chunking

↓

Prompt

↓

Ollama

↓

Markdown

---

# Out of Scope

OCR

Image caption generation

Vision models

Semantic search

Knowledge graph

---

# Definition of Done

✓ Headings preserved

✓ Lists preserved

✓ Tables preserved

✓ Figures represented

✓ References grouped

✓ Quiz slides converted

✓ Existing generation unaffected

---

Risk

MEDIUM

Estimated Time

3 hrs

---

Fallback

If automatic table parsing fails,

summarize the table instead of reproducing it.

Never output malformed Markdown.

---

Completion

Append CONTEXT-LOG.

Report architectural decisions.

State

Commit point reached — Slice 4 complete.