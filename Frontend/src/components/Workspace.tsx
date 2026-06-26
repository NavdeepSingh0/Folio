import ReactMarkdown from "react-markdown";
import { Download, ArrowLeft, Copy, Check, Save, Edit, X, Info, BookOpen } from "lucide-react";
import { StudySidebar } from "./StudySidebar";
import { useState, useEffect, useRef } from "react";

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
  };
  onReset: () => void;
  onSave: (editedMarkdown: string) => void;
}

export function Workspace({ markdown: initialMarkdown, sourceFilename, metadata, onReset, onSave }: WorkspaceProps) {
  const [copied, setCopied] = useState(false);
  const [editedMarkdown, setEditedMarkdown] = useState(initialMarkdown);
  const [viewMode, setViewMode] = useState<'preview' | 'edit'>('preview');
  const [isMetadataOpen, setIsMetadataOpen] = useState(true);
  const [isStudySidebarOpen, setIsStudySidebarOpen] = useState(false);
  
  // Resizable pane state
  const [editorWidth, setEditorWidth] = useState(45); // percentage
  const isDragging = useRef(false);

  useEffect(() => {
    setEditedMarkdown(initialMarkdown);
  }, [initialMarkdown]);

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
    setViewMode('preview');
  };

  const handleCancel = () => {
    setEditedMarkdown(initialMarkdown);
    setViewMode('preview');
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!isDragging.current) return;
    const newWidth = (e.clientX / window.innerWidth) * 100;
    if (newWidth > 20 && newWidth < 80) {
      setEditorWidth(newWidth);
    }
  };

  const onMouseUp = () => {
    isDragging.current = false;
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  };

  const onMouseDown = () => {
    isDragging.current = true;
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-base)] overflow-hidden flex flex-col h-[85vh] shadow-sm">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-[var(--color-border)] p-3 flex items-center justify-between">
        <button
          onClick={onReset}
          className="flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors text-sm font-medium"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        
        <div className="flex items-center gap-2">
          {viewMode === 'preview' ? (
            <>
              {metadata && (
                <button
                  onClick={() => setIsMetadataOpen(!isMetadataOpen)}
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
                onClick={() => {
                  setIsStudySidebarOpen(!isStudySidebarOpen);
                  if (!isStudySidebarOpen) setIsMetadataOpen(false);
                }}
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
              <button
                onClick={() => setViewMode('edit')}
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
      <div className="flex-1 flex overflow-hidden relative">
        {viewMode === 'edit' && (
          <>
            {/* Editor Pane */}
            <div 
              style={{ width: `${editorWidth}%` }} 
              className="flex flex-col bg-[#1e1e1e] text-[#d4d4d4] border-r border-[var(--color-border)]"
            >
              <div className="px-4 py-2 bg-[#2d2d2d] text-xs font-mono border-b border-[#404040]">Markdown Editor</div>
              <textarea
                value={editedMarkdown}
                onChange={(e) => setEditedMarkdown(e.target.value)}
                className="w-full h-full p-4 resize-none bg-transparent outline-none font-mono text-sm leading-relaxed"
                spellCheck={false}
              />
            </div>
            
            {/* Resizer */}
            <div 
              onMouseDown={onMouseDown}
              className="w-1 bg-gray-200 hover:bg-blue-400 cursor-col-resize z-10"
            />
          </>
        )}

        {/* Rendered Preview Pane */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          <div className="flex-1 overflow-auto p-8 lg:p-12">
            <div className="prose prose-slate max-w-3xl mx-auto">
              <ReactMarkdown>{viewMode === 'edit' ? editedMarkdown : initialMarkdown}</ReactMarkdown>
            </div>
          </div>
        </div>

        {/* Metadata Panel (Only visible in Preview Mode when isMetadataOpen is true) */}
        {viewMode === 'preview' && metadata && isMetadataOpen && !isStudySidebarOpen && (
          <div className="w-64 border-l border-[var(--color-border)] bg-gray-50 p-4 flex flex-col gap-4 text-sm hidden lg:flex shadow-[-4px_0_15px_rgba(0,0,0,0.03)] z-10 relative">
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

        {/* Study Sidebar (Only visible in Preview Mode) */}
        {viewMode === 'preview' && isStudySidebarOpen && metadata && (
          <StudySidebar 
            markdown={editedMarkdown} 
            model={metadata.model || "llama3.2"} 
            onClose={() => setIsStudySidebarOpen(false)} 
          />
        )}
      </div>
    </div>
  );
}
