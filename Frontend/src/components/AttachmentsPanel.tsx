import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { ChevronRight, Edit2, FileText, Paperclip, Plus, X } from "lucide-react";
import { api } from "../api";
import type { Attachment } from "../types";

interface AttachmentsPanelProps {
  fileId: string;
  attachments: Attachment[];
  setAttachments: Dispatch<SetStateAction<Attachment[]>>;
  onClose: () => void;
  // Short user-visible failure message (shown in the toolbar status)
  onError: (message: string) => void;
}

const CODE_EXTENSIONS = ['.cpp', '.c', '.h', '.hpp', '.java', '.py', '.js', '.jsx', '.ts', '.tsx', '.cs', '.go', '.rs', '.php', '.rb', '.swift', '.kt', '.sql', '.sh', '.md', '.txt', '.csv'];

function isCodeOrText(att: Attachment) {
  const type = att.file_type || "";
  const name = att.filename?.toLowerCase() || "";
  if (type.startsWith('text/') || type.includes('json') || type.includes('xml') || type.includes('javascript') || type.includes('python')) return true;
  return CODE_EXTENSIONS.some(ext => name.endsWith(ext));
}

// Drawer listing a note's attachments, with upload, rename, delete and preview.
// Mount with key={fileId} so preview/rename state resets when the note changes.
export default function AttachmentsPanel({ fileId, attachments, setAttachments, onClose, onError }: AttachmentsPanelProps) {
  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(null);
  const [editingAttachmentId, setEditingAttachmentId] = useState<number | null>(null);
  const [editAttachmentValue, setEditAttachmentValue] = useState("");
  const [codePreviewContent, setCodePreviewContent] = useState<string | null>(null);
  const panelFileInputRef = useRef<HTMLInputElement>(null);
  // Enter followed by the resulting blur would otherwise submit a rename twice
  const isRenamingAttachmentRef = useRef(false);

  useEffect(() => {
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

  const deleteAttachment = async (att: Attachment) => {
    // Optimistic removal, restored if the server rejects it
    setAttachments(prev => prev.filter(a => a.id !== att.id));
    try {
      await api.deleteAttachment(att.id);
    } catch (err) {
      console.error("Failed to delete attachment", err);
      setAttachments(prev => prev.some(a => a.id === att.id) ? prev : [att, ...prev]);
      onError("Couldn't delete attachment");
    }
  };

  const renameAttachment = async (att: Attachment) => {
    if (isRenamingAttachmentRef.current) return;
    const name = editAttachmentValue.trim();
    // Stays set until the next edit starts, so the blur from unmounting the input is ignored
    isRenamingAttachmentRef.current = true;
    if (name !== "" && name !== att.filename) {
      try {
        const res = await api.updateAttachment(att.id, name);
        setAttachments(prev => prev.map(a => a.id === att.id ? res : a));
      } catch (err) {
        console.error(err);
      }
    }
    setEditingAttachmentId(null);
  };

  const uploadFiles = async (files: File[]) => {
    for (const file of files) {
      try {
        const newAtt = await api.uploadAttachment(fileId, file);
        setAttachments(prev => [newAtt, ...prev]);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleClose = () => {
    setPreviewAttachment(null);
    onClose();
  };

  return (
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
              Attachments ({attachments.length})
            </>
          )}
        </h3>
        <div className="flex gap-2">
          {!previewAttachment && (
            <button onClick={() => panelFileInputRef.current?.click()} className="p-2 hover:bg-primary/10 rounded-md text-primary transition-colors">
              <Plus className="w-5 h-5" />
            </button>
          )}
          <button onClick={handleClose} className="p-2 hover:bg-muted rounded-md text-muted-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <input type="file" multiple className="hidden" ref={panelFileInputRef} onChange={(e) => {
          if (e.target.files) void uploadFiles(Array.from(e.target.files));
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
          {attachments.length === 0 ? (
            <div className="col-span-2 flex flex-col items-center justify-center h-40 text-center text-muted-foreground">
              <p className="text-sm">No attachments yet.<br />Upload reference files here.</p>
            </div>
          ) : (
            attachments.map((f) => (
              <div key={f.id} onClick={() => setPreviewAttachment(f)} className="group border border-border rounded-lg overflow-hidden bg-surface hover:border-primary transition-colors cursor-pointer shadow-sm relative flex flex-col">
                <button onClick={(e) => { e.stopPropagation(); void deleteAttachment(f); }} className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-all z-10">
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
                      onBlur={() => void renameAttachment(f)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') void renameAttachment(f);
                      }}
                      className="text-[13px] font-medium w-full bg-background text-foreground border border-primary px-1 outline-none rounded"
                    />
                  ) : (
                    <div className="overflow-hidden flex-1 group/title cursor-text flex items-center gap-1" onClick={(e) => { e.stopPropagation(); isRenamingAttachmentRef.current = false; setEditingAttachmentId(f.id); setEditAttachmentValue(f.filename); }}>
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
  );
}
