import React, { memo, useEffect, useMemo, useRef } from 'react';
import { View, ActivityIndicator, useColorScheme as useSystemColorScheme } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { WebView } from 'react-native-webview';

interface MobileMarkdownProps {
  content: string;
  searchQuery?: string;
  searchTrigger?: number;
  initialScrollY?: number;
  onScroll?: (y: number) => void;
}

function MobileMarkdown({ content, searchQuery, searchTrigger = 0, initialScrollY = 0, onScroll }: MobileMarkdownProps) {
  const webViewRef = useRef<WebView>(null);
  const onScrollRef = useRef(onScroll);
  const { theme } = useThemeStore();
  const sysColorScheme = useSystemColorScheme();
  const isDark = theme === 'dark' || (theme === 'system' && sysColorScheme === 'dark');
  const prevTrigger = useRef(searchTrigger);

  useEffect(() => {
    onScrollRef.current = onScroll;
  }, [onScroll]);

  // Inject search query whenever it changes
  useEffect(() => {
    if (webViewRef.current) {
      if (searchQuery && searchQuery.trim() !== '') {
        const isBackwards = searchTrigger < prevTrigger.current;
        prevTrigger.current = searchTrigger;
        
        const escapedSearchQuery = JSON.stringify(searchQuery);
        webViewRef.current.injectJavaScript(`
          if (window.find) {
            window.find(${escapedSearchQuery}, false, ${isBackwards}, true, false, true, false);
          }
          true;
        `);
      }
    }
  }, [searchQuery, searchTrigger]);

  const htmlContent = useMemo(() => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
      
      <!-- GitHub Markdown CSS -->
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.5.0/github-markdown-${isDark ? 'dark' : 'light'}.min.css">
      
      <!-- Highlight.js (Dark theme for code blocks) -->
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css">
      <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
      
      <!-- KaTeX -->
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
      <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
      
      <!-- Marked.js + KaTeX extension -->
      <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/marked-katex-extension/lib/index.umd.js"></script>
      <!-- Scroll Sync Script -->
      <script>
        window.addEventListener('scroll', () => {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'scroll', y: window.scrollY }));
        });
        window.onload = () => {
          setTimeout(() => {
            window.scrollTo(0, ${initialScrollY});
          }, 50);
        };
      </script>

      <style>
        ::-webkit-scrollbar { display: none; }
        body {
          background-color: ${isDark ? '#151516' : '#FAFAFC'} !important;
          padding: 16px;
          margin: 0;
        }
        .markdown-body {
          box-sizing: border-box;
          min-width: 200px;
          max-width: 980px;
          margin: 0 auto;
          background-color: transparent !important;
          color: ${isDark ? '#E0E0E0' : '#121212'} !important;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        /* Ensure headers match theme */
        .markdown-body h1, .markdown-body h2, .markdown-body h3, .markdown-body h4, .markdown-body h5, .markdown-body h6 {
          color: ${isDark ? '#E0E0E0' : '#121212'} !important;
        }
        /* Code blocks */
        .markdown-body pre {
          background-color: #1E1E2E !important;
        }
        .markdown-body pre code {
          color: #CDD6F4 !important; /* light text for dark background */
        }
        /* Override github markdown tables to allow horizontal scrolling */
        .markdown-body table {
          display: block;
          width: 100%;
          width: max-content;
          max-width: 100%;
          overflow: auto;
        }
        ::selection {
          background-color: #3b82f6;
          color: #ffffff;
        }
        mark {
          background-color: #3b82f6;
          color: #ffffff;
        }
      </style>
    </head>
    <body>
      <div id="content" class="markdown-body"></div>

      <script>
        const rawMarkdown = ${JSON.stringify(content)};
        
        // Setup marked with KaTeX
        marked.use(window.markedKatex({ throwOnError: false }));
        
        // Parse and inject HTML
        document.getElementById('content').innerHTML = marked.parse(rawMarkdown);

        // Highlight code blocks
        document.querySelectorAll('pre code').forEach((block) => {
          hljs.highlightElement(block);
        });
      </script>
    </body>
    </html>
  `, [content, initialScrollY, isDark]);
  const webViewSource = useMemo(() => ({ html: htmlContent }), [htmlContent]);

  if (!content) return null;

  return (
    <View className="flex-1 min-h-[800px] bg-background">
      <WebView
        ref={webViewRef}
        source={webViewSource}
        style={{ flex: 1, backgroundColor: 'transparent' }}
        scalesPageToFit={false}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        onMessage={(event) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'scroll' && onScrollRef.current) {
              onScrollRef.current(data.y);
            }
          } catch (e) {}
        }}
        originWhitelist={['*']}
        startInLoadingState={true}
        renderLoading={() => (
          <View className="absolute inset-0 justify-center items-center bg-background">
            <ActivityIndicator size="large" color={isDark ? '#E0E0E0' : '#121212'} />
          </View>
        )}
      />
    </View>
  );
}

export default memo(MobileMarkdown, (previous, next) => (
  previous.content === next.content &&
  previous.searchQuery === next.searchQuery &&
  previous.searchTrigger === next.searchTrigger &&
  previous.initialScrollY === next.initialScrollY &&
  previous.onScroll === next.onScroll
));
