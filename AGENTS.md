# AGENTS.md

## Project Identity
**Name:** StudyForge
**Type:** AI-INTEGRATION HEAVY
**Problem:** University students preparing for exams are locked out of AI study tools
the moment they lose internet access, hit a free-tier limit, or upload
anything sensitive — medical notes, legal case studies, research drafts —
to a cloud service. They have the material. They have a laptop. They have
no private, local tool that turns a folder of lecture PDFs into structured
study notes without an API key or a data agreement.
**Solution:** A local desktop app (React + FastAPI + Ollama) that ingests PDFs and PPTX
files and outputs structured Markdown study notes in user-selected formats
— no internet, no API key, no data leaves the machine.
**Tech Stack:**
Frontend:        React + TypeScript + Tailwind CSS + shadcn/ui
Backend:         Python + FastAPI
Database:        SQLite (offline-first, no relational data need)
Auth:            None (local app, no user accounts)
Deployment:      Docker (local container)
Key libraries:   Ollama (local inference), LangChain + langchain-ollama,
                 PyMuPDF (fitz), python-pptx, Lucide React
**Hackathon duration:** 24hrs

## Your Role
You are a senior full-stack engineer working on this project.
You write clean, functional code. You do not over-engineer.
You do not add features not explicitly requested.
You do not refactor code that is working unless asked.
You ask before making any change to a HUMAN GATED file.

## Folder Structure
(paste the filled folder structure from Step 3)

StudyForge/

├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── assets/
│   │   └── App.tsx
│   ├── public/
│   └── package.json

├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── services/
│   │   ├── models/
│   │   ├── utils/
│   │   └── main.py
│   ├── uploads/
│   ├── output/
│   └── requirements.txt

├── AGENTS.md
├── CONTEXT-LOG.md
├── README.md
├── docker-compose.yml
└── .env

## Naming Conventions
(paste the naming conventions from Step 4)

Agent follows these. No exceptions.

FILES:
- React components: PascalCase.tsx (e.g. UserCard.tsx)
- Utility functions: camelCase.ts (e.g. formatDate.ts)
- Route handlers: route.ts (Next.js convention)
- Types: PascalCase.types.ts or inside types/index.ts
- Hooks: use-kebab-case.ts (e.g. use-auth-state.ts)

COMPONENTS:
- One component per file
- Default export only
- Props interface named: ComponentNameProps

FUNCTIONS:
- Event handlers: handle + action (e.g. handleSubmit, handleDelete)
- Data fetchers: fetch + resource (e.g. fetchUserData)
- Formatters: format + thing (e.g. formatCurrency)
- Boolean variables: is/has/can prefix (e.g. isLoading, hasError)

DATABASE (if applicable):
- Table names: snake_case plural (e.g. user_profiles, invoice_items)
- Column names: snake_case (e.g. created_at, user_id)
- Foreign keys: referenced_table_singular + _id (e.g. user_id, project_id)

API ROUTES:
- REST: /api/resource (plural noun, no verbs)
- Method defines action: GET=read, POST=create, PUT=replace, PATCH=update, DELETE=remove
- POST /upload
- POST /generate
- GET /status
- GET /download
- DELETE /uploads

## Human Gated Zones — ASK BEFORE TOUCHING
- frontend/package.json
- backend/requirements.txt
- docker-compose.yml
- .env
- Ollama model selection

If you need to make a change in a human gated zone — stop, describe what change
is needed and why, and wait for confirmation before writing any code.

## Agent Safe Zones — Work Freely
- frontend/src/components/
- frontend/src/pages/
- frontend/src/hooks/
- frontend/src/utils/
- backend/app/api/
- backend/app/services/
- backend/app/models/
- backend/app/utils/
- uploads/
- output/

## Slice Backlog

Convert your Phase 03 screen list into buildable slices.
Each slice is one agent session. One concern. One definition of done.

A slice is NOT a layer (not "all frontend then all backend").
A slice is a complete vertical cut: UI → logic → backend → wired → working.

Fill one block per slice. Add as many as needed.

SLICE 1 — Core Generation Pipeline
Screens involved (from Phase 03 screen list): 1 2 3
Backend work (endpoints / DB operations / external API calls): Upload endpoint,PDF parsing, PPT parsing,Ollama integration, Markdown generation
Definition of done (specific and testable — not "it works"):Upload a PDF,Click Generate,Receive a markdown preview,Download markdown,End-to-end working.
Estimated time: 1.5 hrs 
Risk level: HIGH
Fallback if HIGH (what the mock looks like):Disable PPT support,Support PDF only,Hardcode one note template.

