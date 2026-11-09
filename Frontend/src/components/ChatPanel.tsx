import { useRef } from "react";
import { Loader2, MessageSquare, Minimize2, X } from "lucide-react";
import ChatBubble from "./ChatBubble";
import ChatInput from "./ChatInput";
import type { ChatMessage } from "../hooks/use-file-chat";

interface ChatPanelProps {
  fileName: string;
  messages: ChatMessage[];
  isSending: boolean;
  attachments: File[];
  onAddAttachments: (files: File[]) => void;
  onRemoveAttachment: (index: number) => void;
  onSend: (text: string) => boolean;
  onClose: () => void;
}

// Study Assistant chat for the open note (base layer of the right-hand pane).
export default function ChatPanel({
  fileName, messages, isSending, attachments, onAddAttachments, onRemoveAttachment, onSend, onClose,
}: ChatPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="absolute inset-0 z-10 flex flex-col">
      <div className="h-16 border-b border-border flex items-center justify-between px-6 shrink-0 bg-surface">
        <h3 className="font-medium flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          Study Assistant
        </h3>
        <button
          onClick={onClose}
          className="p-2 hover:bg-muted rounded-md text-muted-foreground transition-colors"
          title="Collapse Assistant"
        >
          <Minimize2 className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 bg-background">
        <div className="bg-muted p-4 rounded-2xl rounded-tl-sm self-start max-w-[85%] text-sm border border-border">
          Hello! I've loaded the context for <strong>{fileName || "this document"}</strong>. What would you like to know?
        </div>
        {messages.map((msg) => (
          <ChatBubble key={msg.id} role={msg.role} text={msg.text} />
        ))}
        {isSending && (
          <div className="p-4 rounded-2xl bg-muted rounded-tl-sm self-start text-sm border border-border">
            <Loader2 className="w-4 h-4 animate-spin" />
          </div>
        )}
      </div>

      <div className="p-4 border-t border-border bg-surface shrink-0 flex flex-col gap-2">
        {attachments.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {attachments.map((f, i) => (
              <div key={`${f.name}-${f.size}-${f.lastModified}`} className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md text-xs border border-border">
                <span className="truncate max-w-[100px]">{f.name}</span>
                <button onClick={() => onRemoveAttachment(i)}><X className="w-3 h-3 hover:text-red-500" /></button>
              </div>
            ))}
          </div>
        )}
        <div className="relative flex items-center">
          <input type="file" multiple className="hidden" ref={fileInputRef} onChange={(e) => {
            if (e.target.files) onAddAttachments(Array.from(e.target.files));
          }} />
          <ChatInput onSend={onSend} onAttachClick={() => fileInputRef.current?.click()} />
        </div>
      </div>
    </div>
  );
}
