import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";
import { StudyScreen } from "./pages/StudyScreen";
import { UploadScreen } from "./pages/UploadScreen";
import { LibraryScreen } from "./pages/LibraryScreen";
import { SettingsScreen } from "./pages/SettingsScreen";
import { KnowledgeBaseScreen } from "./pages/KnowledgeBaseScreen";
import { StudyChatsScreen } from "./pages/StudyChatsScreen";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/library" element={<LibraryScreen />} />
        <Route path="/study" element={<StudyScreen />} />
        <Route path="/upload" element={<UploadScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
        <Route path="/knowledge-base" element={<KnowledgeBaseScreen />} />
        <Route path="/chats" element={<StudyChatsScreen />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
