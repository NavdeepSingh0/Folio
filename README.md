<div align="center">
  <img src="Frontend/public/favicon.png" alt="Folio Logo" width="120" />
  <h1>Folio</h1>
  <p><strong>Cross-Platform Study Companion</strong></p>
  <p>Transform raw academic materials into highly structured, interactive learning experiences powered by AI.</p>
</div>

<br />

Folio is a comprehensive ecosystem designed for modern students. It consists of a Python AI backend, a focus-driven desktop web application, and a deeply integrated native mobile companion app. This documentation covers the system architecture, database schema, and technical implementation details.

---

## System Architecture

The Folio platform relies on a distributed, three-tier architecture ensuring that all clients remain perfectly synchronized.

### 1. Presentation Layer (Clients)
* **Desktop Web Application:** A React-based Single Page Application (SPA) built with Vite and TypeScript. It utilizes Tailwind CSS for styling and handles complex interactions via a custom Tri-Pane layout (PDF Viewer, Markdown Notes, AI Chat). State is managed via local context and aggressive caching strategies to minimize network overhead.
* **Mobile Companion App:** A React Native application built via Expo. It utilizes NativeWind for styling and React Native Reanimated for high-performance fluid animations. Offline caching is managed via react-native-mmkv, ensuring that study notes load instantly without network latency.

### 2. Application Layer (Backend Engine)
* **Python FastAPI Server:** The core processing unit of the platform. It provides RESTful endpoints for the clients and houses the AI Output Engine.
* **Document Processing Pipeline:** When a document is uploaded, this pipeline extracts raw text, chunks the data, interfaces with Large Language Models to structure the content, and generates comprehensive markdown notes.

### 3. Data Layer (Supabase)
* **PostgreSQL Database:** A heavily relational database managing users, folders, generated notes, and historical chat messages.
* **Supabase Storage:** Secure object storage buckets for retaining raw uploaded files (PDFs, PPTs) and static profile assets.
* **Supabase Auth:** Handles secure user authentication and session management across both the web and mobile clients.

---

## Database Schema

The database is built on PostgreSQL (via Supabase) and enforces strict relational integrity.

### Users Table
* `id` (UUID, Primary Key): Unique identifier for the user.
* `email` (String): User email address.
* `username` (String): Display name.
* `created_at` (Timestamp): Account creation date.

### Folders Table
* `id` (UUID, Primary Key): Unique folder identifier.
* `user_id` (UUID, Foreign Key -> Users): Owner of the folder.
* `name` (String): Display name of the folder.
* `is_pinned` (Boolean): Determines if the folder is pinned to the user's dashboard.
* `created_at` (Timestamp): Folder creation date.

### Notes Table
* `id` (UUID, Primary Key): Unique note identifier.
* `folder_id` (UUID, Foreign Key -> Folders): The folder containing this note.
* `user_id` (UUID, Foreign Key -> Users): Owner of the note.
* `name` (String): Title of the note.
* `content` (Text): The AI-generated markdown content.
* `original_text` (Text): The raw extracted text from the source material.
* `status` (String): Current processing status (e.g., pending, completed, failed).
* `created_at` (Timestamp): Note creation date.

### Attachments Table
* `id` (UUID, Primary Key): Unique attachment identifier.
* `note_id` (UUID, Foreign Key -> Notes): The associated note.
* `filename` (String): Original name of the uploaded file.
* `file_type` (String): MIME type of the file.
* `storage_path` (String): The path within the Supabase Storage bucket.
* `created_at` (Timestamp): Upload timestamp.

### Chat Messages Table
* `id` (UUID, Primary Key): Unique message identifier.
* `note_id` (UUID, Foreign Key -> Notes): The note context for this chat conversation.
* `role` (String): Denotes whether the message is from the 'user' or the 'assistant'.
* `content` (Text): The message body.
* `created_at` (Timestamp): Message timestamp.

---

## Core Features

### Desktop Application
* **Home Dashboard:** Search through subjects, track activity, and view study overviews with interactive weekly widgets.
* **Tri-Pane Workspace:** A layout optimized for large screens, allowing simultaneous viewing of the original PDF, the AI-generated structured notes, and an interactive conversational AI Chat.
* **Library Management:** Hierarchical organization of materials. Drag-and-drop raw PDFs to trigger the AI processing pipeline.
* **Theming:** Full Dark Mode and Light Mode support.

### Mobile Application
* **Edge-to-Edge Design:** Access notes smoothly with immersive screens extending beneath system navigation bars.
* **Native Push Notifications:** Local scheduling of study reminders using expo-notifications.
* **Attachment Tabs:** Bottom-sheet style edge tabs to quickly swipe between notes and original file attachments.
* **Glassmorphism:** Uses BlurViews and translucency to create a modern, premium feel on both iOS and Android.

---

## Quick Start Guide

### 1. Backend Setup (Python FastAPI)
Navigate to the `Backend` directory:
```bash
cd Backend
python -m venv venv
# Activate venv: `venv\Scripts\activate` on Windows or `source venv/bin/activate` on Mac/Linux
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```
Note: Ensure your `.env` file is populated with your Supabase and AI API keys.

### 2. Frontend Setup (React/Vite)
Navigate to the `Frontend` directory:
```bash
cd Frontend
npm install
npm run dev
```
The desktop web app will be available at `http://localhost:5173`.

### 3. Mobile Setup (React Native/Expo)
Navigate to the `Mobile` directory:
```bash
cd Mobile
npm install
# To run on Expo Go during development:
npx expo start
# To build the native Android APK locally:
npx expo prebuild -p android
```
