# Slice 8 — Context Magic

Goal:
Transform the Study Assistant from a collection of isolated tools into an
adaptive AI workspace capable of generating different study artifacts from
the current document or the selected workspace context.

Estimated time:
8–12 hrs

Risk:
MEDIUM

Screens involved:
- Document Workspace
- Study Assistant Panel
- Revision Workspace

---

## User Problem

The current Study Assistant only generates one artifact at a time.

Users cannot:

- customize outputs
- revise multiple chapters together
- control difficulty
- generate exam-focused material
- reuse generated content
- understand what context the AI is using

The assistant feels like six disconnected buttons rather than one intelligent
study companion.

---

## Build

Replace the current tool selector with an AI Workspace.

The Study Assistant becomes a configurable generation panel.

---

### Generation Types

Support:

- Flashcards
- MCQs
- Short Questions
- Long Questions
- Key Concepts
- Formula Sheet
- Mindmap
- Revision Sheet
- Explain Simpler
- Custom Prompt

---

### Parameters

Every generation supports options.

Difficulty

- Easy
- Medium
- Hard
- University Exam

Quantity

- 5
- 10
- 20
- Custom

Length

- Short
- Medium
- Detailed

Language

- English
- Simple English

---

### Context Selector

Before generating, user selects context.

Current File

Current Chapter

Current Unit

Entire Collection

Entire Workspace

Selected Files

The assistant must always display the current context before generation.

Example

Context:
Current Chapter (3 files)

or

Context:
Entire Unit
12 documents

---

### Prompt Preview

Before generation show

Prompt Type

Context Used

Estimated Tokens

Estimated Processing Time

Advanced prompt hidden by default.

---

### Generated Results

Every generated artifact can

Copy

Save

Regenerate

Export

Move to Workspace

Open in New Tab

No generated output should disappear unless user closes it.

---

### Revision Mode

Revision Mode becomes configurable.

Instead of one fixed revision,

User chooses

- Quick Revision
- One Page Revision
- Exam Revision
- Last Minute Revision
- Formula Revision
- Concept Revision
- Mindmap Revision

---

### Mindmaps

Generate markdown mindmaps.

No images.

Support

Mermaid

Indented Tree

Bullet Tree

---

### Explain Simpler

Uses currently selected text.

No popup.

Reads browser text selection.

Displays answer inside Study Assistant.

Supports

Explain like Beginner

Explain with Analogy

Explain with Example

Explain Step-by-Step

---

### Search

Improve Study Assistant search.

Modes

Filename Search

Knowledge Search

Toggle between them.

Filename Search

Searches titles only.

Knowledge Search

Uses semantic similarity across workspace.

---

### Performance

Generation must stream.

User can cancel generation.

Generation status shown.

Queue additional requests.

---

Definition of Done

✓ One intelligent assistant replaces isolated tools

✓ User can choose context before generation

✓ User can customize outputs

✓ Generated artifacts are reusable

✓ Revision Mode supports multiple presets

✓ Search supports filename and knowledge modes

✓ Everything streams

---

Fallback

If semantic search exceeds time budget

Fallback to

Current File

Current Chapter

Context selection only.

Knowledge search moves to Slice 11.
    