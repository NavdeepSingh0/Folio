Slice 10Fb — Educational Signal Builder
Goal

The Educational Engine is now structurally complete. The remaining issue is not architecture, but educational richness.

During Slice 10 we discovered an important architectural distinction:

The document determines what is taught.
The Educational Engine determines how it is taught.

Currently the Capability Resolver decides capabilities directly from the planner output. This works, but it mixes semantic classification ("this is an Algorithm") with educational decisions ("this concept would benefit from a formula and code example").

Before moving into Slice 11, we will separate these concerns by introducing an Educational Signal Builder.

This does not change the pipeline architecture.

It simply inserts a deterministic educational reasoning layer between the Planner and the Capability Resolver.

The purpose is to ensure that educational enhancements (code examples, formulas, memory tricks, comparison tables, diagrams, etc.) are selected because they improve learning—not merely because they appeared in the source document.

This keeps the Generator focused entirely on teaching.

Educational Philosophy

Folio is not a slide summarizer.

Folio is an educational engine.

Therefore:

The Planner decides what the lecture teaches.
The Educational Signal Builder decides what helps students learn.
The Capability Resolver decides which fields should exist.
The Generator writes the content.
The Renderer presents the content.

Each stage has exactly one responsibility.

Final Pipeline
Document Intelligence
        │
        ▼
Planner
(title, type, source slides)
        │
        ▼
Educational Signal Builder
(student-centric educational signals)
        │
        ▼
Capability Resolver
(required / standard / optional capabilities)
        │
        ▼
Generator
(full document + exam hints + capabilities)
        │
        ▼
Study Topic
        │
        ▼
Renderer
Markdown

The Generator should never decide educational structure.

It should only fill the structure it receives.

Proposed Changes
1. Educational Signal Builder
[NEW]

app/services/educational_signal_builder.py

Create a deterministic service.

build_signals(
    topic_type: BlockType,
    exam_hints: list[str],
) -> EducationalSignals

This service does not use the LLM.

It simply maps educational needs from the topic type.

Example:

EducationalSignals(
    formula_would_help_learning=True,
    code_would_help_learning=True,
    comparison_would_help_learning=False,
    memory_trick_would_help=True,
    diagram_would_help=False,
)

These are educational recommendations.

They are not extracted facts.

2. EducationalSignals Model
[NEW]

app/models/educational_signals.py

Example:

class EducationalSignals(BaseModel):

    formula_would_help_learning: bool = False

    code_would_help_learning: bool = False

    algorithm_steps_would_help: bool = False

    comparison_would_help_learning: bool = False

    diagram_would_help_learning: bool = False

    memory_trick_would_help: bool = False

    common_mistakes_would_help: bool = False

    real_world_example_would_help: bool = False

Keep the model intentionally small.

It should only answer:

"Would this help a student?"

3. Capability Resolver
[MODIFY]

app/services/capability_resolver.py

Instead of reading only

BlockType

it should now read

EducationalSignals

Example:

signals.code_would_help_learning

↓

add "code_example"

signals.formula_would_help_learning

↓

add "formula"

signals.memory_trick_would_help

↓

add "memory_trick"

The resolver remains deterministic.

No LLM.

4. Signal Profiles
[NEW]

app/config/educational_signal_profiles.py

Example:

ALGORITHM

↓

formula_would_help_learning=True

algorithm_steps_would_help=True

memory_trick_would_help=True

code_would_help_learning=True

common_mistakes_would_help=True

Theory concepts:

real_world_example=True

memory_trick=True

comparison=False

Programming concepts:

code=True

common_mistakes=True

example=True

This becomes the educational knowledge base of Folio.

5. Generator Prompt
[MODIFY]

generation_service.py

The Generator no longer receives generic capability names.

Instead it receives resolved educational capabilities.

Example:

Topic:
Bellman Ford Algorithm

Required capabilities:

definition

explanation

algorithm_steps

formula

exam_tip

code_example

memory_trick

common_mistakes

Use the full document to determine what is taught.

Where the lecture is sparse, supplement using accurate university-level knowledge.

The goal is that a student should not need to reopen the lecture slides.

The Generator teaches.

It no longer decides structure.

6. Planner
[NO CHANGES]

The Planner remains intentionally simple.

It outputs only

title
BlockType
importance
source slides

Nothing else.

The Planner never reasons about educational presentation.

Validation

Run the complete Bellman-Ford validation again.

The expected improvements are:

✅ Formula automatically included.

✅ Code example automatically included.

✅ Memory trick based on analogy rather than author-name mnemonics.

✅ No fragmentation.

✅ No duplicated topics.

✅ No empty comparison tables.

The Study Topic should remain a single cohesive unit while containing richer educational content.

Verification Plan
Automated

Run

production_validation_v4.py

using

Uploads/3.1.4.pptx

Verify:

No schema errors
One Study Topic
Formula rendered correctly
Code example rendered correctly
EducationalSignals generated deterministically
CapabilityResolver selects capabilities without any LLM involvement
Manual

Compare the final output against the previous best Bellman-Ford output.

The final engine should satisfy:

One cohesive Study Topic.
Educational depth equal to or better than V1.
Structure and consistency of V4.
Educational enhancements selected because they improve learning, not simply because they appeared in the slides.
Definition of Done

The Educational Engine is considered frozen when:

The Planner only discovers topics.
EducationalSignalBuilder determines what would help learning.
CapabilityResolver deterministically selects capabilities.
The Generator focuses exclusively on teaching.
The Renderer focuses exclusively on presentation.

After this point, no further architectural changes should be made to the generation pipeline. Slice 11 and beyond will build entirely on this frozen educational engine.