---

SLICE 2 — Intelligent Note Generation
Screens involved: 2 3
Backend work: Prompt template system, Multiple study styles, Prompt builder service, Document chunking, Project deletion endpoint
Definition of done:Prompt generation is modular, long documents are chunked, custom instructions influence output, users have the option to delete a workspace or file.
Estimated time: 1.5 hrs
Risk level: MEDIUM
Fallback if HIGH: Keep five predefined templates, skip advanced chunk merging.

---

SLICE 3 — Workspace & Export Experience
Screens involved: 3 4 5
Backend work: Save project metadata (SQLite), Save markdown files, Project listing endpoint, Open project endpoint
Definition of done:Generated notes can be edited, saved, reopened, and exported. Recent Projects displays correctly.
Estimated time: 1 hr
Risk level: LOW
Fallback if HIGH:Store project metadata in JSON files instead of SQLite.

---

SLICE 3.5 — Editing Workspace & Project Organization
Screens involved: Markdown Workspace, Recent Projects Sidebar, Project Management Dialogs
Backend work: New `project_groups` table, Update `projects` table (add `group_id`, `last_modified`, `model`, etc.), Implement group/project move, rename, and search endpoints.
Definition of done: Preview mode is default, Edit button switches to split workspace, live preview, save updates existing project, Sidebar supports project groups, rename/move/search work, generation pipeline untouched.
Estimated time: 2–3 hours
Risk level: LOW
Fallback if HIGH: Replace drag & drop with Move Project dialog.

---

SLICE 4 — Intelligent Document Understanding
Screens involved: Processing Workspace, Markdown Preview
Backend work: Implement document_structure_service.py (Heading, Table, List detection, Figure placeholder, Metadata extraction).
Definition of done: Headings, Lists, Tables preserved, Figures represented, References grouped, Quiz slides converted, Existing generation unaffected.
Estimated time: 3 hrs
Risk level: MEDIUM
Fallback if HIGH: Summarize table instead of reproducing it.

---

SLICE 5 — AI Study Assistant
Screens involved: Study Assistant, Markdown Preview, Revision Panel
Backend work: Implement study_assistant_service.py (generate_flashcards, generate_questions, generate_summary, generate_keywords, generate_formula_sheet)
Definition of done: Flashcards generated, Practice questions generated, Summary generated, Keywords extracted, Explain Simpler works, Existing workspace unaffected.
Estimated time: 3–4 hrs
Risk level: MEDIUM
Fallback if HIGH: If flashcards become unreliable, generate only Question/Answer pairs.

---

SLICE 6 — Hierarchical Knowledge Context & Revision Workspace
Screens involved: Revision Workspace, Sidebar
Backend work: Implement context_service.py, revision_service.py. Update DB to support collections, units, chapters, projects.
Definition of done: Hierarchical workspace implemented, AI respects selected scope, Revision Workspace completed, 5 revision tools work, existing Study Assistant remains functional.
Estimated time: 3–4 hrs
Risk level: MEDIUM
Fallback if HIGH: Use folder-based hierarchy only. Resolve context directly from folder structure without DB normalization.

---

SLICE 7 — Adaptive Workspace
Screens involved: Workspace, Markdown Reader, Markdown Editor, Live Preview, Explorer Sidebar, Toolbar
Backend work: Minimal. Persist user workspace preferences (zoom level, reading mode, panel widths). No AI or database changes.
Definition of done: Workspace components are resizable, zoom works via shortcuts, Reading/Editing/Focus modes implemented, workspace preferences persist.
Estimated time: 5–7 hrs
Risk level: MEDIUM
Fallback if HIGH: If persistent workspace settings become unstable, fallback to Local Storage.

---

SLICE 7.5 — IDE Tabs & Split-Screen (Ad-hoc)
Screens involved: Workspace, TabBar
Backend work: None.
Definition of done: Multiple documents open in tabs, native drag-and-drop reordering, horizontal split screens, and a smart-collapsing edit mode. Note: There is no SLICE-07.5.md file; it was done at the user's command and not a file.
Estimated time: 1 hr
Risk level: LOW
Fallback if HIGH: Disable drag and drop.

---

