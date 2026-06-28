import { X } from "lucide-react";
import React, { DragEvent } from "react";

export interface TabData {
  id: string;
  title: string;
  isUpload?: boolean;
  isProcessing?: boolean;
  jobId?: string;
  // State for upload tab
  selectedFile?: File | null;
  noteStyle?: string;
  customInstructions?: string;
  isGenerating?: boolean;
  error?: string;
  // State for project tab
  projectId?: string;
  markdown?: string;
  sourceFilename?: string;
  metadata?: any;
}

interface TabBarProps {
  paneId: string;
  tabs: TabData[];
  activeTabId: string | null;
  onTabSelect: (paneId: string, tabId: string) => void;
  onTabClose: (paneId: string, tabId: string) => void;
  onTabDrop: (sourcePaneId: string, sourceTabId: string, targetPaneId: string, targetIndex: number) => void;
  onSplitPane?: (paneId: string) => void;
  canSplit?: boolean;
}

export function TabBar({ paneId, tabs, activeTabId, onTabSelect, onTabClose, onTabDrop, onSplitPane, canSplit }: TabBarProps) {
  const handleDragStart = (e: DragEvent, tabId: string) => {
    e.dataTransfer.setData("application/json", JSON.stringify({ sourcePaneId: paneId, sourceTabId: tabId }));
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: DragEvent, dropIndex: number) => {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData("application/json"));
      if (data.sourcePaneId && data.sourceTabId) {
        onTabDrop(data.sourcePaneId, data.sourceTabId, paneId, dropIndex);
      }
    } catch (err) {
      // ignore parsing errors
    }
  };

  return (
    <div 
      className="flex items-center h-10 bg-[#f3f4f6] dark:bg-[#1e293b] border-b border-[var(--color-border)] overflow-x-auto select-none transition-colors"
      onDragOver={handleDragOver}
      onDrop={(e) => handleDrop(e, tabs.length)}
    >
      {tabs.map((tab, index) => {
        const isActive = tab.id === activeTabId;
        return (
          <div
            key={tab.id}
            draggable
            onDragStart={(e) => handleDragStart(e, tab.id)}
            onDragOver={handleDragOver}
            onDrop={(e) => {
              e.stopPropagation();
              handleDrop(e, index);
            }}
            onClick={() => onTabSelect(paneId, tab.id)}
            className={`flex items-center min-w-[120px] max-w-[200px] h-full px-3 border-r border-[var(--color-border)] cursor-pointer group transition-colors ${
              isActive ? "bg-white dark:bg-[#0f172a] text-blue-600 dark:text-blue-400 border-t-2 border-t-blue-600 dark:border-t-blue-400" : "bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700/50 border-t-2 border-t-transparent"
            }`}
          >
            <span className="truncate text-xs font-medium flex-1">
              {tab.title}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTabClose(paneId, tab.id);
              }}
              className={`p-0.5 rounded-md hover:bg-gray-300 dark:hover:bg-slate-600 ml-2 flex-shrink-0 ${isActive ? 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200' : 'text-transparent group-hover:text-gray-500 dark:group-hover:text-gray-400'} transition-colors`}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
      
      {/* Drop zone for empty area to append to end */}
      <div className="flex-1 h-full flex items-center justify-end pr-2">
        {canSplit && onSplitPane && (
          <button 
            onClick={() => onSplitPane(paneId)}
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
            title="Split Right"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18"/><rect width="18" height="18" x="3" y="3" rx="2"/></svg>
          </button>
        )}
      </div>
    </div>
  );
}
