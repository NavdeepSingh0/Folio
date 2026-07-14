import { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface StudyMarkdownProps {
  content: string;
  zoom: number;
}

function StudyMarkdown({ content, zoom }: StudyMarkdownProps) {
  return (
    <article className="markdown-body transition-all bg-transparent" style={{ fontSize: `${zoom}%` }}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </article>
  );
}

export default memo(StudyMarkdown);