SLICE 8 — Context Magic
Screens involved: Document Workspace, Study Assistant Panel, Revision Workspace
Backend work: Implement dynamic generation options (types, parameters, context selection), stream artifacts, implement semantic search, handle cancellation/queues.
Definition of done: One intelligent assistant replaces isolated tools, user can choose context before generation, customize outputs, generated artifacts are reusable, Revision Mode supports multiple presets, Search supports filename and knowledge modes, everything streams.
Estimated time: 8–12 hrs
Risk level: MEDIUM
Fallback if HIGH: Fallback to Current File and Current Chapter context selection only. Move knowledge search to Slice 11.

---

SLICE 9 — Document Intelligence
Screens involved: Upload Workspace, Generation Pipeline, Project Workspace, Settings
Backend work: Create dedicated preprocessing pipeline (Extract -> Clean -> Classify -> Chunk -> Cache -> Generate -> Save). Implement structure-aware chunking, markdown import parsing, smart document classification, and pipeline metrics tracking.
Definition of done: Large documents generate faster, noise is automatically removed, Markdown files can be imported, cached processing reduces repeated work, processing metrics are visible, and pipeline stages are modular.
Estimated time: 8–10 hrs
Risk level: MEDIUM
Fallback if HIGH: If incremental processing exceeds the time budget, fall back to regenerating the entire document while keeping preprocessing and caching intact.

---

SLICE 9.5 — Architecture Freeze & Generation Engine (Folio)
Screens involved: None (architecture slice, existing generation pipeline only)
Backend work: Freeze the Core Data Model (Document and LearningObject Pydantic models). Implement Stable Identifiers (UUID + Slug). Create Renderer Layer (MarkdownRenderer). Implement Two-Pass Generation Pipeline (Planning Pass -> JSON Outline -> Generation Pass -> Learning Objects -> MarkdownRenderer). Implement Token Budgets (Definition 30-50, Explanation 120-180, etc.). Implement Caching based on content_hash. Defer advanced Canonical Concept features.
Definition of done: LearningObject is the primary storage model. MarkdownRenderer is the only active renderer. Two-pass generation is operational (JSON outline -> Learning Objects). Markdown is never directly output by the LLM. Token budgets are enforced. Stable IDs are implemented.
Estimated time: 5–7 hrs
Risk level: MEDIUM
Fallback if HIGH: Implement the renderer layer and Learning Object schema first. Keep the existing single-pass generation call temporarily. Two-pass generation may be completed later.

---

SLICE 9.5(c) — Generation Engine Validation & Benchmark Freeze
Screens involved: None (validation & benchmarking only)
Backend work: Rename engines (LegacyEngine, TwoPassSequentialEngine, TwoPassBatchEngine). Implement Variant C (wrap JSON array in root object). Enable Ollama JSON mode and set default temp to 0.1. Implement two-stage parser (Syntax Recovery + Schema Validation). Run extensive benchmark suites (Incremental, Thinking, Schema Complexity, Reliability, Determinism) to identify Maximum Reliable Batch Size.
Definition of done: Engine naming standardized, Variant C implemented, JSON mode enabled, two-stage parser active, all 5 benchmark suites completed, and engine acceptance criteria evaluated against 95%+ syntax/schema validity. Engine is then permanently frozen.
Estimated time: 4–6 hrs
Risk level: HIGH
Fallback if HIGH: Determine precise failure points (token limits, batch limits). Automatically constrain generation to validated limits. Re-run benchmark. If TwoPassBatchEngine still fails within limits, fallback to TwoPassSequentialEngine as default.

---

SLICE 10 — Output Engine: Personal Knowledge Rendering
Screens involved: None (core backend processing)
Backend work: Expand LearningObject schema with optional capabilities (code_example, diagram_description, memory_trick, etc.). Create independent, pure-function Markdown rendering components (Heading Renderer, Definition Renderer, Mermaid Renderer, etc.). Create hardcoded renderer acceptance tests. Update Planning & Generation prompts to populate the expanded schema. Run final educational benchmarks across 3 document types.
Definition of done: Renderer faithfully reproduces study patterns from 3 reference Markdown uploads. Generation Engine successfully populates the expanded schema. Real lecture documents produce notes that are educationally superior to the LegacyEngine and require no manual LLM re-prompting.
Estimated time: 5–8 hrs
Risk level: HIGH
Fallback if HIGH: Fallback to basic Markdown structure without advanced Mermaid/table components if model hallucination becomes unmanageable with expanded schemas.

