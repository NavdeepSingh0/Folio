import { useState, useMemo } from "react";
import {
  Folder, FileText, Plus, Settings, Search, Edit2, Trash2,
  FolderPlus, BookOpen, ChevronRight, ChevronDown, Move, Library
} from "lucide-react";
import { CustomSelect } from "./CustomSelect";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/Tooltip";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "./ui/Dialog";
import { cn } from "@/lib/utils";

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

type NodeType = "collection" | "unit" | "chapter" | "project";
type SearchMode = "filename" | "knowledge";

export function Sidebar(props: SidebarProps) {
  const [searchMode, setSearchMode] = useState<SearchMode>("filename");
  const [searchQuery, setSearchQuery] = useState("");
  const [semanticResults, setSemanticResults] = useState<{ project_id: string; project_title: string; text: string; similarity: number }[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const [editingNode, setEditingNode] = useState<{ id: string; type: NodeType } | null>(null);
  const [editValue, setEditValue] = useState("");

  const [createModal, setCreateModal] = useState<{ open: boolean; type: NodeType; parentId: string | null }>({ open: false, type: "collection", parentId: null });
  const [newName, setNewName] = useState("");

  const [moveModal, setMoveModal] = useState<{ open: boolean; type: NodeType; itemId: string }>({ open: false, type: "collection", itemId: "" });
  const [moveTarget, setMoveTarget] = useState("");

  const [deleteModal, setDeleteModal] = useState<{ open: boolean; type: NodeType; itemId: string; itemName: string }>({ open: false, type: "collection", itemId: "", itemName: "" });

  const toggleNode = (id: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const startEdit = (id: string, name: string, type: NodeType, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingNode({ id, type });
    setEditValue(name);
  };

  const submitEdit = () => {
    if (!editingNode || !editValue.trim()) return;
    const { id, type } = editingNode;
    if (type === "collection") props.onRenameCollection(id, editValue);
    if (type === "unit") props.onRenameUnit(id, editValue);
    if (type === "chapter") props.onRenameChapter(id, editValue);
    if (type === "project") props.onRenameProject(id, editValue);
    setEditingNode(null);
  };

  const submitCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const { type, parentId } = createModal;
    if (type === "collection") props.onCreateCollection(newName);
    if (type === "unit" && parentId) props.onCreateUnit(newName, parentId);
    if (type === "chapter" && parentId) props.onCreateChapter(newName, parentId);
    setCreateModal({ open: false, type: "collection", parentId: null });
    setNewName("");
  };

  const submitMove = (e: React.FormEvent) => {
    e.preventDefault();
    const { type, itemId } = moveModal;
    if (type === "unit") props.onMoveUnit(itemId, moveTarget);
    if (type === "chapter") props.onMoveChapter(itemId, moveTarget);
    if (type === "project") props.onMoveProject(itemId, moveTarget || null);
    setMoveModal({ open: false, type: "collection", itemId: "" });
    setMoveTarget("");
  };

  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);

    if (searchMode === "knowledge" && val.trim().length > 2) {
      setIsSearching(true);
      try {
        const res = await fetch("http://localhost:8000/api/study/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: val, mode: "knowledge" }),
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
  };

  const handleModeToggle = (mode: SearchMode) => {
    setSearchMode(mode);
    if (mode === "knowledge" && searchQuery.trim().length > 2) {
      handleSearchChange({ target: { value: searchQuery } } as any);
    } else {
      setSemanticResults([]);
    }
  };

  const filteredProjects = useMemo(() => {
    if (searchMode === "filename") {
      return props.projects.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    const matchedIds = new Set(semanticResults.map(r => r.project_id));
    return props.projects.filter(p => matchedIds.has(p.id));
  }, [searchMode, searchQuery, props.projects, semanticResults]);

  // === Render helpers ===
  const ActionButton = ({ onClick, title, icon: Icon, danger = false }: any) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          className={cn(
            "p-1 rounded transition-colors",
            danger
              ? "text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          )}
        >
          <Icon size={12} />
        </button>
      </TooltipTrigger>
      <TooltipContent side="right">{title}</TooltipContent>
    </Tooltip>
  );

  const EditableName = ({ id, name, type }: { id: string; name: string; type: NodeType }) => {
    if (editingNode?.id === id) {
      return (
        <Input
          autoFocus
          value={editValue}
          onChange={e => setEditValue(e.target.value)}
          onBlur={submitEdit}
          onKeyDown={e => e.key === "Enter" && submitEdit()}
          onClick={e => e.stopPropagation()}
          className="h-6 text-xs px-1.5"
        />
      );
    }
    return <span className="truncate text-sm">{name}</span>;
  };

  const renderProject = (p: Project, indent: number = 0) => (
    <div
      key={p.id}
      style={{ paddingLeft: `${indent * 12 + 8}px` }}
      onClick={() => props.onSelectProject(p.id)}
      className={cn(
        "group flex items-center justify-between py-1.5 pr-2 rounded-md cursor-pointer transition-colors",
        props.activeProjectId === p.id
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      )}
    >
      <div className="flex items-center gap-2 overflow-hidden flex-1">
        <FileText size={14} className="shrink-0 opacity-70" />
        <EditableName id={p.id} name={p.title} type="project" />
      </div>
      {!editingNode && (
        <div className="opacity-0 group-hover:opacity-100 flex items-center shrink-0 ml-1">
          <ActionButton onClick={(e: any) => startEdit(p.id, p.title, "project", e)} title="Rename" icon={Edit2} />
          <ActionButton onClick={(e: any) => { e.stopPropagation(); setMoveTarget(p.chapter_id || ""); setMoveModal({ open: true, type: "project", itemId: p.id }); }} title="Move" icon={Move} />
          <ActionButton onClick={(e: any) => { e.stopPropagation(); setDeleteModal({ open: true, type: "project", itemId: p.id, itemName: p.title }); }} title="Delete" icon={Trash2} danger />
        </div>
      )}
    </div>
  );

  const renderFolderRow = ({
    id, name, type, depth, icon: Icon, iconClass, isExpanded, hasChildren, onAdd,
  }: any) => (
    <div
      key={id}
      className="group flex items-center justify-between p-1.5 rounded-md hover:bg-accent cursor-pointer text-foreground font-medium transition-colors"
      style={{ paddingLeft: `${depth * 12 + 8}px` }}
      onClick={() => toggleNode(id)}
    >
      <div className="flex items-center gap-1 flex-1 overflow-hidden">
        {isExpanded
          ? <ChevronDown size={14} className="text-muted-foreground shrink-0" />
          : <ChevronRight size={14} className="text-muted-foreground shrink-0" />}
        <Icon size={14} className={cn("shrink-0", iconClass)} />
        <EditableName id={id} name={name} type={type} />
      </div>
      {!editingNode && (
        <div className="opacity-0 group-hover:opacity-100 flex items-center shrink-0 ml-1">
          {onAdd && <ActionButton onClick={(e: any) => { e.stopPropagation(); setNewName(""); setCreateModal({ open: true, type: onAdd.type, parentId: id }); }} title={`Add ${onAdd.label}`} icon={Plus} />}
          <ActionButton onClick={(e: any) => startEdit(id, name, type, e)} title="Rename" icon={Edit2} />
          {type !== "collection" && (
            <ActionButton
              onClick={(e: any) => {
                e.stopPropagation();
                const current = type === "unit"
                  ? props.units.find(u => u.id === id)?.collection_id
                  : props.chapters.find(c => c.id === id)?.unit_id;
                setMoveTarget(current || "");
                setMoveModal({ open: true, type, itemId: id });
              }}
              title="Move"
              icon={Move}
            />
          )}
          <ActionButton onClick={(e: any) => { e.stopPropagation(); setDeleteModal({ open: true, type, itemId: id, itemName: name }); }} title="Delete" icon={Trash2} danger />
        </div>
      )}
    </div>
  );

  return (
    <TooltipProvider delayDuration={400}>
      <div className="flex flex-col h-full bg-sidebar text-foreground transition-colors">
        {/* === Header === */}
        <div className="p-4 border-b border-border space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-sm">
              <Library size={16} className="text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight leading-none">Argus</h2>
              <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider">Study workspace</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={props.onNewProject} size="sm" className="flex-1">
              <Plus size={14} /> Note
            </Button>
            <Button onClick={props.onOpenRevisionWorkspace} size="sm" variant="secondary" className="flex-1">
              <BookOpen size={14} /> Revise
            </Button>
          </div>

          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Search notes…"
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-9 h-8 text-sm"
            />
          </div>

          <div className="flex p-0.5 rounded-md bg-muted text-xs">
            <button
              onClick={() => handleModeToggle("filename")}
              className={cn(
                "flex-1 py-1 rounded text-center transition-all",
                searchMode === "filename"
                  ? "bg-card text-foreground shadow-sm font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Filename
            </button>
            <button
              onClick={() => handleModeToggle("knowledge")}
              className={cn(
                "flex-1 py-1 rounded text-center transition-all",
                searchMode === "knowledge"
                  ? "bg-card text-foreground shadow-sm font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Knowledge
            </button>
          </div>
          {searchMode === "knowledge" && isSearching && (
            <p className="text-xs text-primary text-center animate-pulse">Searching knowledge base…</p>
          )}
        </div>

        {/* === Tree / Search results === */}
        <div className="flex-1 overflow-y-auto p-2">
          {searchMode === "knowledge" && searchQuery.trim().length > 2 ? (
            <div className="space-y-1.5 mt-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">
                Knowledge Matches
              </h3>
              {semanticResults.length === 0 && !isSearching ? (
                <p className="text-sm text-muted-foreground px-2">No semantic matches found.</p>
              ) : (
                semanticResults.map((res, i) => (
                  <button
                    key={i}
                    onClick={() => props.onSelectProject(res.project_id)}
                    className="w-full text-left p-3 rounded-lg border border-secondary/30 bg-secondary/5 hover:bg-secondary/10 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1.5 gap-2">
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        <FileText size={14} className="text-secondary shrink-0" />
                        <span className="font-semibold text-sm truncate">{res.project_title}</span>
                      </div>
                      <span className="text-[10px] font-bold text-secondary bg-secondary/15 px-1.5 py-0.5 rounded-full shrink-0">
                        {Math.round(res.similarity * 100)}%
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">{res.text}</p>
                  </button>
                ))
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between px-2 mb-2 mt-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Hierarchy</h3>
                <ActionButton
                  onClick={(e: any) => { e.stopPropagation(); setNewName(""); setCreateModal({ open: true, type: "collection", parentId: null }); }}
                  title="New collection"
                  icon={FolderPlus}
                />
              </div>

              {props.collections.map(col => {
                const isExpanded = expandedNodes.has(col.id) || !!searchQuery;
                const colUnits = props.units.filter(u => u.collection_id === col.id);

                return (
                  <div key={col.id} className="mb-1">
                    {renderFolderRow({
                      id: col.id, name: col.name, type: "collection", depth: 0,
                      icon: Folder, iconClass: "text-primary",
                      isExpanded, hasChildren: colUnits.length > 0,
                      onAdd: { type: "unit", label: "unit" },
                    })}

                    {isExpanded && colUnits.map(unit => {
                      const isUnitExpanded = expandedNodes.has(unit.id) || !!searchQuery;
                      const unitChapters = props.chapters.filter(c => c.unit_id === unit.id);

                      return (
                        <div key={unit.id}>
                          {renderFolderRow({
                            id: unit.id, name: unit.name, type: "unit", depth: 1,
                            icon: Folder, iconClass: "text-secondary",
                            isExpanded: isUnitExpanded, hasChildren: unitChapters.length > 0,
                            onAdd: { type: "chapter", label: "chapter" },
                          })}

                          {isUnitExpanded && unitChapters.map(chap => {
                            const isChapExpanded = expandedNodes.has(chap.id) || !!searchQuery;
                            const chapProjects = filteredProjects.filter(p => p.chapter_id === chap.id);

                            return (
                              <div key={chap.id}>
                                {renderFolderRow({
                                  id: chap.id, name: chap.name, type: "chapter", depth: 2,
                                  icon: Folder, iconClass: "text-muted-foreground",
                                  isExpanded: isChapExpanded, hasChildren: chapProjects.length > 0,
                                })}

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
                <h3 className="px-2 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Uncategorized
                </h3>
                <div className="space-y-0.5">
                  {filteredProjects.filter(p => !p.chapter_id).map(p => renderProject(p, 0))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* === Footer === */}
        <div className="p-3 border-t border-border">
          <Button variant="ghost" size="sm" onClick={props.onOpenSettings} className="w-full justify-start text-muted-foreground">
            <Settings size={16} /> Settings
          </Button>
        </div>

        {/* === Modals === */}
        <Dialog open={createModal.open} onOpenChange={(open) => setCreateModal({ open, type: "collection", parentId: null })}>
          <DialogContent>
            <form onSubmit={submitCreate}>
              <DialogHeader>
                <DialogTitle>Create new {createModal.type}</DialogTitle>
                <DialogDescription>
                  {createModal.type === "collection" && "Top-level groups for organizing your study material."}
                  {createModal.type === "unit" && "A subject or topic within this collection."}
                  {createModal.type === "chapter" && "A specific chapter or section of this unit."}
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4">
                <Input
                  autoFocus
                  placeholder={`${createModal.type.charAt(0).toUpperCase() + createModal.type.slice(1)} name`}
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setCreateModal({ open: false, type: "collection", parentId: null })}>Cancel</Button>
                <Button type="submit" disabled={!newName.trim()}>Create</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={moveModal.open} onOpenChange={(open) => setMoveModal({ open, type: "collection", itemId: "" })}>
          <DialogContent>
            <form onSubmit={submitMove}>
              <DialogHeader>
                <DialogTitle>Move {moveModal.type}</DialogTitle>
                <DialogDescription>Select a new location for this item.</DialogDescription>
              </DialogHeader>
              <div className="mt-4">
                <CustomSelect
                  value={moveTarget}
                  onChange={val => setMoveTarget(val)}
                  options={[
                    { value: "", label: "— Select destination —" },
                    ...(moveModal.type === "unit" ? props.collections.map(c => ({ value: c.id, label: c.name })) : []),
                    ...(moveModal.type === "chapter" ? props.units.map(u => ({ value: u.id, label: u.name })) : []),
                    ...(moveModal.type === "project"
                      ? [
                        ...props.chapters.map(c => ({ value: c.id, label: c.name })),
                        { value: "", label: "(Uncategorized)" },
                      ]
                      : []),
                  ]}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setMoveModal({ open: false, type: "collection", itemId: "" })}>Cancel</Button>
                <Button type="submit">Move</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={deleteModal.open} onOpenChange={(open) => setDeleteModal({ open, type: "collection", itemId: "", itemName: "" })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete {deleteModal.type}?</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete <strong className="text-foreground">"{deleteModal.itemName}"</strong>?
                {(deleteModal.type === "collection" || deleteModal.type === "unit" || deleteModal.type === "chapter") &&
                  " All of its contents will also be permanently deleted."}
                {" "}This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteModal({ open: false, type: "collection", itemId: "", itemName: "" })}>Cancel</Button>
              <Button
                variant="destructive"
                onClick={() => {
                  const { type, itemId } = deleteModal;
                  if (type === "collection") props.onDeleteCollection(itemId);
                  if (type === "unit") props.onDeleteUnit(itemId);
                  if (type === "chapter") props.onDeleteChapter(itemId);
                  if (type === "project") props.onDeleteProject(itemId);
                  setDeleteModal({ open: false, type: "collection", itemId: "", itemName: "" });
                }}
              >
                Delete permanently
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
