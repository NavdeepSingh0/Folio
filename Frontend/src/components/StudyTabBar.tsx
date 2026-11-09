import type React from "react";
import { Edit2, File as FileIcon, Plus, X } from "lucide-react";

interface StudyTabBarProps {
  tabs: { id: string; name: string }[];
  activeId: string | null;
  isRenaming: boolean;
  nameValue: string;
  onNameChange: (value: string) => void;
  onStartRename: () => void;
  onSaveName: () => void;
  onSelect: (id: string) => void;
  onClose: (e: React.MouseEvent, id: string) => void;
  onAdd: () => void;
}

// IDE-style tab strip; clicking the active tab's name renames the note.
export default function StudyTabBar({
  tabs, activeId, isRenaming, nameValue, onNameChange, onStartRename, onSaveName, onSelect, onClose, onAdd,
}: StudyTabBarProps) {
  return (
    <div className="h-12 border-b border-border flex items-center bg-surface shrink-0 overflow-x-auto overflow-y-hidden">
      {tabs.map(tab => {
        const isActive = tab.id === activeId;
        return (
          <div
            key={tab.id}
            onClick={() => onSelect(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 border-r border-border h-full cursor-pointer group min-w-32 max-w-64 transition-colors ${isActive ? 'bg-background border-t-2 border-t-primary' : 'bg-surface hover:bg-muted border-t-2 border-t-transparent'}`}
          >
            <FileIcon className={`w-4 h-4 shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
            {isActive && isRenaming ? (
              <input
                autoFocus
                value={nameValue}
                onChange={(e) => onNameChange(e.target.value)}
                onBlur={onSaveName}
                onKeyDown={(e) => e.key === 'Enter' && onSaveName()}
                className="text-sm font-medium w-full bg-transparent border-b border-primary outline-none"
              />
            ) : (
              <div className="flex-1 flex items-center gap-2 overflow-hidden" onClick={(e) => { if (isActive) { e.stopPropagation(); onStartRename(); } }} title={isActive ? "Click to rename" : tab.name}>
                <span className={`text-sm truncate ${isActive ? 'font-medium text-foreground' : 'text-muted-foreground group-hover:text-foreground'}`}>{tab.name}</span>
                {isActive && <Edit2 className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />}
              </div>
            )}
            <button
              onClick={(e) => onClose(e, tab.id)}
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
        onClick={onAdd}
        className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors ml-1 shrink-0 rounded-md"
        title="Open another note from Library"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}
