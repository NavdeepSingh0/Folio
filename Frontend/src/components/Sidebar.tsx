import { useState } from "react";
import { Folder, FileText, Plus, Settings, Search, Edit2, Trash2, FolderPlus, BookOpen, ChevronRight, ChevronDown, Move } from "lucide-react";

export interface Collection { id: string; name: string; created_at: string; }
export interface Unit { id: string; name: string; collection_id: string; created_at: string; }
export interface Chapter { id: string; name: string; unit_id: string; created_at: string; }
export interface Project { id: string; title: string; source_filename: string; chapter_id: string | null; markdown_path: string; }

interface SidebarProps {
  collections: Collection[];
  units: Unit[];
  chapters: Chapter[];
  projects: Project[];
  activeProjectId: string | null;
  
  onNewProject: () => void;
  onSelectProject: (id: string) => void;
  onOpenSettings: () => void;
  onOpenRevisionWorkspace: () => void;
  
  onCreateCollection: (name: string) => void;
  onCreateUnit: (name: string, collectionId: string) => void;
  onCreateChapter: (name: string, unitId: string) => void;
  
  onRenameCollection: (id: string, name: string) => void;
  onRenameUnit: (id: string, name: string) => void;
  onRenameChapter: (id: string, name: string) => void;
  onRenameProject: (id: string, name: string) => void;
  
  onDeleteCollection: (id: string) => void;
  onDeleteUnit: (id: string) => void;
  onDeleteChapter: (id: string) => void;
  onDeleteProject: (id: string) => void;
  
  onMoveUnit: (id: string, collectionId: string) => void;
  onMoveChapter: (id: string, unitId: string) => void;
  onMoveProject: (id: string, chapterId: string | null) => void;
}

