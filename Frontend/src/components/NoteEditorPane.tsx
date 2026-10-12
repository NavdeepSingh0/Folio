import React, { useDeferredValue, useEffect, useMemo, useState, type MutableRefObject } from "react";
import { FileText } from "lucide-react";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";
import StudyMarkdown from "./StudyMarkdown";

interface NoteEditorPaneProps {
  // Buffer contents on mount; remount (via key) to load a different note
  initialContent: string;
  // Last loaded/saved content; the buffer is dirty when it differs
  baseline: string;
  mode: "edit" | "split" | "read";
  zoom: number;
  // Written synchronously on every change so saves always see the latest text
  contentRef: MutableRefObject<string>;
  onDirtyChange: (dirty: boolean) => void;
  onWordCount: (count: number) => void;
  onSave: () => void;
  uploadImage: (file: File) => Promise<string>;
  onUploadError: () => void;
  // Extra content for the reading view (e.g. the assistant button)
  readOverlay?: React.ReactNode;
}

// Data URIs (inline images) are stripped before counting so large notes
// don't split megabytes of base64.
const DATA_URI = /data:[^\s)"']+/g;

let placeholderSeq = 0;

// Owns the editor buffer so keystrokes re-render only this pane, not the
// tabs, toolbar, or chat in StudyScreen.
export function NoteEditorPane({
  initialContent, baseline, mode, zoom, contentRef,
  onDirtyChange, onWordCount, onSave, uploadImage, onUploadError, readOverlay,
}: NoteEditorPaneProps) {
  const [markdown, setMarkdown] = useState(initialContent);
  const preview = useDeferredValue(markdown);

  const updateMarkdown = (update: (prev: string) => string) => {
    setMarkdown(prev => {
      const next = update(prev);
      contentRef.current = next;
      return next;
    });
  };

  useEffect(() => { contentRef.current = markdown; }, [contentRef, markdown]);

  const isDirty = markdown !== baseline;
  useEffect(() => { onDirtyChange(isDirty); }, [isDirty, onDirtyChange]);

  const wordCount = useMemo(() => preview.replace(DATA_URI, "").split(/\s+/).length, [preview]);
  useEffect(() => {
    const t = setTimeout(() => onWordCount(wordCount), 300);
    return () => clearTimeout(t);
  }, [wordCount, onWordCount]);

  const insertImage = async (file: File, cursorStart: number, cursorEnd: number) => {
    const placeholder = `![Uploading ${file.name} #${++placeholderSeq}...]()`;
    updateMarkdown(prev => prev.substring(0, cursorStart) + placeholder + prev.substring(cursorEnd));
    try {
      const url = await uploadImage(file);
      updateMarkdown(prev => prev.replace(placeholder, `![${file.name}](${url})`));
    } catch (err) {
      console.error("Failed to upload image", err);
      updateMarkdown(prev => prev.replace(placeholder, ""));
      onUploadError();
    }
  };

  // Mode branches stay in sync with the original StudyScreen layout
  if (mode === "edit") {
    return (
      <PanelGroup direction="horizontal">
        <Panel minSize={30}>
          <textarea
            value={markdown}
            onChange={(e) => updateMarkdown(() => e.target.value)}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                const file = e.dataTransfer.files[0];
                if (file.type.startsWith('image/')) {
                  insertImage(file, e.currentTarget.selectionStart, e.currentTarget.selectionEnd);
                }
              }
            }}
            onPaste={(e) => {
              if (e.clipboardData.files && e.clipboardData.files.length > 0) {
                const file = e.clipboardData.files[0];
                if (file.type.startsWith('image/')) {
                  e.preventDefault();
                  insertImage(file, e.currentTarget.selectionStart, e.currentTarget.selectionEnd);
                }
              }
            }}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                onSave();
              }
            }}
            style={{ fontSize: `${zoom}%` }}
            className="w-full h-full p-6 bg-surface border-r border-border font-mono resize-none focus:outline-none"
          />
        </Panel>
        <PanelResizeHandle className="w-1 bg-border hover:bg-primary/50 cursor-col-resize" />
        <Panel minSize={30}>
          <div className="h-full overflow-y-auto px-8 py-8 bg-background">
            <StudyMarkdown content={preview} zoom={zoom} />
          </div>
        </Panel>
      </PanelGroup>
    );
  }

  if (mode === "split") {
    return (
      <PanelGroup direction="horizontal">
        <Panel minSize={30}>
          <div className="h-full overflow-y-auto px-6 py-8 bg-background">
            <div className="max-w-3xl mr-auto">
              <StudyMarkdown content={preview} zoom={zoom} />
            </div>
          </div>
        </Panel>
        <PanelResizeHandle className="w-1 bg-border hover:bg-primary/50 cursor-col-resize" />
        <Panel minSize={30}>
          <div className="h-full overflow-y-auto px-6 py-8 bg-surface flex flex-col items-center justify-center text-muted-foreground">
              <FileText className="w-12 h-12 mb-4 opacity-20" />
              <p>No secondary file selected</p>
          </div>
        </Panel>
      </PanelGroup>
    );
  }

  return (
    <div className="h-full overflow-y-auto px-8 py-12 relative scroll-smooth" style={{ WebkitOverflowScrolling: 'touch' }}>
      {readOverlay}
      <div className="max-w-4xl mr-auto">
        <StudyMarkdown content={preview} zoom={zoom} />
      </div>
    </div>
  );
}
