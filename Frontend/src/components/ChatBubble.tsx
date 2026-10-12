import { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Hoisted so ReactMarkdown sees a stable plugin list across renders
const remarkPlugins = [remarkGfm];

interface ChatBubbleProps {
  role: "user" | "model";
  text: string;
}

function ChatBubble({ role, text }: ChatBubbleProps) {
  return (
    <div className={`p-4 rounded-2xl text-sm border border-border max-w-[85%] ${
      role === 'model'
        ? 'bg-muted rounded-tl-sm self-start'
        : 'bg-primary text-primary-foreground rounded-tr-sm self-end'
    }`}>
      <ReactMarkdown remarkPlugins={remarkPlugins}>{text}</ReactMarkdown>
    </div>
  );
}

export default memo(ChatBubble);
