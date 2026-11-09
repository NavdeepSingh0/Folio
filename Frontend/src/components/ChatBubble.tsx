import { memo } from "react";
import ReactMarkdown from "react-markdown";
import CodeBlock from "./CodeBlock";
import { remarkPlugins, rehypePlugins } from "../lib/markdownPlugins";

// Hoisted so ReactMarkdown sees a stable components map across renders
const components = { code: CodeBlock };

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
      <ReactMarkdown remarkPlugins={remarkPlugins} rehypePlugins={rehypePlugins} components={components}>{text}</ReactMarkdown>
    </div>
  );
}

export default memo(ChatBubble);
