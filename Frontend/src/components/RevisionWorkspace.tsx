import { useState } from "react";
import type { Collection, Unit, Chapter, Project } from "./Sidebar";
import { Play, Loader2, X, FileText, Map, Hash, HelpCircle, Zap, BookOpen, Menu } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Group as PanelGroup, Panel, Separator as PanelResizeHandle } from "react-resizable-panels";
import { useRef } from "react";

interface RevisionWorkspaceProps {
  collections: Collection[];
  units: Unit[];
  chapters: Chapter[];
  projects: Project[];
  activeProjectId: string | null;
  onClose: () => void;
  model: string;
  zoomStyle?: React.CSSProperties;
}

export function RevisionWorkspace(props: RevisionWorkspaceProps) {
  const sidebarRef = useRef<any>(null);
  const [scopeType, setScopeType] = useState<string>("file");
  const [customIds, setCustomIds] = useState<string[]>([]);
  const [activeTool, setActiveTool] = useState<string>("revision_sheet");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState<number>(15);

  const activeProject = props.projects.find(p => p.id === props.activeProjectId);
  const activeChapter = props.chapters.find(c => c.id === activeProject?.chapter_id);
  const activeUnit = props.units.find(u => u.id === activeChapter?.unit_id);
  const activeCollection = props.collections.find(c => c.id === activeUnit?.collection_id);

  const getScopeId = () => {
    if (scopeType === "file") return activeProject?.id;
    if (scopeType === "chapter") return activeChapter?.id;
    if (scopeType === "unit") return activeUnit?.id;
    if (scopeType === "collection") return activeCollection?.id;
    return undefined;
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setResult("");

    try {
      const response = await fetch(`http://localhost:8000/api/revision/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          scope_type: scopeType,
          scope_id: getScopeId(),
          custom_ids: scopeType === "custom" ? customIds : undefined,
          tool: activeTool,
          model: props.model
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.detail || "Generation failed");
      }
      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      let lastUpdate = Date.now();
      let fullText = "";

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          fullText += chunk;
          if (Date.now() - lastUpdate > 150) {
            setResult(fullText);
            lastUpdate = Date.now();
          }
        }
      }
      setResult(fullText);
    } catch (err: any) {
      console.error(err);
      setResult("Error: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCustomId = (id: string) => {
    if (customIds.includes(id)) setCustomIds(customIds.filter(i => i !== id));
    else setCustomIds([...customIds, id]);
  };

  return (
    <div className="flex h-screen bg-white w-full fixed inset-0 z-50 overflow-hidden">
      {/* Activity Bar */}
      <div className="w-14 bg-gray-50 flex flex-col items-center py-4 border-r border-gray-200 z-20 flex-shrink-0">
        <button
          onClick={() => {
            const panel = sidebarRef.current;
            if (panel) {
              if (panel.getCollapsed()) panel.expand();
              else panel.collapse();
            }
          }}
          className={`p-2.5 rounded-xl transition-colors ${!isSidebarCollapsed ? 'bg-teal-100 text-teal-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'}`}
          title="Explorer"
        >
          <Menu size={22} />
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <PanelGroup direction="horizontal" id="revision-panel-group">
          <>
            <Panel 
              ref={sidebarRef}
              id="revision-sidebar" 
              order={1} 
              defaultSize={isSidebarCollapsed ? 0 : (sidebarWidth || 15)} 
              minSize={15} 
              maxSize={40} 
              collapsible={true}
              onResize={(size) => {
                if (size === 0) {
                  setIsSidebarCollapsed(true);
                } else {
                  setSidebarWidth(size);
                  setIsSidebarCollapsed(false);
                }
              }}
            >
              <div className="border-r border-gray-200 bg-gray-50 flex flex-col h-full">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-lg font-bold text-teal-600 flex items-center gap-2"><BookOpen size={20} /> Revision</h2>
                  <button onClick={props.onClose} className="text-gray-400 hover:text-gray-700">
                    <X size={20} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase">Context Scope</h3>
                    <div className="space-y-2 text-sm text-gray-700">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="scope" checked={scopeType === 'file'} onChange={() => setScopeType('file')} className="text-teal-600" />
                        <span className="flex-1 truncate">Current File {activeProject && <span className="text-gray-400 text-xs">({activeProject.title})</span>}</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="scope" checked={scopeType === 'chapter'} onChange={() => setScopeType('chapter')} className="text-teal-600" />
                        <span className="flex-1 truncate">Current Chapter {activeChapter && <span className="text-gray-400 text-xs">({activeChapter.name})</span>}</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="scope" checked={scopeType === 'unit'} onChange={() => setScopeType('unit')} className="text-teal-600" />
                        <span className="flex-1 truncate">Current Unit {activeUnit && <span className="text-gray-400 text-xs">({activeUnit.name})</span>}</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="scope" checked={scopeType === 'collection'} onChange={() => setScopeType('collection')} className="text-teal-600" />
                        <span className="flex-1 truncate">Entire Collection {activeCollection && <span className="text-gray-400 text-xs">({activeCollection.name})</span>}</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="scope" checked={scopeType === 'custom'} onChange={() => setScopeType('custom')} className="text-teal-600" />
                        Custom Selection
                      </label>
                    </div>
                  </div>

                  {scopeType === 'custom' && (
                    <div className="space-y-2 border border-gray-200 p-2 rounded bg-white max-h-40 overflow-y-auto shadow-inner">
                      <h4 className="text-xs font-semibold text-gray-500 mb-2">Select Projects</h4>
                      {props.projects.map(p => (
                        <label key={p.id} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                          <input type="checkbox" checked={customIds.includes(p.id)} onChange={() => toggleCustomId(p.id)} className="text-teal-600 rounded" />
                          <span className="truncate">{p.title}</span>
                        </label>
                      ))}
                      {props.projects.length === 0 && <span className="text-xs text-gray-400">No projects available</span>}
                    </div>
                  )}

                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase">Revision Tool</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => setActiveTool("revision_sheet")} className={`p-2 border rounded text-xs flex flex-col items-center gap-1 transition-colors ${activeTool === "revision_sheet" ? "bg-teal-50 border-teal-200 text-teal-700" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                        <FileText size={16} /> Revision Sheet
                      </button>
                      <button onClick={() => setActiveTool("mind_map")} className={`p-2 border rounded text-xs flex flex-col items-center gap-1 transition-colors ${activeTool === "mind_map" ? "bg-teal-50 border-teal-200 text-teal-700" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                        <Map size={16} /> Mind Map
                      </button>
                      <button onClick={() => setActiveTool("cheat_sheet")} className={`p-2 border rounded text-xs flex flex-col items-center gap-1 transition-colors ${activeTool === "cheat_sheet" ? "bg-teal-50 border-teal-200 text-teal-700" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                        <Hash size={16} /> Cheat Sheet
                      </button>
                      <button onClick={() => setActiveTool("expected_questions")} className={`p-2 border rounded text-xs flex flex-col items-center gap-1 transition-colors ${activeTool === "expected_questions" ? "bg-teal-50 border-teal-200 text-teal-700" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                        <HelpCircle size={16} /> Expected Questions
                      </button>
                      <button onClick={() => setActiveTool("last_minute")} className={`p-2 border rounded text-xs flex flex-col items-center gap-1 col-span-2 transition-colors ${activeTool === "last_minute" ? "bg-teal-50 border-teal-200 text-teal-700" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                        <Zap size={16} /> Last Minute Revision
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-gray-200 bg-white">
                  <button
                    onClick={handleGenerate}
                    disabled={isLoading || (scopeType !== 'custom' && !getScopeId()) || (scopeType === 'custom' && customIds.length === 0)}
                    className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white py-2 px-4 rounded-md font-medium transition-colors disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
                    Generate
                  </button>
                </div>
              </div>
            </Panel>

            <PanelResizeHandle className="w-1 bg-gray-200 hover:bg-blue-400 transition-colors z-10" />
          </>

        {/* Main Content Area */}
        <Panel id="revision-main" order={2} defaultSize={isSidebarCollapsed ? 100 : (100 - (sidebarWidth || 15))} minSize={40}>
          <div className="h-full bg-white p-8 overflow-y-auto relative">
            <div className="max-w-3xl mx-auto pt-10">
              {result ? (
                <div className="prose prose-teal max-w-none" style={props.zoomStyle}>
                  <ReactMarkdown>{result}</ReactMarkdown>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 mt-32">
                  <BookOpen size={48} className="mb-4 opacity-20" />
                  <p>Select a scope and a revision tool, then click Generate.</p>
                </div>
              )}
            </div>
          </div>
        </Panel>
      </PanelGroup>
      </div>
    </div>
  );
}
