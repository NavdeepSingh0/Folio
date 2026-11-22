import { memo, useMemo, useState, type ComponentPropsWithoutRef, type MouseEvent } from "react";
import ReactMarkdown, { defaultUrlTransform, type ExtraProps } from "react-markdown";
import CodeBlock from "./CodeBlock";
import { remarkPlugins, rehypePlugins } from "../lib/markdownPlugins";
import rehypeHeadingIds, { HEADING_ID_PREFIX } from "../utils/rehypeHeadingIds";

interface StudyMarkdownProps {
  content: string;
  zoom: number;
}

// Only raster base64 images are allowed; svg+xml and every other data: URI stay blocked.
const SAFE_DATA_IMAGE = /^data:image\/(png|jpe?g|gif|webp|bmp|avif);base64,[a-z0-9+/=\s]+$/i;

function transformUrl(url: string, key: string) {
  if (key === "src" && SAFE_DATA_IMAGE.test(url)) return url.replace(/\s+/g, "");
  return defaultUrlTransform(url);
}

function readAttr(tag: string, name: string): string | undefined {
  const match = tag.match(new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"));
  return match ? (match[1] ?? match[2] ?? match[3]) : undefined;
}

// Raw HTML stays disabled; HTML <img> tags are rewritten to Markdown image syntax
// so they go through the same URL sanitization as ![alt](src).
function convertHtmlImages(md: string) {
  return md.replace(/<img\b[^>]*>/gim, (tag) => {
    const src = readAttr(tag, "src");
    if (!src) return "";
    const alt = (readAttr(tag, "alt") ?? "").replace(/[[\]]/g, "\\$&");
    const title = readAttr(tag, "title");
    const safeSrc = src.replace(/\s+/g, "").replace(/\(/g, "%28").replace(/\)/g, "%29");
    const titlePart = title ? ` "${title.replace(/"/g, '\\"')}"` : "";
    return `![${alt}](${safeSrc}${titlePart})`;
  });
}

function MarkdownImage({ node: _node, src, alt, title }: ComponentPropsWithoutRef<"img"> & ExtraProps) {
  const [failed, setFailed] = useState(false);
  if (failed || !src) {
    return (
      <span role="img" aria-label={alt ?? ""} className="text-muted-foreground">
        [image{alt ? `: ${alt}` : ""}]
      </span>
    );
  }
  return (
    <img
      src={src}
      alt={alt ?? ""}
      title={title}
      loading="lazy"
      decoding="async"
      style={{ maxWidth: "100%", height: "auto" }}
      className="rounded-[10px] my-4"
      onError={() => setFailed(true)}
    />
  );
}

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

// In-note links such as [Section 2](#2-jsp--servlet-vs-jsp) scroll to the matching heading.
// The lookup is scoped to this article, so split view (two notes with the same headings)
// and the URL hash stay untouched.
function MarkdownLink({ node: _node, href, children, ...rest }: ComponentPropsWithoutRef<"a"> & ExtraProps) {
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!href || !href.startsWith("#") || href.length < 2) return;
    const targetId = HEADING_ID_PREFIX + safeDecode(href.slice(1));
    const article = e.currentTarget.closest("article");
    const target = article
      ? Array.from(article.querySelectorAll<HTMLElement>("h1, h2, h3, h4, h5, h6")).find((h) => h.id === targetId)
      : undefined;
    if (!target) return; // no such heading: leave the browser's default behaviour alone
    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  return (
    <a {...rest} href={href} onClick={handleClick}>
      {children}
    </a>
  );
}

// Hoisted so ReactMarkdown gets stable references across renders
const components = { img: MarkdownImage, code: CodeBlock, a: MarkdownLink };
// Headings get ids only for notes (not chat bubbles, which share rehypePlugins)
const noteRehypePlugins = [rehypeHeadingIds, ...rehypePlugins];

function StudyMarkdown({ content, zoom }: StudyMarkdownProps) {
  const prepared = useMemo(() => convertHtmlImages(content), [content]);
  return (
    <article className="markdown-body bg-transparent" style={{ fontSize: `${zoom}%` }}>
      <ReactMarkdown remarkPlugins={remarkPlugins} rehypePlugins={noteRehypePlugins} urlTransform={transformUrl} components={components}>
        {prepared}
      </ReactMarkdown>
    </article>
  );
}

export default memo(StudyMarkdown);
