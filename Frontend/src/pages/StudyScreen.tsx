import React, { useState, useEffect, useRef, useCallback } from "react";
import { AppLayout } from "../components/AppLayout";
import { MessageSquare, Paperclip, Minimize2, Edit, Edit2, Eye, Info, X, FileText, File as FileIcon, Plus, Loader2, ChevronRight } from "lucide-react";
import { api } from "../api";
import { cache } from "../lib/cache";
import "github-markdown-css/github-markdown.css";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useNavigate, useSearchParams } from "react-router-dom";
import { NoteEditorPane } from "../components/NoteEditorPane";
import ChatBubble from "../components/ChatBubble";
import ChatInput from "../components/ChatInput";

// File metadata for the localStorage cache; the markdown body is left out so
// large notes (inline images) never fill the storage quota.
const stripBody = ({ markdown_content: _body, ...meta }: any) => meta;

const SAMPLE_MARKDOWN = `
# Newton's Laws of Motion

Classical mechanics is governed by three fundamental laws formulated by Sir Isaac Newton.

## First Law: Inertia
An object at rest remains at rest, and an object in motion remains in motion at constant speed and in a straight line unless acted on by an unbalanced force.

## Second Law: F = ma
The acceleration of an object depends on the mass of the object and the amount of force applied. 

## Third Law: Action & Reaction
Whenever one object exerts a force on a second object, the second object exerts an equal and opposite force on the first.
`;

type ChatMessage = { id: number; role: "user" | "model"; text: string; isError?: boolean };

let chatMessageSeq = 0;

