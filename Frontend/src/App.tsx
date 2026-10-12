import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Loader2 } from "lucide-react";

import { AuthGuard } from "./components/AuthGuard";

// Pages are split into their own chunks and loaded on first visit
const Home = lazy(() => import("./pages/Home").then(m => ({ default: m.Home })));
const StudyScreen = lazy(() => import("./pages/StudyScreen").then(m => ({ default: m.StudyScreen })));
const UploadScreen = lazy(() => import("./pages/UploadScreen").then(m => ({ default: m.UploadScreen })));
const LibraryScreen = lazy(() => import("./pages/LibraryScreen").then(m => ({ default: m.LibraryScreen })));
const SettingsScreen = lazy(() => import("./pages/SettingsScreen").then(m => ({ default: m.SettingsScreen })));
const KnowledgeBaseScreen = lazy(() => import("./pages/KnowledgeBaseScreen").then(m => ({ default: m.KnowledgeBaseScreen })));
const StudyChatsScreen = lazy(() => import("./pages/StudyChatsScreen").then(m => ({ default: m.StudyChatsScreen })));
const AuthScreen = lazy(() => import("./pages/AuthScreen").then(m => ({ default: m.AuthScreen })));

function PageFallback() {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-background" role="status" aria-label="Loading">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/auth" element={<AuthScreen />} />
          
          <Route element={<AuthGuard />}>
            <Route path="/" element={<Home />} />
            <Route path="/library" element={<LibraryScreen />} />
            <Route path="/study" element={<StudyScreen />} />
            <Route path="/upload" element={<UploadScreen />} />
            <Route path="/settings" element={<SettingsScreen />} />
            <Route path="/knowledge-base" element={<KnowledgeBaseScreen />} />
            <Route path="/chats" element={<StudyChatsScreen />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
