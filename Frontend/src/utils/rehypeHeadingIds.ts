// Gives every heading a GitHub-style id so in-note table-of-contents links
// ([Title](#1-some-heading)) have something to jump to.
//
// Ids carry a prefix (as GitHub does) so a heading called "Location" or "Name"
// can never shadow a global like window.location through named-element access.

interface HastNode {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
}

export const HEADING_ID_PREFIX = "user-content-";

// GitHub's rule: lowercase, drop everything except letters, digits, marks, "_" and "-",
// then turn each space into "-" ("A & B" becomes "a--b").
export function slugifyHeading(text: string): string {
  return text.trim().toLowerCase().replace(/[^\p{L}\p{N}\p{M}_ -]/gu, "").replace(/ /g, "-");
}

function textOf(node: HastNode): string {
  if (node.type === "text") return node.value ?? "";
  return (node.children ?? []).map(textOf).join("");
}

export default function rehypeHeadingIds() {
  return (tree: HastNode) => {
    const seen = new Map<string, number>();

    const visit = (node: HastNode) => {
      if (node.type === "element" && node.tagName && /^h[1-6]$/.test(node.tagName)) {
        const base = slugifyHeading(textOf(node));
        if (base) {
          const count = seen.get(base) ?? 0;
          seen.set(base, count + 1);
          const slug = count === 0 ? base : `${base}-${count}`; // repeated titles: foo, foo-1, foo-2
          node.properties = { ...node.properties, id: HEADING_ID_PREFIX + slug };
        }
      }
      node.children?.forEach(visit);
    };

    visit(tree);
  };
}
