import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

// Hoisted so ReactMarkdown sees stable plugin lists across renders.
// Shared by the note reader and the chat bubbles so both render math the same way.
export const remarkPlugins = [remarkGfm, remarkMath];
export const rehypePlugins = [rehypeKatex];
