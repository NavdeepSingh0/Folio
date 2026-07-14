Slice 11B — Educational Revision Engine
Goal

Enhance the deterministic revision resources created in Slice 11A using the Educational Engine.

The deterministic engine guarantees correctness, consistency, and speed.

The Educational Revision Engine improves pedagogical quality by making flashcards, MCQs, and recall prompts resemble those created by an experienced lecturer rather than simple field transformations.

The key architectural principle is:

Deterministic first. Educational enhancement second.

If the enhancement stage fails or is disabled, the deterministic outputs remain fully usable.

The Revision Engine must never depend on the LLM for correctness.

Philosophy

StudyTopic remains the only source of truth.

StudyTopic

↓

Deterministic Revision Engine

↓

Flashcards
MCQs
Recall Prompts
Cheat Sheet

↓

Educational Enhancement Layer (Optional)

↓

Improved Flashcards
Improved MCQs
Improved Recall

Nothing new is generated from the lecture.

Everything is derived from the StudyTopic.

The LLM only improves educational quality.

Why another layer?

Slice 11A proved the architecture.

It also exposed its limitation.

The deterministic engine can ask

What is Bellman-Ford?

It cannot naturally ask

Why can't Dijkstra replace Bellman-Ford?

Likewise

it can generate

What are the steps?

but not

During interviews students often confuse Bellman-Ford with Dijkstra. Explain why Bellman-Ford must run V−1 iterations.

Those require reasoning rather than restructuring.

That is exactly where a small local model should be used.

Architectural Principle

The deterministic engine owns correctness.

The LLM owns educational quality.

Never the reverse.

Enhancement Targets

Only three resources benefit significantly from LLM reasoning.

Flashcards

Current

Front

What is Bellman-Ford?

Back

Definition

Enhanced

Concept

Bellman-Ford

↓

Definition

↓

Application

↓

Edge Case

↓

Comparison

↓

Common Mistake

↓

Exam Question

↓

Memory Trick

The LLM may create additional flashcards.

It never modifies the factual definition.

MCQs

This is where Slice 11B adds the most value.

Instead of

Definition

↓

Question

the LLM should generate

Conceptual questions

Application questions

Comparison questions

Scenario questions

Complexity questions

Output format

Question

Options

Correct Answer

Explanation

Difficulty

Tags

Distractors should be plausible misconceptions.

Not random wrong answers.

Active Recall

Current

Write the definition.

Enhanced

Without looking,

Explain why Bellman-Ford requires V−1 iterations.

How would you detect a negative cycle?

When would Dijkstra fail?

What mistake do students usually make?


This becomes genuine retrieval practice.

What is NOT enhanced

Cheat Sheets remain deterministic.

Markdown remains deterministic.

Study Topics remain deterministic.

The Educational Engine has already generated those.

Services
New
app/services/revision_enrichment_service.py

Responsibilities

Flashcard enhancement

MCQ enhancement

Recall enhancement
New Prompt
revision_prompts.py

Separate from generation prompts.

Generation teaches.

Revision tests.

Different jobs.

Prompt Philosophy

System Prompt

You are an experienced university lecturer.

The student already has high-quality study notes.

Your task is not to rewrite them.

Your task is to create excellent revision material.

Prioritize:

conceptual understanding

comparison

application

exam thinking

common misconceptions

Avoid trivial definition questions when richer educational questions are possible.
Pipeline
StudyTopic

↓

Deterministic Revision Engine

↓

Revision Objects

↓

Educational Enhancement

↓

Enhanced Revision Objects

Notice

The LLM never sees the lecture.

Only the StudyTopic.

This keeps context tiny.

Generation extremely fast.

Failure Behaviour

If enhancement fails

StudyTopic

↓

Deterministic Revision Engine

↓

Done

System still works.

Configuration
ENABLE_REVISION_ENHANCEMENT=True

Allows instant fallback.

Benchmark

Use

Bellman-Ford

SDLC

Exception Handling

Compare

Deterministic

vs

Enhanced

Metrics

Metric	Evaluation
Conceptual depth	Higher than deterministic
Distractor quality	Plausible misconceptions
Recall quality	Tests understanding instead of memorization
Hallucinations	Zero
Runtime	≤ 5 seconds/topic
Factual consistency	Matches StudyTopic exactly
Acceptance Criteria

Slice 11B is complete when:

Flashcards move beyond simple definition extraction and include conceptual, comparative, application, and exam-oriented cards.
MCQs contain realistic distractors and explanations rather than template-based wrong answers.
Active Recall prompts encourage genuine retrieval practice and reasoning.
The LLM never changes or invents facts beyond the StudyTopic.
The deterministic engine remains the fallback and primary guarantee of correctness.
The enhancement layer is optional, modular, and can be disabled without affecting the rest of the pipeline.
Implementation Instructions for the IDE
New Files
app/services/revision_enrichment_service.py
app/prompts/revision_prompts.py
benchmark/revision_validation_v2.py
Modify
app/services/revision_engine.py
Add an optional enhancement stage controlled by ENABLE_REVISION_ENHANCEMENT.
First generate deterministic revision artifacts.
Then pass them, along with the originating StudyTopic, to the revision_enrichment_service.
revision_enrichment_service.py

Implement three independent methods:

enhance_flashcards()
enhance_mcqs()
enhance_recall_prompts()

Each should:

Take the deterministic output as input.
Improve educational quality without altering factual content.
Return objects conforming to the existing Pydantic schemas.
revision_prompts.py

Create separate prompts for:

Flashcard enhancement
MCQ generation
Active recall enhancement

These prompts should emphasize conceptual understanding, application, comparison, common misconceptions, and exam-style thinking rather than rote memorization.

Validation

Create benchmark/revision_validation_v2.py to compare:

Slice 11A deterministic outputs
Slice 11B enhanced outputs

The benchmark should report:

Number of flashcards
MCQ quality (conceptual vs definition-based)
Recall depth
Runtime
Factual consistency with the original StudyTopic

This keeps the architecture you've spent months refining intact: StudyTopic remains the canonical educational artifact, deterministic generation guarantees correctness, and the LLM is used only where it adds genuine pedagogical value.