---

SLICE 10b — Phase 5: Educational Intelligence Calibration
Screens involved: None (pipeline diagnostics & prompt alignment only)
Backend work: Refactor `planning_service.py` to stop picking capabilities directly, and instead perform "Educational Analysis" (detecting algorithms, formulas, code, memorization needs, etc.). Implement a deterministic python Capability Mapper that translates the Educational Analysis booleans into the required renderer capabilities. Log every stage (Document -> Planner -> Analysis -> Capabilities -> Generation -> LearningObject -> Markdown) for a single concept (Banker's Algorithm) to identify capability drops.
Definition of done: The pipeline is fully instrumented. Every missing educational section can be traced. The planner consistently identifies educational opportunities without needing to know renderer internal fields. The Generation engine correctly populates requested capabilities. The renderer naturally displays richer notes.
Estimated time: 4–6 hrs
Risk level: HIGH
Fallback if HIGH: Revert to the LLM directly choosing capabilities if the deterministic mapping proves too inflexible.

---

SLICE 10c — Phase 6: Final Production Validation
Screens involved: None (production benchmarking)
Backend work: Cleanup tasks: 1) Update Generation Prompt to strictly route code/syntax to `code_example`. 2) Add Mermaid validation to `renderer.py` to prevent broken markdown. Real World Validation: Run a script `benchmark/production_validation.py` on a genuine large university lecture to measure End-to-End Timing, LearningObjects per Second, Capability Usage distribution, and Renderer Statistics. Generate a `production_validation_report.md` evaluating the true educational quality and system throughput.
Definition of done: Code examples route correctly. Non-mermaid diagrams gracefully fallback to standard notes. Real lecture processed without parser/schema/renderer failures. Throughput metrics recorded. Educational quality is judged suitable for studying without external AI tools. Production report generated.
Estimated time: 2–3 hrs
Risk level: MEDIUM
Fallback if HIGH: If a large real-world lecture fails to process entirely due to memory/token limits, chunk the document manually and run the validation on a subset to prove quality, then address throughput in Slice 11.

---

SLICE 9.6 — Document Intelligence Refinement
Screens involved: None
Backend work: Refine document extraction into an educationally-aware planner input deterministically (no LLMs). Introduce `app/services/document_intelligence.py` to classify slides (CONTENT, EXAMPLE, COMPARISON, QUIZ, REFERENCE, etc.), extract exam hints, detect image-heavy slides, and build a `PlannerInput` object containing a `DocumentProfile`. Update `planning_service.py` to consume this richer input. Add a `confidence` float to each `ClassifiedSlide`.
Definition of done: Every slide is deterministically classified. Planner receives only relevant educational material (excluding noise). Quiz questions enrich exam hints rather than forming isolated LearningObjects. Image-heavy slides are identified. 
Estimated time: 3–4 hrs
Risk level: MEDIUM
Fallback if HIGH: If deterministic classification proves too brittle across diverse documents, loosen the rules to be highly permissive (classifying most things as CONTENT) to prevent data loss.

---

SLICE 10.5 — Educational Engine Finalization
Screens involved: None
Backend work: Freeze the educational pipeline. Refactor the Planner to output only concept metadata (title, type, source_slides). Introduce `Capability Resolver` (pure Python) to map concept types to required/recommended capabilities via `app/config/capability_profiles.py`. Introduce `Educational Policy` (`app/config/educational_policy.py`) to enforce target depths/word counts. Update the Generator prompt to ingest full document context, resolver output, policy, and hints, completely decoupling structure logic from generation. Generate v3 of the production validation and log to CONTEXT-LOG.
Definition of done: Every pipeline stage has one responsibility. Planner only discovers concepts. Capability selection is deterministic. Educational depth is controlled by policy rather than prompts. The generator teaches rather than transcribes.
Estimated time: 4–6 hrs
Risk level: HIGH
Fallback if HIGH: Revert to Slice 10c architecture if deterministic capability profiles fail to handle edge-case concepts effectively.

---

