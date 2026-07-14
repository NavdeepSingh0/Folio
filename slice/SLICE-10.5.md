# Slice 10.5 — Educational Engine Finalization

## Goal

Freeze the educational pipeline before Slice 11.

The objective of this slice is **not** to add new features.

Its purpose is to ensure every future feature (Revision, Flashcards, MCQs, Mindmaps, Exam Mode, Context Magic, etc.) is built on a stable educational engine instead of repeatedly modifying prompts.

This slice is the final architectural refinement of Folio.

---

# Philosophy

Throughout the project, the architecture has evolved into a pipeline where every stage has exactly one responsibility.

A stage should answer **one question only**.

| Stage                 | Responsibility                                                |
| --------------------- | ------------------------------------------------------------- |
| Parser                | What is inside the document?                                  |
| Document Intelligence | What type of educational content exists?                      |
| Planner               | What concepts exist?                                          |
| Capability Resolver   | What educational sections should exist for this concept type? |
| Generator             | How should this concept be taught?                            |
| Renderer              | How should this information be displayed?                     |

If any stage begins answering another stage's question, the architecture becomes harder to maintain.

This principle becomes a permanent design rule for Folio.

---

# Current Problem

Slice 9.6 successfully improved document intelligence.

However it accidentally reduced note quality because the Generator received only filtered educational slides.

The result was:

* Better structure
* Worse educational depth

Version 1 generated richer notes because it saw the entire lecture.

Version 2 generated cleaner notes because it reasoned better.

The goal of Slice 10.5 is to combine both advantages.

---

# Final Educational Pipeline

```
                    DOCUMENT
                        │
                        ▼
              Document Intelligence
                        │
     ┌──────────────────┴──────────────────┐
     │                                     │
     ▼                                     ▼
 Planner Input                      Educational Metadata
(Content Slides)          (Quiz Hints, Image Flags, Density)
     │                                     │
     └──────────────────┬──────────────────┘
                        ▼
                  Planner (LLM)
                        │
                        ▼
              Concept Outline
                        │
                        ▼
             Capability Resolver
                  (Pure Code)
                        │
                        ▼
          Educational Generator (LLM)
                        ▲
                        │
              Full Document Context
                        │
                        ▼
              Learning Objects
                        │
                        ▼
             Markdown Renderer
```

---

# Architecture Decisions

## Document Intelligence

Document Intelligence exists only to improve reasoning.

It should never reduce educational quality.

Its responsibilities are:

* classify slides
* detect image-heavy slides
* compute educational density
* extract quiz questions
* extract exam hints
* produce planner input

It does **not** generate educational content.

---

## Planner

The planner should become much simpler.

Its only responsibility is discovering concepts.

It should output:

```json
{
    "title": "...",
    "type": "algorithm",
    "source_slides": [3,4,5]
}
```

Nothing more.

The planner should never decide:

* capabilities
* educational depth
* memory tricks
* examples
* formatting

Those belong elsewhere.

---

# Capability Resolver

This becomes the bridge between planning and generation.

The Capability Resolver is pure deterministic Python.

No AI.

No prompting.

No heuristics beyond predefined educational profiles.

---

## Capability Profiles

Each concept type has a predefined educational profile.

Example:

```python
CAPABILITY_PROFILES = {

    BlockType.ALGORITHM: {

        "required": [
            "definition",
            "explanation",
            "algorithm_steps",
            "exam_tip",
            "key_takeaways"
        ],

        "recommended": [
            "formula",
            "memory_trick",
            "common_mistakes"
        ],

        "optional": [
            "comparison_table",
            "code_example",
            "diagram_description"
        ]
    },

    BlockType.DEFINITION: {

        "required":[
            "definition",
            "explanation",
            "exam_tip"
        ],

        "recommended":[
            "example",
            "memory_trick",
            "key_takeaways"
        ],

        "optional":[
            "comparison_table",
            "common_mistakes"
        ]
    }

}
```

The LLM no longer decides educational completeness.

Algorithms always deserve algorithm steps.

Algorithms always deserve memory tricks.

Algorithms always deserve exam tips.

The resolver decides.

---

## Capability Resolver Output

The resolver returns:

```python
{
    "required":[...],
    "recommended":[...],
    "optional":[...]
}
```

This becomes part of the Generator input.

---

# Educational Policy

Capability Profiles answer:

