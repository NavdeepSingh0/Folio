import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // Simple regex to extract H2 headings for TOC
  const headings = useMemo(() => {
    const matches = Array.from(content.matchAll(/^##\s+(.+)$/gm));
    return matches.map(m => m[1]);
  }, [content]);

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
                <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg" {...props} />
              </div>
            ),
            th: ({node, ...props}) => <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" {...props} />,
            td: ({node, ...props}) => <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border-t border-gray-200" {...props} />,
          }}
        >
          {content}
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
