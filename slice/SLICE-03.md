# Slice 3 — Workspace & Export Experience

## Goal

Transform StudyForge from a one-time document generator into a usable study workspace.

Improve usability and workflow without changing the core AI pipeline.

Do not modify Slice 1 or Slice 2 functionality unless required for integration.

---

## Slice Scope

Screens involved:

- Generated Study Notes Preview
- Markdown Editor & Export
- Settings (basic)
- Recent Projects (lightweight)

---

## User Flow

1. User generates study notes.
2. User edits the generated Markdown directly.
3. User saves the notes.
4. User exports the notes.
5. User can reopen recently generated notes.
6. User can change default study preferences.

---

## Backend Responsibilities

Implement:

- Save generated Markdown locally.
- Save lightweight project metadata (SQLite).
- Project listing endpoint.
- Open existing project endpoint.

Suggested endpoints:

GET /projects

GET /projects/{id}

POST /projects/save

DELETE /projects/{id}

---

## Frontend Responsibilities

Implement:

### Markdown Workspace

- Live Markdown editor
- Split preview (editor | rendered output)
- Save button
- Export Markdown
- Copy to clipboard

### Recent Projects

Display:

- Project name
- Date generated
- Note style
- Open project

### Settings

Allow users to configure:

- Default study style
- Default export location
- Ollama model (if multiple are installed)

---

## Database

Store only lightweight metadata.

Suggested fields:

Project
- id
- title
- source filename
- study style
- created_at
- markdown file path

Do NOT store document contents inside SQLite.

Markdown files remain on disk.

---

## Out of Scope

Do NOT implement:

- User accounts
- Cloud sync
- Authentication
- OCR
- Flashcards
- Quiz generation
- Search indexing
- Multi-user collaboration

---

## Definition of Done

Slice is complete only when:

- Generated notes can be edited.
- Notes can be saved.
- Notes can be reopened.
- Export works reliably.
- Recent Projects displays correctly.
- Existing Slice 1 & Slice 2 functionality remains unchanged.

---

## Risk Level

LOW

---

## Fallback Plan

If SQLite integration becomes problematic:

- Store project metadata in JSON files.
- Preserve the save/open workflow.

---

## Constraints

- Follow AGENTS.md.
- Preserve previous slices.
- Keep components modular.
- Do not redesign the application.
- Maintain the existing design system.

---

## Completion

When Slice 3 is complete:

1. Append to CONTEXT-LOG.md.
2. Report architectural decisions.
3. State:

Commit point reached — Slice 3 complete.