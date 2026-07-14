Slice 10 Finalization — Engine Freeze
Goal

Before starting Slice 11 (Learning Engine), we will permanently freeze the educational pipeline.

Slice 10 proved that the architecture works and that the generated Study Topics are genuinely useful for studying.

This session is not about redesigning the architecture.

Instead, it focuses on polishing the educational quality, removing the last weak points discovered during real-world validation, and freezing the engine so every future renderer (Flashcards, MCQs, Revision Cards, AI Tutor) can rely on a stable data model.

After this implementation, the Educational Engine becomes the permanent foundation of Folio.

Architectural Principle

The architecture is now frozen.

Document

↓

Document Intelligence

↓

Planner
(What is being taught?)

↓

Capability Resolver
(What educational features are required?)

↓

Educational Policy
(How detailed should each feature be?)

↓

Generator
(Teach the topic)

↓

StudyTopic

↓

Renderer
(Present the StudyTopic)

No future slice should modify this pipeline unless a genuine architectural flaw is discovered.

All future features consume StudyTopic.

They never regenerate knowledge.

Objectives

We will address the final educational weaknesses discovered during production validation.

Specifically:

improve memory tricks
improve formula generation
improve code example generation
strengthen educational prompts
validate renderer outputs
freeze all prompt templates
Proposed Changes
1. Capability Profile Improvements
MODIFY
app/config/capability_profiles.py

The capability profiles are now considered stable.

However, two improvements are required.

Formula Priority

Formula generation should no longer depend solely on BlockType.

Instead, introduce an educational importance rule.

Example:

requires_formula = (
    concept.contains_formula
    or concept.type == BlockType.FORMULA
    or concept.type == BlockType.ALGORITHM
)

Algorithms such as

Bellman-Ford
Banker's Algorithm
Heap Operations

should automatically request formulas whenever they are educationally important.

The absence of a formula should only occur when one genuinely does not exist.

Memory Trick Policy

Replace generic memory tricks with educational mnemonics.

Bad:

Bellman for Bellman
Ford for Ford

Good:

Think of a cautious banker.

Never approve a transaction unless
you know the account will remain safe.

Bellman-Ford repeatedly checks every road
before trusting a path.

The Capability Resolver should always request meaningful analogies instead of name-based mnemonics.

2. Educational Policy Improvements
MODIFY
app/config/educational_policy.py

Extend the educational policy.

Instead of only defining target word counts, define quality expectations.

Example

EducationalPolicy(
    memory_trick="analogy",
    example="real_world",
    code_example="minimal_complete",
    explanation_depth="teaching",
    exam_tip="high_value"
)

This allows prompts to stay simple while educational quality is controlled in one place.

3. Generator Prompt Improvements
MODIFY
app/services/generation_service.py

Update the generation prompt.

The generator should no longer think like a summarizer.

It should think like a lecturer.

New guiding principles:

Teach.

Do not summarize.

Assume the student will never reopen the slides.

Preserve the lecturer's emphasis.

Supplement sparse content using accurate
standard academic knowledge.

Prefer understanding over compression.

Generate useful revision material,
not presentation notes.
Code Example Guidance

Instead of requesting

Provide a code example.

request

Provide the smallest complete implementation
that demonstrates the concept.

Do not write unnecessary boilerplate.

Only include code if it improves understanding.

This keeps code educational.

Formula Guidance

When formulas exist,

request

Generate the canonical formula exactly
as students are expected to write it in exams.

Explain each symbol briefly if appropriate.
Memory Trick Guidance

Replace

Generate a memory trick.

with

Generate a genuine mnemonic,
analogy,
or visualization.

Avoid creator-name mnemonics.

Prefer analogies students can remember
months later.
4. Renderer Validation
MODIFY
app/services/renderer.py

Add lightweight validation before rendering.

Examples

Formula

If formula exists

Render

**Formula**

```math
Need = Max - Allocation

Otherwise

Skip the section.

---

### Mermaid

Before rendering

```mermaid

verify that the content begins with

graph

flowchart

sequenceDiagram

classDiagram

stateDiagram

If invalid,

render as

> Diagram Description

instead of broken Mermaid.

Code

Always render

```language

instead of plain text.

Even if the language is unknown,

default to

text
5. Production Validation
MODIFY
benchmark/production_validation.py

Create

production_validation_v4.md

using

the three reference lectures.

Validation should confirm

no duplicate Study Topics
formulas appear when appropriate
memory tricks are educational
code examples are minimal
renderer output is clean
markdown renders correctly
6. Documentation Freeze
MODIFY
PIPELINE_DECISIONS.md

Record the final educational decisions.

Example

StudyTopic is the primary learning entity.

Flashcards,
MCQs,
Revision Sheets,
AI Tutor,
Mind Maps,
and Search
derive from StudyTopics.

The generator teaches.

The renderer presents.

The planner discovers.

The capability resolver decides educational structure.

Educational Policy controls quality.

No renderer may regenerate knowledge.

Also document

Known Future Improvements

• OCR

• Vision models

• Diagram understanding

• Formula OCR

• Image extraction

• Interactive diagrams

These are intentionally postponed.

Verification Plan

Run the production validation suite again using the three benchmark documents.

Validation passes when:

Educational Quality
Memory tricks are meaningful.
Formula blocks appear whenever educationally important.
Code examples are concise and useful.
Explanations are complete enough that students do not need the original slides.
Rendering
No empty sections.
No malformed Mermaid.
No duplicated code.
No broken markdown.
Architecture
No changes to Planner.
No changes to StudyTopic schema.
No changes to Document Intelligence.
No changes to Capability Resolver flow.
Acceptance Criteria

The engine is considered permanently frozen when:

✅ StudyTopic remains the single educational source of truth.
✅ Educational prompts consistently produce study-quality notes.
✅ Formula generation is reliable for formula-heavy subjects.
✅ Memory tricks are useful rather than superficial.
✅ Code examples are educational and minimal.
✅ Renderer output is production-ready.
✅ All production validation documents pass.
✅ PIPELINE_DECISIONS.md is updated and frozen.
Deliverable

At the end of this session, the Educational Engine is feature-complete and frozen.

From Slice 11 onward, the focus shifts entirely to building new learning experiences (Flashcards, MCQs, Revision Sheets, AI Tutor, etc.) on top of the StudyTopic model, without revisiting the core generation pipeline.