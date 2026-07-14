# SLICE-07.md

# Slice 7 — Adaptive Workspace

Estimated Time: 5–7 hrs
Risk Level: MEDIUM

---

## Goal

Transform Folio from a fixed document viewer into an adaptive study workspace.

This slice focuses entirely on improving the study experience through an IDE-inspired interface. The workspace should adapt to how the user studies instead of forcing a single layout.

No AI generation logic should change in this slice.

---

## Screens Involved

- Workspace
- Markdown Reader
- Markdown Editor
- Live Preview
- Explorer Sidebar
- Toolbar

---

## Backend Work

Minimal.

Backend should only persist user workspace preferences if required.

Examples:

- zoom level
- reading mode
- panel widths

If persistence becomes complex, Local Storage is an acceptable fallback.

No AI changes.

No prompt changes.

No database redesign.

---

## Features

### 1. Resizable Workspace

Replace the fixed layout with draggable panel dividers.

Panels:

- Explorer
- Markdown Area
- Preview
- Study Assistant (future Context Magic)

Requirements:

- draggable separators
- smooth resizing
- minimum widths
- maximum widths
- layout should never break
- remember sizes between sessions

---

### 2. IDE Style Zoom

Support zooming similar to modern IDEs.

Keyboard Shortcuts

Ctrl +

Increase zoom

Ctrl -

Decrease zoom

Ctrl 0

Reset zoom

Zoom should affect

- markdown editor
- markdown preview
- document reader

Zoom must NOT affect

- sidebar
- toolbar
- buttons
- application chrome

---

### 3. Reading Modes

Introduce workspace modes.

Reading Mode

Explorer + Reader

Editing Mode

Markdown Editor + Live Preview

Focus Mode

Reader only

Hide

- Explorer
- Toolbar
- Side panels

ESC exits Focus Mode.

Future modes should be easy to add.

---

### 4. Better Navigation

Improve navigation throughout the workspace.

Requirements

- smoother transitions
- preserve scroll position
- remember last opened document
- better breadcrumb/back navigation
- clearer active document highlighting

Navigation should feel closer to an IDE than a webpage.

---

### 5. Adaptive Panels

The interface should intelligently use available space.

Examples

- Preview expands when editor is hidden.
- Reader expands when assistant is closed.
- Sidebar collapses cleanly.
- Empty space should never appear unnecessarily.

No fixed-width assumptions.

---

### 6. Workspace Persistence

Remember user preferences.

Persist

- zoom level
- panel sizes
- reading mode
- collapsed sidebar state

Automatically restore them when reopening Folio.

---

## Out of Scope

This slice intentionally DOES NOT include:

- AI prompt improvements
- Context Magic redesign
- Revision tools
- MCQs
- Mindmaps
- Formula Sheets
- Markdown generation improvements
- Performance optimizations
- Markdown import
- Notifications
- Search improvements

These belong to later slices.

---

## Definition of Done

✓ Explorer is resizable

✓ Reader is resizable

✓ Preview is resizable

✓ Editor is resizable

✓ Zoom works using keyboard shortcuts

✓ Reading Mode implemented

✓ Editing Mode implemented

✓ Focus Mode implemented

✓ Workspace preferences persist

✓ Existing features continue to work

✓ No regression in generation pipeline

---

## Human Approval Required

None expected.

If any backend schema change becomes necessary, stop and ask before implementation.

---

## Fallback

If persistent workspace settings become unstable,

fallback to Local Storage.

User experience is more important than where preferences are stored.

---

## Benchmark Goal

By the end of this slice, Folio should no longer feel like a web page displaying generated notes.

It should feel like a dedicated study workspace similar to an IDE, where the interface adapts to different study workflows while remaining fast, responsive, and distraction-free.