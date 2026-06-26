import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Download, ArrowLeft, Copy, Check, Save, Edit, X, Info, BookOpen } from "lucide-react";
import { StudySidebar } from "./StudySidebar";
import { useState, useEffect, useRef, useCallback } from "react";
import { Group as PanelGroup, Panel, Separator as PanelResizeHandle } from "react-resizable-panels";

export interface WorkspaceProps {
  markdown: string;
  sourceFilename: string;
  metadata?: {
    created_at: string;
    last_modified: string;
    model: string;
    study_style: string;
    word_count: number;
    pages?: number;
    chunks?: number;
    generation_time?: number;
    classification?: string;
    pipeline_metrics?: string;
  };
  onReset: () => void;
  onSave: (editedMarkdown: string) => void;
  workspaceSettings: any;
  updateWorkspaceSettings: (updates: any) => void;
  zoomStyle: React.CSSProperties;
}

const RIGHT_PANEL_DEFAULT = 280;
const RIGHT_PANEL_MIN = 200;
const RIGHT_PANEL_MAX = 500;

export function Workspace({ projectId, chapterId, unitId, collectionId, markdown: initialMarkdown, sourceFilename, metadata, onReset, onSave, workspaceSettings, updateWorkspaceSettings, zoomStyle }: WorkspaceProps) {
  const [copied, setCopied] = useState(false);
  const [editedMarkdown, setEditedMarkdown] = useState(initialMarkdown);
  const [isMetadataOpen, setIsMetadataOpen] = useState(false);
  const [isStudySidebarOpen, setIsStudySidebarOpen] = useState(false);
  const [rightPanelWidth, setRightPanelWidth] = useState(RIGHT_PANEL_DEFAULT);
  const isResizingRight = useRef(false);
  const mainAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setEditedMarkdown(initialMarkdown);
  }, [initialMarkdown]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && workspaceSettings.readingMode === 'FOCUS') {
        updateWorkspaceSettings({ readingMode: 'READING' });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [workspaceSettings.readingMode, updateWorkspaceSettings]);

  const onRightResizeMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizingRight.current = true;

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!isResizingRight.current || !mainAreaRef.current) return;
      const containerRect = mainAreaRef.current.getBoundingClientRect();
      const newWidth = containerRect.right - moveEvent.clientX;
      if (newWidth < RIGHT_PANEL_MIN) {
        // Snap shut
        setIsMetadataOpen(false);
        setIsStudySidebarOpen(false);
        isResizingRight.current = false;
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      } else if (newWidth > RIGHT_PANEL_MAX) {
        setRightPanelWidth(RIGHT_PANEL_MAX);
      } else {
        setRightPanelWidth(newWidth);
      }
    };

    const onMouseUp = () => {
      isResizingRight.current = false;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }, []);

  const extractTopicName = (mdContent: string): string => {
    const match = mdContent.match(/^#\s+(.+)$/m);
    if (match && match[1].trim()) {
      return match[1].trim().replace(/[^a-z0-9]/gi, '_').toLowerCase() + ".md";
    }
    const baseName = sourceFilename.replace(/\.[^/.]+$/, "");
    return `${baseName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_notes.md`;
  };

  const handleDownload = () => {
    const filename = extractTopicName(editedMarkdown);
    const blob = new Blob([editedMarkdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editedMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    onSave(editedMarkdown);
    updateWorkspaceSettings({ readingMode: 'READING' });
  };

  const handleCancel = () => {
    setEditedMarkdown(initialMarkdown);
    updateWorkspaceSettings({ readingMode: 'READING' });
  };

  const safePreviewWidth = Number(workspaceSettings.previewWidth) || 50;
  const isEditing = workspaceSettings.readingMode === 'EDITING';
  const rightPanelVisible = !isEditing && (isMetadataOpen || isStudySidebarOpen);

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-base)] overflow-hidden flex flex-col h-[85vh] shadow-sm">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-[var(--color-border)] p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors text-sm font-medium"
          >
            <ArrowLeft size={16} />
            Back
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <>
              {metadata && (
                <button
                  onClick={() => { setIsMetadataOpen(!isMetadataOpen); setIsStudySidebarOpen(false); }}
                  className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    isMetadataOpen 
                      ? "bg-blue-100 text-blue-800" 
                      : "text-[var(--color-text-secondary)] hover:bg-gray-200"
                  }`}
                  title="Toggle Project Info"
                >
                  <Info size={16} /> Info
                </button>
              )}
              <button
                onClick={() => { setIsStudySidebarOpen(!isStudySidebarOpen); setIsMetadataOpen(false); }}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  isStudySidebarOpen 
                    ? "bg-indigo-100 text-indigo-800" 
                    : "text-[var(--color-text-secondary)] hover:bg-gray-200"
                }`}
                title="Toggle Study Assistant"
              >
                <BookOpen size={16} /> Study Assistant
              </button>
              <div className="w-px h-5 bg-gray-300 mx-1"></div>
              
              <div className="flex bg-gray-100 p-0.5 rounded-md mx-1">
                <button 
                  onClick={() => updateWorkspaceSettings({ readingMode: 'READING' })}
                  className={`px-3 py-1 text-xs font-medium rounded ${workspaceSettings.readingMode === 'READING' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                >Reading</button>
                <button 
                  onClick={() => updateWorkspaceSettings({ readingMode: 'FOCUS' })}
                  className={`px-3 py-1 text-xs font-medium rounded ${workspaceSettings.readingMode === 'FOCUS' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                >Focus</button>
              </div>
              
              <button
                onClick={() => updateWorkspaceSettings({ readingMode: 'EDITING' })}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[var(--color-text-secondary)] hover:bg-gray-200 rounded-md transition-colors"
              >
                <Edit size={16} /> Edit
              </button>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[var(--color-text-secondary)] hover:bg-gray-200 rounded-md transition-colors"
              >
                {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                {copied ? "Copied!" : "Copy"}
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 text-sm font-medium rounded-md transition-colors"
              >
                <Download size={16} /> Export
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                <X size={16} /> Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-1.5 bg-[var(--color-primary)] hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
              >
                <Save size={16} /> Save Changes
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div ref={mainAreaRef} className="flex-1 flex overflow-hidden relative">
        
        {/* Editor/Preview split — react-resizable-panels works fine here */}
        <div className="flex-1 flex overflow-hidden">
          {isEditing ? (
            <PanelGroup direction="horizontal" id="workspace-panel-group">
              <Panel id="editor-panel" order={1} defaultSize={safePreviewWidth} minSize={20}>
                <div className="flex flex-col bg-[#1e1e1e] text-[#d4d4d4] border-r border-[var(--color-border)] h-full">
                  <div className="px-4 py-2 bg-[#2d2d2d] text-xs font-mono border-b border-[#404040]">Markdown Editor</div>
                  <textarea
                    value={editedMarkdown}
                    onChange={(e) => setEditedMarkdown(e.target.value)}
                    className="w-full h-full p-4 resize-none bg-transparent outline-none font-mono leading-relaxed"
                    spellCheck={false}
                    style={zoomStyle}
                  />
                </div>
              </Panel>
              <PanelResizeHandle id="editor-resize" className="w-1 bg-gray-200 hover:bg-blue-400 transition-colors z-10" />
              <Panel id="preview-panel" order={2} defaultSize={100 - safePreviewWidth} minSize={30}>
                <div className="flex-1 flex flex-col bg-white overflow-hidden h-full">
                  <div className="flex-1 overflow-auto p-8 lg:p-12">
                    <div className="prose prose-slate max-w-3xl mx-auto" style={zoomStyle}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{editedMarkdown}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              </Panel>
            </PanelGroup>
          ) : (
            /* Reading / Focus mode — just the preview */
            <div className="flex-1 flex flex-col bg-white overflow-hidden h-full">
              <div className="flex-1 overflow-auto p-8 lg:p-12">
                <div className="prose prose-slate max-w-3xl mx-auto" style={zoomStyle}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{initialMarkdown}</ReactMarkdown>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel — CSS width transition */}
        {rightPanelVisible && (
          /* Resize handle on the LEFT edge of the right panel */
          <div
            onMouseDown={onRightResizeMouseDown}
            className="w-1.5 h-full cursor-col-resize hover:bg-blue-400 transition-colors z-30 flex-shrink-0 bg-gray-200"
          />
        )}
        <div
          style={{
            width: rightPanelVisible ? rightPanelWidth : 0,
            minWidth: rightPanelVisible ? RIGHT_PANEL_MIN : 0,
            transition: isResizingRight.current ? 'none' : 'width 0.2s ease, min-width 0.2s ease',
            overflow: 'hidden',
            flexShrink: 0,
          }}
          className="border-l border-[var(--color-border)] bg-gray-50 flex flex-col relative"
        >
          <div style={{ width: rightPanelWidth, minWidth: RIGHT_PANEL_MIN }} className="h-full overflow-auto">
            {/* Metadata Panel */}
            {isMetadataOpen && metadata && (
              <div className="p-4 flex flex-col gap-4 text-sm h-full">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-700 uppercase tracking-wider text-xs">Project Info</h3>
                  <button 
                    onClick={() => setIsMetadataOpen(false)}
                    className="text-gray-400 hover:text-gray-700 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
                
                <div>
                  <div className="text-gray-500 text-xs mb-0.5">Source Document</div>
                  <div className="font-medium text-gray-800 break-words" title={sourceFilename}>{sourceFilename}</div>
                </div>
                
                <div>
                  <div className="text-gray-500 text-xs mb-0.5">Study Style</div>
                  <div className="font-medium text-gray-800 capitalize">{metadata.study_style.replace('_', ' ')}</div>
                </div>

                <div>
                  <div className="text-gray-500 text-xs mb-0.5">Model Used</div>
                  <div className="font-medium text-gray-800">{metadata.model}</div>
                </div>

                <div>
                  <div className="text-gray-500 text-xs mb-0.5">Word Count</div>
                  <div className="font-medium text-gray-800">{metadata.word_count} words</div>
                </div>

                <div>
                  <div className="text-gray-500 text-xs mb-0.5">Pages</div>
                  <div className="font-medium text-gray-800">{metadata.pages || 0}</div>
                </div>
                
                <div>
                  <div className="text-gray-500 text-xs mb-0.5">Chunks</div>
                  <div className="font-medium text-gray-800">{metadata.chunks || 0}</div>
                </div>
                
                <div>
                  <div className="text-gray-500 text-xs mb-0.5">Generation Time</div>
                  <div className="font-medium text-gray-800">{metadata.generation_time?.toFixed(1) || "0.0"}s</div>
                </div>

                {metadata.classification && (
                  <div>
                    <div className="text-gray-500 text-xs mb-0.5">Classification</div>
                    <div className="font-medium text-gray-800 bg-blue-50 text-blue-700 px-2 py-0.5 rounded inline-block text-xs border border-blue-100">{metadata.classification}</div>
                  </div>
                )}
                
                {metadata.pipeline_metrics && (
                  <div>
                    <div className="text-gray-500 text-xs mb-1">Pipeline Metrics</div>
                    <div className="bg-gray-100 p-2 rounded text-xs text-gray-700 font-mono space-y-1">
                      {(() => {
                        try {
                          const pm = JSON.parse(metadata.pipeline_metrics);
                          return (
                            <>
                              {pm.extract_time_sec !== undefined && <div className="flex justify-between"><span>Extract:</span> <span>{pm.extract_time_sec}s</span></div>}
                              {pm.clean_time_sec !== undefined && <div className="flex justify-between"><span>Clean:</span> <span>{pm.clean_time_sec}s</span></div>}
                              {pm.chunk_time_sec !== undefined && <div className="flex justify-between"><span>Chunk:</span> <span>{pm.chunk_time_sec}s</span></div>}
                              {pm.llm_time_sec !== undefined && <div className="flex justify-between"><span>LLM:</span> <span>{pm.llm_time_sec}s</span></div>}
                              {pm.total_time_sec !== undefined && <div className="flex justify-between pt-1 border-t border-gray-200 mt-1 font-semibold"><span>Total:</span> <span>{pm.total_time_sec}s</span></div>}
                              {pm.imported && <div>Imported directly (No LLM)</div>}
                            </>
                          );
                        } catch (e) {
                          return <div>Invalid metrics data</div>;
                        }
                      })()}
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-gray-500 text-xs mb-0.5">Created</div>
                  <div className="font-medium text-gray-800">{new Date(metadata.created_at).toLocaleDateString()}</div>
                </div>
                
                <div>
                  <div className="text-gray-500 text-xs mb-0.5">Last Edited</div>
                  <div className="font-medium text-gray-800">{new Date(metadata.last_modified).toLocaleTimeString()}</div>
                </div>
              </div>
            )}

            {/* Study Assistant Panel */}
            {isStudySidebarOpen && metadata && (
              <StudySidebar 
                markdown={editedMarkdown} 
                model={metadata.model || "qwen3"} 
                onClose={() => setIsStudySidebarOpen(false)} 
                projectId={projectId}
                chapterId={chapterId}
                unitId={unitId}
                collectionId={collectionId}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
