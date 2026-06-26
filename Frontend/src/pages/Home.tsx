import { useState, useEffect } from "react";
import { UploadWorkspace } from "../components/UploadWorkspace";
import { Workspace } from "../components/Workspace";
import { Sidebar } from "../components/Sidebar";
import type { Project, Collection, Unit, Chapter } from "../components/Sidebar";
import { SettingsModal } from "../components/SettingsModal";
import { RevisionWorkspace } from "../components/RevisionWorkspace";

export function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [noteStyle, setNoteStyle] = useState<string>("university_notes");
  const [customInstructions, setCustomInstructions] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [markdown, setMarkdown] = useState<string>("");
  const [error, setError] = useState<string>("");

  const [projects, setProjects] = useState<Project[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [sourceFilename, setSourceFilename] = useState<string>("");
  const [activeProjectMetadata, setActiveProjectMetadata] = useState<any>(null);
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRevisionWorkspaceOpen, setIsRevisionWorkspaceOpen] = useState(false);
  const [settings, setSettings] = useState({ default_model: "llama3.2", default_style: "university_notes" });

  useEffect(() => {
    fetchHierarchy();
    fetchSettings();
  }, []);

  const fetchHierarchy = async () => {
    try {
      const [colRes, unitRes, chapRes, projRes] = await Promise.all([
        fetch("http://localhost:8000/api/hierarchy/collections"),
        fetch("http://localhost:8000/api/hierarchy/units"),
        fetch("http://localhost:8000/api/hierarchy/chapters"),
        fetch("http://localhost:8000/api/projects")
      ]);
      if (colRes.ok) setCollections(await colRes.json());
      if (unitRes.ok) setUnits(await unitRes.json());
      if (chapRes.ok) setChapters(await chapRes.json());
      if (projRes.ok) setProjects(await projRes.json());
    } catch (err) {
      console.error("Failed to fetch hierarchy", err);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
        setNoteStyle(data.default_style);
      }
    } catch (err) {
      console.error("Failed to fetch settings", err);
    }
  };

  const handleSaveSettings = async (newSettings: any) => {
    try {
      await fetch("http://localhost:8000/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSettings),
      });
      setSettings(newSettings);
      setIsSettingsOpen(false);
    } catch (err) {
      console.error("Failed to save settings", err);
    }
  };

  const handleGenerate = async () => {
    if (!selectedFile) return;

    setIsGenerating(true);
    setError("");
    setMarkdown("");
    setSourceFilename(selectedFile.name);
    setActiveProjectMetadata(null);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("style", noteStyle);
    formData.append("model", settings.default_model);
    if (customInstructions.trim()) {
      formData.append("custom_instructions", customInstructions);
    }

    try {
      const response = await fetch("http://localhost:8000/api/generate", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.detail || "Failed to generate notes");
      }

      if (!response.body) throw new Error("No response body returned");
      
      const pages = parseInt(response.headers.get("X-Document-Pages") || "0", 10);
      const chunks = parseInt(response.headers.get("X-Document-Chunks") || "0", 10);
      const startTime = Date.now();
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let fullMarkdown = "";

      let lastUpdate = Date.now();

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          fullMarkdown += chunk;
          if (Date.now() - lastUpdate > 150) {
            setMarkdown(fullMarkdown);
            lastUpdate = Date.now();
          }
        }
      }
      setMarkdown(fullMarkdown);

      const topicMatch = fullMarkdown.match(/^#\s+(.+)$/m);
      const title = topicMatch && topicMatch[1].trim() ? topicMatch[1].trim() : selectedFile.name;

      const generationTimeSec = (Date.now() - startTime) / 1000;

      const saveRes = await fetch("http://localhost:8000/api/projects/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          source_filename: selectedFile.name,
          study_style: noteStyle,
          model: settings.default_model,
          markdown_content: fullMarkdown,
          pages: pages,
          chunks: chunks,
          generation_time: generationTimeSec
        }),
      });
      
      if (saveRes.ok) {
        const savedProject = await saveRes.json();
        setActiveProjectId(savedProject.id);
        setActiveProjectMetadata(savedProject);
        fetchHierarchy();
      }

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveEditedNotes = async (editedMarkdown: string) => {
    if (!activeProjectId) return;
    try {
      const topicMatch = editedMarkdown.match(/^#\s+(.+)$/m);
      const title = topicMatch && topicMatch[1].trim() ? topicMatch[1].trim() : undefined;
      
      await fetch(`http://localhost:8000/api/projects/${activeProjectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, markdown_content: editedMarkdown }),
      });
      setMarkdown(editedMarkdown);
      fetchHierarchy();
      
      const res = await fetch(`http://localhost:8000/api/projects/${activeProjectId}`);
      if (res.ok) setActiveProjectMetadata(await res.json());
      
    } catch (err) {
      console.error("Failed to save edited notes", err);
    }
  };

  const handleSelectProject = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:8000/api/projects/${id}`);
      if (res.ok) {
        const data = await res.json();
        setMarkdown(data.markdown_content);
        setSourceFilename(data.source_filename);
        setActiveProjectId(id);
        setActiveProjectMetadata(data);
        setIsRevisionWorkspaceOpen(false); // Close revision view if navigating to a file
      }
    } catch (err) {
      console.error("Failed to open project", err);
    }
  };

  // --- Hierarchy API Handlers ---
  const genericApi = async (url: string, method: string, body?: any) => {
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    fetchHierarchy();
  };

  const handleReset = () => {
    setMarkdown("");
    setSelectedFile(null);
    setCustomInstructions("");
    setActiveProjectId(null);
    setActiveProjectMetadata(null);
    setIsRevisionWorkspaceOpen(false);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex">
      <Sidebar 
        collections={collections}
        units={units}
        chapters={chapters}
        projects={projects}
        activeProjectId={activeProjectId}
        
        onNewProject={handleReset}
        onSelectProject={handleSelectProject}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenRevisionWorkspace={() => setIsRevisionWorkspaceOpen(true)}
        
        onCreateCollection={n => genericApi("http://localhost:8000/api/hierarchy/collections", "POST", { name: n })}
        onCreateUnit={(n, cid) => genericApi("http://localhost:8000/api/hierarchy/units", "POST", { name: n, collection_id: cid })}
        onCreateChapter={(n, uid) => genericApi("http://localhost:8000/api/hierarchy/chapters", "POST", { name: n, unit_id: uid })}
        
        onRenameCollection={(id, n) => genericApi(`http://localhost:8000/api/hierarchy/collections/${id}`, "PATCH", { name: n })}
        onRenameUnit={(id, n) => genericApi(`http://localhost:8000/api/hierarchy/units/${id}`, "PATCH", { name: n })}
        onRenameChapter={(id, n) => genericApi(`http://localhost:8000/api/hierarchy/chapters/${id}`, "PATCH", { name: n })}
        onRenameProject={(id, t) => genericApi(`http://localhost:8000/api/projects/${id}`, "PATCH", { title: t })}
        
        onDeleteCollection={id => genericApi(`http://localhost:8000/api/hierarchy/collections/${id}`, "DELETE")}
        onDeleteUnit={id => genericApi(`http://localhost:8000/api/hierarchy/units/${id}`, "DELETE")}
        onDeleteChapter={id => genericApi(`http://localhost:8000/api/hierarchy/chapters/${id}`, "DELETE")}
        onDeleteProject={async id => {
          await genericApi(`http://localhost:8000/api/projects/${id}`, "DELETE");
          if (id === activeProjectId) handleReset();
        }}
        
        onMoveUnit={(id, cid) => genericApi(`http://localhost:8000/api/hierarchy/units/${id}/move`, "POST", { collection_id: cid })}
        onMoveChapter={(id, uid) => genericApi(`http://localhost:8000/api/hierarchy/chapters/${id}/move`, "POST", { unit_id: uid })}
        onMoveProject={(id, cid) => genericApi(`http://localhost:8000/api/projects/${id}/move`, "POST", { chapter_id: cid || "null" })}
      />

      <div className="flex-1 md:ml-64 p-6 md:p-12">
        <div className="max-w-7xl mx-auto">
          {!markdown && !isRevisionWorkspaceOpen && (
            <header className="mb-10">
              <h1 className="text-3xl font-bold text-blue-600 mb-2">StudyForge</h1>
              <p className="text-gray-500">
                Intelligent study note generation from your local documents.
              </p>
            </header>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6 border border-red-200">
              {error}
            </div>
          )}

          {isRevisionWorkspaceOpen ? null : !markdown ? (
            <div className="max-w-4xl">
              <UploadWorkspace
                selectedFile={selectedFile}
                onFileSelect={setSelectedFile}
                noteStyle={noteStyle}
                onStyleSelect={setNoteStyle}
                customInstructions={customInstructions}
                onCustomInstructionsChange={setCustomInstructions}
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
              />
            </div>
          ) : (
            <Workspace
              markdown={markdown}
              sourceFilename={sourceFilename}
              metadata={activeProjectMetadata}
              onReset={handleReset}
              onSave={handleSaveEditedNotes}
            />
          )}
        </div>
      </div>

      {isRevisionWorkspaceOpen && (
        <RevisionWorkspace 
          collections={collections}
          units={units}
          chapters={chapters}
          projects={projects}
          activeProjectId={activeProjectId}
          model={settings.default_model}
          onClose={() => setIsRevisionWorkspaceOpen(false)}
        />
      )}

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveSettings}
        initialSettings={settings}
      />
    </div>
  );
}
