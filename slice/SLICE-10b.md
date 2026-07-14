# Slice 10 — Phase 5: Educational Intelligence Calibration

## Goal

The renderer, schema, and generation engine have now been validated.

The remaining quality gap is no longer architectural.

It is educational.

This phase calibrates the Planning Engine so it correctly identifies educational opportunities inside a lecture and instructs the Generation Engine to populate the appropriate LearningObject capabilities.

This is **not** a renderer task.

This is **not** a schema task.

This is **not** a benchmark task.

This is a prompt alignment and pipeline diagnostics session.

---

# Why this phase exists

Current output demonstrates that:

* Renderer works correctly.
* LearningObject schema is stable.
* Generation Engine produces valid JSON.
* Pipeline architecture is functioning.

However, the generated notes remain thinner than the renderer is capable of displaying.

Example:

Banker's Algorithm currently renders only:

* Definition
* Explanation
* Example
* Exam Tip

while the renderer is capable of rendering:

* Formula
* Algorithm Steps
* Memory Trick
* Common Mistakes
* Comparison Tables
* Code Examples
* Diagrams

The renderer is waiting for data that never reaches it.

This phase determines exactly where that information is being lost.

---

# Primary Objective

Instrument the complete pipeline for a single concept.

The objective is to observe every transformation from source material to rendered markdown.

No prompt modifications should occur before the diagnostic logs have been collected.

---

# Diagnostic Pipeline

For one representative concept (Banker's Algorithm), log every stage.

```
Document

↓

Planning Output

↓

Educational Analysis

↓

Capability Mapping

↓

Generation Output

↓

LearningObject

↓

Renderer

↓

Markdown
```

Every stage should be printed independently.

---

# Required Debug Output

## Stage 1 — Planner

Print the raw planner JSON.

Example:

```json
{
    "title": "Banker's Algorithm",

    "educational_analysis": {

        "contains_algorithm": true,

        "contains_formula": true,

        "contains_code": false,

        "requires_memorisation": true,

        "commonly_examined": true,

        "has_common_errors": true
    }
}
```

---

## Stage 2 — Capability Mapper

Print the capabilities selected by Python.

Example:

```
Capabilities

✓ definition

✓ explanation

✓ example

✓ exam_tip

✓ algorithm_steps

✓ formula

✓ memory_trick

✓ common_mistakes
```

This verifies that deterministic capability mapping behaves correctly.

---

## Stage 3 — Generation

Print the raw generated LearningObject before rendering.

Example:

```json
{
    "formula": "...",

    "algorithm_steps": [...],

    "memory_trick": "...",

    "common_mistakes": [...]
}
```

Null values should immediately reveal prompt weaknesses.

---

## Stage 4 — Renderer

Render the LearningObject exactly as normal.

No renderer modifications are expected during this phase.

---

# Educational Analysis Layer

The planner should no longer directly choose renderer capabilities.

Instead, it performs educational analysis.

Required analysis fields:

* contains_algorithm
* contains_formula
* contains_code
* contains_comparison
* contains_diagram
* requires_memorisation
* commonly_examined
* has_common_errors

The planner's responsibility ends here.

---

# Deterministic Capability Mapping

Renderer capabilities are chosen by Python code.

The mapping should remain deterministic.

Example:

```
contains_algorithm

↓

algorithm_steps

contains_formula

↓

formula

requires_memorisation

↓

memory_trick

contains_code

↓

code_example
```

The LLM should never need to know internal renderer field names.

---

# Prompt Calibration

Only after diagnostics.

If Educational Analysis is correct but Generation leaves fields null:

Improve the Generation Prompt.

If Educational Analysis is missing educational signals:

Improve the Planning Prompt.

No renderer modifications.

No schema changes.

---

# Prompt Philosophy

The planner should think like an experienced university professor preparing revision notes.

Its objective is to identify every educational aid that would improve student understanding.

When uncertain, prefer identifying educational opportunities rather than omitting them.

The generator's responsibility is only to populate the requested capabilities.

---

# Validation Documents

Re-run exactly the same benchmark documents:

1. Operating Systems

2. Software Engineering

3. Java

No new benchmark documents should be introduced during this phase.

This allows direct comparison with previous Slice 10 outputs.

---

# Expected Improvements

Operating Systems:

Banker's Algorithm should now include:

* Formula

* Algorithm Steps

* Memory Trick

* Common Mistakes

Java:

Exception Handling should render code examples using the dedicated code renderer rather than embedding implementation inside generic examples.

Software Engineering:

Concepts should naturally populate comparison tables, key takeaways, and memory aids wherever educationally appropriate.

---

# Deliverables

✓ Pipeline diagnostic logs.

✓ Educational Analysis implementation.

✓ Deterministic Capability Mapper.

✓ Refined Planning Prompt.

✓ Refined Generation Prompt.

✓ Updated benchmark outputs.

---

# Definition of Done

This phase is complete when:

1. Every missing educational section can be traced to a specific stage of the pipeline.

2. The planner consistently identifies educational opportunities.

3. The Generation Engine populates the requested capabilities.

4. The renderer naturally displays richer notes without any renderer modifications.

At that point, Slice 10 can proceed to its final educational benchmark and be considered feature complete.
