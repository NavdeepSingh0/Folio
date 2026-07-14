SLICE 12 — Learning Experience
Goal

Transform StudyForge from a powerful backend into an application that a student can actually use from start to finish.

Until now every slice answered:

"Can we generate better educational content?"

Slice 12 answers:

"Can a student upload lectures, wait for processing, study the output, and revise everything from one coherent interface?"

The Educational Engine, Revision Engine, and Advanced Practice Engine are now frozen. Slice 12 does not change any AI logic.

Its responsibility is exposing everything already built through a clean backend API and an intuitive frontend workflow.

Philosophy

The backend already knows how to create:

Study Notes
Flashcards
MCQs
Recall Prompts
Cheat Sheets
Advanced Practice

The frontend should never recreate this logic.

Instead it becomes a viewer and orchestrator.

Think of Slice 12 as building the IDE around the compiler you've spent weeks writing.

Scope
Phase 1 — API Layer

Expose every educational artifact through dedicated REST endpoints.

The frontend should never directly call internal services.

It only communicates with the API.

New endpoints
POST   /api/upload

POST   /api/generate

GET    /api/status/{job_id}

GET    /api/study-topic/{id}

GET    /api/notes/{id}

GET    /api/revision/{id}

GET    /api/advanced-practice/{id}

GET    /api/download/{id}

DELETE /api/project/{id}

The generation endpoint should return a Job ID immediately.

Generation continues in the background.

Phase 2 — Generation Workspace

Replace the current "click generate and wait" experience.

Instead build a proper processing workspace.

Display pipeline progress.

Example

Uploading

✓ Extracting document

✓ Document Intelligence

✓ Planning

✓ Educational Engine

✓ Markdown Rendering

✓ Revision Engine

✓ Advanced Practice

Complete

Students should understand what is happening.

No mysterious loading spinner.

Phase 3 — Study Workspace

This becomes the primary screen.

Left sidebar

Projects

Collections

Units

Chapters

Study Topics

Center

Study Notes

Right Sidebar

Flashcards

MCQs

Recall

Cheat Sheet

Advanced Practice

Changing tabs should never regenerate anything.

Everything is already cached.

Phase 4 — Advanced Practice UI

Each practice type deserves its own experience.

Conceptual Questions

Comparison Questions

Scenario Questions

Viva

Coding

Exam Prediction

Not one long markdown file.

Use cards.

Allow collapse/expand.

Phase 5 — Reading Experience

The renderer is complete.

Now make reading enjoyable.

Features

Reading Mode
Focus Mode
Dark Mode
Table of Contents
Sticky navigation
Smooth scrolling
Collapsible sections

No backend work.

Phase 6 — Progress & Feedback

Generation now takes around 45–75 seconds.

Students need confidence the app is working.

Display

Current Stage

Elapsed Time

Estimated Remaining Time

Current Topic

Objects Generated

Also surface

Using local AI

Nothing leaves your computer

This reinforces one of StudyForge's biggest strengths.

What Slice 12 intentionally does NOT include

No OCR

No Vision Models

No Cross-document intelligence

No Planner changes

No Prompt changes

No Renderer changes

No Educational Engine changes

No Revision Engine changes

Those are frozen.

Proposed Changes
[NEW] backend/app/api/

Create dedicated route files.

upload.py

generation.py

study_topics.py

revision.py

advanced_practice.py

download.py

status.py
[NEW] backend/app/services/job_service.py

Responsible for

Job lifecycle
Progress tracking
Status updates

No educational logic.

[NEW] backend/app/models/job.py
Job

id

status

current_stage

progress

started_at

completed_at

elapsed_time

result_id
[MODIFY] Frontend

Create pages

UploadWorkspace

ProcessingWorkspace

StudyWorkspace
[NEW] Components
PipelineProgress

StudyTopicNavigator

RevisionSidebar

AdvancedPracticePanel

GenerationStatus

ProcessingTimeline

ArtifactTabs
[NEW] Hooks
useGenerationJob()

useStudyTopic()

useRevision()

useAdvancedPractice()
[MODIFY] Existing Workspace

Remove direct service coupling.

Everything flows through REST endpoints.

Verification Plan
Backend
Upload succeeds.
Generation returns Job ID.
Progress updates correctly.
Study Topics are retrievable.
Revision artifacts load independently.
Advanced Practice loads independently.
Downloads function correctly.
Frontend

Complete user journey.

Upload PPT

↓

Watch processing stages

↓

Open generated notes

↓

Open Flashcards

↓

Open MCQs

↓

Open Cheat Sheet

↓

Open Advanced Practice

↓

Download Markdown

No manual refreshes.

No JSON visible to the user.

No regeneration when switching tabs.

Definition of Done

A first-time student should be able to:

Upload a lecture.
Watch the processing pipeline.
Read the generated study notes.
Instantly switch between notes, flashcards, MCQs, recall prompts, cheat sheets, and advanced practice.
Download the generated notes.
Complete the entire experience without using the terminal or inspecting JSON.
Expected Outcome

It becomes a complete offline study application that demonstrates the full value of the educational pipeline you've built.

Only after this slice would I move to your long-term vision for multi-PPT chapter understanding, OCR, and cross-document intelligence, since those features enhance an already usable product rather than delaying one.

---

## Slice 12 Prerequisites: Audits & Hardening

Before beginning the Frontend integration (Slice 12), we conducted two end-to-end audits of the system to identify inefficiencies, race conditions, and UX bottlenecks. The results of these audits and the changes made are logged below.

### 1. Backend Audit & Hardening
**Focus:** Concurrency, State Management, and LLM Resilience.
**Results:** Identified major locking issues in SQLite, runaway generation times from local LLMs, and Pydantic validation failures.
**Changes Made:**
- **Concurrency Fixes:** Enabled SQLite `PRAGMA journal_mode=WAL` to resolve `database is locked` errors during background generation.
- **Lazy Daemon Pass:** Refactored the Generation API into a two-pass system. The "Fast Pass" immediately generates the UI-critical notes, while the "Lazy Pass" runs `AdvancedPracticeService` in a background daemon thread to prevent HTTP timeouts.
- **JSON Resilience:** Intercepted all LLM outputs using `json-repair` before `json.loads()`. This fixed the critical bugs where missing commas or unclosed brackets caused complete generation failures.
- **Strict Pydantic Defaults:** Updated `AdvancedPractice` schemas with `Field(default_factory=list)`. If the LLM omits a section entirely, it gracefully defaults to empty rather than throwing validation errors.
- **Context Caps:** Hardcoded `num_ctx=4096` on all `OllamaLLM` initializations to stop "runaway hallucination loops" that previously drove generation times from ~150s up to ~430s.

### 2. Frontend Audit (Planning Phase)
**Focus:** State Management, UI/UX Workflow, and Next.js Architecture.
**Results:** Identified missing loading states, disconnected API routes, and no central way to track background generation jobs.
**Changes Planned for Slice 12:**
- Implementing a complete "Processing Workspace" to show real-time pipeline progress instead of a generic loading spinner.
- Building a "Study Workspace" with a dual-pane layout (Notes in the center, Flashcards/MCQs/Practice on the right sidebar).
- Migrating away from manual generation clicks to a fully automated `/api/generate` workflow that polls `/api/status/{job_id}`.