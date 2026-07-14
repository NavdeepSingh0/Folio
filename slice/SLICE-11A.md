Slice 11 — Revision Engine
Goal

Transform a generated Study Topic into multiple active-learning resources without making another expensive planning pass.

The philosophy is simple:

Study Topics are the source of truth. Everything else is derived.

Nothing new is stored.

Everything is generated from the existing Study Topic.

                    Study Topic
                         │
      ┌──────────────────┼────────────────────┐
      │                  │                    │
      ▼                  ▼                    ▼
 Flashcards           MCQs             Revision Sheet
      │                  │                    │
      ▼                  ▼                    ▼
 Active Recall     Self Assessment      Quick Revision

The Educational Engine has already done the hard work.

Slice 11 simply changes how the information is presented.

Core Philosophy

One of the biggest architectural decisions we made in Slice 10 was this:

Study Topic

is the primary object.

Not flashcards.

Not MCQs.

Not revision notes.

Those are temporary educational views.

That means

StudyTopic
        │
        ├── MarkdownRenderer
        ├── FlashcardRenderer
        ├── MCQRenderer
        ├── CheatSheetRenderer
        ├── ActiveRecallRenderer
        └── RevisionRenderer

Every renderer receives the exact same object.

No renderer calls another renderer.

No renderer calls the planner.

No renderer calls the generator.

They are pure transformations.

Architecture
                    Study Topic
                         │
             Revision Engine
                         │
      ┌──────────┬────────────┬───────────┬───────────┐
      ▼          ▼            ▼           ▼
 Flashcards     MCQs      Active Recall  Cheat Sheet

Notice

There is no LLM yet.

The first implementation should be entirely deterministic.

Why deterministic?

Because your Study Topic already contains

definition
explanation
algorithm steps
examples
common mistakes
memory tricks
exam tips
key takeaways

Most educational resources can be generated from these fields directly.

For example

Definition

↓

Flashcard Front
Explanation

↓

Active Recall
Common Mistakes

↓

MCQ Distractors
Exam Tips

↓

Revision Sheet
Educational Objects

Slice 11 introduces a new family of models.

These are derived objects.

Flashcard
class Flashcard(BaseModel):
    id: str

    topic_id: str

    front: str

    back: str

    difficulty: str

    tags: list[str]
MCQ
class MCQ(BaseModel):

    id: str

    topic_id: str

    question: str

    options: list[str]

    correct_answer: int

    explanation: str
Active Recall
class RecallPrompt(BaseModel):

    id: str

    topic_id: str

    prompt: str

    expected_points: list[str]
Cheat Sheet
class CheatSheet(BaseModel):

    topic_id: str

    bullets: list[str]

    formulas: list[str]

    memory_tricks: list[str]

    exam_focus: list[str]

Notice

They never exist independently.

They always point back to

StudyTopic
Renderers

This is the important architectural decision.

The renderer interface does not change.

Renderer<TInput, TOutput>

Examples

MarkdownRenderer

StudyTopic

↓

Markdown
FlashcardRenderer

StudyTopic

↓

list[Flashcard]
MCQRenderer

StudyTopic

↓

list[MCQ]

Every renderer remains a pure function.

Flashcard Strategy

Don't use the LLM initially.

Generate deterministic flashcards.

Example

Definition

↓

Question

"What is Bellman-Ford Algorithm?"
Back

Definition

Another

Algorithm Steps

↓

"What are the steps of Bellman-Ford?"
Back

Step 1

Step 2

...

Step 6

Another

Memory Trick

↓

Front

"How can you remember Bellman-Ford?"
Back

Bank analogy

One Study Topic naturally becomes multiple flashcards.

MCQ Strategy

Initially

Generate them deterministically.

Example

Question

Which algorithm detects negative cycles?

Correct

Bellman-Ford

Distractors

Can come from

Comparison Table

Common Mistakes

Related Algorithms

If comparison data is unavailable

use

Dijkstra

Floyd-Warshall

Prim's

from the Study Topic context.

Later

Slice 11B

can introduce

LLM-enhanced MCQs.

Active Recall

One of the most valuable features.

Instead of

Explain Bellman-Ford.

Ask

Without looking,

write down

1.

Definition

2.

Steps

3.

Time Complexity

4.

Negative Cycle Detection

5.

Applications

Then reveal

Key Takeaways.

No extra generation required.

Cheat Sheet

Generated entirely from

Definition

Formula

Key Takeaways

Exam Tips

Memory Trick

Should fit on one page.

This becomes incredibly useful before exams.

Directory Structure
app/

    renderers/

        markdown_renderer.py

        flashcard_renderer.py

        mcq_renderer.py

        recall_renderer.py

        cheatsheet_renderer.py

models/

    revision.py

services/

    revision_engine.py
Revision Engine

The Revision Engine coordinates renderers.

class RevisionEngine:

    def flashcards(self, topic):

        ...

    def mcqs(self, topic):

        ...

    def recall(self, topic):

        ...

    def cheatsheet(self, topic):

        ...

Notice

No business logic.

Only orchestration.

Future Compatibility

This architecture leaves room for:

LLM-generated higher-quality MCQs
Adaptive flashcards
Spaced repetition
Personalized quizzes
Difficulty adjustment

without changing the core models.

Slice 11 Implementation Plan
Phase 1 — Revision Models

Create:

app/models/revision.py

Implement:

Flashcard
MCQ
RecallPrompt
CheatSheet

No LLM.

Phase 2 — Renderer Layer

Create:

flashcard_renderer.py

mcq_renderer.py

recall_renderer.py

cheatsheet_renderer.py

Each receives

StudyTopic

Each returns its own object.

Phase 3 — Revision Engine

Create

revision_engine.py

This is simply an orchestrator.

Phase 4 — Deterministic Generation

Implement:

Definition → Flashcards
Algorithm Steps → Flashcards
Memory Trick → Flashcards
Common Mistakes → Flashcards
Exam Tips → Flashcards

Do the same for:

MCQs
Recall prompts
Cheat sheets

without using the LLM.

Phase 5 — Validation

Use your three benchmark topics:

Bellman-Ford
Exception Handling
SDLC

For each, verify that:

Flashcards are accurate and complete.
MCQs are meaningful and have sensible distractors.
Active Recall prompts cover the major learning objectives.
Cheat Sheets summarize the topic effectively.
Acceptance Criteria

Slice 11 is complete when:

A StudyTopic can produce all revision resources without another planning pass.
Every renderer is a pure transformation.
No renderer calls the LLM.
Revision artifacts are derived, not stored as primary data.
The revision outputs are genuinely useful for study and exam preparation.
One recommendation before implementation

I would keep Slice 11A deterministic exactly as described above.

Once that is stable, create Slice 11B that selectively uses the LLM to enhance revision materials (for example, generating more natural MCQs or richer active recall questions). This preserves the architecture you've spent months building while allowing educational quality to improve incrementally without making the Revision Engine dependent on another generation pipeline.