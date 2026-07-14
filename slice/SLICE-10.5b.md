# Slice 10.5 — Validation & Refinement

## Goal

The Educational Engine architecture is now frozen.

This session is **not** about redesigning the pipeline.

It is about validating whether the implementation behaves the way the architecture intended.

The recent Bellman-Ford benchmark exposed two possible issues:

1. The planner may be over-splitting concepts.
2. Forward-reference slides may be leaking into educational content.

Before changing prompts or architecture, we must determine exactly where these problems originate.

The objective of this session is to **diagnose first, then implement only the minimal fixes required.**

---

# Principle

Do not change architecture based on assumptions.

Every modification must be backed by pipeline evidence.

We will inspect the output of each stage before changing prompts or code.

---

# Current Questions

We do **not** yet know whether:

* the Planner generated 8 concepts,
* Document Intelligence leaked administrative slides,
* Generation split concepts,
* or post-processing produced the fragmentation.

Until this is verified, no architectural changes should be made.

---

# Immediate Fixes

These are implementation bugs rather than architectural changes.

## 1. Forward Reference Classification

Document Intelligence should distinguish between:

* Educational Content
* Summary
* Quiz
* Administrative
* References
* Forward References

Slides such as:

```
Next Lecture:
Floyd-Warshall Algorithm
```

must never become educational concepts.

Introduce a new slide type:

```
FORWARD_REFERENCE
```

These slides should:

* remain in diagnostics
* never reach the Planner
* never contribute Learning Objects

---

## 2. Algorithm Capability Profile

Algorithms should support educational implementation examples.

Update the Algorithm capability profile.

Current:

```python
optional = [
    comparison_table,
    diagram_description
]
```

Updated:

```python
optional = [
    code_example,
    comparison_table,
    diagram_description
]
```

The Generator should be allowed to produce a clean implementation example when it meaningfully improves learning, even if the source slides contain only pseudocode or conceptual explanations.

This is optional, not mandatory.

---

## 3. Planner Prompt Refinement

Do **not** force:

> One Lecture = One Learning Object

Instead refine the planner's understanding of concept granularity.

Add guidance such as:

```
A Learning Object represents one complete teachable concept.

Do not split a concept into implementation details,
time complexity,
applications,
supporting mechanisms,
or algorithm components.

These belong inside the parent concept.

Only generate multiple Learning Objects if the lecture introduces multiple independent concepts that could each be studied separately.
```

This keeps the planner general-purpose while preventing obvious over-fragmentation.

---

# Verification Before Any Further Changes

Before modifying prompts further, we need to inspect the pipeline.

---

## Diagnostic 1 — Planner Output

Print the raw planner JSON.

Questions to answer:

* Did the planner actually generate 8 concepts?
* Did it generate parent/sub-topic relationships?
* Did it already merge concepts correctly?

Do not guess.

Inspect the output.

---

## Diagnostic 2 — Document Intelligence Output

Print the classified slides.

Verify:

* Slide classifications
* Forward references
* Administrative slides
* Quiz slides
* Content slides

Specifically verify whether:

```
Next Lecture:
Floyd-Warshall
```

was incorrectly classified as CONTENT.

---

## Diagnostic 3 — Learning Object Builder

Determine whether the fragmentation occurred:

* during planning,
* during generation,
* or during Learning Object construction.

The architecture should identify the exact stage responsible.

---

# Do NOT Implement Yet

Until diagnostics are complete, do **not** implement:

* forced one-object generation
* parent-child concept hierarchy
* concept merging
* automatic consolidation
* new planner architecture

These are architectural changes.

We first need evidence that they are actually required.

---

# Expected Findings

The diagnostics should answer:

1. Is the planner truly over-splitting?

2. Is Document Intelligence leaking forward-reference slides?

3. Is the Generator fragmenting concepts?

4. Is post-processing responsible?

Only after these questions are answered should additional changes be considered.

---

# Acceptance Criteria

This validation session is complete when:

✅ Forward-reference slides no longer become Learning Objects.

✅ Algorithm capability profile supports optional code examples.

✅ Planner prompt better defines concept granularity.

✅ Raw Planner output has been inspected.

✅ Raw Document Intelligence classifications have been inspected.

✅ The exact stage responsible for concept fragmentation has been identified.

No further architectural changes should be made until these diagnostics are complete.

---

# Deliverable

Produce a diagnostic report containing:

* Raw Planner Output
* Document Intelligence Classification
* Learning Object Generation Output
* Final Markdown Output

Along with a short conclusion answering:

* Where did concept fragmentation originate?
* Was the planner responsible?
* Did administrative slides leak?
* Are any further architectural changes actually necessary?

Only after this report is complete should we decide whether additional refinement is needed.

The Educational Engine remains architecturally frozen throughout this session.
