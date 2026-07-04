# Folio mk-1

Folio is an AI-powered study workspace and document management platform designed to help you organize, read, and understand your study materials seamlessly. 

It provides an elegant interface to upload notes, organize them into folders, attach reference files (like PDFs, images, and code snippets), and chat with an AI study assistant specifically grounded in your documents.

## Features
- **Document Management**: Upload notes, organize them into folders, and manage your study library.
- **Attachments System**: Attach any supporting documents directly to your study notes, complete with built-in code and image previews! 
- **AI Study Assistant**: Chat with the intelligent assistant about any of your notes.
- **Dark Mode**: A beautiful, unified dark mode interface designed for late-night study sessions.
- **Cloud Persistence**: All attachments are securely synced to Supabase Storage.

## Screenshots

*(Place your screenshots in the `docs/` folder or root and link them here)*

- **Home Dashboard**: `![Home Screen](./docs/home.png)`
- **Library Organization**: `![Library Screen](./docs/library.png)`
- **Study Screen (with Code Previews)**: `![Study Screen](./docs/study.png)`
- **AI Chat interface**: `![Study Chats](./docs/chats.png)`
- **Dark Mode Settings**: `![Settings Screen](./docs/settings.png)`

## Tech Stack
- **Frontend**: React, TailwindCSS, Vite
- **Backend**: FastAPI (Python), SQLite
- **Cloud Storage**: Supabase Storage
- **AI Backend**: Google Gemini

## Setup

1. Setup the backend:
```bash
cd Backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```
Make sure you have a `.env` file with your `GEMINI_API_KEY`, `SUPABASE_URL`, and `SUPABASE_KEY` (use the `service_role` key for uploads).

2. Start the frontend:
```bash
cd Frontend
npm install
npm run dev
```
