import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // Process YAML frontmatter into a Markdown table
  const processedContent = useMemo(() => {
    let text = content;
    const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
    const match = text.match(frontmatterRegex);
    
    if (match) {
      const yamlContent = match[1];
      const lines = yamlContent.split('\n');
      
      let tableMd = '| Property | Value |\n| :--- | :--- |\n';
      
      let currentKey = '';
      let currentValue = '';
      
      for (const line of lines) {
        if (line.trim() === '') continue;
        
        const colonIndex = line.indexOf(':');
        if (colonIndex !== -1 && !line.startsWith(' ')) {
          // New key-value pair
          if (currentKey) {
            tableMd += `| **${currentKey}** | ${currentValue.trim()} |\n`;
          }
          currentKey = line.substring(0, colonIndex).trim();
          currentValue = line.substring(colonIndex + 1).trim();
        } else {
          // Continuation of previous value (e.g., nested yaml or multi-line)
          currentValue += ' ' + line.trim();
        }
      }
      
      if (currentKey) {
        tableMd += `| **${currentKey}** | ${currentValue.trim()} |\n`;
      }
      
      text = text.replace(frontmatterRegex, tableMd + '\n');
    }
    
    return text;
  }, [content]);

  // Simple regex to extract H2 headings for TOC
  const headings = useMemo(() => {
    const matches = Array.from(processedContent.matchAll(/^##\s+(.+)$/gm));
    return matches.map(m => m[1]);
  }, [processedContent]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="flex relative">
      <div className="flex-1 min-w-0 pr-8">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          components={{
            h2: ({node, ...props}) => {
              const id = props.children?.toString().toLowerCase().replace(/[^\w]+/g, '-');
              return <h2 id={id} className="scroll-mt-6" {...props} />
            },
            table: ({node, ...props}) => (
              <div className="overflow-x-auto my-6">
                <table className="min-w-full divide-y divide-border border border-border rounded-lg bg-card" {...props} />
              </div>
            ),
            th: ({node, ...props}) => <th className="px-4 py-3 bg-muted/50 text-left text-sm font-semibold text-foreground uppercase tracking-wider" {...props} />,
            td: ({node, ...props}) => <td className="px-4 py-3 whitespace-normal text-sm text-muted-foreground border-t border-border" {...props} />,
          }}
        >
          {processedContent}
        </ReactMarkdown>
      </div>

      {headings.length > 0 && (
        <div className="hidden lg:block w-48 shrink-0">
          <div className="sticky top-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">On this page</h4>
            <ul className="space-y-2 border-l-2 border-gray-100">
              {headings.map((h, i) => (
                <li key={i}>
                  <button 
                    onClick={() => scrollToHeading(h.toLowerCase().replace(/[^\w]+/g, '-'))}
                    className="text-sm text-gray-600 hover:text-blue-600 truncate w-full text-left pl-3 py-1 hover:border-l-2 hover:border-blue-600 -ml-[2px] transition-colors"
                  >
                    {h}
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