SLICE 10.5b — Validation & Refinement
Screens involved: None
Backend work: Validate pipeline behavior and identify fragmentation source without making architectural changes. 1) Add `FORWARD_REFERENCE` slide classification to Document Intelligence. 2) Update Planner prompt to clarify concept granularity and prevent over-splitting. 3) Run a diagnostic script (`diagnostic_pipeline.py`) to inspect Planner JSON, Document Intelligence classification, and final output.
Definition of done: Forward-reference slides are properly identified and filtered. Planner prompt accurately conveys that one Learning Object = one complete teachable concept. Raw outputs have been analyzed to determine exactly where fragmentation occurred. No further architecture changes are made until diagnostics are verified.
Estimated time: 2–3 hrs
Risk level: LOW
Fallback if HIGH: Revert planner prompt to previous state if new prompt causes concepts to become too merged.

---

SLICE 10.6 — Study Topic Refactor (Final Educational Architecture)
Screens involved: None
Backend work: Rename `LearningObject` to `StudyTopic`. Update the Planner to output unified `StudyTopics` with a new `covers` list (e.g., ["Time Complexity", "Applications"]) instead of fragmenting sub-topics into distinct objects. Update Generator to ingest this broader scope and generate a single comprehensive Study Topic containing all capabilities. Update SQLite cache logic and Markdown Renderer to reflect `StudyTopic`. Create `PIPELINE_DECISIONS.md` to document this final architectural decision. Re-run `production_validation_v3.py` (or a v4) to prove we now get 1 cohesive object.
Definition of done: The pipeline extracts a single `StudyTopic` (e.g. "Bellman-Ford Algorithm") from the 3.1.4.pptx lecture instead of 8 fragmented concepts. The generated Markdown retains all educational depth (Time Complexity, Applications, etc.) within that single topic. No duplicate educational objects exist.
Estimated time: 3–4 hrs
Risk level: HIGH
Fallback if HIGH: Keep `LearningObject` name but enforce prompt restrictions to prevent fragmentation.

---

SLICE 10F — Engine Freeze (Finalization)
Screens involved: None
Backend work: Finalize the Educational Engine for production. 1) Update `app/config/capability_profiles.py` to intelligently request formulas based on educational importance, and memory tricks as genuine analogies. 2) Extend `app/config/educational_policy.py` with qualitative expectations (e.g., "minimal_complete" code, "analogy" memory tricks). 3) Update `app/services/generation_service.py` prompt to "teach, not summarize". 4) Add strict Mermaid/Markdown validation to `app/services/renderer.py`. 5) Update and freeze `PIPELINE_DECISIONS.md`. 6) Run the final production validation suite.
Definition of done: The generation engine produces high-quality, study-ready notes. Formulas and code examples are present when educationally valuable. Mermaid syntax is strictly validated before rendering. The engine is completely frozen and ready to support downstream Slices (Flashcards, MCQs, etc.).
Estimated time: 2–3 hrs
Risk level: LOW
Fallback if HIGH: Revert any overly strict validation rules in the renderer if they strip out too much useful content.

---

SLICE 10Fb — Educational Signal Builder
Screens involved: None
Backend work: Insert a deterministic `EducationalSignalBuilder` between the Planner and Capability Resolver. 1) Create `app/config/educational_signal_profiles.py` to map `BlockType` to ideal educational enhancements. 2) Create `app/services/educational_signal_builder.py` to build `EducationalSignals` based on those profiles and exam hints. 3) Update `app/models/educational_signals.py` to reflect "would_help_learning" flags. 4) Update `CapabilityResolver` to consume these signals and dynamically inject capabilities.
Definition of done: The generation engine produces high-quality, study-ready notes with code, formulas, and memory tricks injected when educationally beneficial, without hardcoding them in validation scripts or relying on the LLM Planner to select them. The Educational Engine is permanently frozen.
Estimated time: 1–2 hrs
Risk level: LOW
Fallback if HIGH: Revert to static capability profiles without dynamic signal injection.

---

SLICE 11 — Revision Engine (Deterministic)
Screens involved: None
Backend work: Build a deterministic pipeline to transform a `StudyTopic` into `Flashcard`, `MCQ`, `RecallPrompt`, and `CheatSheet` resources without using the LLM. 1) Create models in `app/models/revision.py`. 2) Refactor renderers into `app/renderers/`. 3) Implement pure-function renderers for each revision type. 4) Create `RevisionEngine` orchestrator in `app/services/revision_engine.py`.
Definition of done: A single generated Study Topic seamlessly and deterministically produces flashcards, MCQs, active recall prompts, and a cheat sheet based on its existing fields (e.g. Definition -> Flashcard Front, Explanation -> Back).
Estimated time: 3–4 hrs
Risk level: LOW
Fallback if HIGH: Start with only Flashcards and Cheat Sheets before tackling deterministic MCQs.

