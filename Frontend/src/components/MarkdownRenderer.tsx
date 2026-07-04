import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import 'katex/dist/katex.min.css';

interface MarkdownRendererProps {
  content: string;
}

// Parses YAML frontmatter (robust: handles \r\n and \n, nested values, quoted strings)
function parseFrontmatter(raw: string): { meta: Record<string, string>; body: string } {
  // Normalize line endings
  const text = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const fmRegex = /^---\s*\n([\s\S]*?)\n---\s*\n?/;
  const match = text.match(fmRegex);

  if (!match) return { meta: {}, body: text };

  const yamlBlock = match[1];
  const body = text.slice(match[0].length);
  const meta: Record<string, string> = {};

  let currentKey = '';
  let currentValue = '';

  const flush = () => {
    if (currentKey) {
      // Strip surrounding quotes from values
      const v = currentValue.trim().replace(/^["']|["']$/g, '');
      meta[currentKey] = v;
    }
  };

  for (const line of yamlBlock.split('\n')) {
    if (line.trim() === '') continue;

    // Top-level key: value  (not indented)
    const topLevel = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*):\s*(.*)/);
    if (topLevel) {
      flush();
      currentKey = topLevel[1];
      currentValue = topLevel[2];
    } else if (line.startsWith('  ') || line.startsWith('\t')) {
      // Indented / nested — append to current value
      currentValue += ' ' + line.trim();
    } else {
      currentValue += ' ' + line.trim();
    }
  }
  flush();

  return { meta, body };
}

