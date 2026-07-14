# Slice 10.6 — Study Topic Refactor (Final Educational Architecture)

## Goal

Slice 10 successfully built an educational generation engine capable of producing high-quality study material. However, real-world validation revealed one final architectural mismatch.

The current pipeline treats every discovered concept as an independent `LearningObject`. While this works well for flashcards and search, it fragments lecture notes into many small pieces that students would never naturally study individually.

The objective of Slice 10.6 is **not** to redesign the pipeline.

Instead, it is to finalize the educational model by making **Study Topics** the primary educational entity.

After this slice, every downstream feature (Markdown Notes, Revision Mode, Flashcards, MCQs, Mindmaps, Formula Sheets, Exam Mode) will derive from a single canonical Study Topic rather than dozens of fragmented objects.

This freezes the educational architecture before Slice 11.

---

# Why This Change?

During real-world validation using the Bellman-Ford lecture, the planner generated eight separate objects:

* Bellman-Ford Algorithm
* Relaxation
* Time Complexity
* Negative Cycle Detection
* Applications
* Single Source Shortest Path
* etc.

Technically this was correct.

Educationally it was wrong.

A student never studies these independently.

A student studies:

> **Bellman-Ford Algorithm**

and expects one coherent page containing:

* Definition
* Explanation
* Formula
* Algorithm Steps
* Worked Example
* Time Complexity
* Applications
* Comparison with Dijkstra
* Common Mistakes
* Exam Tips
* Memory Tricks
* Key Takeaways

The planner currently optimizes for atomic concepts.

Folio's primary experience should optimize for complete study sessions.

Therefore:

> **Study Topic becomes the primary educational entity.**

---

# Educational Philosophy

The pipeline is now divided into two responsibilities.

## The Document decides WHAT is taught.

The lecture defines:

* terminology
* order
* emphasis
* examples
* scope

The planner should preserve this.

---

## The Educational Engine decides HOW it is taught.

The Educational Engine enriches the material by producing:

* explanations
* memory tricks
* examples
* algorithm walkthroughs
* exam tips
* common mistakes
* comparisons
* formulas

Students should not need to reopen the original slides.

---

# Frozen Educational Pipeline

```
Document

↓

Document Intelligence

↓

Planner

↓

Study Topics

↓

Capability Resolver

↓

Educational Generator

↓

Renderer

↓

Markdown Notes
```

Every renderer in the future consumes Study Topics.

Never raw documents.

---

# Study Topic

The Study Topic replaces the current LearningObject as the educational source of truth.

Example:

```
Study Topic

Bellman-Ford Algorithm

contains

Definition

Explanation

Formula

Algorithm Steps

Worked Example

Complexity

Applications

Comparison

Memory Trick

Common Mistakes

Exam Tips

Key Takeaways
```

One topic.

One study session.

One markdown section.

---

# Future Renderers

Nothing except Markdown stores educational content.

Everything else becomes a renderer.

```
Study Topic

↓

Markdown Renderer

↓

Notes
```

```
Study Topic

↓

Flashcard Renderer

↓

Flashcards
```

```
Study Topic

↓

MCQ Renderer

↓

Practice Questions
```

```
Study Topic

↓

Mindmap Renderer

↓

Mindmap
```

```
Study Topic

↓

Revision Renderer

↓

Revision Sheet
```

```
Study Topic

↓

Formula Renderer

↓

Formula Sheet
```

One source.

Many educational views.

---

# Planner Responsibilities

The planner no longer creates educational objects.

The planner only identifies Study Topics.

Its responsibilities become:

* Topic Title
* Topic Type
* Source Slides
* Topic Boundaries
* Sections Covered

Nothing more.

---

Example output:

```json
{
  "topics": [
    {
      "title": "Bellman-Ford Algorithm",
      "type": "algorithm",
      "covers": [
        "Definition",
        "Edge Relaxation",
        "Negative Cycle Detection",
        "Time Complexity",
        "Applications",
        "Comparison with Dijkstra"
      ],
      "source_slides": [3,4,5,6,7,8,9,10,11,12]
    }
  ]
}
```

Notice that:

* Time Complexity is NOT another topic.
* Applications are NOT another topic.
* Negative Cycle Detection is NOT another topic.

They become sections inside Bellman-Ford.

---

# Capability Resolver

The Capability Resolver remains completely deterministic.

The LLM never decides educational capabilities.

Given:

```
Study Topic Type

Algorithm
```

The resolver automatically selects:

Required

* Definition
* Explanation
* Algorithm Steps
* Exam Tip
* Key Takeaways

Standard

* Formula
* Example
* Memory Trick
* Common Mistakes

Optional

* Code Example
* Diagram
* Comparison Table

No prompt engineering decides this.

Code does.

---

# Educational Generator

The Generator now receives:

* Full Document Context
* Study Topic
* Sections Covered
* Exam Hints
* Capability Profile
* Educational Policy

Its only job becomes teaching.

It no longer decides:

* topic boundaries
* educational structure
* capabilities

Those decisions already happened upstream.

---

# Renderer

The renderer now renders one complete Study Topic.

Example:

```
Bellman-Ford Algorithm

Definition

Explanation

Formula

Algorithm

Worked Example

Comparison

Memory Trick

Exam Tips

Key Takeaways
```

Instead of rendering:

```
Bellman Ford

---

Time Complexity

---

Applications

---

Negative Cycle Detection
```

---

# Required Refactor

## 1. Rename Educational Entity

Rename:

```
LearningObject
```

to

```
StudyTopic
```

This is a semantic change.

Almost all fields remain identical.

---

## 2. Planner Output

Planner now outputs:

* topic title
* topic type
* covers
* source slides

instead of fragmented concepts.

---

## 3. Generator

Generator receives:

* full document
* study topic
* covers
* capability profile
* educational policy
* exam hints

and generates one comprehensive educational object.

---

## 4. Renderer

Renderer renders Study Topics.

Not fragmented concepts.

---

# Validation

Re-run:

```
Uploads/3.1.4.pptx
```

Expected result:

Exactly ONE Study Topic.

```
Bellman-Ford Algorithm
```

Containing:

* Definition
* Explanation
* Formula
* Algorithm
* Example
* Complexity
* Applications
* Comparison
* Common Mistakes
* Memory Trick
* Exam Tips
* Key Takeaways

No fragmentation.

No duplicate educational objects.

---

# Deliverables

## New Educational Entity

* StudyTopic

---

## Planner

* Outputs Study Topics
* Groups sub-concepts into sections

---

## Generator

* Generates one comprehensive educational object per Study Topic

---

## Renderer

* Renders one Study Topic into one coherent markdown section

---

## Documentation

Update:

```
PIPELINE_DECISIONS.md
```

Add:

```
Primary Educational Entity:
Study Topic

Reason:

Students study complete topics, not fragmented concepts.

Markdown Notes are the primary educational artifact.

Flashcards, MCQs, Mindmaps, Revision Sheets,
Formula Sheets, and all future study experiences
are renderers derived from Study Topics.

Study Topics are the permanent educational source of truth.
```

---

# Acceptance Criteria

The Bellman-Ford lecture should generate:

* One Study Topic
* One coherent markdown section
* Rich educational depth equal to or better than the previous V1 output
* No fragmented concepts
* No duplicate educational objects
* All required capabilities populated deterministically through the Capability Resolver

Once these criteria are met, the educational engine is considered frozen.

Slice 10 is officially complete.

The project can then move confidently into **Slice 11 — Study Experience**, where Flashcards, MCQs, Mindmaps, Revision Mode, and Exam Mode become alternate renderers built on top of the Study Topic architecture.
