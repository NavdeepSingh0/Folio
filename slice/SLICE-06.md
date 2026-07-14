# Slice 6 — Hierarchical Knowledge Context & Revision Workspace

## Goal

Introduce hierarchical context into Folio.

AI operations should no longer operate on arbitrary files.

Instead, every AI request must execute within an explicitly selected scope of the workspace hierarchy.

This slice establishes the foundation for every future multi-document AI capability.

---

## Core Architecture

The workspace hierarchy is:

Workspace

↓

Collection (Subject / Project)

↓

Unit / Folder

↓

Chapter / Subfolder

↓

Markdown Files

Every node in this hierarchy is a valid AI context.

Context is never inferred.

Context is always explicitly selected.

---

## Context Scopes

Every AI action must allow one of the following scopes:

• Current File

• Current Chapter

• Current Unit

• Entire Collection

• Custom Selection

No global search.

No cross-collection context.

---

## User Flow

Example 1

Workspace

Academic

↓

Operating Systems

↓

Unit 1

↓

Chapter 2

↓

Generate Questions

↓

Only files inside Chapter 2 are used.

---

Example 2

Operating Systems

↓

Entire Subject

↓

Generate Mind Map

↓

All Units participate.

---

Example 3

Resume

↓

Generate Interview Questions

↓

Only Resume files participate.

No academic notes are loaded.

---

## Revision Workspace

Create a dedicated Revision Workspace.

Users select

Current Chapter

Current Unit

Entire Collection

or

Custom Selection

Then choose one revision artifact.

---

## Revision Tools

### Revision Sheet

Compress selected notes into concise revision notes.

---

### Markdown Mind Map

Generate a hierarchical markdown mind map.

Readable directly in Markdown.

Future slices may export this into Mermaid.

---

### Cheat Sheet

One-page revision sheet.

Definitions.

Keywords.

Formulas.

No long explanations.

---

### Expected Questions

Generate

• 2 Marks

• 5 Marks

• Long Answer

Questions.

---

### Last Minute Revision

Maximum two markdown pages.

Readable within 10 minutes.

Designed for mobile reading.

---

## Backend

Implement

context_service.py

Responsibilities

• Resolve hierarchy

• Collect markdown files within selected scope

• Respect workspace boundaries

• Build context package

---

Implement

revision_service.py

Responsibilities

• Generate Revision Sheet

• Generate Mind Map

• Generate Cheat Sheet

• Generate Expected Questions

• Generate Last Minute Revision

---

## Database

Introduce hierarchy tables.

collections

units

chapters

projects

Each project belongs to exactly one chapter.

Each chapter belongs to one unit.

Each unit belongs to one collection.

Future hierarchy expansion should not require changing AI logic.

---

## Frontend

Revision Workspace

Sidebar

Current Scope

○ Current File

○ Current Chapter

○ Current Unit

○ Entire Collection

○ Custom Selection

Revision Tool

Revision Sheet

Mind Map

Cheat Sheet

Expected Questions

Last Minute Revision

Generate

---

## Context Rules

The AI receives only documents inside the selected scope.

Never search outside the selected Collection.

Never mix Resume with Academic.

Never mix different subjects.

The selected scope is the complete context boundary.

---

## Out of Scope

Vector Database

Embeddings

Knowledge Graph

Semantic Search

Internet Search

Automatic related-document discovery

Cross-workspace context

---

## Definition of Done

✓ Hierarchical workspace implemented

✓ AI respects selected scope

✓ Revision Workspace completed

✓ Revision Sheet works

✓ Mind Map works

✓ Cheat Sheet works

✓ Expected Questions work

✓ Last Minute Revision works

✓ Existing Study Assistant remains functional

---

## Risk

Medium

Estimated Time

3–4 hours

---

## Fallback

If hierarchy migration becomes too large:

Use folder-based hierarchy only.

Resolve context directly from folder structure.

Database normalization may be completed in a later slice.

---

## Architectural Principle

Hierarchy defines context.

AI never decides what documents are relevant.

The user selects the context scope, and the hierarchy determines exactly which documents are included.

This rule applies to every future AI feature inside Folio.

---

## Completion

Append to CONTEXT-LOG.md.

Document any architectural decisions.

State:

Commit point reached — Slice 6 complete.