// Convert parsed frontmatter into a styled Markdown table string
function frontmatterToMarkdownTable(meta: Record<string, string>): string {
  const rows = Object.entries(meta)
    .filter(([, v]) => v.trim() !== '')
    .map(([k, v]) => `| **${k.replace(/_/g, ' ')}** | ${v} |`)
    .join('\n');

  if (!rows) return '';
  return `| Property | Value |\n| :--- | :--- |\n${rows}\n\n`;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const { meta, body, processedContent } = useMemo(() => {
    const { meta, body } = parseFrontmatter(content);
    const tableBlock = frontmatterToMarkdownTable(meta);
    const processedContent = tableBlock + body;
    return { meta, body, processedContent };
  }, [content]);

  // Extract H2 headings for sidebar TOC
  const headings = useMemo(() => {
    const matches = Array.from(processedContent.matchAll(/^#{1,3}\s+(.+)$/gm));
    return matches.map(m => ({ text: m[1].replace(/[*_`]/g, ''), level: m[0].match(/^#+/)?.[0].length ?? 2 }));
  }, [processedContent]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  const makeId = (text: string) => text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');

  return (
    <div className="flex relative gap-8">
      {/* Main content */}
      <div className="flex-1 min-w-0 prose prose-invert max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeKatex]}
          components={{
            // ── Headings with anchor IDs ──
            h1: ({ node, children, ...props }) => {
              const id = makeId(children?.toString() ?? '');
              return <h1 id={id} className="text-3xl font-bold text-foreground mt-8 mb-4 scroll-mt-6 border-b border-border pb-2" {...props}>{children}</h1>;
            },
            h2: ({ node, children, ...props }) => {
              const id = makeId(children?.toString() ?? '');
              return <h2 id={id} className="text-2xl font-semibold text-foreground mt-8 mb-3 scroll-mt-6" {...props}>{children}</h2>;
            },
            h3: ({ node, children, ...props }) => {
              const id = makeId(children?.toString() ?? '');
              return <h3 id={id} className="text-xl font-semibold text-foreground mt-6 mb-2 scroll-mt-6" {...props}>{children}</h3>;
            },
            h4: ({ node, children, ...props }) => (
              <h4 className="text-lg font-semibold text-foreground mt-4 mb-2" {...props}>{children}</h4>
            ),

            // ── Paragraphs ──
            p: ({ node, ...props }) => (
              <p className="text-foreground/90 leading-7 mb-4" {...props} />
            ),

            // ── Tables ──
            table: ({ node, ...props }) => (
              <div className="overflow-x-auto my-6 rounded-xl border border-border shadow-sm">
                <table className="min-w-full divide-y divide-border bg-card text-sm" {...props} />
              </div>
            ),
            thead: ({ node, ...props }) => <thead className="bg-muted/60" {...props} />,
            tbody: ({ node, ...props }) => <tbody className="divide-y divide-border/50" {...props} />,
            th: ({ node, ...props }) => (
              <th className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider" {...props} />
            ),
            td: ({ node, ...props }) => (
              <td className="px-4 py-3 text-foreground/80 align-top" {...props} />
            ),
            tr: ({ node, ...props }) => (
              <tr className="hover:bg-muted/30 transition-colors" {...props} />
            ),

            // ── Lists ──
            ul: ({ node, ...props }) => (
              <ul className="list-disc list-outside pl-6 mb-4 space-y-1 text-foreground/90" {...props} />
            ),
            ol: ({ node, ...props }) => (
              <ol className="list-decimal list-outside pl-6 mb-4 space-y-1 text-foreground/90" {...props} />
            ),
            li: ({ node, ...props }) => (
              <li className="leading-7" {...props} />
            ),

            // ── Blockquote ──
            blockquote: ({ node, ...props }) => (
              <blockquote className="border-l-4 border-primary/60 pl-4 py-1 my-4 bg-muted/30 rounded-r-lg italic text-muted-foreground" {...props} />
            ),

            // ── Inline code ──
            code: ({ node, className, children, ...props }: any) => {
              const match = /language-(\w+)/.exec(className || '');
              const isBlock = match !== null;

              if (isBlock) {
                return (
                  <div className="my-4 rounded-xl overflow-hidden border border-border shadow-sm">
                    <div className="flex items-center justify-between px-4 py-2 bg-muted/80 border-b border-border">
                      <span className="text-xs font-mono text-muted-foreground">{match[1]}</span>
                    </div>
                    <SyntaxHighlighter
                      style={oneDark}
                      language={match[1]}
                      PreTag="div"
                      customStyle={{ margin: 0, borderRadius: 0, background: 'hsl(var(--background))' }}
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  </div>
                );
              }

              return (
                <code className="bg-muted text-primary font-mono text-sm px-1.5 py-0.5 rounded-md" {...props}>
                  {children}
                </code>
              );
            },

            // ── Horizontal rule ──
            hr: ({ node, ...props }) => (
              <hr className="my-8 border-border" {...props} />
            ),

            // ── Strong / Em ──
            strong: ({ node, ...props }) => (
              <strong className="font-bold text-foreground" {...props} />
            ),
            em: ({ node, ...props }) => (
              <em className="italic text-foreground/80" {...props} />
            ),

            // ── Links ──
            a: ({ node, ...props }) => (
              <a className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors" target="_blank" rel="noopener noreferrer" {...props} />
            ),

            // ── Images ──
            img: ({ node, ...props }) => (
              <img className="rounded-xl max-w-full my-4 border border-border shadow-sm" {...props} />
            ),
          }}
        >
          {processedContent}
        </ReactMarkdown>
      </div>

      {/* Sticky TOC sidebar */}
      {headings.length > 2 && (
        <div className="hidden xl:block w-52 shrink-0">
          <div className="sticky top-4">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">On this page</h4>
            <ul className="space-y-1 border-l border-border">
              {headings.map((h, i) => (
                <li key={i} style={{ paddingLeft: `${(h.level - 1) * 8}px` }}>
                  <button
                    onClick={() => scrollToHeading(makeId(h.text))}
                    className="text-sm text-muted-foreground hover:text-primary truncate w-full text-left pl-3 py-1 hover:border-l-2 hover:border-primary -ml-[1px] transition-colors"
                  >
                    {h.text}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
