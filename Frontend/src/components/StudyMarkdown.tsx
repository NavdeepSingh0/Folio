import { memo, useMemo, useState, type ComponentPropsWithoutRef } from "react";
import ReactMarkdown, { defaultUrlTransform, type ExtraProps } from "react-markdown";
import remarkGfm from "remark-gfm";

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

function StudyMarkdown({ content, zoom }: StudyMarkdownProps) {
  const prepared = useMemo(() => convertHtmlImages(content), [content]);
  return (
    <article className="markdown-body transition-all bg-transparent" style={{ fontSize: `${zoom}%` }}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} urlTransform={transformUrl} components={{ img: MarkdownImage }}>
        {prepared}
      </ReactMarkdown>
    </article>
  );
}

export default memo(StudyMarkdown);
