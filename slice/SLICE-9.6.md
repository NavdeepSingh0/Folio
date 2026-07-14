# Slice 9.6 — Document Intelligence Refinement

## Goal

The production validation using real lecture material exposed an important weakness in the current pipeline.

The issue is **not** the renderer.

It is **not** the LearningObject schema.

It is **not** the TwoPassBatchEngine.

It is the quality of the information reaching the Planning Engine.

The current planner receives raw extracted slides containing educational content mixed with boilerplate, image-only slides, quiz pages, references, and administrative material.

The objective of Slice 9.6 is to refine the extracted document into an educationally-aware planner input while remaining completely deterministic (no additional LLM calls).

---

# Why this refinement exists

Current pipeline:

```text
Parser
    ↓
Planner
    ↓
Generation
    ↓
Renderer
```

New pipeline:

```text
Parser
    ↓
Document Intelligence
    ↓
Planner
    ↓
Generation
    ↓
Renderer
```

The Planning Engine should never spend reasoning tokens deciding which slides matter.

That responsibility belongs to Document Intelligence.

---

# Design Philosophy

Document Intelligence should **classify**, never discard.

Every slide remains part of the document.

Each slide simply gains metadata describing its educational purpose.

This allows every downstream feature to make its own decisions.

Examples:

* Planner uses educational slides.
* Exam Tip generation uses quiz slides.
* Search indexes every slide.
* Future export may include references.
* Analytics can compute document quality.

Nothing is lost.

Everything becomes typed.

---

# Objectives

## 1. Slide Classification

Every extracted slide should receive one deterministic type.

```python
CONTENT
EXAMPLE
COMPARISON
QUIZ
LEARNING_OBJECTIVE
SUMMARY
REFERENCE
RESOURCE
ADMINISTRATIVE
IMAGE_HEAVY
```

Classification must use rule-based heuristics.

No LLM.

No prompt.

No embeddings.

---

## 2. Quiz Intelligence

Quiz slides should no longer be treated as noise.

Instead they become:

```python
exam_focus_hints
```

Example:

```json
{
    "exam_focus_hints": [
        "Negative cycle detection",
        "Time Complexity",
        "Bellman Ford vs Dijkstra",
        "V−1 iterations"
    ]
}
```

These hints are attached to the planner input and later improve Exam Tips.

---

## 3. Image Heavy Detection

Many lecture slides contain diagrams rather than text.

Instead of pretending the information exists in extracted text, identify these slides.

Example metadata:

```python
image_heavy=True
extractable_text_length=27
```

The planner should know that visual information exists but is unavailable.

---

## 4. Document Profile

Generate deterministic metadata describing the document.

Example:

```text
Total Slides: 19

Educational Slides: 6

Quiz Slides: 1

Image Heavy Slides: 5

Administrative Slides: 7

Educational Density: 0.42
```

This information is used only for diagnostics.

---

## 5. Planner Input Builder

Instead of passing raw extraction directly into the planner, create a dedicated planner payload.

Planner receives:

* CONTENT slides
* EXAMPLE slides
* COMPARISON slides
* LEARNING OBJECTIVE slides (optional context)
* Image-heavy metadata
* Exam focus hints
* Document profile

Administrative material remains stored but is excluded from planner reasoning.

---

## 6. Capability Guard

Capabilities should only be requested when supported by extracted evidence.

Example:

Heading:

```
Bellman Ford vs Dijkstra
```

If only a heading exists and comparison data is inside an image:

DO NOT request

```
comparison_table
```

Instead request a normal explanation.

Likewise:

* No algorithm_steps without procedural text.
* No formula unless formula evidence exists.
* No comparison tables from titles alone.

This prevents empty renderer sections.

---

# Files to Modify

## MODIFY

```
Backend/app/services/preprocessing_service.py
```

Extract classification logic into reusable functions.

---

## NEW

```
Backend/app/services/document_intelligence.py
```

Responsibilities:

* classify_slide()
* extract_exam_hints()
* detect_image_heavy()
* compute_document_profile()
* build_planner_input()

---

## MODIFY

```
Backend/app/services/planning_service.py
```

Planner should consume the new PlannerInput model instead of raw extracted slides.

No planner prompt changes should be required beyond accepting the richer metadata.

---

## NEW

```
Backend/app/models/document_profile.py
```

Contains:

* SlideType enum
* ClassifiedSlide
* DocumentProfile
* PlannerInput

---

## MODIFY

```
benchmark/diagnostic_pipeline.py
```

Print the entire refinement pipeline:

```
Raw Extraction
        ↓
Classification
        ↓
Exam Hint Extraction
        ↓
Document Profile
        ↓
Planner Input
        ↓
Planner Output
```

This becomes the primary debugging tool for future planner improvements.

---

# Verification

Re-run the Bellman-Ford lecture.

Expected behaviour:

✓ Duplicate concepts removed

✓ No empty comparison tables

✓ Quiz questions improve exam tips

✓ Image-heavy slides correctly identified

✓ Planner reasons over educational content instead of administrative noise

✓ LearningObjects become more educationally focused without changing the renderer or generation engine

---

# Success Criteria

This slice is complete when:

* Every slide is deterministically classified.
* Planner input contains only relevant educational material plus metadata.
* Quiz slides enrich exam tips rather than becoming LearningObjects.
* Image-heavy slides no longer cause hallucinated capabilities.
* Bellman-Ford production validation passes without duplicate concepts or empty sections.

---

# Architectural Note

Slice 9.6 is **not** a new generation architecture.

It is a refinement of the existing Document Intelligence layer introduced in Slice 9.

The Generation Engine, LearningObject schema, Renderer, and TwoPassBatchEngine remain frozen.

Only the quality of the planner's input improves.

--- 

just some extra info here told by chatgpt 
One thing I'd add beyond both Claude's and my previous suggestion

Looking at where Folio is heading (revision, MCQs, mind maps, semantic search), I'd make one tiny addition now because it will pay dividends later.

Add a lightweight confidence field to each classified slide:

class ClassifiedSlide:
    slide_number: int
    slide_type: SlideType
    confidence: float
    image_heavy: bool

For example:

CONTENT detected by clear paragraphs → 0.98
QUIZ detected by "Q1/Q2" → 1.0
COMPARISON inferred only from a title → 0.55

You don't have to use this immediately, but it becomes incredibly useful for diagnostics. If you later wonder why the planner made a poor decision, you can see whether it was working from high-confidence or low-confidence classifications. 