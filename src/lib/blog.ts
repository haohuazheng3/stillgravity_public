import "server-only";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import GithubSlugger from "github-slugger";
import { CATEGORIES, categoryBySlug } from "@/content/categories";

/*
 * Publishing pipeline: an article is one file, content/blog/<category>/<slug>.mdx (or .md),
 * with frontmatter. Commit + push → Vercel builds → the article, its category hub,
 * the sitemap and llms.txt all update; scripts/indexnow.mjs pings search engines.
 * Drafts (draft: true) and future-dated posts never render publicly; the owner can
 * preview them at /admin/preview/<category>/<slug>.
 */

export interface PostImage {
  src: string;
  alt: string;
  credit?: string;
  creditUrl?: string;
  width?: number;
  height?: number;
}

export interface PostFaq {
  q: string;
  a: string;
}

/** B-level pages open with a conclusion card: the answer first, then the article. */
export interface PostVerdict {
  answer: string;
  points: string[];
}

export interface Post {
  slug: string;
  category: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt: string;
  keywords: string[];
  featured: boolean;
  draft: boolean;
  faq: PostFaq[];
  image: PostImage | null;
  chapters: string[];
  /** Tool-first page: id of the interactive tool shown above the article. */
  tool: string | null;
  /** Intent level from the keyword plan: A = tool/action, B = decision. */
  level: "A" | "B" | null;
  verdict: PostVerdict | null;
  body: string;
  format: "md" | "mdx";
  wordCount: number;
  readingMinutes: number;
  headings: { id: string; text: string }[];
}

const ROOT = path.join(process.cwd(), "content", "blog");
let cache: Post[] | null = null;

function toIsoDate(v: unknown, fallback: string): string {
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}/.test(v)) return v.slice(0, 10);
  return fallback;
}

export function extractHeadings(body: string): { id: string; text: string }[] {
  const slugger = new GithubSlugger();
  const out: { id: string; text: string }[] = [];
  let inFence = false;
  for (const raw of body.split("\n")) {
    const line = raw.trimEnd();
    if (/^```/.test(line)) inFence = !inFence;
    if (inFence) continue;
    const m = /^##\s+(.+?)\s*#*$/.exec(line);
    if (m) {
      const text = m[1].replace(/[*_`]/g, "").trim();
      out.push({ id: slugger.slug(text), text });
    }
  }
  return out;
}

function load(): Post[] {
  if (cache) return cache;
  const posts: Post[] = [];
  if (fs.existsSync(ROOT)) {
    for (const cat of fs.readdirSync(ROOT, { withFileTypes: true })) {
      if (!cat.isDirectory() || !categoryBySlug(cat.name)) continue;
      const dir = path.join(ROOT, cat.name);
      for (const f of fs.readdirSync(dir)) {
        const m = /^([a-z0-9][a-z0-9-]*)\.(mdx?)$/.exec(f);
        if (!m) continue; // files starting with "_" or other names are ignored
        const raw = fs.readFileSync(path.join(dir, f), "utf8");
        const { data, content } = matter(raw);
        const published = toIsoDate(data.publishedAt, "2099-01-01");
        const words = content.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
        posts.push({
          slug: m[1],
          category: cat.name,
          title: String(data.title ?? m[1]),
          description: String(data.description ?? ""),
          publishedAt: published,
          updatedAt: toIsoDate(data.updatedAt, published),
          keywords: Array.isArray(data.keywords) ? data.keywords.map(String) : [],
          featured: data.featured === true,
          draft: data.draft === true,
          faq: Array.isArray(data.faq) ? (data.faq as PostFaq[]).filter((x) => x && x.q && x.a) : [],
          image: data.image && typeof data.image === "object" ? (data.image as PostImage) : null,
          chapters: Array.isArray(data.chapters) ? data.chapters.map(String) : [],
          tool: typeof data.tool === "string" ? data.tool : null,
          level: data.level === "A" || data.level === "B" ? data.level : null,
          verdict:
            data.verdict && typeof data.verdict === "object" && typeof data.verdict.answer === "string"
              ? { answer: String(data.verdict.answer), points: Array.isArray(data.verdict.points) ? data.verdict.points.map(String) : [] }
              : null,
          body: content,
          format: m[2] === "md" ? "md" : "mdx",
          wordCount: words,
          readingMinutes: Math.max(1, Math.round(words / 230)),
          headings: extractHeadings(content),
        });
      }
    }
  }
  posts.sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
  cache = posts;
  return posts;
}

function isLive(p: Post, now = new Date().toISOString().slice(0, 10)): boolean {
  return !p.draft && p.publishedAt <= now;
}

export function publishedPosts(): Post[] {
  return load().filter((p) => isLive(p));
}

export function allPostsIncludingDrafts(): Post[] {
  return load();
}

export function postsInCategory(category: string): Post[] {
  return publishedPosts().filter((p) => p.category === category);
}

export function getPost(category: string, slug: string, opts: { includeDrafts?: boolean } = {}): Post | null {
  const p = load().find((x) => x.category === category && x.slug === slug);
  if (!p) return null;
  if (!opts.includeDrafts && !isLive(p)) return null;
  return p;
}

export function postUrl(p: Pick<Post, "category" | "slug">): string {
  return `/blog/${p.category}/${p.slug}`;
}

export function relatedPosts(post: Post, n = 3): Post[] {
  const kw = new Set(post.keywords.map((k) => k.toLowerCase()));
  return publishedPosts()
    .filter((p) => !(p.category === post.category && p.slug === post.slug))
    .map((p) => {
      let score = p.category === post.category ? 3 : 0;
      for (const k of p.keywords) if (kw.has(k.toLowerCase())) score += 2;
      for (const c of p.chapters) if (post.chapters.includes(c)) score += 1;
      return { p, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, n)
    .map((x) => x.p);
}

export const PAGE_SIZE = 12;

export function categoriesWithCounts() {
  const live = publishedPosts();
  return CATEGORIES.map((c) => ({ ...c, count: live.filter((p) => p.category === c.slug).length }));
}

/** Phrases that the article renderer turns into internal links (first occurrence only). */
export function autolinkTerms(): { phrase: string; href: string }[] {
  const terms: { phrase: string; href: string }[] = [];
  for (const p of publishedPosts()) {
    for (const k of p.keywords.slice(0, 3)) {
      if (k.length >= 8) terms.push({ phrase: k, href: postUrl(p) });
    }
  }
  terms.push({ phrase: "Situation Finder", href: "/situations" });
  terms.push({ phrase: "the friend zone", href: "/blog/signals" });
  terms.push({ phrase: "situationship", href: "/blog/talking-stage" });
  return terms;
}