> What sections should exist?

Educational Policy answers:

> How detailed should every section be?

Example:

```python
STANDARD_POLICY = {

    "definition": {
        "required": True,
        "max_words": 35
    },

    "explanation": {
        "required": True,
        "target_words": 120
    },

    "example": {
        "required": True,
        "target_words": 80
    },

    "memory_trick": {
        "required": False,
        "target_words": 30
    },

    "exam_tip": {
        "required": True,
        "target_words": 40
    }

}
```

The policy is configuration.

Not prompt engineering.

Future modes (Revision, Flashcards, Quick Revision, Exam Mode) will swap policies rather than rewriting prompts.

---

# Generator Responsibilities

The Generator is the educational engine.

It receives:

* Full document
* Concept outline
* Capability Resolver output
* Educational Policy
* Exam hints
* Image-heavy metadata

The Generator should follow these rules:

1. Preserve the lecturer's terminology.

2. Preserve the lecturer's emphasis.

3. Supplement sparse material with accurate academic knowledge.

4. Never contradict the source material.

5. Produce notes that allow a student to study without reopening the slides.

The document determines **what** is taught.

The Generator determines **how** it is taught.

---

# Prompt Refactor

The generation prompt should no longer hardcode capability logic.

Instead it receives:

```
Concept

Concept Type

Required Capabilities

Recommended Capabilities

Educational Policy

Exam Hints

Image Metadata

Full Document
```

This dramatically simplifies prompt engineering.

---

# Renderer

No architectural changes.

The renderer remains a pure presentation layer.

It renders only the populated sections.

No educational logic belongs here.

---

# Real World Validation

Before Slice 11 begins we will run one final validation.

Use real university lectures:

* Operating Systems
* Java Programming
* Software Engineering

Acceptance Criteria:

✓ Complete notes

✓ Rich educational explanations

✓ Correct formulas

✓ Memory tricks

✓ Exam tips

✓ Code blocks

✓ Tables

✓ Diagrams when applicable

✓ No duplicate concepts

✓ No hallucinated comparison tables

✓ Student should not need the original slides

---

# Performance Targets

Maintain previously validated benchmarks.

Generation:

≈40–50 seconds

Hot GPU

Planning + Generation

Batch Size ≤12

JSON Validity ≥95%

Pipeline Success ≥99%

---

# Required Code Changes

## 1. Capability Resolver

Create:

```
Backend/app/services/capability_resolver.py
```

Responsibilities:

* Capability Profiles

* resolve_capabilities()

* Educational Policies

---

## 2. Planner

Simplify output.

Remove capability selection.

Output only:

* title

* type

* source_slides

---

## 3. Generator

Update generator inputs.

Generator now receives:

* planner output

* resolver output

* policy

* full document

* exam hints

* image metadata

---

## 4. Prompt Templates

Refactor prompts.

Remove capability logic.

Inject capability profile and educational policy dynamically.

---

## 5. Educational Policies

Create:

```
Backend/app/config/educational_policy.py
```

Contains:

* STANDARD_POLICY

Future:

* REVISION_POLICY

* QUICK_REVISION_POLICY

* FLASHCARD_POLICY

* MCQ_POLICY

---

## 6. Capability Profiles

Create:

```
Backend/app/config/capability_profiles.py
```

Contains profiles for:

* Algorithm

* Definition

* Process

* Comparison

* Formula

* Code Concept

* Theory

---

## 7. Validation

Re-run:

* Operating Systems

* Java

* Software Engineering

Compare against:

* Legacy

* Previous Slice 10 output

Acceptance:

The new output must match or exceed the educational richness of Version 1 while preserving the structural improvements introduced in Version 2.

---

# Definition of Done

Slice 10.5 is complete when:

* Every pipeline stage has one responsibility.
* The planner only discovers concepts.
* Capability selection is deterministic.
* Educational depth is controlled by policy rather than prompts.
* The generator teaches rather than transcribes.
* Real university lectures produce notes that are rich enough to study from without reopening the original slides.

At this point the Educational Engine is frozen.

Slice 11 can begin with confidence, knowing that Revision Mode, Flashcards, MCQs, Mindmaps, and every future learning feature will reuse a stable, extensible foundation rather than requiring architectural changes.


after this we will test the ppt again and make v3 of production validation output and report 

after completion commit point reached log it to context.