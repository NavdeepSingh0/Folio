import type { ComponentPropsWithoutRef } from "react";
import type { ExtraProps } from "react-markdown";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import bash from "react-syntax-highlighter/dist/esm/languages/prism/bash";
import c from "react-syntax-highlighter/dist/esm/languages/prism/c";
import cpp from "react-syntax-highlighter/dist/esm/languages/prism/cpp";
import css from "react-syntax-highlighter/dist/esm/languages/prism/css";
import java from "react-syntax-highlighter/dist/esm/languages/prism/java";
import javascript from "react-syntax-highlighter/dist/esm/languages/prism/javascript";
import json from "react-syntax-highlighter/dist/esm/languages/prism/json";
import markup from "react-syntax-highlighter/dist/esm/languages/prism/markup";
import python from "react-syntax-highlighter/dist/esm/languages/prism/python";
import sql from "react-syntax-highlighter/dist/esm/languages/prism/sql";
import typescript from "react-syntax-highlighter/dist/esm/languages/prism/typescript";
import yaml from "react-syntax-highlighter/dist/esm/languages/prism/yaml";

// Only the languages students are likely to paste; the full Prism bundle is much larger.
const LANGUAGES = { bash, c, cpp, css, java, javascript, json, markup, python, sql, typescript, yaml };
for (const [name, grammar] of Object.entries(LANGUAGES)) {
  SyntaxHighlighter.registerLanguage(name, grammar);
}

const ALIASES: Record<string, keyof typeof LANGUAGES> = {
  sh: "bash", shell: "bash", zsh: "bash",
  js: "javascript", jsx: "javascript",
  ts: "typescript", tsx: "typescript",
  py: "python", python3: "python",
  "c++": "cpp", html: "markup", xml: "markup",
  yml: "yaml",
};

function resolveLanguage(raw: string): keyof typeof LANGUAGES | null {
  const name = raw.toLowerCase();
  if (name in LANGUAGES) return name as keyof typeof LANGUAGES;
  return ALIASES[name] ?? null;
}

// Rendered inside the <pre> that react-markdown already emits, so this returns
// only a <code>. Token colors come from CSS classes (see .token rules in index.css),
// which lets them follow the light/dark theme without a JS theme check.
function NoPre({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}

export default function CodeBlock({
  node: _node, className, children, ...rest
}: ComponentPropsWithoutRef<"code"> & ExtraProps) {
  const match = /language-([\w+#-]+)/.exec(className ?? "");
  const language = match ? resolveLanguage(match[1]) : null;

  if (!language) {
    return <code className={className} {...rest}>{children}</code>;
  }

  return (
    <SyntaxHighlighter
      language={language}
      useInlineStyles={false}
      PreTag={NoPre}
      CodeTag="code"
      codeTagProps={{ className: `language-${language}` }}
    >
      {String(children).replace(/\n$/, "")}
    </SyntaxHighlighter>
  );
}