---

SLICE 11.5 — Revision Expansion Engine
Screens involved: None
Backend work: Build `app/services/revision_expansion_service.py` to generate entirely new educational artifacts (Conceptual Questions, Comparison Questions, Scenario Questions, Viva Questions, Coding Challenges, Exam Predictions) from a single `StudyTopic`. Create `app/models/revision_expansion.py` for Pydantic schemas. Create `app/prompts/revision_expansion_prompt.py`. Update validation suite.
Definition of done: Every `StudyTopic` can generate six new higher-order revision experiences in a single LLM call. Questions require reasoning rather than simple recall. No artifacts duplicate deterministic resources. The deterministic engine remains unaffected.
Estimated time: 3–4 hrs
Risk level: LOW
Fallback if HIGH: Start with only Conceptual and Scenario questions before adding the rest.

**Slice ordering rules:**
- Slice 1 must be the core feature — the thing that proves the product works. Not auth. Not settings.
- Auth goes in Slice 2 unless the entire product is behind auth and cannot be demoed without it.
- Nice-to-have features go last. If time runs out they get cut without breaking the demo.
- Total estimated time across all slices must be ≤ 80% of your build window. The remaining 20% is buffer. If it doesn't fit, cut a slice now — not at hour 20.


## Design System
The following design tokens apply to every component you write.
Do not introduce any color, font, radius, or shadow not defined here.

(paste the full Design Brief from Phase 03 here)
DESIGN BRIEF PREFIX:
Product aesthetic: Knowledge Workspace — editor-inspired, document-first,
typography-led, calm, productivity-focused, minimal decoration, built for
long reading sessions.

Color system: Primary #2563EB, Secondary #0EA5A4,
Background #F8FAFC, Surface #FFFFFF,
Border #E2E8F0, Text primary #0F172A, Text secondary #64748B

Typography: Inter for headings (700), Inter for body (400), scale: Normal

Spacing: 4px base unit. Padding: 24px on containers, 16px on components.

Shape: 10px border radius on all components. Subtle shadow.

Buttons: Solid primary-colored buttons with 10px radius, medium-weight
labels, optional leading icon, no gradients, darker hover state.

Cards: White surface cards with subtle shadow, 10px radius, 24px internal
padding, 1px border using the border color, generous whitespace.

Inputs: Outlined inputs with 1px border, 10px radius, 16px horizontal
padding, muted placeholder text, blue focus ring.

Icons: Lucide, 20px

Consistency rule: Every screen must feel like it belongs to the same
product. Prioritize readability, whitespace, and information hierarchy
over decoration. No element should introduce a color, font, radius,
shadow, or visual style not defined above.


SCREEN LIST IN DEMO ORDER:
1. Welcome / Upload Workspace
2. Document Processing & Configuration
3. Generated Study Notes Preview
4. Markdown Editor & Export
5. Settings (Model & Note Style)
6. About / Recent Projects (only if time permits)


ICON LIBRARY CHOSEN:
Lucide — 20px


FONT IMPORT URLS (Google Fonts links for both fonts):
Heading: https://fonts.googleapis.com/css2?family=Inter:wght@700&display=swap
Body:    https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap

## Slice Protocol
You work one slice at a time. A slice is defined in the slice backlog.
At the start of each slice: read the slice definition. Confirm you understand
the definition of done before writing any code.
At the end of each slice: append one entry to CONTEXT-LOG.md in this format:

[YYYY-MM-DD HH:MM] SLICE: slice name
What was built: (2–3 lines max)
Key decisions made: (1–2 lines — only if non-obvious)
Blockers encountered: (if none, write "none")
Next slice: next slice name

Do not overwrite previous entries. Append only.

## Commit Convention
You do not make commits. The developer commits manually.
If you complete work and believe a commit point has been reached,
say: "Commit point reached — [brief description of what was done]"
Do not use git commands unless explicitly asked.

## Error Protocol
If you encounter an error you cannot resolve in 2 attempts:
1. Stop trying to fix it
2. State exactly what the error is, what you tried, and what you think is causing it
3. Ask the developer how to proceed
Do not spiral. Do not make unrelated changes while debugging.