export function StudyScreen() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const fileId = searchParams.get("file");

  const [chatOpen, setChatOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState("");
  // The live editor buffer lives in NoteEditorPane; this ref mirrors it for saves.
  const markdownRef = useRef("");
  const [initialContent, setInitialContent] = useState("");
  // Bumped on every load so NoteEditorPane remounts with the new content
  const [loadVersion, setLoadVersion] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [fileData, setFileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDocInfo, setShowDocInfo] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [showSplitFile, setShowSplitFile] = useState(false);
  const [zoom, setZoom] = useState(100);

  // Content the editor buffer was last loaded from or saved as. The buffer is
  // "dirty" when it differs, and dirty buffers are never overwritten by loads.
  const [baselineMarkdown, setBaselineMarkdown] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const isDirtyRef = useRef(false);
  const fileIdRef = useRef(fileId);
  useEffect(() => { isDirtyRef.current = isDirty; }, [isDirty]);
  useEffect(() => { fileIdRef.current = fileId; }, [fileId]);

  // Chat state is kept per file so each note has its own conversation and
  // backend session (the API returns session_id; we send it on follow-ups).
  const [chatByFile, setChatByFile] = useState<Record<string, ChatMessage[]>>({});
  const [sessionByFile, setSessionByFile] = useState<Record<string, number>>({});
  const [sendingByFile, setSendingByFile] = useState<Record<string, boolean>>({});
  const [chatAttachments, setChatAttachments] = useState<File[]>([]);
  const chatHistory = fileId ? chatByFile[fileId] ?? [] : [];
  const isSending = fileId ? !!sendingByFile[fileId] : false;

  const [openTabs, setOpenTabs] = useState<{id: string, name: string}[]>(() => cache.get<{id: string, name: string}[]>('open_tabs') || []);

  // Ask before any in-screen navigation that would discard unsaved edits.
  const confirmDiscard = () => !isDirty || window.confirm("You have unsaved changes to this note. Discard them?");

  const openTab = (id: string) => {
    if (id === fileId || !confirmDiscard()) return;
    navigate(`/study?file=${id}`);
  };

  useEffect(() => {
    if (fileId && fileData && fileData.name) {
      setOpenTabs(prev => {
        const exists = prev.find(t => t.id === fileId);
        if (!exists) {
          const newTabs = [...prev, { id: fileId, name: fileData.name }];
          cache.set('open_tabs', newTabs);
          return newTabs;
        } else if (exists.name !== fileData.name) {
          const newTabs = prev.map(t => t.id === fileId ? { ...t, name: fileData.name } : t);
          cache.set('open_tabs', newTabs);
          return newTabs;
        }
        return prev;
      });
    }
  }, [fileId, fileData]);

  const closeTab = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (id === fileId && !confirmDiscard()) return;
    const newTabs = openTabs.filter(t => t.id !== id);
    setOpenTabs(newTabs);
    cache.set('open_tabs', newTabs);
    if (id === fileId) {
      if (newTabs.length > 0) {
        navigate(`/study?file=${newTabs[newTabs.length - 1].id}`);
      } else {
        navigate('/library');
      }
    }
  };
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [panelAttachments, setPanelAttachments] = useState<any[]>([]);
  const [previewAttachment, setPreviewAttachment] = useState<any | null>(null);
  const panelFileInputRef = useRef<HTMLInputElement>(null);
  const [editingAttachmentId, setEditingAttachmentId] = useState<number | null>(null);
  const [editAttachmentValue, setEditAttachmentValue] = useState("");
  const [codePreviewContent, setCodePreviewContent] = useState<string | null>(null);

  useEffect(() => {
    const isCodeOrText = (att: any) => {
      const type = att.file_type || "";
      const name = att.filename?.toLowerCase() || "";
      if (type.startsWith('text/') || type.includes('json') || type.includes('xml') || type.includes('javascript') || type.includes('python')) return true;
      const codeExts = ['.cpp', '.c', '.h', '.hpp', '.java', '.py', '.js', '.jsx', '.ts', '.tsx', '.cs', '.go', '.rs', '.php', '.rb', '.swift', '.kt', '.sql', '.sh', '.md', '.txt', '.csv'];
      return codeExts.some(ext => name.endsWith(ext));
    };

    if (previewAttachment && isCodeOrText(previewAttachment)) {
      setCodePreviewContent("Loading code preview...");
      fetch(previewAttachment.public_url)
        .then(res => res.text())
        .then(text => setCodePreviewContent(text))
        .catch(() => setCodePreviewContent("Failed to load code preview."));
    } else {
      setCodePreviewContent(null);
    }
  }, [previewAttachment]);

  // Load File Data
  useEffect(() => {
    if (!fileId) {
      // If no file loaded, navigate to library
      navigate("/library", { replace: true });
      return;
    }

    // Aborted when fileId changes or the screen unmounts, so a slow response
    // for a previous file can never land in this file's buffer.
    const controller = new AbortController();
    const { signal } = controller;

    // Switching files starts a fresh buffer (unsaved edits were already
    // confirmed-discarded by the navigation guard).
    isDirtyRef.current = false;
    setIsDirty(false);
    setIsEditing(false);
    setEditingName(false);
    setPreviewAttachment(null);

    const applyFile = (data: any) => {
      const content = data.markdown_content || "No content extracted.";
      setFileData(data);
      setEditNameValue(data.name || "");
      showMessage(content);
    };

    function showMessage(text: string) {
      markdownRef.current = text;
      setInitialContent(text);
      setBaselineMarkdown(text);
      setLoadVersion(v => v + 1);
    }

    // 1. Instant metadata from cache. Note bodies are never cached in
    // localStorage, so content always comes from the network.
    const cachedMeta = cache.get<any>(`study_file_${fileId}`);
    // Drop the previous file's buffer so it can't be shown or saved under this id
    setFileData(cachedMeta && !("markdown_content" in cachedMeta) ? cachedMeta : null);
    setEditNameValue(cachedMeta?.name || "");
    showMessage("");
    setIsLoading(true);

    setPanelAttachments(cache.get<any[]>(`study_attachments_${fileId}`) || []);

    // 2. Background Revalidation
    api.getFile(fileId, signal).then(data => {
      if (signal.aborted) return;
      cache.set(`study_file_${fileId}`, stripBody(data));
      if (isDirtyRef.current) {
        // The user started editing the cached copy; keep their buffer.
        setFileData(data);
      } else {
        applyFile(data);
      }
      setIsLoading(false);
    }).catch(err => {
      if (signal.aborted) return;
      console.error("Failed to load file", err);
      if (!isDirtyRef.current) showMessage("Failed to load file data.");
      setIsLoading(false);
    });
    api.getAttachments(fileId, signal).then(data => {
      if (signal.aborted) return;
      setPanelAttachments(data);
      cache.set(`study_attachments_${fileId}`, data);
    }).catch(err => {
      if (signal.aborted) return;
      console.error("Failed to load attachments", err);
    });

    return () => controller.abort();
  }, [fileId, navigate]);

  const handleSave = async () => {
    if (!fileId || !isDirtyRef.current) return;
    // Capture what is being saved so a tab switch mid-request can't redirect it
    const id = fileId;
    const content = markdownRef.current;
    const savedFileData = fileData;
    try {
      setSaveStatus("Saving...");
      // PUT returns a summary without the body; keep the local buffer.
      await api.updateFile(id, { markdown_content: content });
      if (savedFileData) {
        cache.set(`study_file_${id}`, stripBody(savedFileData));
      }
      if (fileIdRef.current === id) {
        setFileData((prev: any) => prev ? { ...prev, markdown_content: content } : prev);
        setBaselineMarkdown(content);
      }
      setSaveStatus("Saved!");
      setTimeout(() => setSaveStatus(null), 2000);
    } catch (err) {
      console.error("Failed to save markdown", err);
      setSaveStatus("Error!");
      setTimeout(() => setSaveStatus(null), 2000);
    }
  };

  const handleSend = (draft: string) => {
    const text = draft.trim();
    if (!fileId || !text || isSending) return false;
    void sendMessage(fileId, text);
    return true;
  };

  const sendMessage = async (id: string, text: string) => {
    // Bind the reply to the file it was asked about, even if the user switches tabs
    const attachments = [...chatAttachments];
    setChatAttachments([]);

    const append = (msg: Omit<ChatMessage, "id">) =>
      setChatByFile(prev => ({ ...prev, [id]: [...(prev[id] ?? []), { ...msg, id: ++chatMessageSeq }] }));

    append({ role: "user", text: attachments.length > 0 ? `${text}\n[Attachments sent]` : text });
    setSendingByFile(prev => ({ ...prev, [id]: true }));
    try {
      const response = await api.sendMessage(text, Number(id), sessionByFile[id], attachments);
      if (response.session_id) {
        setSessionByFile(prev => ({ ...prev, [id]: response.session_id }));
      }
      append({ role: "model", text: response.message });
    } catch (err) {
      console.error(err);
      const detail = err instanceof Error ? err.message : String(err);
      append({ role: "model", text: `Sorry, I couldn't get a response: ${detail}` });
    } finally {
      setSendingByFile(prev => ({ ...prev, [id]: false }));
    }
  };

  // Keyboard shortcut for zoom
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "=" || e.key === "+") {
          e.preventDefault();
          setZoom(z => Math.min(z + 10, 200));
        } else if (e.key === "-") {
          e.preventDefault();
          setZoom(z => Math.max(z - 10, 50));
        } else if (e.key === "0") {
          e.preventDefault();
          setZoom(100);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const saveFileName = async () => {
    if (editNameValue.trim() === "" || !fileId) {
      setEditingName(false);
      return;
    }
    try {
      await api.updateFile(fileId, { name: editNameValue.trim() });
      setFileData({ ...fileData, name: editNameValue.trim() });
    } catch (err) {
      console.error(err);
    }
    setEditingName(false);
  };

  // Uploads an image dropped/pasted into the editor and returns its URL;
  // NoteEditorPane handles the placeholder insert and replacement.
  const uploadEditorImage = async (file: File) => {
    if (!fileId) throw new Error("No file loaded");
    const uploadedAtt = await api.uploadAttachment(fileId, file);
    setPanelAttachments(prev => [uploadedAtt, ...prev]);
    return uploadedAtt.public_url as string;
  };

  const handleUploadError = () => {
    setSaveStatus("Error uploading image");
    setTimeout(() => setSaveStatus(null), 2000);
  };

  const handleDirtyChange = useCallback((dirty: boolean) => {
    isDirtyRef.current = dirty;
    setIsDirty(dirty);
  }, []);

  return (
    <AppLayout>
      <div className="h-full w-full bg-background relative flex flex-col">
        
        {/* Top Navigation - File Tabs */}
        <div className="h-12 border-b border-border flex items-center bg-surface shrink-0 overflow-x-auto overflow-y-hidden">
          {openTabs.map(tab => {
            const isActive = tab.id === fileId;
            return (
              <div 
                key={tab.id}
                onClick={() => openTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 border-r border-border h-full cursor-pointer group min-w-32 max-w-64 transition-colors ${isActive ? 'bg-background border-t-2 border-t-primary' : 'bg-surface hover:bg-muted border-t-2 border-t-transparent'}`}
              >
                <FileIcon className={`w-4 h-4 shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                {isActive && editingName ? (
                  <input
                    autoFocus
                    value={editNameValue}
                    onChange={(e) => setEditNameValue(e.target.value)}
                    onBlur={saveFileName}
                    onKeyDown={(e) => e.key === 'Enter' && saveFileName()}
                    className="text-sm font-medium w-full bg-transparent border-b border-primary outline-none"
                  />
                ) : (
                  <div className="flex-1 flex items-center gap-2 overflow-hidden" onClick={(e) => { if (isActive) { e.stopPropagation(); setEditingName(true); } }} title={isActive ? "Click to rename" : tab.name}>
                    <span className={`text-sm truncate ${isActive ? 'font-medium text-foreground' : 'text-muted-foreground group-hover:text-foreground'}`}>{tab.name}</span>
                    {isActive && <Edit2 className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />}
                  </div>
                )}
                <button 
                  onClick={(e) => closeTab(e, tab.id)}
                  className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-muted-foreground/20 text-muted-foreground hover:text-foreground transition-all shrink-0"
                  title="Close tab"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
          
          {/* Add New Tab Button */}
          <button 
            onClick={() => { if (confirmDiscard()) navigate('/library'); }}
            className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors ml-1 shrink-0 rounded-md"
            title="Open another note from Library"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="h-12 border-b border-border flex items-center justify-between px-6 shrink-0 bg-background">
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground">Zoom: {zoom}%</span>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowSplitFile(!showSplitFile)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${showSplitFile ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
            >
              <FileText className="w-4 h-4" />
              Split View
            </button>
            <button 
              onClick={() => setShowDocInfo(!showDocInfo)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${showDocInfo ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
            >
              <Info className="w-4 h-4" />
              Info
            </button>
            <button 
              onClick={() => setShowAttachments(!showAttachments)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${showAttachments ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'}`}
            >
              <Paperclip className="w-4 h-4" />
              Attachments
            </button>
            <div className="w-px h-5 bg-border mx-1"></div>
            {saveStatus && <span className="text-xs font-medium text-green-500 animate-in fade-in mr-2">{saveStatus}</span>}
            <button 
              onClick={async () => {
                if (isEditing) {
                  await handleSave();
                  setIsEditing(false);
                } else {
                  setIsEditing(true);
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${isEditing ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
            >
              {isEditing ? <Eye className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
              {isEditing ? "Preview" : "Edit"}
            </button>
          </div>
        </div>

        {/* Optional Doc Info Bar */}
        {showDocInfo && (
          <div className="bg-muted px-6 py-2 border-b border-border flex items-center gap-6 text-xs text-muted-foreground">
            <span><strong>Words:</strong> {wordCount}</span>
            <span><strong>Created:</strong> {fileData?.created_at ? new Date(fileData.created_at).toLocaleDateString() : 'Unknown'}</span>
          </div>
        )}

        <PanelGroup direction="horizontal" className="flex-1 overflow-hidden">
          {/* Main Reading/Editing Pane */}
          <Panel defaultSize={chatOpen || showAttachments ? 65 : 100} minSize={30}>
            <div className="h-full overflow-hidden flex flex-col relative">
              {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <NoteEditorPane
                  key={`${fileId}-${loadVersion}`}
                  initialContent={initialContent}
                  baseline={baselineMarkdown}
                  mode={isEditing ? "edit" : showSplitFile ? "split" : "read"}
                  zoom={zoom}
                  contentRef={markdownRef}
                  onDirtyChange={handleDirtyChange}
                  onWordCount={setWordCount}
                  onSave={handleSave}
                  uploadImage={uploadEditorImage}
                  onUploadError={handleUploadError}
                  readOverlay={!chatOpen && !showAttachments && (
                    <button 
                      onClick={() => setChatOpen(true)}
                      className="absolute top-8 right-8 flex items-center gap-2 text-sm font-medium text-primary bg-primary/10 px-4 py-2 rounded-full hover:bg-primary/20 transition-colors"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Study Assistant
                    </button>
                  )}
                />
              )}

            </div>
          </Panel>

          {/* Resizable Split Handle */}
          {(chatOpen || showAttachments) && (
            <PanelResizeHandle className="w-1 bg-border hover:bg-primary/50 transition-colors cursor-col-resize active:bg-primary" />
          )}

          {/* Side Panels (Chat or Attachments) */}
          {(chatOpen || showAttachments) && (
            <Panel defaultSize={35} minSize={20} maxSize={50}>
              <div className="h-full flex flex-col relative bg-card">
                
                {/* Attachments Drawer (Overlays Chat if both are open, but doesn't blur reading pane) */}
                {showAttachments && (
                  <div className="absolute inset-0 z-20 bg-card border-l border-border flex flex-col shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.1)]">
                    <div className="h-16 border-b border-border flex items-center justify-between px-6 shrink-0 bg-surface">
                      <h3 className="font-medium flex items-center gap-2">
                        {previewAttachment ? (
                          <>
                            <button onClick={() => setPreviewAttachment(null)} className="p-1 hover:bg-muted rounded-md mr-1 text-muted-foreground"><ChevronRight className="w-4 h-4 rotate-180" /></button>
                            <span className="truncate max-w-[150px] text-sm">{previewAttachment.filename}</span>
                          </>
                        ) : (
                          <>
                            <Paperclip className="w-4 h-4 text-primary" />
                            Attachments ({panelAttachments.length})
                          </>
                        )}
                      </h3>
                      <div className="flex gap-2">
                        {!previewAttachment && (
                          <button onClick={() => panelFileInputRef.current?.click()} className="p-2 hover:bg-primary/10 rounded-md text-primary transition-colors">
                            <Plus className="w-5 h-5" />
                          </button>
                        )}
                        <button onClick={() => { setShowAttachments(false); setPreviewAttachment(null); }} className="p-2 hover:bg-muted rounded-md text-muted-foreground transition-colors">
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      <input type="file" multiple className="hidden" ref={panelFileInputRef} onChange={async (e) => {
                        if (e.target.files && fileId) {
                          const files = Array.from(e.target.files);
                          for (const file of files) {
                            try {
                              const newAtt = await api.uploadAttachment(fileId, file);
                              setPanelAttachments(prev => [newAtt, ...prev]);
                            } catch(err) {
                              console.error(err);
                            }
                          }
                        }
                      }} />
                    </div>
                    {previewAttachment ? (
                      <div className="flex-1 overflow-auto bg-background flex flex-col">
                        {previewAttachment.file_type?.startsWith('image/') ? (
                          <img src={previewAttachment.public_url} alt="Preview" className="w-full h-auto object-contain" />
                        ) : codePreviewContent !== null ? (
                          <pre className="p-4 bg-muted text-foreground text-sm overflow-auto h-full w-full whitespace-pre-wrap font-mono">
                            {codePreviewContent}
                          </pre>
                        ) : (
                          <iframe src={previewAttachment.public_url} className="w-full h-full border-0 bg-background" title="Preview" />
                        )}
                      </div>
                    ) : (
                      <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 gap-4 bg-background items-start">
                        {panelAttachments.length === 0 ? (
                          <div className="col-span-2 flex flex-col items-center justify-center h-40 text-center text-muted-foreground">
                            <p className="text-sm">No attachments yet.<br/>Upload reference files here.</p>
                          </div>
                        ) : (
                          panelAttachments.map((f, i) => (
                            <div key={i} onClick={() => setPreviewAttachment(f)} className="group border border-border rounded-lg overflow-hidden bg-surface hover:border-primary transition-colors cursor-pointer shadow-sm relative flex flex-col">
                              <button onClick={(e) => { e.stopPropagation(); api.deleteAttachment(f.id); setPanelAttachments(prev => prev.filter(att => att.id !== f.id)); }} className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-all z-10">
                                <X className="w-3 h-3" />
                              </button>
                              <div className="h-28 bg-muted flex items-center justify-center relative overflow-hidden">
                                {f.file_type?.startsWith('image/') ? (
                                  <img src={f.public_url} alt={f.filename} className="w-full h-full object-cover" />
                                ) : (
                                  <FileText className="w-8 h-8 text-muted-foreground" />
                                )}
                                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                                  <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1.5 rounded-full shadow-md">
                                    Preview
                                  </span>
                                </div>
                              </div>
                              <div className="p-3 border-t border-border flex items-center justify-between" onClick={e => e.stopPropagation()}>
                                {editingAttachmentId === f.id ? (
                                  <input 
                                    autoFocus
                                    value={editAttachmentValue}
                                    onChange={(e) => setEditAttachmentValue(e.target.value)}
                                    onClick={e => e.stopPropagation()}
                                    onBlur={async () => {
                                      if (editAttachmentValue.trim() !== "") {
                                        try {
                                          const res = await api.updateAttachment(f.id, editAttachmentValue.trim());
                                          setPanelAttachments(prev => prev.map(a => a.id === f.id ? res : a));
                                        } catch (err) { console.error(err); }
                                      }
                                      setEditingAttachmentId(null);
                                    }}
                                    onKeyDown={async (e) => {
                                      if (e.key === 'Enter') {
                                        if (editAttachmentValue.trim() !== "") {
                                          try {
                                            const res = await api.updateAttachment(f.id, editAttachmentValue.trim());
                                            setPanelAttachments(prev => prev.map(a => a.id === f.id ? res : a));
                                          } catch (err) { console.error(err); }
                                        }
                                        setEditingAttachmentId(null);
                                      }
                                    }}
                                    className="text-[13px] font-medium w-full bg-background text-foreground border border-primary px-1 outline-none rounded"
                                  />
                                ) : (
                                  <div className="overflow-hidden flex-1 group/title cursor-text flex items-center gap-1" onClick={(e) => { e.stopPropagation(); setEditingAttachmentId(f.id); setEditAttachmentValue(f.filename); }}>
                                    <h4 className="text-[13px] font-medium truncate" title={f.filename}>{f.filename}</h4>
                                    <Edit2 className="w-3 h-3 text-muted-foreground opacity-0 group-hover/title:opacity-100 transition-opacity shrink-0" />
                                  </div>
                                )}
                              </div>
                              <div className="px-3 pb-3">
                                <p className="text-[11px] text-muted-foreground mt-0.5">{(f.file_size / 1024).toFixed(1)} KB</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Chatbot Panel (Base layer of the right pane) */}
                {chatOpen && (
                  <div className="absolute inset-0 z-10 flex flex-col">
                    <div className="h-16 border-b border-border flex items-center justify-between px-6 shrink-0 bg-surface">
                      <h3 className="font-medium flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-primary" />
                        Study Assistant
                      </h3>
                      <button 
                        onClick={() => setChatOpen(false)}
                        className="p-2 hover:bg-muted rounded-md text-muted-foreground transition-colors"
                        title="Collapse Assistant"
                      >
                        <Minimize2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 bg-background">
                      <div className="bg-muted p-4 rounded-2xl rounded-tl-sm self-start max-w-[85%] text-sm border border-border">
                        Hello! I've loaded the context for <strong>{fileData?.name || "this document"}</strong>. What would you like to know?
                      </div>
                      {chatHistory.map((msg) => (
                        <ChatBubble key={msg.id} role={msg.role} text={msg.text} />
                      ))}
                      {isSending && (
                        <div className="p-4 rounded-2xl bg-muted rounded-tl-sm self-start text-sm border border-border">
                          <Loader2 className="w-4 h-4 animate-spin" />
                        </div>
                      )}
                    </div>

                    <div className="p-4 border-t border-border bg-surface shrink-0 flex flex-col gap-2">
                      {chatAttachments.length > 0 && (
                        <div className="flex items-center gap-2 overflow-x-auto pb-2">
                          {chatAttachments.map((f, i) => (
                            <div key={i} className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md text-xs border border-border">
                              <span className="truncate max-w-[100px]">{f.name}</span>
                              <button onClick={() => setChatAttachments(prev => prev.filter((_, idx) => idx !== i))}><X className="w-3 h-3 hover:text-red-500" /></button>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="relative flex items-center">
                        <input type="file" multiple className="hidden" ref={fileInputRef} onChange={(e) => {
                          if (e.target.files) {
                            setChatAttachments(prev => [...prev, ...Array.from(e.target.files!)]);
                          }
                        }} />
                        <ChatInput onSend={handleSend} onAttachClick={() => fileInputRef.current?.click()} />
                      </div>
                    </div>
                  </div>
                )}
                
              </div>
            </Panel>
          )}
        </PanelGroup>

      </div>
    </AppLayout>
  );
}