export function Sidebar(props: SidebarProps) {
  const [searchMode, setSearchMode] = useState<"filename" | "knowledge">("filename");
  const [searchQuery, setSearchQuery] = useState("");
  const [semanticResults, setSemanticResults] = useState<{project_id: string, project_title: string, text: string, similarity: number}[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  
  const [editingNode, setEditingNode] = useState<{id: string, type: string} | null>(null);
  const [editValue, setEditValue] = useState("");

  const [createModal, setCreateModal] = useState<{isOpen: boolean, type: string, parentId: string | null}>({isOpen: false, type: '', parentId: null});
  const [newName, setNewName] = useState("");

  const [moveModal, setMoveModal] = useState<{isOpen: boolean, type: string, itemId: string}>({isOpen: false, type: '', itemId: ''});
  const [moveTarget, setMoveTarget] = useState("");

  const toggleNode = (id: string) => {
    const next = new Set(expandedNodes);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedNodes(next);
  };

  const startEdit = (id: string, name: string, type: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingNode({id, type});
    setEditValue(name);
  };

  const submitEdit = () => {
    if (!editingNode || !editValue.trim()) return;
    if (editingNode.type === 'collection') props.onRenameCollection(editingNode.id, editValue);
    if (editingNode.type === 'unit') props.onRenameUnit(editingNode.id, editValue);
    if (editingNode.type === 'chapter') props.onRenameChapter(editingNode.id, editValue);
    if (editingNode.type === 'project') props.onRenameProject(editingNode.id, editValue);
    setEditingNode(null);
  };

  const submitCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    if (createModal.type === 'collection') props.onCreateCollection(newName);
    if (createModal.type === 'unit' && createModal.parentId) props.onCreateUnit(newName, createModal.parentId);
    if (createModal.type === 'chapter' && createModal.parentId) props.onCreateChapter(newName, createModal.parentId);
    setCreateModal({isOpen: false, type: '', parentId: null});
    setNewName("");
  };

  const submitMove = (e: React.FormEvent) => {
    e.preventDefault();
    if (moveModal.type === 'unit') props.onMoveUnit(moveModal.itemId, moveTarget);
    if (moveModal.type === 'chapter') props.onMoveChapter(moveModal.itemId, moveTarget);
    if (moveModal.type === 'project') props.onMoveProject(moveModal.itemId, moveTarget || null);
    setMoveModal({isOpen: false, type: '', itemId: ''});
  };

  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    
    if (searchMode === "knowledge") {
      if (val.trim().length > 2) {
        setIsSearching(true);
        try {
          const res = await fetch("http://localhost:8000/api/study/search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: val, mode: "knowledge" })
          });
          if (res.ok) {
            const data = await res.json();
            setSemanticResults(data.results || []);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSemanticResults([]);
      }
    }
  };

  const handleModeToggle = () => {
    const nextMode = searchMode === "filename" ? "knowledge" : "filename";
    setSearchMode(nextMode);
    if (nextMode === "knowledge" && searchQuery.trim().length > 2) {
      handleSearchChange({ target: { value: searchQuery } } as any);
    } else {
      setSemanticResults([]);
    }
  };

  const filteredProjects = searchMode === "filename" 
    ? props.projects.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : props.projects.filter(p => semanticResults.some(r => r.project_id === p.id));

  const renderProject = (p: Project, indent: number = 0) => (
    <div key={p.id} style={{ paddingLeft: `${indent * 12 + 8}px` }}
      onClick={() => props.onSelectProject(p.id)}
      className={`group flex items-center justify-between py-1.5 pr-2 rounded-md cursor-pointer transition-colors ${
        props.activeProjectId === p.id ? "bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-gray-200"
      }`}
    >
      <div className="flex items-center gap-2 overflow-hidden flex-1">
        <FileText size={14} className="shrink-0 opacity-70" />
        {editingNode?.id === p.id ? (
          <input autoFocus value={editValue} onChange={e => setEditValue(e.target.value)} onBlur={submitEdit} onKeyDown={e => e.key === 'Enter' && submitEdit()} className="flex-1 min-w-0 bg-white border border-blue-400 rounded px-1 text-xs" onClick={e => e.stopPropagation()} />
        ) : (
          <div className="truncate text-sm">{p.title}</div>
        )}
      </div>
      {!editingNode && (
        <div className="opacity-0 group-hover:opacity-100 flex items-center shrink-0 ml-1">
          <button onClick={e => startEdit(p.id, p.title, 'project', e)} className="p-1 hover:bg-gray-200 rounded text-gray-500"><Edit2 size={12} /></button>
          <button onClick={e => { e.stopPropagation(); setMoveTarget(p.chapter_id || ""); setMoveModal({isOpen: true, type: 'project', itemId: p.id}); }} className="p-1 hover:bg-gray-200 rounded text-gray-500"><Move size={12} /></button>
          <button onClick={e => { e.stopPropagation(); if(confirm("Delete project?")) props.onDeleteProject(p.id); }} className="p-1 hover:bg-red-100 hover:text-red-600 rounded text-gray-500"><Trash2 size={12} /></button>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 transition-colors">
      <div className="p-4 border-b border-gray-200 dark:border-slate-800 transition-colors">
        <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-4">StudyForge</h2>
        
        <div className="flex gap-2 mb-3">
          <button onClick={props.onNewProject} className="flex-1 flex items-center justify-center gap-1 bg-blue-600 text-white py-1.5 px-2 rounded-md font-medium hover:bg-blue-700 transition-colors shadow-sm text-sm">
            <Plus size={16} /> Note
          </button>
          <button onClick={props.onOpenRevisionWorkspace} className="flex-1 flex items-center justify-center gap-1 bg-teal-600 text-white py-1.5 px-2 rounded-md font-medium hover:bg-teal-700 transition-colors shadow-sm text-sm">
            <BookOpen size={16} /> Revise
          </button>
        </div>

        <div className="relative mb-2">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search..." value={searchQuery} onChange={handleSearchChange} className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors" />
        </div>
        
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-slate-800 p-1 rounded-md border border-gray-200 dark:border-slate-700 transition-colors">
          <button 
            onClick={() => {setSearchMode("filename"); setSemanticResults([]);}}
            className={`flex-1 py-1 rounded text-center transition-colors ${searchMode === "filename" ? "bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400 font-medium" : "hover:text-gray-700 dark:hover:text-gray-200"}`}
          >
            Filename
          </button>
          <button 
            onClick={handleModeToggle}
            className={`flex-1 py-1 rounded text-center transition-colors ${searchMode === "knowledge" ? "bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400 font-medium" : "hover:text-gray-700 dark:hover:text-gray-200"}`}
          >
            Knowledge
          </button>
        </div>
        {searchMode === "knowledge" && isSearching && <div className="text-xs text-blue-500 text-center mt-2 animate-pulse">Searching knowledge base...</div>}
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {searchMode === "knowledge" && searchQuery.trim().length > 2 ? (
          <div className="space-y-2 mt-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase px-2 mb-2">Knowledge Matches</h3>
            {semanticResults.length === 0 && !isSearching ? (
              <div className="text-sm text-gray-500 px-2">No semantic matches found.</div>
            ) : (
              semanticResults.map((res, i) => (
                <div key={i} onClick={() => props.onSelectProject(res.project_id)} className="group p-3 rounded-lg border border-indigo-100 bg-indigo-50/30 hover:bg-indigo-50 cursor-pointer transition-colors">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      <FileText size={14} className="text-indigo-500 shrink-0" />
                      <span className="font-semibold text-sm text-indigo-900 truncate">{res.project_title}</span>
                    </div>
                    <span className="text-[10px] font-bold text-indigo-400 bg-indigo-100 px-1.5 py-0.5 rounded-full shrink-0">
                      {Math.round(res.similarity * 100)}% match
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                    {res.text}
                  </p>
                </div>
              ))
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-2 mb-2 mt-2">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Hierarchy</h3>
              <button onClick={() => { setNewName(""); setCreateModal({isOpen: true, type: 'collection', parentId: null}); }} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" title="New Collection">
                <FolderPlus size={14} />
              </button>
            </div>

            {props.collections.map(col => {
              const isColExpanded = expandedNodes.has(col.id) || searchQuery;
          const colUnits = props.units.filter(u => u.collection_id === col.id);
          
          return (
            <div key={col.id} className="mb-1">
              <div className="group flex items-center justify-between p-1.5 rounded-md hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer text-gray-800 dark:text-gray-200 font-semibold transition-colors" onClick={() => toggleNode(col.id)}>
                <div className="flex items-center gap-1 flex-1 overflow-hidden">
                  {isColExpanded ? <ChevronDown size={14} className="text-gray-400 shrink-0" /> : <ChevronRight size={14} className="text-gray-400 shrink-0" />}
                  <Folder size={14} className="text-blue-500 shrink-0" />
                  {editingNode?.id === col.id ? (
                    <input autoFocus value={editValue} onChange={e => setEditValue(e.target.value)} onBlur={submitEdit} onKeyDown={e => e.key === 'Enter' && submitEdit()} className="flex-1 min-w-0 bg-white border border-blue-400 rounded px-1 text-xs" onClick={e => e.stopPropagation()} />
                  ) : <span className="truncate text-sm">{col.name}</span>}
                </div>
                {!editingNode && (
                  <div className="opacity-0 group-hover:opacity-100 flex items-center shrink-0 ml-1">
                    <button onClick={e => { e.stopPropagation(); setNewName(""); setCreateModal({isOpen: true, type: 'unit', parentId: col.id}); }} className="p-1 hover:bg-gray-200 rounded text-gray-500" title="Add Unit"><Plus size={12} /></button>
                    <button onClick={e => startEdit(col.id, col.name, 'collection', e)} className="p-1 hover:bg-gray-200 rounded text-gray-500"><Edit2 size={12} /></button>
                    <button onClick={e => { e.stopPropagation(); if(confirm("Delete collection and ALL contents?")) props.onDeleteCollection(col.id); }} className="p-1 hover:bg-red-100 hover:text-red-600 rounded text-gray-500"><Trash2 size={12} /></button>
                  </div>
                )}
              </div>

              {isColExpanded && colUnits.map(unit => {
                const isUnitExpanded = expandedNodes.has(unit.id) || searchQuery;
                const unitChapters = props.chapters.filter(c => c.unit_id === unit.id);
                
                return (
                  <div key={unit.id}>
                    <div className="group flex items-center justify-between p-1.5 pl-5 rounded-md hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer text-gray-700 dark:text-gray-300 font-medium transition-colors" onClick={() => toggleNode(unit.id)}>
                      <div className="flex items-center gap-1 flex-1 overflow-hidden">
                        {isUnitExpanded ? <ChevronDown size={14} className="text-gray-400 shrink-0" /> : <ChevronRight size={14} className="text-gray-400 shrink-0" />}
                        <Folder size={14} className="text-teal-500 shrink-0" />
                        {editingNode?.id === unit.id ? (
                          <input autoFocus value={editValue} onChange={e => setEditValue(e.target.value)} onBlur={submitEdit} onKeyDown={e => e.key === 'Enter' && submitEdit()} className="flex-1 min-w-0 bg-white border border-blue-400 rounded px-1 text-xs" onClick={e => e.stopPropagation()} />
                        ) : <span className="truncate text-sm">{unit.name}</span>}
                      </div>
                      {!editingNode && (
                        <div className="opacity-0 group-hover:opacity-100 flex items-center shrink-0 ml-1">
                          <button onClick={e => { e.stopPropagation(); setNewName(""); setCreateModal({isOpen: true, type: 'chapter', parentId: unit.id}); }} className="p-1 hover:bg-gray-200 rounded text-gray-500" title="Add Chapter"><Plus size={12} /></button>
                          <button onClick={e => startEdit(unit.id, unit.name, 'unit', e)} className="p-1 hover:bg-gray-200 rounded text-gray-500"><Edit2 size={12} /></button>
                          <button onClick={e => { e.stopPropagation(); setMoveTarget(unit.collection_id); setMoveModal({isOpen: true, type: 'unit', itemId: unit.id}); }} className="p-1 hover:bg-gray-200 rounded text-gray-500"><Move size={12} /></button>
                          <button onClick={e => { e.stopPropagation(); if(confirm("Delete unit?")) props.onDeleteUnit(unit.id); }} className="p-1 hover:bg-red-100 hover:text-red-600 rounded text-gray-500"><Trash2 size={12} /></button>
                        </div>
                      )}
                    </div>

                    {isUnitExpanded && unitChapters.map(chap => {
                      const isChapExpanded = expandedNodes.has(chap.id) || searchQuery;
                      const chapProjects = filteredProjects.filter(p => p.chapter_id === chap.id);
                      
                      return (
                        <div key={chap.id}>
                          <div className="group flex items-center justify-between p-1.5 pl-9 rounded-md hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer text-gray-600 dark:text-gray-400 font-medium transition-colors" onClick={() => toggleNode(chap.id)}>
                            <div className="flex items-center gap-1 flex-1 overflow-hidden">
                              {isChapExpanded ? <ChevronDown size={14} className="text-gray-400 shrink-0" /> : <ChevronRight size={14} className="text-gray-400 shrink-0" />}
                              <Folder size={14} className="text-gray-400 shrink-0" />
                              {editingNode?.id === chap.id ? (
                                <input autoFocus value={editValue} onChange={e => setEditValue(e.target.value)} onBlur={submitEdit} onKeyDown={e => e.key === 'Enter' && submitEdit()} className="flex-1 min-w-0 bg-white border border-blue-400 rounded px-1 text-xs" onClick={e => e.stopPropagation()} />
                              ) : <span className="truncate text-sm">{chap.name}</span>}
                            </div>
                            {!editingNode && (
                              <div className="opacity-0 group-hover:opacity-100 flex items-center shrink-0 ml-1">
                                <button onClick={e => startEdit(chap.id, chap.name, 'chapter', e)} className="p-1 hover:bg-gray-200 rounded text-gray-500"><Edit2 size={12} /></button>
                                <button onClick={e => { e.stopPropagation(); setMoveTarget(chap.unit_id); setMoveModal({isOpen: true, type: 'chapter', itemId: chap.id}); }} className="p-1 hover:bg-gray-200 rounded text-gray-500"><Move size={12} /></button>
                                <button onClick={e => { e.stopPropagation(); if(confirm("Delete chapter?")) props.onDeleteChapter(chap.id); }} className="p-1 hover:bg-red-100 hover:text-red-600 rounded text-gray-500"><Trash2 size={12} /></button>
                              </div>
                            )}
                          </div>

                          {isChapExpanded && (
                            <div className="space-y-0.5">
                              {chapProjects.map(p => renderProject(p, 3))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          );
        })}

        <div className="mt-4">
          <div className="px-2 mb-2"><h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Uncategorized Notes</h3></div>
          <div className="space-y-0.5">
            {filteredProjects.filter(p => !p.chapter_id).map(p => renderProject(p, 0))}
          </div>
        </div>
        </>
        )}
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-slate-800 transition-colors">
        <button onClick={props.onOpenSettings} className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors w-full">
          <Settings size={18} /> Settings
        </button>
      </div>

      {/* Create Modal */}
      {createModal.isOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <form onSubmit={submitCreate} className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold mb-4">Create New {createModal.type}</h3>
            <input autoFocus type="text" placeholder="Name" value={newName} onChange={e => setNewName(e.target.value)} className="w-full px-3 py-2 border rounded-md mb-4" />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setCreateModal({isOpen: false, type: '', parentId: null})} className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={!newName.trim()} className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50">Create</button>
            </div>
          </form>
        </div>
      )}

      {/* Move Modal */}
      {moveModal.isOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <form onSubmit={submitMove} className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold mb-4">Move {moveModal.type}</h3>
            <select value={moveTarget} onChange={e => setMoveTarget(e.target.value)} className="w-full px-3 py-2 border rounded-md mb-4">
              <option value="">-- Select Destination --</option>
              {moveModal.type === 'unit' && props.collections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              {moveModal.type === 'chapter' && props.units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              {moveModal.type === 'project' && props.chapters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              {moveModal.type === 'project' && <option value="">(Uncategorized)</option>}
            </select>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setMoveModal({isOpen: false, type: '', itemId: ''})} className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50">Cancel</button>
              <button type="submit" className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700">Move</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
