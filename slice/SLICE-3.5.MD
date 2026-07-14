# Slice 3.5 — Editing Workspace & Project Organization

## Goal

Transform StudyForge from a document generator into a practical knowledge workspace.

This slice focuses entirely on editing, organization, and project management.

Do NOT modify the generation pipeline or LLM workflow.

---

## Screens

- Markdown Workspace
- Recent Projects Sidebar
- Project Management Dialogs

---

## User Flow

1. User opens an existing project.
2. User views the rendered notes.
3. User clicks Edit.
4. Workspace switches into split-view editing mode.
5. User edits Markdown.
6. Live preview updates instantly.
7. User saves changes.
8. User organizes projects into folders/groups.

---

# Feature 1 — Edit Mode

Current behaviour:

Markdown editor is always visible.

Replace with:

VIEW MODE
--------------------------
Markdown preview only

Toolbar:
- Edit
- Copy
- Export
- Save

Clicking Edit enters Workspace Mode.

---

WORKSPACE MODE

Left:
Markdown Editor

Right:
Live Preview

Toolbar:
- Save
- Cancel Changes
- Export
- Copy

Changes render live while typing.

The editor should occupy roughly 45% width.

Preview 55%.

The split pane must be resizable.

---

# Feature 2 — Workspace Toggle

Normal state

Preview only

↓

Click Edit

↓

Split Editor

↓

Save

↓

Return to Preview Mode

---

# Feature 3 — Recent Projects Improvements

Current sidebar stores individual files only.

Replace with a project explorer.

Support:

• Create Project Group

Examples

Semester 4

Operating Systems

DBMS

Resume

Hackathon Notes

Research Papers

---

Each project may contain multiple generated note files.

Example

Operating Systems

    RAID.md

    Scheduling.md

    Deadlocks.md

---

Support collapse / expand.

---

# Feature 4 — Rename Operations

Allow:

Rename

- Project
- Group
- Generated note

Inline rename.

No popup required.

---

# Feature 5 — Move Projects

Allow drag & drop.

OR

Simple Move dialog.

Example

Move

RAID.md

↓

Semester 4

↓

Operating Systems

---

# Feature 6 — Search

Add search at top of sidebar.

Search:

- filename
- project name
- group

Real-time filtering.

---

# Feature 7 — Metadata

Store

Project

Created

Last Edited

Document Source

Study Style

Model Used

Word Count

Display metadata in a small details panel.

---

# Backend

Implement endpoints

GET /projects

GET /groups

POST /groups

PATCH /projects/{id}

PATCH /groups/{id}

POST /projects/move

GET /project/{id}

PUT /project/{id}

---

Database

New table

project_groups

id

name

created_at

projects

group_id (nullable)

last_modified

markdown_path

source_file

model

study_style

---

# Out of Scope

Do NOT implement

Cloud Sync

Authentication

Version History

Real-time Collaboration

Git Integration

Tagging

Favorites

Trash Bin

---

# Definition of Done

✓ Preview mode is default

✓ Edit button switches to split workspace

✓ Live markdown preview

✓ Save updates existing project

✓ Sidebar supports project groups

✓ Rename works

✓ Move works

✓ Search works

✓ Existing generation pipeline remains untouched

---

Risk Level

LOW

Estimated Time

2–3 hours

---

Fallback

If drag & drop becomes unstable,

replace with

Move Project dialog.

Do NOT delay the slice for drag-and-drop polish.

---

Completion

Append to CONTEXT-LOG.md

Report architectural decisions.

State:

Commit point reached — Slice 3.5 complete.