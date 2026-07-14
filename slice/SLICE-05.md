# Slice 5 — AI Study Assistant

## Goal

Transform generated notes into an active study companion.

This slice focuses on helping students revise, memorize, and prepare for exams using the generated Markdown.

Do NOT modify the document generation pipeline.

---

## Screens

- Study Assistant
- Markdown Preview
- Revision Panel

---

## User Flow

1. User generates notes.
2. User opens Study Assistant.
3. Assistant analyzes the Markdown.
4. Student chooses a study tool.
5. Results are generated locally using Ollama.

---

## Feature 1 — Flashcards

Generate question-answer flashcards from the notes.

Example

Q:
What is RAID 5?

A:
Striping with distributed parity.

---

## Feature 2 — Practice Questions

Generate

• MCQs

• Short answer

• Long answer

Questions.

Difficulty

Easy

Medium

Hard

---

## Feature 3 — Key Concepts

Extract

Top 10 concepts

Definitions

Keywords

---

## Feature 4 — Formula Sheet

If formulas exist

Generate

Formula Summary

Variables

Meaning

Usage

---

## Feature 5 — Revision Summary

Create

5-minute revision

15-minute revision

One-page revision sheet

---

## Feature 6 — Explain Simpler

Button

Explain this section like I'm learning it for the first time.

Uses selected Markdown.

---

## Feature 7 — Study Timer

Estimate

Reading time

Revision time

Exam preparation time

---

## Backend

study_assistant_service.py

Implement

generate_flashcards()

generate_questions()

generate_summary()

generate_keywords()

generate_formula_sheet()

---

## New Sidebar

Study Tools

• Flashcards

• Questions

• Summary

• Key Concepts

• Explain Simpler

---

## Out of Scope

Spaced repetition

Cloud sync

Calendar integration

Voice assistant

OCR

---

## Definition of Done

✓ Flashcards generated

✓ Practice questions generated

✓ Summary generated

✓ Keywords extracted

✓ Explain Simpler works

✓ Existing workspace unaffected

---

Risk

MEDIUM

Estimated Time

3–4 hrs

---

Fallback

If flashcards become unreliable,

generate only

Question

Answer

pairs.

---

Completion

Append CONTEXT-LOG.

Report architectural decisions.

Commit point reached — Slice 5 complete.