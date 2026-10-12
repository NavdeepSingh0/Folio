import { memo, useState } from "react";
import { Paperclip, Send } from "lucide-react";

interface ChatInputProps {
  // Returns true when the message was accepted, so the draft can be cleared
  onSend: (text: string) => boolean;
  onAttachClick: () => void;
}

// Owns the draft text so typing a question doesn't re-render the study screen
function ChatInput({ onSend, onAttachClick }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const send = () => {
    if (onSend(message)) setMessage("");
  };
  return (
    <>
      <button
        onClick={onAttachClick}
        className="absolute left-2 p-2 text-muted-foreground hover:text-primary transition-colors"
      >
        <Paperclip className="w-4 h-4" />
      </button>
      <input
        type="text"
        placeholder="Ask a question..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="w-full bg-background border border-border rounded-xl pl-10 pr-12 py-3.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
        onKeyDown={(e) => {
          if (e.key === "Enter") send();
        }}
      />
      <button
        onClick={send}
        className="absolute right-2 p-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
      >
        <Send className="w-4 h-4" />
      </button>
    </>
  );
}

export default memo(ChatInput);
