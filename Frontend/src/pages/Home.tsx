import { useState, useEffect, useRef, useCallback } from "react";
import { UploadWorkspace } from "../components/UploadWorkspace";
import { Workspace } from "../components/Workspace";
import { Sidebar } from "../components/Sidebar";
import { Menu } from "lucide-react";
import { useWorkspaceSettings } from "../hooks/useWorkspaceSettings";
import { useZoom } from "../hooks/useZoom";
import type { Project, Collection, Unit, Chapter } from "../components/Sidebar";
import { SettingsModal } from "../components/SettingsModal";
import { RevisionWorkspace } from "../components/RevisionWorkspace";
import { TabBar } from "../components/TabBar";
import type { TabData } from "../components/TabBar";
import { Group as PanelGroup, Panel, Separator as PanelResizeHandle } from "react-resizable-panels";

interface Pane {
  id: string;
  tabIds: string[];
  activeTabId: string | null;
}

export function Home() {
  const [tabs, setTabs] = useState<TabData[]>([
    { id: "new-1", title: "New Document", isUpload: true }
  ]);
  const [panes, setPanes] = useState<Pane[]>([
    { id: "pane-1", tabIds: ["new-1"], activeTabId: "new-1" }
  ]);
  const [tabCounter, setTabCounter] = useState(2);
  const [editingPaneId, setEditingPaneId] = useState<string | null>(null);

  const [projects, setProjects] = useState<Project[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRevisionWorkspaceOpen, setIsRevisionWorkspaceOpen] = useState(false);
  const [settings, setSettings] = useState({ default_model: "llama3.2", default_style: "university_notes" });

  const { settings: workspaceSettings, updateSettings: updateWorkspaceSettings } = useWorkspaceSettings();
  const { zoomStyle } = useZoom(workspaceSettings.zoomLevel, (l) => updateWorkspaceSettings({ zoomLevel: l }));

  const DEFAULT_SIDEBAR_WIDTH = 260;
  const MIN_SIDEBAR_WIDTH = 180;
  const MAX_SIDEBAR_WIDTH = 500;
  
  const [sidebarWidth, setSidebarWidth] = useState<number>(
    Number(workspaceSettings.explorerWidth) > 0 ? Number(workspaceSettings.explorerWidth) : DEFAULT_SIDEBAR_WIDTH
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(!workspaceSettings.isSidebarCollapsed);

  const isResizing = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => {
      const next = !prev;
      updateWorkspaceSettings({ isSidebarCollapsed: !next });
      return next;
    });
  };

  const onResizeMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!isResizing.current) return;
      const newWidth = moveEvent.clientX - 56;
      if (newWidth < MIN_SIDEBAR_WIDTH) {
        setIsSidebarOpen(false);
        updateWorkspaceSettings({ isSidebarCollapsed: true });
        isResizing.current = false;
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      } else if (newWidth > MAX_SIDEBAR_WIDTH) {
        setSidebarWidth(MAX_SIDEBAR_WIDTH);
        updateWorkspaceSettings({ explorerWidth: MAX_SIDEBAR_WIDTH });
      } else {
        setSidebarWidth(newWidth);
        updateWorkspaceSettings({ explorerWidth: newWidth });
      }
    };

    const onMouseUp = () => {
      isResizing.current = false;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }, [updateWorkspaceSettings]);

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

  const updateTab = (tabId: string, updates: Partial<TabData>) => {
    setTabs(prev => prev.map(t => t.id === tabId ? { ...t, ...updates } : t));
  };

  const handleGenerate = async (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab || !tab.selectedFile) return;

    updateTab(tabId, { isGenerating: true, error: "", markdown: "" });

    const formData = new FormData();
    formData.append("file", tab.selectedFile);
    formData.append("style", tab.noteStyle || settings.default_style || "university_notes");
    formData.append("model", settings.default_model);
    if (tab.customInstructions?.trim()) {
      formData.append("custom_instructions", tab.customInstructions);
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
            updateTab(tabId, { markdown: fullMarkdown });
            lastUpdate = Date.now();
          }
        }
      }
      
      const topicMatch = fullMarkdown.match(/^#\s+(.+)$/m);
      const title = topicMatch && topicMatch[1].trim() ? topicMatch[1].trim() : tab.selectedFile.name;
      const generationTimeSec = (Date.now() - startTime) / 1000;

      const saveRes = await fetch("http://localhost:8000/api/projects/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          source_filename: tab.selectedFile.name,
          study_style: tab.noteStyle || settings.default_style || "university_notes",
          model: settings.default_model,
          markdown_content: fullMarkdown,
          pages,
          chunks,
          generation_time: generationTimeSec
        }),
      });
      
      if (saveRes.ok) {
        const savedProject = await saveRes.json();
        updateTab(tabId, { 
          title: savedProject.title,
          isUpload: false,
          projectId: savedProject.id,
          metadata: savedProject,
          markdown: fullMarkdown,
          sourceFilename: savedProject.source_filename,
          isGenerating: false
        });
        fetchHierarchy();
      } else {
        updateTab(tabId, { markdown: fullMarkdown, isGenerating: false });
      }

    } catch (err: any) {
      updateTab(tabId, { error: err.message || "An unexpected error occurred.", isGenerating: false });
    }
  };

  const handleSaveEditedNotes = async (tabId: string, editedMarkdown: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab || !tab.projectId) return;
    try {
      const topicMatch = editedMarkdown.match(/^#\s+(.+)$/m);
      const title = topicMatch && topicMatch[1].trim() ? topicMatch[1].trim() : undefined;
      
      await fetch(`http://localhost:8000/api/projects/${tab.projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, markdown_content: editedMarkdown }),
      });
      
      updateTab(tabId, { markdown: editedMarkdown, title: title || tab.title });
      fetchHierarchy();
      
      const res = await fetch(`http://localhost:8000/api/projects/${tab.projectId}`);
      if (res.ok) {
        updateTab(tabId, { metadata: await res.json() });
      }
    } catch (err) {
      console.error("Failed to save edited notes", err);
    }
  };

  const handleSelectProject = async (id: string) => {
    // Check if project is already open in any pane
    const existingTab = tabs.find(t => t.projectId === id);
    if (existingTab) {
      // Find pane and focus
      const paneWithTab = panes.find(p => p.tabIds.includes(existingTab.id));
      if (paneWithTab) {
        setPanes(prev => prev.map(p => p.id === paneWithTab.id ? { ...p, activeTabId: existingTab.id } : p));
      }
      return;
    }

    try {
      const res = await fetch(`http://localhost:8000/api/projects/${id}`);
      if (res.ok) {
        const data = await res.json();
        const newTabId = `proj-${Date.now()}`;
        const newTab: TabData = {
          id: newTabId,
          title: data.title || "Document",
          isUpload: false,
          projectId: id,
          markdown: data.markdown_content,
          sourceFilename: data.source_filename,
          metadata: data
        };

        setTabs(prev => [...prev, newTab]);
        
        // Add to active pane (pane-1 for now, or whichever is first)
        setPanes(prev => {
          const first = prev[0];
          const newFirst = { ...first, tabIds: [...first.tabIds, newTabId], activeTabId: newTabId };
          return [newFirst, ...prev.slice(1)];
        });
      }
    } catch (err) {
      console.error("Failed to open project", err);
    }
  };

  const handleNewDocument = () => {
    const newTabId = `new-${tabCounter}`;
    setTabCounter(prev => prev + 1);
    const newTab: TabData = { id: newTabId, title: "New Document", isUpload: true };
    setTabs(prev => [...prev, newTab]);
    setPanes(prev => {
      const first = prev[0];
      const newFirst = { ...first, tabIds: [...first.tabIds, newTabId], activeTabId: newTabId };
      return [newFirst, ...prev.slice(1)];
    });
  };

  const genericApi = async (url: string, method: string, body?: any) => {
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    fetchHierarchy();
  };

  // Tab management functions
  const handleTabSelect = (paneId: string, tabId: string) => {
    setPanes(prev => prev.map(p => p.id === paneId ? { ...p, activeTabId: tabId } : p));
  };

  const handleTabClose = (paneId: string, tabId: string) => {
    setPanes(prev => prev.map(p => {
      if (p.id !== paneId) return p;
      const newTabIds = p.tabIds.filter(id => id !== tabId);
      let newActive = p.activeTabId;
      if (newActive === tabId) {
        newActive = newTabIds.length > 0 ? newTabIds[newTabIds.length - 1] : null;
      }
      return { ...p, tabIds: newTabIds, activeTabId: newActive };
    }));
    // We could clean up `tabs` state here if tab is completely closed, but leaving them in state is fine
  };

  const handleTabDrop = (sourcePaneId: string, sourceTabId: string, targetPaneId: string, targetIndex: number) => {
    setPanes(prev => {
      let result = [...prev];
      
      const sourcePaneIndex = result.findIndex(p => p.id === sourcePaneId);
      const targetPaneIndex = result.findIndex(p => p.id === targetPaneId);
      if (sourcePaneIndex === -1 || targetPaneIndex === -1) return prev;

      const sourcePane = { ...result[sourcePaneIndex] };
      const targetPane = { ...result[targetPaneIndex] };
      
      // Remove from source
      sourcePane.tabIds = sourcePane.tabIds.filter(id => id !== sourceTabId);
      if (sourcePane.activeTabId === sourceTabId) {
        sourcePane.activeTabId = sourcePane.tabIds.length > 0 ? sourcePane.tabIds[sourcePane.tabIds.length - 1] : null;
      }
      
      // Insert to target
      if (sourcePaneId === targetPaneId) {
        // Reordering in same pane
        sourcePane.tabIds.splice(targetIndex, 0, sourceTabId);
        sourcePane.activeTabId = sourceTabId; // auto-focus dropped tab
        result[sourcePaneIndex] = sourcePane;
      } else {
        targetPane.tabIds.splice(targetIndex, 0, sourceTabId);
        targetPane.activeTabId = sourceTabId;
        result[sourcePaneIndex] = sourcePane;
        result[targetPaneIndex] = targetPane;
      }

      return result;
    });
  };

  const handleSplitPane = (sourcePaneId: string) => {
    if (panes.length >= 2) return; // Limit to 2 panes
    const sourcePane = panes.find(p => p.id === sourcePaneId);
    if (!sourcePane || !sourcePane.activeTabId) return;

    const newPaneId = `pane-${Date.now()}`;
    const newPane: Pane = {
      id: newPaneId,
      tabIds: [sourcePane.activeTabId],
      activeTabId: sourcePane.activeTabId
    };

    setPanes(prev => [...prev, newPane]);
  };

  const handleClosePane = (paneId: string) => {
    setPanes(prev => prev.filter(p => p.id !== paneId));
  };

  const isFocus = workspaceSettings.readingMode === 'FOCUS';

  // Helper to render the content for a given pane
  const renderPaneContent = (pane: Pane) => {
    const activeTab = tabs.find(t => t.id === pane.activeTabId);
    
    if (!activeTab) {
      return (
        <div className="flex-1 flex items-center justify-center bg-gray-50 text-gray-400">
          <div className="text-center">
            <Menu size={48} className="mx-auto mb-4 opacity-20" />
            <p>No open documents.</p>
            <button 
              onClick={handleNewDocument}
              className="mt-4 px-4 py-2 bg-white border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
            >
              Open New Document
            </button>
          </div>
        </div>
      );
    }

    if (activeTab.isUpload && !activeTab.markdown) {
      return (
        <div className="flex-1 overflow-auto p-6 flex flex-col">
          {activeTab.error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6 border border-red-200">
              {activeTab.error}
            </div>
          )}
          <div className="max-w-4xl mx-auto w-full flex-1">
            <UploadWorkspace
              selectedFile={activeTab.selectedFile || null}
              onFileSelect={(file) => updateTab(activeTab.id, { selectedFile: file })}
              noteStyle={activeTab.noteStyle || settings.default_style}
              onStyleSelect={(style) => updateTab(activeTab.id, { noteStyle: style })}
              customInstructions={activeTab.customInstructions || ""}
              onCustomInstructionsChange={(inst) => updateTab(activeTab.id, { customInstructions: inst })}
              onGenerate={() => handleGenerate(activeTab.id)}
              isGenerating={activeTab.isGenerating || false}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 flex flex-col overflow-hidden h-full pt-4 px-4 pb-4">
         <Workspace 
          markdown={activeTab.markdown || ""}
          sourceFilename={activeTab.sourceFilename || activeTab.selectedFile?.name || "Untitled"}
          metadata={activeTab.metadata}
          onReset={() => {}} // "Back" button might not make sense in tabs anymore, but we can leave it no-op
          onSave={(editedMd) => handleSaveEditedNotes(activeTab.id, editedMd)}
          workspaceSettings={{ 
            ...workspaceSettings, 
            readingMode: editingPaneId === pane.id ? 'EDITING' : workspaceSettings.readingMode 
          }}
          updateWorkspaceSettings={(updates) => {
            if (updates.readingMode === 'EDITING') {
              setEditingPaneId(pane.id);
            } else if (updates.readingMode) {
              setEditingPaneId(null);
              // also update global reading mode for things like FOCUS
              updateWorkspaceSettings(updates);
            } else {
              updateWorkspaceSettings(updates);
            }
          }}
          zoomStyle={zoomStyle}
        />
      </div>
    );
  };

  // Determine if we should force a single-pane view (because one pane is editing)
  const activePanes = editingPaneId 
    ? panes.filter(p => p.id === editingPaneId) 
    : panes;

  return (
    <div ref={containerRef} className="h-screen bg-[var(--background)] flex overflow-hidden select-none">
      {/* Activity Bar */}
      {!isFocus && (
        <div className="w-14 bg-gray-50 flex flex-col items-center py-4 border-r border-[var(--color-border)] z-20 flex-shrink-0">
          <button
            onClick={toggleSidebar}
            className={`p-2.5 rounded-xl transition-colors ${isSidebarOpen ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'}`}
            title="Explorer (Ctrl+B)"
          >
            <Menu size={22} />
          </button>
        </div>
      )}

      {/* Sidebar */}
      {!isFocus && (
        <div
          style={{
            width: isSidebarOpen ? sidebarWidth : 0,
            minWidth: isSidebarOpen ? MIN_SIDEBAR_WIDTH : 0,
            transition: isResizing.current ? 'none' : 'width 0.2s ease, min-width 0.2s ease',
            overflow: 'hidden',
            flexShrink: 0,
          }}
          className="flex flex-col border-r border-[var(--color-border)] bg-gray-50 relative"
        >
          <div style={{ width: sidebarWidth, minWidth: MIN_SIDEBAR_WIDTH }} className="h-full">
            <Sidebar
              collections={collections}
              units={units}
              chapters={chapters}
              projects={projects}
              activeProjectId={panes[0]?.activeTabId ? tabs.find(t => t.id === panes[0].activeTabId)?.projectId || null : null}

              onNewProject={handleNewDocument}
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
              }}

              onMoveUnit={(id, cid) => genericApi(`http://localhost:8000/api/hierarchy/units/${id}/move`, "POST", { collection_id: cid })}
              onMoveChapter={(id, uid) => genericApi(`http://localhost:8000/api/hierarchy/chapters/${id}/move`, "POST", { unit_id: uid })}
              onMoveProject={(id, cid) => genericApi(`http://localhost:8000/api/projects/${id}/move`, "POST", { chapter_id: cid || "null" })}
            />
          </div>
          {isSidebarOpen && (
            <div
              onMouseDown={onResizeMouseDown}
              className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-blue-400 transition-colors z-30"
              title="Drag to resize, drag left past minimum to close"
            />
          )}
        </div>
      )}

      {/* Main split-screen area */}
      <div className="flex-1 flex overflow-hidden">
        {activePanes.length === 1 ? (
          <div className="flex-1 flex flex-col min-w-0">
            <TabBar 
              paneId={activePanes[0].id}
              tabs={activePanes[0].tabIds.map(id => tabs.find(t => t.id === id)!).filter(Boolean)}
              activeTabId={activePanes[0].activeTabId}
              onTabSelect={handleTabSelect}
              onTabClose={handleTabClose}
              onTabDrop={handleTabDrop}
              onSplitPane={panes.length < 2 && !editingPaneId ? handleSplitPane : undefined}
              canSplit={panes.length < 2 && !editingPaneId}
            />
            {renderPaneContent(activePanes[0])}
          </div>
        ) : (
          <PanelGroup direction="horizontal" id="split-layout">
            <Panel id="pane-1" order={1} minSize={20}>
              <div className="flex-1 flex flex-col min-w-0 h-full">
                <TabBar 
                  paneId={panes[0].id}
                  tabs={panes[0].tabIds.map(id => tabs.find(t => t.id === id)!).filter(Boolean)}
                  activeTabId={panes[0].activeTabId}
                  onTabSelect={handleTabSelect}
                  onTabClose={handleTabClose}
                  onTabDrop={handleTabDrop}
                />
                {renderPaneContent(panes[0])}
              </div>
            </Panel>
            <PanelResizeHandle className="w-1 bg-gray-200 hover:bg-blue-400 transition-colors z-10" />
            <Panel id="pane-2" order={2} minSize={20}>
              <div className="flex-1 flex flex-col min-w-0 h-full border-l border-[var(--color-border)] relative">
                <button 
                  onClick={() => handleClosePane(panes[1].id)}
                  className="absolute top-1 right-2 z-50 p-1 bg-white border border-gray-200 rounded text-gray-500 hover:text-red-500 hover:bg-red-50 shadow-sm"
                  title="Close Split Pane"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
                <TabBar 
                  paneId={panes[1].id}
                  tabs={panes[1].tabIds.map(id => tabs.find(t => t.id === id)!).filter(Boolean)}
                  activeTabId={panes[1].activeTabId}
                  onTabSelect={handleTabSelect}
                  onTabClose={handleTabClose}
                  onTabDrop={handleTabDrop}
                />
                {renderPaneContent(panes[1])}
              </div>
            </Panel>
          </PanelGroup>
        )}
      </div>

      {isRevisionWorkspaceOpen && (
        <RevisionWorkspace 
          collections={collections}
          units={units}
          chapters={chapters}
          projects={projects}
          activeProjectId={panes[0]?.activeTabId ? tabs.find(t => t.id === panes[0].activeTabId)?.projectId || null : null}
          model={settings.default_model}
          onClose={() => setIsRevisionWorkspaceOpen(false)}
          zoomStyle={zoomStyle}
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
