# Slice 9 — Document Intelligence

Goal:
Make Folio significantly smarter and faster by improving how documents are
understood before they ever reach the LLM. This slice focuses on preprocessing,
chunking, markdown imports, and generation performance.

Estimated time:
8–10 hrs

Risk:
MEDIUM

Screens involved:
- Upload Workspace
- Generation Pipeline
- Project Workspace
- Settings

---

## User Problem

Large documents contain a lot of noise.

Examples:

- Title slides
- Agenda pages
- "Thank You" slides
- Blank slides
- Duplicate headers
- Duplicate footers
- Repeated university logos
- Slide numbers
- Navigation pages

Sending this directly to the LLM wastes context, increases latency, and
reduces output quality.

Additionally, users should be able to bring their own Markdown notes into
Folio without regenerating them.

---

## Build

### 1. Intelligent Preprocessing

Before chunking, clean the extracted content.

Automatically detect and remove:

- Blank pages
- Thank You slides
- Agenda slides
- Table of contents pages
- Repeated headers
- Repeated footers
- Page numbers
- Duplicate logos/text blocks

Preserve:

- Headings
- Lists
- Tables
- Code blocks
- Mermaid diagrams
- Mathematical notation

---

### 2. Better Chunking

Replace fixed chunking with structure-aware chunking.

Priority:

Heading

↓

Section

↓

Paragraph

↓

Sentence

Rules

Never split

- Code blocks
- Tables
- Bullet lists
- Mermaid diagrams

Prefer chunks that align with document structure rather than token counts.

---

### 3. Markdown Import

Users can import existing Markdown files.

Supported:

.md

Imported files become normal Folio documents.

The system must

- Parse metadata
- Index headings
- Extract title
- Create project entry

No LLM generation required.

---

### 4. Smart Document Detection

Automatically classify imported documents.

Examples

Programming

Theory

Research

Notes

Cheat Sheet

Reference

Store this classification for future output profiles.

---

### 5. Incremental Processing

When a document changes

Do NOT regenerate everything.

Only reprocess modified sections.

---

### 6. Performance Optimizations

Implement

- Cached preprocessing
- Cached parsed document structure
- Cached embeddings
- Lazy markdown rendering
- Smarter streaming
- Background indexing

Generation should begin before every optimization finishes.

---

### 7. Pipeline Metrics

Track internally

Extraction time

Preprocessing time

Chunking time

LLM generation time

Streaming duration

Total processing time

Display these in Project Info.

Example

Extraction:
0.8 sec

Preprocessing:
0.4 sec

Chunking:
0.2 sec

LLM:
13.6 sec

Total:
15.0 sec

---

### 8. Architecture

Create a dedicated preprocessing pipeline.

Extract

↓

Clean

↓

Classify

↓

Chunk

↓

Cache

↓

Generate

↓

Save

Each stage should be independently testable.

---

Definition of Done

✓ Large documents generate faster

✓ Noise is automatically removed

✓ Markdown files can be imported

✓ Cached processing reduces repeated work

✓ Processing metrics are visible

✓ Pipeline stages are modular

---

Fallback

If incremental processing exceeds the time budget,

Fall back to regenerating the entire document while keeping preprocessing
and caching intact.