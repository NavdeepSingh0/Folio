import React, { useState, useEffect, useRef, useCallback } from "react";
import { AppLayout } from "../components/AppLayout";
import { MessageSquare, Paperclip, Edit, Eye, Info, FileText, Loader2 } from "lucide-react";
import { api } from "../api";
import { cache } from "../lib/cache";
import "github-markdown-css/github-markdown.css";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useNavigate, useSearchParams } from "react-router-dom";
import { NoteEditorPane } from "../components/NoteEditorPane";
import SplitNotePane from "../components/SplitNotePane";
import StudyTabBar from "../components/StudyTabBar";
import AttachmentsPanel from "../components/AttachmentsPanel";
import ChatPanel from "../components/ChatPanel";
import { useFileChat } from "../hooks/use-file-chat";
import type { Attachment } from "../types";

// File metadata for the localStorage cache; the markdown body is left out so
// large notes (inline images) never fill the storage quota.
const stripBody = ({ markdown_content: _body, ...meta }: any) => meta;

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
  // Which note the editor buffer was loaded for. The editor is only mounted when this
  // matches the URL's note; otherwise a stale pane (previous note's text vs. the new
  // baseline) briefly reports "dirty" and makes the load skip applying the new note.
  const [loadedFileId, setLoadedFileId] = useState<string | null>(null);
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

  const chat = useFileChat(fileId);

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
  const [panelAttachments, setPanelAttachments] = useState<Attachment[]>([]);

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
    setLoadedFileId(null);
    setIsLoading(true);

    setPanelAttachments(cache.get<any[]>(`study_attachments_${fileId}`) || []);

    // 2. Background Revalidation
    api.getFile(fileId, signal).then(data => {
      if (signal.aborted) return;
      cache.set(`study_file_${fileId}`, stripBody(data));
      if (isDirtyRef.current) {
        // The user started editing the cached copy; keep their buffer. If the server
        // copy moved on, keep the old revision so saving raises the conflict prompt
        // instead of silently overwriting, and tell the user now.
        const serverMoved = !!cachedMeta?.content_hash && cachedMeta.content_hash !== data.content_hash;
        setFileData(serverMoved ? { ...data, content_hash: cachedMeta.content_hash } : data);
        if (serverMoved) {
          setSaveStatus("Note updated on server; your unsaved edits are kept");
          setTimeout(() => setSaveStatus(null), 4000);
        }
      } else {
        applyFile(data);
      }
      setLoadedFileId(fileId);
      setIsLoading(false);
    }).catch(err => {
      if (signal.aborted) return;
      console.error("Failed to load file", err);
      if (!isDirtyRef.current) showMessage("Failed to load file data.");
      setLoadedFileId(fileId);
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
      // expected_hash makes the server reject the save if another tab/device changed the note.
      let summary: any;
      try {
        summary = await api.updateFile(id, { markdown_content: content, expected_hash: savedFileData?.content_hash ?? null });
      } catch (err: any) {
        if (err?.status !== 409) throw err;
        setSaveStatus("Note changed on server: reload or overwrite");
        const overwrite = window.confirm(
          "This note changed on the server since you opened it.\n\nOK: overwrite it with your version.\nCancel: keep editing (reload the note to see the server version)."
        );
        if (!overwrite) return;
        summary = await api.updateFile(id, { markdown_content: content });
      }
      const nextFileData = savedFileData ? { ...savedFileData, content_hash: summary?.content_hash } : null;
      if (nextFileData) {
        cache.set(`study_file_${id}`, stripBody(nextFileData));
      }
      if (fileIdRef.current === id) {
        setFileData((prev: any) => prev ? { ...prev, markdown_content: content, content_hash: summary?.content_hash } : prev);
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

  // Enter followed by the resulting blur would otherwise submit a rename twice
  const isRenamingRef = useRef(false);
  const saveFileName = async () => {
    if (isRenamingRef.current) return;
    // Stays set until the next edit starts, so the blur from unmounting the input is ignored
    isRenamingRef.current = true;
    if (editNameValue.trim() === "" || !fileId) {
      setEditingName(false);
      return;
    }
    const id = fileId;
    const name = editNameValue.trim();
    try {
      await api.updateFile(id, { name });
      if (fileIdRef.current === id) {
        setFileData((prev: any) => prev ? { ...prev, name } : prev);
      }
    } catch (err) {
      console.error(err);
    }
    setEditingName(false);
  };

  // Brief toolbar status message (e.g. "Saved!", errors)
  const flashStatus = (message: string) => {
    setSaveStatus(message);
    setTimeout(() => setSaveStatus(null), 2000);
  };

  // Uploads an image dropped/pasted into the editor and returns its URL;
  // NoteEditorPane handles the placeholder insert and replacement.
  const uploadEditorImage = async (file: File) => {
    if (!fileId) throw new Error("No file loaded");
    // Bind the upload to the note it was dropped into, even if the user switches tabs
    const id = fileId;
    const uploadedAtt = await api.uploadAttachment(id, file);
    if (fileIdRef.current === id) {
      setPanelAttachments(prev => [uploadedAtt, ...prev]);
    }
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
        
        <StudyTabBar
          tabs={openTabs}
          activeId={fileId}
          isRenaming={editingName}
          nameValue={editNameValue}
          onNameChange={setEditNameValue}
          onStartRename={() => { isRenamingRef.current = false; setEditingName(true); }}
          onSaveName={saveFileName}
          onSelect={openTab}
          onClose={closeTab}
          onAdd={() => { if (confirmDiscard()) navigate('/library'); }}
        />

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
              {isLoading || loadedFileId !== fileId ? (
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
                  secondary={<SplitNotePane tabs={openTabs.filter(t => t.id !== fileId)} zoom={zoom} />}
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
          {(chatOpen || showAttachments) && fileId && (
            <Panel defaultSize={35} minSize={20} maxSize={50}>
              <div className="h-full flex flex-col relative bg-card">
                {/* Attachments Drawer (Overlays Chat if both are open, but doesn't blur reading pane) */}
                {showAttachments && (
                  <AttachmentsPanel
                    key={fileId}
                    fileId={fileId}
                    attachments={panelAttachments}
                    setAttachments={setPanelAttachments}
                    onClose={() => setShowAttachments(false)}
                    onError={flashStatus}
                  />
                )}

                {/* Chatbot Panel (Base layer of the right pane) */}
                {chatOpen && (
                  <ChatPanel
                    fileName={fileData?.name || ""}
                    messages={chat.messages}
                    isSending={chat.isSending}
                    attachments={chat.attachments}
                    onAddAttachments={chat.addAttachments}
                    onRemoveAttachment={chat.removeAttachment}
                    onSend={chat.send}
                    onClose={() => setChatOpen(false)}
                  />
                )}
              </div>
            </Panel>
          )}
        </PanelGroup>

      </div>
    </AppLayout>
  );
}
