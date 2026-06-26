# CONTEXT-LOG

Append-only. Never overwrite. Never delete entries.
One entry per slice. Agent writes this. Developer does not edit it manually.
This file is the cross-agent handoff record for the entire sprint.

FORMAT — every entry must follow this exactly:
```
[YYYY-MM-DD HH:MM] SLICE: {slice name}
What was built: {2–3 lines max — what exists now that did not exist before}
Key decisions made: {1–2 lines — only if non-obvious. Write "none" if standard implementation.}
Blockers encountered: {what slowed this down. Write "none" if clean.}
Next slice: {name of the next slice in the backlog}
```

IF YOU ARE AN AI AGENT READING THIS FILE:
- Read all entries top to bottom before doing anything
- The most recent entry tells you what was just completed and what comes next
- Do not repeat work already logged
- If the next slice listed does not match what you were asked to do — flag it before starting

```
[2026-06-26 00:16] SLICE: Core Generation Pipeline
What was built: Scaffolded React/FastAPI projects. Implemented the frontend
upload/preview UI and the backend /api/generate endpoint with PDF/PPTX
parsing and Ollama generation.
Key decisions made: Implemented both PDF and PPTX support per user approval.
Scaffolded projects manually with dependencies.
Blockers encountered: none
Next slice: Intelligent Note Generation
```

```
[2026-06-26 00:29] SLICE: Intelligent Note Generation
What was built: Prompt templating system, document chunking via
`langchain-text-splitters`, and a custom instructions UI to improve
output quality.
Key decisions made: Used sequential chunk joining instead of map-reduce
to optimize for a fast MVP. Replaced standard Markdown Workspace slice
with this slice per user request.
Blockers encountered: None.
Next slice: Settings
```

```
[2026-06-26 01:17] OPTIMIZATION: Streaming Output
What was optimized: Replaced synchronous generation with a
StreamingResponse to improve UX.
Why it was needed: 12-53 second generation times felt unresponsive
to the user.
Next slice: Settings
```

```
[2026-06-26 01:53] SLICE: Workspace & Export Experience
What was built: SQLite backend for projects, settings JSON storage. Frontend sidebar, split-pane Markdown editor, and dynamic export topic naming.
Key decisions made: Export topic naming extracts the first Markdown H1 instead of adding LLM latency.
Blockers encountered: None.
Next slice: Editing Workspace & Project Organization
```

```
[2026-06-26 02:22] SLICE: Editing Workspace & Project Organization (Slice 3.5)
What was built: Refactored UI into a true workspace. Added View/Edit toggles, a resizable split-pane editor, and a metadata sidebar. Upgraded Sidebar with Project Groups, HTML5 drag-and-drop to move projects, inline renaming, and real-time search filtering. Refactored SQLite schema to support groups.
Key decisions made: Implemented HTML5 native drag-and-drop instead of external libraries to keep dependencies light. Wiped initial DB to cleanly create new relational group structure.
Blockers encountered: Typescript module resolution errors with Vite during refactoring (fixed via import type).
Next slice: Intelligent Document Understanding (Slice 4)
```

```
[2026-06-26 02:35] SLICE: Intelligent Document Understanding (Slice 4)
What was built: Created `document_structure_service.py` to parse PDFs and PPTXs structurally. Replaced raw text extraction with enriched markdown containing headings, lists, manual markdown tables, and image placeholders before feeding it to the LLM. 
Key decisions made: Used `table.extract()` instead of `pandas` for PyMuPDF table parsing to avoid introducing heavy dependencies not in `requirements.txt`. Used font size heuristics for PDF headings and `python-pptx` shape types for slides.
Blockers encountered: None.
Next slice: AI Study Assistant (Slice 5)
```

```
[2026-06-26 02:59] SLICE: AI Study Assistant (Slice 5)
What was built: Created `study_assistant_service.py` to stream generated Flashcards, Questions, Summaries, Key Concepts, and Formulas via Ollama. Built a right-hand `StudySidebar` in the frontend to access these tools and implemented an "Explain Simpler" feature using browser text selection.
Key decisions made: All study materials are generated on-the-fly and kept ephemeral to keep the DB schema unchanged and satisfy the constraints.
Blockers encountered: None.
Next slice: Hierarchical Knowledge Context & Revision Workspace (Slice 6)
```

```
[2026-06-26 04:12] SLICE: Hierarchical Knowledge Context & Revision Workspace (Slice 6)
What was built: Restructured the database from simple groups to a Collections -> Units -> Chapters -> Projects hierarchy. Refactored the UI sidebar into an expandable 3-tier tree and built the Revision Workspace to perform LLM operations strictly bound by selected hierarchical scopes.
Key decisions made: Dropped `project_groups` completely and wiped the local DB to create the normalized `collections`, `units`, and `chapters` tables. Disabled drag-and-drop in favor of simple "Move" dialogs to prioritize shipping architecture over complex UI.
Blockers encountered: None.
Next slice: Adaptive Workspace (Slice 7)
```

```
[2026-06-26 11:37] SLICE: Adaptive Workspace (Slice 7)
What was built: Implemented an adaptive, IDE-inspired workspace layout using react-resizable-panels. Added global keyboard shortcuts for reading zoom (scaling font sizes) and three dedicated viewing modes (Reading, Editing, Focus) with localStorage persistence.
Key decisions made: Installed react-resizable-panels for robust panel state management. Managed zoom level by applying dynamic fontSize to typography containers to avoid UI reflow issues.
Blockers encountered: None
Next slice: IDE Tabs & Split-Screen (Slice 7.5)
```

```
[2026-06-26 13:51] SLICE: IDE Tabs & Split-Screen (Slice 7.5)
What was built: Re-architected Home.tsx to support an array of tabs and panes. Implemented native HTML5 drag-and-drop tabs, a horizontal split-screen layout, and a smart edit mode that temporarily collapses the split to provide full editing space.
Key decisions made: Used native HTML5 drag-and-drop instead of external libraries. Note: There is no SLICE-07.5.md file; it was executed dynamically at the user's command and not from a file.
Blockers encountered: Vite import errors for TS interfaces (fixed by using `import type`).
Next slice: Context Magic (Slice 8)
```

```
[2026-06-26 14:15] SLICE: Context Magic (Slice 8)
What was built: Configurable Study Assistant with dynamic parameter mapping and stacked artifact UI. Integrated offline semantic search using `langchain-ollama` to generate and cache `nomic-embed-text` embeddings natively in SQLite. Upgraded Revision Workspace to use presets mapped to the new unified API.
Key decisions made: Implemented embeddings inside the existing SQLite `projects` table using a JSON-encoded array rather than adding heavy external vector DB dependencies like Chroma or FAISS, preserving offline portability.
Blockers encountered: None.
Next slice: Slice 9
```

```
[2026-06-26 15:05] NON-SLICE: UI Enhancements & Bug Fixes
What was built: Removed `select-none` from workspace containers to re-enable text selection. Built a custom animated `CustomSelect` dropdown component to replace native HTML selects in StudySidebar. Rewrote Knowledge Search rendering logic to display semantic matches as cards with similarity scores and text snippets instead of just filtering the hierarchy tree.
Key decisions made: Used custom React state for dropdowns instead of importing Headless UI to keep dependencies light.
Blockers encountered: Semantic search initially appeared broken to the user because projects created before Slice 8 had `NULL` embeddings, requiring a dummy save after downloading `nomic-embed-text` to backfill the database.
Next slice: Slice 9
```