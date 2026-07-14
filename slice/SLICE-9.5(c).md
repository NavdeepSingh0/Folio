# Slice 9.5(c) — Generation Engine Validation & Benchmark Freeze

## Goal

Validate the new **TwoPassBatchEngine** against objective engineering acceptance criteria before beginning Slice 10.

This slice is **NOT** about improving educational quality or adding new features.

This slice exists to answer one question:

> Can the new Generation Engine be considered production-ready for the benchmark project?

This slice freezes the benchmarking methodology, validates reliability, and determines the operational limits of the engine.

---

# Why this slice exists

Slice 9.5 introduced an entirely new architecture:

Document

↓

Planning

↓

Learning Objects

↓

Renderer

↓

Markdown

Initial benchmarks demonstrated enormous performance improvements by replacing multiple generation calls with a single batch generation call.

However, subsequent benchmarks revealed that local 8B models occasionally produce malformed structured output under larger generation loads.

Before continuing with Slice 10, we must determine whether these failures are:

* architectural,
* prompt-related,
* parser-related,
* or simply operating beyond the model's reliable limits.

This slice exists to answer that question through benchmarking instead of assumptions.

---

# Core Principle

No new architecture.

No new features.

No renderer improvements.

No Slice 10 work.

Only validation.

---

# Frozen Acceptance Criteria

The Generation Engine is considered validated only if all criteria below are satisfied.

| Metric                                  | Required Threshold                                             |
| --------------------------------------- | -------------------------------------------------------------- |
| JSON Syntax Validity                    | ≥95%                                                           |
| Schema Validity                         | ≥95%                                                           |
| Final Pipeline Success (after recovery) | ≥99%                                                           |
| Mean Generation Time                    | ≤30 seconds                                                    |
| Educational Quality                     | Not measurably worse than TwoPassSequentialEngine              |
| Determinism                             | Structurally consistent across three runs at Temperature = 0.1 |

If these criteria are met:

Generation Engine is frozen.

Development immediately proceeds to Slice 10.

---

# Scope

---

## Part 1 — Engine Standardization

Rename engines throughout the codebase.

Current

Legacy

Variant A

Variant B

Replace with

LegacyEngine

TwoPassSequentialEngine

TwoPassBatchEngine

Update:

* source code
* benchmark logs
* comments
* documentation

No benchmark should refer to Variant A/B afterwards.

---

## Part 2 — Engine Reliability Improvements

Implement the following improvements before benchmarking.

### Variant C

Wrap generated output inside a root object.

Replace

[
...
]

with

{
"learning_objects":[
...
]
}

---

### JSON Mode

Enable Ollama JSON mode for every Generation call.

Generation must use constrained decoding.

Planning is unchanged.

---

### Temperature

Default generation temperature:

0.1

Reason:

Improve determinism and JSON reliability.

---

### Parser Refactor

Replace the current parser with a two-stage parser.

Stage 1

Syntax Recovery

Responsible for:

* malformed JSON
* missing brackets
* trailing commas
* escaped characters

Stage 2

Schema Validation

Responsible for:

* validating LearningObject schema
* repairing missing optional fields
* reporting validation errors

These stages must log independently.

Never mix syntax failures with schema failures.

---

# Part 3 — Incremental Output Benchmark

Determine the maximum reliable generation size.

Benchmark:

1 Learning Object

↓

2 Learning Objects

↓

3 Learning Objects

↓

...

Run:

10 iterations per size.

Record:

* Learning Objects
* Approximate Output Tokens
* Syntax Validity
* Schema Validity
* Recovery Rate
* Generation Time
* Parse Attempts

Stop when syntax validity falls below 90%.

The previous size becomes the engine's

Maximum Reliable Batch Size.

Future generation automatically respects this limit.

---

# Part 4 — Thinking Benchmark

Benchmark independently.

Planning

Thinking ON

vs

Thinking OFF

Generation

Thinking ON

vs

Thinking OFF

Measure:

Planning

* outline quality
* planning speed

Generation

* JSON validity
* generation speed
* determinism

The benchmark determines the default configuration.

No assumptions.

---

# Part 5 — Schema Complexity Benchmark

Benchmark three Learning Object schemas.

Minimal

* definition
* explanation

Standard

* definition
* explanation
* example
* exam_tip

Extended

* standard fields
* misconceptions
* prerequisites

Measure:

* generation time
* JSON validity
* schema validity

Determine the maximum reliable schema complexity.

Do not exceed this complexity in Slice 10.

---

# Part 6 — Reliability Suite

Run the complete benchmark corpus.

Benchmark:

* 1 concept
* 2 concepts
* 4 concepts
* 10 concepts
* mixed concept types
* code examples
* empty optional fields
* long explanations

Each benchmark:

10 runs.

Record:

* syntax validity
* schema validity
* recovery rate
* final success
* generation time

Recovery Rate must be reported separately from raw validity.

---

# Part 7 — Determinism Benchmark

Run identical input

3 times

Temperature = 0.1

Compare:

* Learning Object structure
* ordering
* field completeness

Minor wording differences are acceptable.

Structural drift is not.

---

# Deliverables

At the end of this slice produce:

## 1

Final Generation Engine Report

Containing:

* acceptance criteria
* benchmark results
* reliability
* performance

---

## 2

Engine Configuration

Including:

* default temperature
* JSON mode
* thinking configuration
* maximum batch size

---

## 3

Benchmark Findings

Document:

* output-size ceiling
* parser recovery rate
* schema ceiling
* deterministic behaviour

These findings become permanent benchmark documentation.

---

# Out of Scope

Do NOT implement:

* Canonical Concepts
* Knowledge Graph
* Renderer improvements
* Output Engine
* Prompt redesign for educational quality
* Flashcards
* MCQs
* Revision Engine
* Slice 10

---

# Definition of Done

✓ Engine naming standardized

✓ Variant C implemented

✓ JSON mode enabled

✓ Two-stage parser implemented

✓ Maximum Reliable Batch Size identified

✓ Thinking benchmark completed

✓ Schema complexity benchmark completed

✓ Reliability suite completed

✓ Acceptance criteria evaluated

If acceptance criteria are satisfied:

The Generation Engine is permanently frozen.

Slice 10 begins.

---

# Fallback

If the TwoPassBatchEngine fails the acceptance criteria:

1. Determine the precise failure point.

Examples:

* unreliable beyond five Learning Objects
* unreliable beyond 1,500 output tokens

2. Automatically constrain generation to remain inside validated operating limits.

3. Re-run the benchmark.

Only if the engine still fails within validated limits should the benchmark conclude that TwoPassSequentialEngine remains the default architecture.

The benchmark must always prefer measured evidence over architectural assumptions.




commit point reached. log it in the context log.