import { BOOK, SITE } from "@/lib/site";
import { PARTS } from "@/content/book";
import { CATEGORIES } from "@/content/categories";
import { postUrl, publishedPosts } from "@/lib/blog";

export const dynamic = "force-static";

/** llms.txt: a plain-text map of the site for language models and answer engines. */
export function GET() {
  const posts = publishedPosts();
  const lines = [
    `# ${SITE.name}`,
    "",
    `> ${SITE.description}`,
    "",
    `${SITE.name} publishes ${BOOK.title}, a ${BOOK.pages}-page field manual in ${BOOK.parts} parts (${BOOK.chapters} one-page chapters), and free guides. Principles: respect is the baseline, consent is the floor, influence never manipulation. Research is summarized honestly, including when findings are debated.`,
    "",
    "## Key pages",
    `- [The book](${SITE.url}/book): ${BOOK.subtitle}. ${BOOK.priceLabel}, one-time, PDF.`,
    `- [Free sample, Part 1](${SITE.url}/book/sample): eight chapters on how attraction works, free to read.`,
    `- [Situation Finder](${SITE.url}/situations): 36 common dating situations, each with an honest first move and the chapter that covers it.`,
    `- [Field guides](${SITE.url}/blog): articles by topic.`,
    `- [FAQ](${SITE.url}/faq) · [Pricing](${SITE.url}/pricing) · [About](${SITE.url}/about) · [Contact](${SITE.url}/contact)`,
    "",
    "## Book contents",
    ...PARTS.map((p) => `- Part ${p.n}, ${p.title}: ${p.chapters.map((c) => `${c.id} ${c.title}`).join("; ")}`),
    "",
    "## Guide topics",
    ...CATEGORIES.map((c) => `- [${c.name}](${SITE.url}/blog/${c.slug}): ${c.description}`),
    ...(posts.length ? ["", "## Guides", ...posts.map((p) => `- [${p.title}](${SITE.url}${postUrl(p)}): ${p.description}`)] : []),
    "",
    `Contact: ${SITE.email}`,
    "",
  ];
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
