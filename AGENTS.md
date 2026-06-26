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