import { useEffect, useState } from "react";
import { FileText, Loader2 } from "lucide-react";
import { api } from "../api";
import StudyMarkdown from "./StudyMarkdown";

interface SplitNotePaneProps {
  // Other open tabs the user can compare against (the active note is excluded)
  tabs: { id: string; name: string }[];
  zoom: number;
}

type LoadedNote = { id: string; markdown: string };

// Read-only second pane for Split View: pick another open tab to read beside the active note.
export default function SplitNotePane({ tabs, zoom }: SplitNotePaneProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState<LoadedNote | null>(null);
  const [hasError, setHasError] = useState(false);

  // Fall back to the first tab when nothing is picked or the picked tab was closed
  const activeId = tabs.some(t => t.id === selectedId) ? selectedId : tabs[0]?.id ?? null;
  const isLoading = activeId !== null && loaded?.id !== activeId && !hasError;

  useEffect(() => {
    if (!activeId) return;
    const controller = new AbortController();
    setHasError(false);
    api.getFile(activeId, controller.signal)
      .then((data: { markdown_content?: string | null }) => {
        if (controller.signal.aborted) return;
        setLoaded({ id: activeId, markdown: data.markdown_content || "No content extracted." });
      })
      .catch(() => {
        if (!controller.signal.aborted) setHasError(true);
      });
    return () => controller.abort();
  }, [activeId]);

  if (!activeId) {
    return (
      <div className="h-full px-6 py-8 bg-surface flex flex-col items-center justify-center text-center text-muted-foreground">
        <FileText className="w-12 h-12 mb-4 opacity-20" />
        <p>No other note is open</p>
        <p className="text-xs mt-1">Open another note in a tab to read it side by side.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-surface">
      <div className="h-10 px-4 border-b border-border flex items-center shrink-0">
        <select
          aria-label="Note to show in split view"
          value={activeId}
          onChange={(e) => { setSelectedId(e.target.value); setLoaded(null); }}
          className="text-sm bg-transparent text-foreground max-w-full truncate outline-none cursor-pointer"
        >
          {tabs.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-8 bg-background">
        {hasError ? (
          <p className="text-sm text-muted-foreground">Couldn't load this note.</p>
        ) : isLoading || !loaded ? (
          <div className="flex justify-center pt-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : (
          <div className="max-w-3xl mr-auto">
            <StudyMarkdown content={loaded.markdown} zoom={zoom} />
          </div>
        )}
      </div>
    </div>
  );
}
