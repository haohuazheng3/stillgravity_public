import "server-only";
import { evaluate } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import type { ComponentType, ReactNode } from "react";

/* Minimal hast types so the autolink plugin needs no extra dependency. */
type HastText = { type: "text"; value: string };
type HastElement = { type: "element"; tagName: string; properties?: Record<string, unknown>; children: HastNode[] };
type HastNode = HastText | HastElement | { type: string; children?: HastNode[]; value?: string };

const SKIP_TAGS = new Set(["a", "h1", "h2", "h3", "h4", "code", "pre", "figcaption", "button"]);

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Automatic internal links: the first occurrence of each known phrase in body text
 * becomes a link to its article or hub. Never inside headings, links or code; never
 * a link to the page itself; at most `max` links per article.
 */
function rehypeAutolink(options: { terms: { phrase: string; href: string }[]; self?: string; max?: number }) {
  const max = options.max ?? 5;
  return (tree: HastNode) => {
    const used = new Set<string>();
    let added = 0;
    const terms = options.terms
      .filter((t) => t.href !== options.self)
      .sort((a, b) => b.phrase.length - a.phrase.length);

    const walk = (node: HastNode, inSkip: boolean) => {
      if (added >= max) return;
      const el = node as HastElement;
      if (!("children" in node) || !Array.isArray(el.children)) return;
      const skip = inSkip || (node.type === "element" && SKIP_TAGS.has(el.tagName));
      for (let i = 0; i < el.children.length; i++) {
        const child = el.children[i];
        if (child.type === "text" && !skip) {
          const text = (child as HastText).value;
          for (const t of terms) {
            if (added >= max) break;
            if (used.has(t.href) || used.has(t.phrase.toLowerCase())) continue;
            const re = new RegExp(`\\b(${escapeRegExp(t.phrase)})\\b`, "i");
            const m = re.exec(text);
            if (!m) continue;
            const before = text.slice(0, m.index);
            const after = text.slice(m.index + m[0].length);
            const link: HastElement = {
              type: "element",
              tagName: "a",
              properties: { href: t.href, "data-autolink": "true" },
              children: [{ type: "text", value: m[0] }],
            };
            el.children.splice(i, 1, { type: "text", value: before }, link, { type: "text", value: after });
            used.add(t.href);
            used.add(t.phrase.toLowerCase());
            added++;
            break;
          }
        } else {
          walk(child, skip);
        }
      }
    };
    walk(tree, false);
  };
}

export async function renderMdx(
  source: string,
  opts: {
    format: "md" | "mdx";
    components?: Record<string, ComponentType<Record<string, unknown>>>;
    autolink?: { phrase: string; href: string }[];
    self?: string;
  },
): Promise<ReactNode> {
  const { default: Content } = await evaluate(source, {
    ...(runtime as unknown as Parameters<typeof evaluate>[1]),
    format: opts.format,
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypeSlug, [rehypeAutolink, { terms: opts.autolink ?? [], self: opts.self }]],
    development: false,
  });
  return <Content components={opts.components} />;
}
