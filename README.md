# StudyForge

**Private, Offline-First AI Study Notes Generator**

StudyForge is a local desktop application that transforms lecture PDFs and PowerPoint presentations into structured, study-ready Markdown notes using AI — completely offline. No internet connection required, no API keys needed, and no data ever leaves your machine.

![Tech Stack](https://img.shields.io/badge/React-TypeScript-blue)
![Backend](https://img.shields.io/badge/FastAPI-Python-green)
![AI](https://img.shields.io/badge/Ollama-qwen3-orange)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## 🎯 Problem Statement

University students preparing for exams are locked out of AI study tools the moment they:
- Lose internet access
- Hit free-tier usage limits
- Need to upload sensitive material (medical notes, legal case studies, research drafts) to cloud services

Students have the lecture materials and a laptop, but lack a **private, local tool** that turns a folder of lecture PDFs/PPTX files into structured study notes without an API key or data agreement.

## ✨ Solution

StudyForge is a local desktop app (React + FastAPI + Ollama) that:
- ✅ Ingests PDF and PPTX lecture files
- ✅ Outputs structured Markdown study notes with flashcards, MCQs, summaries, and practice questions
- ✅ Runs 100% offline with zero API calls to external services
- ✅ Keeps all data on your machine — privacy by design

---

## 🚀 Features

### Core Capabilities
- **Document Upload**: Drag-and-drop PDF and PPTX files
- **Intelligent Parsing**: Structure-aware extraction preserving headings, tables, lists, and code blocks
- **Two-Pass Generation Engine (Folio)**: Planning pass creates JSON outline → Generation pass produces structured Learning Objects
- **Educational Intelligence**: Deterministic capability mapping prevents LLM hallucination while ensuring pedagogically-rich outputs
- **Hierarchical Organization**: Collections → Units → Chapters → Projects for knowledge management
- **IDE-like Workspace**: Multi-tab interface with resizable split-screen panels, Reading/Editing/Focus modes
- **Semantic Search**: Offline embeddings stored in SQLite for instant knowledge retrieval
- **Export Options**: Download notes as Markdown files

### Revision Tools (100% Deterministic, 0 LLM Calls)
- **Flashcards**: Auto-generated from definitions and explanations
- **MCQs**: Multiple-choice questions with distractors
- **Active Recall Prompts**: Open-ended questions for self-testing
- **Cheat Sheets**: Condensed summaries of key concepts
- **Advanced Practice**: Conceptual, Comparison, Scenario, Viva, and Coding challenges generated asynchronously

### Document Intelligence
- **Noise Filtering**: Automatically removes administrative slides, quiz slides, and forward references
- **Slide Classification**: CONTENT, EXAMPLE, COMPARISON, QUIZ, REFERENCE, FORWARD_REFERENCE
- **Exam Hint Extraction**: Detects and preserves instructor hints about exam relevance
- **Structure-Aware Chunking**: Processes documents slide-by-slide instead of arbitrary text chunks

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19 + TypeScript + Tailwind CSS 4 + shadcn/ui components |
| **Backend** | Python 3.x + FastAPI + Uvicorn |
| **Database** | SQLite (WAL mode for concurrency) |
| **AI Runtime** | Ollama (local inference) with `qwen3` model |
| **Document Processing** | PyMuPDF (fitz), python-pptx, langchain-text-splitters |
| **Embeddings** | `nomic-embed-text` via langchain-ollama (offline) |
| **UI Icons** | Lucide React (20px) |
| **Fonts** | Inter (Google Fonts) — 700 for headings, 400/500/600 for body |

### Key Dependencies

**Backend** (`Backend/requirements.txt`):
```
fastapi==0.138.1
uvicorn==0.49.0
pydantic==2.13.4
langchain-ollama==1.1.0
PyMuPDF==1.27.2.3
python-pptx==1.0.2
json-repair==(for LLM output recovery)
```

**Frontend** (`Frontend/package.json`):
```json
{
  "react": "^19.2.7",
  "react-markdown": "^10.1.0",
  "react-resizable-panels": "^4.11.2",
  "lucide-react": "^1.21.0",
  "tailwindcss": "^4.3.1"
}
```

---

## 📁 Project Structure

```
StudyForge/
├── Backend/
│   ├── app/
│   │   ├── api/              # REST API endpoints
│   │   │   ├── upload.py     # File upload handling
│   │   │   ├── generation.py # Generation job orchestration
│   │   │   ├── study_topics.py
│   │   │   ├── revision.py   # Flashcards, MCQs endpoints
│   │   │   ├── advanced_practice.py
│   │   │   ├── hierarchy.py  # Collections/Units/Chapters CRUD
│   │   │   ├── projects.py   # Project management
│   │   │   └── settings.py   # Model/style preferences
│   │   ├── config/           # Frozen engine configuration
│   │   │   ├── capability_profiles.py  # Deterministic capability rules
│   │   │   └── educational_policy.py   # Token budgets, depth controls
│   │   ├── models/           # Pydantic schemas & DB models
│   │   │   ├── database.py   # SQLite schema & operations
│   │   │   ├── folio.py      # StudyTopic, LearningObject
│   │   │   ├── revision.py   # Flashcard, MCQ, RecallPrompt
│   │   │   └── advanced_practice.py
│   │   ├── prompts/          # LLM prompt templates
│   │   │   ├── planning_prompt.py
│   │   │   ├── generation_prompt.py
│   │   │   └── advanced_practice_prompt.py
│   │   ├── renderers/        # Pure-function Markdown renderers
│   │   │   └── markdown_renderer.py
│   │   ├── services/         # Business logic layer
│   │   │   ├── generation_engine.py    # TwoPassBatchEngine
│   │   │   ├── generation_service.py   # Fast Pass + Lazy Daemon
│   │   │   ├── planning_service.py     # Educational Analysis
│   │   │   ├── document_intelligence.py # Slide classification
│   │   │   ├── capability_mapper.py    # Boolean → Capability mapping
│   │   │   ├── revision_engine.py      # Deterministic revision assets
│   │   │   ├── advanced_practice_service.py
│   │   │   ├── job_service.py          # Background job tracking
│   │   │   └── embeddings_service.py   # Semantic search
│   │   └── main.py           # FastAPI entry point
│   ├── benchmark/            # Production validation scripts
│   ├── uploads/              # Uploaded lecture files
│   ├── output/               # Generated Markdown notes
│   └── requirements.txt
│
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Workspace.tsx       # Main IDE-like workspace
│   │   │   ├── Sidebar.tsx         # Hierarchical navigation tree
│   │   │   ├── StudySidebar.tsx    # Revision tools panel
│   │   │   ├── TabBar.tsx          # Multi-tab document management
│   │   │   ├── RevisionWorkspace.tsx
│   │   │   ├── MarkdownRenderer.tsx
│   │   │   └── ui/                 # shadcn/ui primitives
│   │   ├── pages/
│   │   │   └── Home.tsx            # Single-page app router
│   │   ├── hooks/                  # Custom React hooks
│   │   └── assets/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
├── Uploads/                    # Sample lecture files (demo)
├── AGENTS.md                   # Development guidelines & slice backlog
├── CONTEXT-LOG.md              # Append-only development history
├── PIPELINE_DECISIONS.md       # Architectural decisions & metrics
└── README.md                   # This file
```

---

## 🔧 Installation & Setup

### Prerequisites

1. **Python 3.10+** installed
2. **Node.js 18+** installed
3. **Ollama** installed and running locally:
   ```bash
   # Install Ollama (macOS/Linux)
   curl -fsSL https://ollama.com/install.sh | sh
   
   # Pull the qwen3 model
   ollama pull qwen3
   
   # Pull embedding model
   ollama pull nomic-embed-text
   ```

### Backend Setup

```bash
cd Backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at `http://localhost:8000`.

### Frontend Setup

```bash
cd Frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173` (or next available port).

### Docker Deployment (Optional)

```bash
# Build and run with Docker Compose
docker-compose up --build
```

---

## 📖 Usage Guide

### 1. Upload Lecture Files
- Navigate to the Upload Workspace
- Drag and drop PDF or PPTX files
- Optionally add custom instructions for the generation

### 2. Generate Study Notes
- Click "Generate" to start the two-pass pipeline
- Watch real-time progress in the Processing Workspace
- Generation typically takes 2-3 minutes for a 20-slide lecture

### 3. Review & Edit
- View generated notes in the Markdown Workspace
- Toggle between Preview and Edit modes
- Use split-screen for live preview while editing

### 4. Organize Knowledge
- Create Collections (e.g., "Operating Systems")
- Add Units (e.g., "Unit 2: Memory Management")
- Organize Chapters and Projects hierarchically
- Move projects between folders via dialog

### 5. Revision Mode
- Open any Study Topic
- Click the Study Assistant panel
- Generate Flashcards, MCQs, Recall Prompts, Cheat Sheets instantly
- Access Advanced Practice for higher-order questions

### 6. Semantic Search
- Use the search bar in the sidebar
- Choose "Filename" or "Knowledge" mode
- Results display similarity scores and context snippets

---

## 🏗️ Architecture Highlights

### The Folio Engine (Two-Pass Generation)

```
┌─────────────────────┐
│   Input Document    │
│   (PDF / PPTX)      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Document Intelligence│ ← Deterministic slide classification
│ - Extract structure │   - Filter noise (quiz slides, admin)
│ - Classify slides   │   - Extract exam hints
│ - Detect images     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Planning Pass     │ ← LLM call #1 (qwen3)
│ - Educational Analysis│ Output: ConceptOutline with
│ - Identify concepts │   EducationalAnalysis booleans
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Capability Mapper   │ ← Pure Python function
│ - Map booleans to   │   Prevents LLM hallucination
│   required fields   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Generation Pass    │ ← LLM call #2 (qwen3, JSON mode)
│ - Dynamic JSON schema│ Output: List[LearningObject]
│ - Populate fields   │   with strict validation
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Parser + Cache    │ ← json-repair for syntax recovery
│ - Validate schema   │   SQLite storage by content_hash
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Markdown Renderer  │ ← Pure functions
│ - HeadingRenderer   │   Mermaid validation
│ - DefinitionRenderer│   LaTeX escaping
│ - CodeRenderer      │
│ - TableRenderer     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Final Markdown     │
│  (StudyTopic)       │
└─────────────────────┘
```

### Background Job Architecture

To prevent HTTP timeouts during long-running generation:

1. **Fast Pass** (Synchronous): Returns initial Study Topics immediately (~30-60 seconds)
2. **Lazy Daemon Pass** (Asynchronous): Generates Advanced Practice in background thread
3. **Progressive Polling UI**: Frontend polls `/api/jobs/{id}` and unlocks sections as they complete
4. **Invisible Markers**: `<!-- GENERATING_ADVANCED_PRACTICE -->` HTML comment coordinates frontend rendering

### Database Schema

SQLite with normalized hierarchy:

```sql
collections (id, name, created_at)
units (id, collection_id, name, created_at)
chapters (id, unit_id, name, created_at)
projects (id, chapter_id, title, markdown_content, embeddings_json, 
          document_profile_json, created_at, last_modified)
settings (key, value_json)
```

---

## 📊 Performance Metrics

Based on production validation (Slice 10c):

| Metric | Value |
|--------|-------|
| **Test Document** | 3.1.4.pptx (19 slides, ~4,300 characters) |
| **Total Pipeline Time** | ~159 seconds |
| **Throughput** | ~0.01 StudyTopics/second (I/O bound) |
| **Revision Generation** | 0.0002 seconds (0 LLM calls) |
| **Advanced Practice** | Asynchronous, non-blocking |
| **Maximum Reliable Batch Size** | 12 concepts per LLM call |
| **JSON Validity Rate** | 95%+ (with json-repair fallback) |

---

## 🎨 Design System

StudyForge follows a **Knowledge Workspace** aesthetic — editor-inspired, document-first, typography-led:

- **Colors**: Primary `#2563EB`, Secondary `#0EA5A4`, Background `#F8FAFC`
- **Typography**: Inter font family (700 headings, 400/500/600 body)
- **Spacing**: 4px base unit, 24px container padding, 16px component padding
- **Shape**: 10px border radius on all components, subtle shadows
- **Buttons**: Solid primary color, medium weight, optional leading icon
- **Cards**: White surface with subtle borders, optimized for long reading sessions

---

## 🔒 Privacy & Security

- **No Internet Required**: All processing happens locally via Ollama
- **No API Keys**: No third-party service dependencies
- **No Data Transmission**: Your lecture files never leave your machine
- **Local Storage Only**: SQLite database stored on your filesystem
- **No User Accounts**: No authentication, no tracking, no telemetry

---

## 🧪 Testing & Validation

Run production validation benchmarks:

```bash
cd Backend

# Run full benchmark suite
python benchmark_final.py

# Run specific validation
python benchmark/production_validation.py
```

Benchmark reports are saved to `Backend/benchmark/` with detailed metrics on:
- End-to-end timing
- LearningObjects per second
- Capability usage distribution
- Renderer statistics
- Educational quality assessment

---

## 📝 Development Workflow

StudyForge uses a **slice-based development** approach. Each slice is a vertical cut (UI → Backend → Wired → Working):

1. Read the slice definition in `AGENTS.md`
2. Implement the feature end-to-end
3. Log completion in `CONTEXT-LOG.md` (append-only)
4. Move to the next slice

### Human-Gated Zones (Ask Before Modifying)
- `Frontend/package.json`
- `Backend/requirements.txt`
- `docker-compose.yml`
- `.env`
- Ollama model selection

### Agent-Safe Zones (Modify Freely)
- `Frontend/src/components/`
- `Frontend/src/pages/`
- `Backend/app/api/`
- `Backend/app/services/`
- `Backend/app/models/`

---

## 🚧 Known Limitations

- **Image Understanding**: Cannot interpret diagrams or images embedded in slides (text-only extraction)
- **Diagram OCR**: No optical character recognition for text inside images
- **Formula Extraction**: Depends on textual representation; handwritten equations not supported
- **Comparison Tables**: Require sufficient textual source material
- **Model Constraints**: Local `qwen3` may hallucinate complex nested JSON (mitigated via `json-repair`)

---

## 📅 Development History

See [`CONTEXT-LOG.md`](./CONTEXT-LOG.md) for the complete append-only development log tracking all 12+ slices completed during the 24-hour hackathon sprint.

Key milestones:
- **Slice 1-3**: Core generation pipeline, workspace, export
- **Slice 4-6**: Document intelligence, study assistant, hierarchical organization
- **Slice 7-7.5**: Adaptive workspace, IDE tabs, split-screen
- **Slice 8**: Context magic, semantic search
- **Slice 9-9.6**: Document intelligence refinement, preprocessing pipeline
- **Slice 9.5-10F**: Folio engine architecture freeze, educational calibration
- **Slice 10.6**: StudyTopic refactor (unified educational entities)
- **Slice 11A-11.5**: Deterministic revision engine, advanced practice
- **Slice 12**: API layer, frontend wiring, progressive polling
- **Mini Sprint**: Optimization, error handling, dark mode completion

---

## 🤝 Contributing

This project was built during a 24-hour hackathon. Contributions welcome for:
- OCR integration for diagram understanding
- Additional export formats (PDF, Anki decks)
- Plugin system for custom renderers
- Multi-language support

---

## 📄 License

MIT License — see LICENSE file for details.

---

## 🙏 Acknowledgments

Built with:
- [Ollama](https://ollama.com/) for local LLM inference
- [LangChain](https://python.langchain.com/) for text splitting and embeddings
- [FastAPI](https://fastapi.tiangolo.com/) for the backend API
- [React](https://react.dev/) and [Vite](https://vitejs.dev/) for the frontend
- [shadcn/ui](https://ui.shadcn.com/) design patterns
- [Lucide Icons](https://lucide.dev/) for iconography

---

**StudyForge** — Turn your lectures into study gold, offline and private. 🎓✨