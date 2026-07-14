Slice 11B — Revision Expansion Engine
Goal

The deterministic Revision Engine (Slice 11A) successfully transforms a StudyTopic into revision resources such as Flashcards, MCQs, Cheat Sheets, and Active Recall prompts. However, these resources are fundamentally restructured information. They reorganize knowledge that already exists inside the StudyTopic, but they do not create new educational experiences.

Slice 11B introduces the Revision Expansion Engine.

Instead of rewriting existing flashcards or MCQs, the LLM is tasked with generating entirely new forms of revision that require reasoning, application, comparison, and teaching experience.

The philosophy is:

Deterministic Revision recalls information. Revision Expansion teaches students how to think.

The StudyTopic remains the single source of truth.

The Revision Expansion Engine never reads the original lecture or PowerPoint. It operates exclusively on the finalized StudyTopic, ensuring that all generated content remains consistent with the validated Educational Engine.

Educational Philosophy

Different study activities exercise different cognitive skills.

Slice 11A primarily supports:

Recognition
Memorization
Quick Revision

Slice 11B adds higher-order learning:

Conceptual Understanding
Comparison
Application
Problem Solving
Interview Preparation
Exam Preparation

This aligns much better with Bloom's Taxonomy.

Architecture
StudyTopic
      │
      ▼
Revision Engine (Deterministic)
      │
      ├── Flashcards
      ├── MCQs
      ├── Cheat Sheet
      └── Active Recall
      │
      ▼
Revision Expansion Engine
      │
      ├── Conceptual Questions
      ├── Comparison Questions
      ├── Scenario Questions
      ├── Viva Questions
      ├── Coding Challenges
      └── Exam Predictions

Notice that nothing in Slice 11B replaces Slice 11A.

It only adds new educational artifacts.

New Educational Objects

These are not renderers.

They are entirely new learning experiences.

Conceptual Questions

Purpose:

Test understanding rather than memory.

Example:

Why must Bellman-Ford perform V−1 iterations instead of stopping after the first relaxation?

Comparison Questions

Purpose:

Develop discrimination between similar concepts.

Example:

Under what circumstances should Bellman-Ford be preferred over Dijkstra?

Scenario Questions

Purpose:

Force application.

Example:

Your graph contains negative edge weights. Which shortest-path algorithm would you choose and why?

Viva Questions

Purpose:

Prepare students for interviews and oral examinations.

Example:

Explain edge relaxation in less than 30 seconds.

Coding Challenges

Purpose:

Bridge theory to implementation.

Example:

Implement Bellman-Ford and analyze its time complexity.

Exam Predictions

Purpose:

Generate realistic university-style questions.

Example:

Design a 10-mark question testing Bellman-Ford and provide a marking scheme.

Implementation
New Models
app/models/revision_expansion.py

Example:

class ConceptualQuestion(BaseModel):
    question: str
    answer: str

class ScenarioQuestion(BaseModel):
    scenario: str
    expected_answer: str

class VivaQuestion(BaseModel):
    question: str
    model_answer: str

class CodingChallenge(BaseModel):
    prompt: str
    expected_topics: list[str]

class ExamPrediction(BaseModel):
    marks: int
    question: str
    marking_scheme: list[str]
New Service
app/services/revision_expansion_service.py

Responsibilities:

StudyTopic

↓

Generate

Conceptual Questions

Comparison Questions

Scenario Questions

Viva Questions

Coding Challenges

Exam Predictions

This service should make one LLM call per StudyTopic, requesting all expansion artifacts in a single structured JSON response (following the same Variant C pattern you've already validated).

New Prompt
app/prompts/revision_expansion_prompt.py

The prompt should establish the model as an experienced university lecturer.

Key instructions:

Assume the student already has high-quality notes.
Do not summarize or rewrite the StudyTopic.
Create new learning activities.
Prefer conceptual understanding over memorization.
Generate plausible university-level questions.
Remain faithful to the supplied StudyTopic.
Never invent concepts outside the StudyTopic.
Output Contract

The LLM should return:

{
  "conceptual_questions": [],
  "comparison_questions": [],
  "scenario_questions": [],
  "viva_questions": [],
  "coding_challenges": [],
  "exam_predictions": []
}

Exactly the same philosophy used throughout the Educational Engine.

Validation

Create

benchmark/revision_expansion_validation.py

Validate using:

Bellman-Ford
Exception Handling
SDLC

For each topic verify:

Questions are conceptually different.
No factual hallucinations.
Output matches Pydantic schema.
Runtime remains reasonable (≤5–10 seconds per topic).
No duplicate questions.
Acceptance Criteria

Slice 11B is complete when:

Every StudyTopic can generate six new revision experiences.
The generated questions require reasoning rather than simple recall.
No educational artifact duplicates deterministic flashcards or MCQs.
All outputs remain grounded in the StudyTopic.
The entire expansion is produced in a single structured LLM call.
If the LLM fails, the deterministic Revision Engine (Slice 11A) continues to function unchanged.
Why this slice matters

This slice completes the educational backend.

After it, the backend will no longer be "a notes generator." It becomes a complete educational content engine capable of transforming one StudyTopic into multiple complementary ways of learning.

Once this is finished, I would freeze the backend. From that point onward, the focus shifts to Slice 12 — Learning Experience, where all this capability is exposed through a polished API and user interface rather than adding more intelligence to the pipeline.