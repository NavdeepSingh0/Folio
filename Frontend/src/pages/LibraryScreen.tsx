import React, { useState, useEffect } from "react";
import { Search, Folder, FileText, Pin, MoreVertical, Plus, Edit2, Check, X, ChevronRight, RefreshCw, Trash2 } from "lucide-react";
import { AppLayout } from "../components/AppLayout";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";

export function LibraryScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [pinnedFolders, setPinnedFolders] = useState<string[]>([]);
  const [folders, setFolders] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Inline folder creation state
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const [activeFolder, setActiveFolder] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, [activeFolder]);

  const loadData = async () => {
    try {
      const [foldersData, filesData] = await Promise.all([
        api.getFolders(),
        activeFolder ? api.getFilesByFolder(activeFolder.id) : api.getUnassignedFiles()
      ]);

      if (!activeFolder) {
        const params = new URLSearchParams(window.location.search);
        const folderIdStr = params.get("folder");
        if (folderIdStr) {
          const found = foldersData.find((f: any) => f.id.toString() === folderIdStr);
          if (found) {
            setActiveFolder(found);
            return; // Will re-trigger loadData via useEffect
          }
        }
      }

      setFolders(foldersData);
      setFiles(filesData);
      setPinnedFolders(foldersData.filter((f: any) => f.is_pinned).map((f: any) => f.name));
    } catch (error) {
      console.error("Failed to load library data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    loadData();
  };

  const [editingId, setEditingId] = useState<string | null>(null);
  const [movingId, setMovingId] = useState<string | null>(null);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [deleteFolderPrompt, setDeleteFolderPrompt] = useState<any>(null);
  const [deleteFilePrompt, setDeleteFilePrompt] = useState<any>(null);

  const confirmDeleteFolder = async (id: string, keepNotes: boolean) => {
    try {
      await api.deleteFolder(id, keepNotes);
      setFolders(folders.filter(f => f.id !== id));
      if (activeFolder?.id === id) setActiveFolder(null);
      handleRefresh();
    } catch (err) {
      console.error(err);
    }
    setDeleteFolderPrompt(null);
  };

  const confirmDeleteFile = async (id: string) => {
    try {
      await api.deleteFile(id);
      setFiles(files.filter(f => f.id !== id));
    } catch (err) {
      console.error(err);
    }
    setDeleteFilePrompt(null);
  };

  const togglePin = async (folderName: string, folderId: string, isCurrentlyPinned: boolean, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const willPin = !isCurrentlyPinned;
    if (willPin && pinnedFolders.length >= 6) {
      alert("You can only pin up to 6 folders to the Home screen.");
      return;
    }
    
    try {
      await api.updateFolder(folderId, { is_pinned: willPin });
      
      if (willPin) {
        setPinnedFolders([...pinnedFolders, folderName]);
      } else {
        setPinnedFolders(pinnedFolders.filter(name => name !== folderName));
      }
      
      // Update local folder state too
      setFolders(folders.map(f => f.id === folderId ? { ...f, is_pinned: willPin } : f));
    } catch (error) {
      console.error("Failed to pin/unpin folder:", error);
    }
  };

  const handleCreateFolderClick = () => {
    setIsCreatingFolder(true);
    setNewFolderName("");
  };

  const submitNewFolder = async () => {
    if (newFolderName.trim() !== "") {
      try {
        const newFolder = await api.createFolder(newFolderName.trim());
        setFolders([newFolder, ...folders]);
      } catch (error) {
        console.error("Failed to create folder:", error);
      }
    }
    setIsCreatingFolder(false);
    setNewFolderName("");
  };

  const cancelNewFolder = () => {
    setIsCreatingFolder(false);
    setNewFolderName("");
  };

  const startEdit = (id: string, currentName: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingId(id);
    setEditValue(currentName);
  };

  const saveEdit = async (type: "folder" | "file", id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (editValue.trim() === "") {
      setEditingId(null);
      return;
    }

    try {
      if (type === "folder") {
        await api.updateFolder(id, { name: editValue.trim() });
        setFolders(folders.map(f => f.id === id ? { ...f, name: editValue.trim() } : f));
        // Update pinned folders if name changed
        const folder = folders.find(f => f.id === id);
        if (folder && pinnedFolders.includes(folder.name)) {
          setPinnedFolders(pinnedFolders.map(name => name === folder.name ? editValue.trim() : name));
        }
      } else {
        await api.updateFile(id, { name: editValue.trim() });
        setFiles(files.map(f => f.id === id ? { ...f, name: editValue.trim() } : f));
      }
    } catch (error) {
      console.error("Failed to rename:", error);
    }
    setEditingId(null);
  };

  const moveToFolder = async (fileId: string, folderId: string, e: React.MouseEvent | React.ChangeEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!folderId) {
      setMovingId(null);
      return;
    }
    
    try {
      await api.updateFile(fileId, { folder_id: folderId });
      // Remove from standalone files
      setFiles(files.filter(f => f.id !== fileId));
      // Increment target folder notes count
      setFolders(folders.map(f => f.id === folderId ? { ...f, notes_count: f.notes_count + 1 } : f));
    } catch (error) {
      console.error("Failed to move file:", error);
    }
    setMovingId(null);
  };

  const handleDrop = async (fileId: string, folderId: string) => {
    try {
      await api.updateFile(fileId, { folder_id: folderId });
      setFiles(files.filter(f => f.id.toString() !== fileId.toString()));
      setFolders(folders.map(f => f.id === folderId ? { ...f, notes_count: f.notes_count + 1 } : f));
    } catch (error) {
      console.error("Failed to drop file:", error);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-8 pt-12 pb-16 h-full flex flex-col">
        
        {/* Header & Actions */}
        <div className="flex items-end justify-between mb-8 shrink-0">
          <div>
            <h1 className="text-3xl font-serif tracking-tight mb-2">Your Library</h1>
            <p className="text-muted-foreground text-sm">Organize your subjects and access all your notes.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-foreground transition-colors" />
              <input
                type="text"
                placeholder="Search library..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 h-9 pl-9 pr-4 rounded-md bg-card border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
              />
            </div>
              <button onClick={handleRefresh} className={`p-2 border border-border rounded-lg text-muted-foreground hover:bg-muted transition-all ${loading ? 'animate-spin' : ''}`} title="Refresh Library">
                <RefreshCw className="w-4 h-4" />
              </button>
              <button onClick={handleCreateFolderClick} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2">
                <Plus className="w-4 h-4" /> New Folder
              </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-10">
          
          {/* Folders Grid */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium tracking-wide text-foreground">Subjects ({folders.length})</h2>
              <span className="text-xs text-muted-foreground">{pinnedFolders.length}/6 pinned to Home</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-12">
            {isCreatingFolder && (
              <div className="flex flex-col p-5 rounded-2xl bg-card border-2 border-primary shadow-sm group">
                <div className="flex items-start justify-between mb-8">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Folder className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex gap-1">
                    <button onClick={submitNewFolder} className="p-1.5 rounded-md text-success hover:bg-success/10 transition-colors">
                      <Check className="w-4 h-4" />
                    </button>
                    <button onClick={cancelNewFolder} className="p-1.5 rounded-md text-muted-foreground hover:bg-muted transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div>
                  <input
                    autoFocus
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && submitNewFolder()}
                    onBlur={submitNewFolder}
                    className="w-full bg-transparent border-b border-primary outline-none font-medium text-foreground text-[15px] mb-1 pb-1"
                    placeholder="Folder name..."
                  />
                  <p className="text-[13px] text-muted-foreground">0 notes</p>
                </div>
              </div>
            )}
            
            {folders.map((folder) => {
                const isPinned = pinnedFolders.includes(folder.name);
                const isEditing = editingId === folder.id;
                const isDragOver = dragOverFolderId === folder.id;

                return (
                  <div 
                    key={folder.id} 
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOverFolderId(folder.id);
                    }}
                    onDragLeave={() => setDragOverFolderId(null)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOverFolderId(null);
                      const fileId = e.dataTransfer.getData('text/plain');
                      if (fileId) handleDrop(fileId, folder.id);
                    }}
                    onClick={() => {
                      if (!isEditing) {
                        setActiveFolder(folder);
                      }
                    }}
                    className={`relative group bg-card border rounded-xl p-5 transition-all cursor-pointer ${
                      isDragOver 
                        ? 'border-primary ring-2 ring-primary/20 scale-105 shadow-md bg-primary/5' 
                        : 'border-border hover:border-primary/40 hover:shadow-sm'
                    }`}
                  >
                    
                    {/* Actions (Pin & Edit & Delete) */}
                    {!isEditing && (
                      <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDeleteFolderPrompt(folder); }}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="Delete Folder"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={(e) => startEdit(folder.id, folder.name, e)}
                          className="p-1.5 rounded-md text-muted-foreground hover:bg-muted transition-colors"
                          title="Rename Folder"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={(e) => togglePin(folder.name, folder.id, isPinned, e)}
                          className={`p-1.5 rounded-md transition-colors ${isPinned ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:bg-muted'}`}
                          title={isPinned ? "Unpin from Home" : "Pin to Home"}
                        >
                          <Pin className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                    {/* Always show pinned icon if pinned and not hovering */}
                    {isPinned && !isEditing && (
                      <div className="absolute top-3 right-3 p-1.5 text-primary bg-primary/10 rounded-md group-hover:opacity-0 transition-opacity pointer-events-none">
                        <Pin className="w-3.5 h-3.5" />
                      </div>
                    )}

                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${folder.color}`}>
                      <Folder className="w-6 h-6" />
                    </div>
                    
                    {isEditing ? (
                      <div className="flex items-center gap-2 mb-1" onClick={e => e.preventDefault()}>
                        <input 
                          autoFocus
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && saveEdit("folder", folder.id)}
                          className="w-full h-7 px-2 text-[14px] font-medium border border-primary rounded-md outline-none"
                        />
                        <button onClick={(e) => saveEdit("folder", folder.id, e)} className="p-1 text-success hover:bg-success/10 rounded">
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <h3 className="font-medium text-foreground text-[15px] mb-1 truncate pr-12">{folder.name}</h3>
                    )}
                    
                    <p className="text-[13px] text-muted-foreground">{folder.notes_count || 0} notes</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Standalone Files */}
          {files.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-medium tracking-wide text-foreground">
                  {activeFolder ? `Notes in ${activeFolder.name}` : "Unassigned Notes"}
                </h2>
                {activeFolder && (
                  <button onClick={() => setActiveFolder(null)} className="text-xs text-primary hover:underline">
                    View Unassigned
                  </button>
                )}
              </div>
              <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="flex flex-col">
                {files.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground text-sm">All files have been assigned to folders.</div>
                )}
                {files.map((file) => {
                  const isEditing = editingId === file.id;
                  const isMoving = movingId === file.id;

                  return (
                    <div 
                      key={file.id} 
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', file.id);
                        e.dataTransfer.effectAllowed = 'move';
                      }}
                      onClick={() => {
                        if (!isEditing && !isMoving) {
                          navigate(`/study?file=${file.id}`);
                        }
                      }}
                      className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors border-b border-border last:border-0 group cursor-pointer active:cursor-grabbing"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <div className="flex-1">
                          {isEditing ? (
                            <div className="flex items-center gap-2 mb-0.5 max-w-sm" onClick={e => e.stopPropagation()}>
                              <input 
                                autoFocus
                                value={editValue}
                                onChange={e => setEditValue(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && saveEdit("file", file.id)}
                                className="w-full h-7 px-2 text-[14px] font-medium border border-primary rounded-md outline-none"
                              />
                              <button onClick={(e) => saveEdit("file", file.id, e)} className="p-1 text-success hover:bg-success/10 rounded">
                                <Check className="w-4 h-4" />
                              </button>
                            </div>
                          ) : isMoving ? (
                            <div className="flex items-center gap-2 mb-0.5 max-w-sm" onClick={e => e.stopPropagation()}>
                              <select 
                                autoFocus
                                onChange={(e) => moveToFolder(file.id, e.target.value, e)}
                                onBlur={() => setMovingId(null)}
                                className="w-full h-7 px-2 text-[13px] border border-primary rounded-md outline-none bg-card cursor-pointer"
                              >
                                <option value="">Select destination folder...</option>
                                {folders.map(f => (
                                  <option key={f.id} value={f.id}>{f.name}</option>
                                ))}
                              </select>
                            </div>
                          ) : (
                            <h4 className="font-medium text-foreground text-[15px]">{file.name}</h4>
                          )}
                          <p className="text-[13px] text-muted-foreground mt-0.5">{file.file_size} • {new Date(file.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      
                      {!isEditing && !isMoving && (
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setDeleteFilePrompt(file);
                            }}
                            className="p-2 text-muted-foreground hover:text-red-500 rounded-md transition-colors"
                            title="Delete File"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setMovingId(file.id);
                            }}
                            className="p-2 text-muted-foreground hover:text-foreground rounded-md transition-colors"
                            title="Move to Folder"
                          >
                            <Folder className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={(e) => startEdit(file.id, file.name, e)}
                            className="p-2 text-muted-foreground hover:text-foreground rounded-md transition-colors"
                            title="Rename File"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <Link to={`/study?file=${file.id}`} className="p-2 text-muted-foreground hover:text-foreground rounded-md transition-colors" title="Open File">
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
          )}

        </div>
      </div>

      {/* Modals */}
      {deleteFolderPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card p-6 rounded-xl shadow-xl max-w-md w-full border border-border">
            <h3 className="text-lg font-semibold mb-2">Delete "{deleteFolderPrompt.name}"?</h3>
            {deleteFolderPrompt.notes_count > 0 ? (
              <p className="text-sm text-muted-foreground mb-6">
                This folder contains {deleteFolderPrompt.notes_count} note(s). Do you want to keep the notes (move to Unassigned) or delete everything inside?
              </p>
            ) : (
              <p className="text-sm text-muted-foreground mb-6">Are you sure you want to delete this folder?</p>
            )}
            
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteFolderPrompt(null)} className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-md transition-colors">Cancel</button>
              {deleteFolderPrompt.notes_count > 0 && (
                <button onClick={() => confirmDeleteFolder(deleteFolderPrompt.id, true)} className="px-4 py-2 text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 rounded-md transition-colors">Keep Notes</button>
              )}
              <button onClick={() => confirmDeleteFolder(deleteFolderPrompt.id, false)} className="px-4 py-2 text-sm font-medium bg-red-500 text-white hover:bg-red-600 rounded-md transition-colors">Delete {deleteFolderPrompt.notes_count > 0 ? "Everything" : ""}</button>
            </div>
          </div>
        </div>
      )}

      {deleteFilePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card p-6 rounded-xl shadow-xl max-w-sm w-full border border-border">
            <h3 className="text-lg font-semibold mb-2">Delete File?</h3>
            <p className="text-sm text-muted-foreground mb-6">Are you sure you want to permanently delete "{deleteFilePrompt.name}" and all its attachments?</p>
            
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteFilePrompt(null)} className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-md transition-colors">Cancel</button>
              <button onClick={() => confirmDeleteFile(deleteFilePrompt.id)} className="px-4 py-2 text-sm font-medium bg-red-500 text-white hover:bg-red-600 rounded-md transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
