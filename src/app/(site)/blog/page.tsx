import Link from "next/link";
import type { Metadata } from "next";
import { Breadcrumbs, Container, CtaSlab, Section } from "@/components/ui";
import { categoriesWithCounts, postUrl, publishedPosts } from "@/lib/blog";
import { categoryBySlug } from "@/content/categories";
import { pageMetadata } from "@/lib/seo";

const hasPosts = publishedPosts().length > 0;

export const metadata: Metadata = pageMetadata({
  title: "Field guides: honest dating and self-improvement advice for men",
  description:
    "Specific, research-backed guides for the moments men search for at 2 a.m.: texting, reading her signals, first dates, the talking stage, rejection, relationships and becoming the man.",
  path: "/blog",
  noindex: !hasPosts,
});

export default function BlogHub() {
  const cats = categoriesWithCounts();
  const posts = publishedPosts();
  const featured = posts.filter((p) => p.featured).slice(0, 3);
  const latest = posts.slice(0, 6);

  return (
    <>
      <Container className="pt-10 sm:pt-14">
        <Breadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: "Guides", path: "/blog" },
          ]}
        />
        <div className="mt-6 max-w-3xl">
          <p className="eyebrow eyebrow-accent">Field guides</p>
          <h1 className="display mt-4 text-[2.6rem] text-ink sm:text-[3.8rem]">Specific answers for specific moments.</h1>
          <p className="mt-5 text-[1.12rem] leading-relaxed text-ink-3">
            One question per guide, answered honestly: what it usually means, what to do next, and what not to do. Organized the way
            the night actually goes.
          </p>
        </div>
      </Container>

      {featured.length ? (
        <Section className="!pt-14">
          <h2 className="eyebrow">Start here</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {featured.map((p) => (
              <Link key={postUrl(p)} href={postUrl(p)} className="slab slab-hover p-6">
                <span className="text-[0.8rem] font-semibold text-accent-text">{categoryBySlug(p.category)?.name}</span>
                <span className="headline mt-2 block text-[1.3rem] text-ink">{p.title}</span>
                <span className="mt-3 block text-[0.94rem] text-ink-3">{p.description}</span>
              </Link>
            ))}
          </div>
        </Section>
      ) : null}

      <Section className="!pt-14">
        <h2 className="eyebrow">Browse by topic</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cats.map((c) => {
            const inner = (
              <>
                <span className="flex items-center justify-between gap-3">
                  <span className="text-[1.15rem] font-semibold text-ink">{c.name}</span>
                  <span className={`tag ${c.count ? "tag-accent" : ""}`}>{c.count ? `${c.count} guide${c.count === 1 ? "" : "s"}` : "Soon"}</span>
                </span>
                <span className="mt-3 text-[0.94rem] leading-relaxed text-ink-3">{c.description}</span>
              </>
            );
            // Empty topics stay visible as "Soon" but aren't links: their hub pages are noindex.
            return c.count ? (
              <Link key={c.slug} href={`/blog/${c.slug}`} className="slab slab-hover flex flex-col p-6">
                {inner}
              </Link>
            ) : (
              <div key={c.slug} className="slab flex flex-col p-6 opacity-75">
                {inner}
              </div>
            );
          })}
        </div>
      </Section>

      {latest.length ? (
        <Section className="!pt-14">
          <h2 className="eyebrow">Latest</h2>
          <ul className="slab mt-4 divide-y divide-[var(--line)] px-2">
            {latest.map((p) => (
              <li key={postUrl(p)}>
                <Link href={postUrl(p)} className="flex flex-col gap-1 rounded-2xl px-4 py-4 hover:bg-slab-2 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-[1.02rem] font-semibold text-ink">{p.title}</span>
                  <span className="text-[0.85rem] text-ink-4">{categoryBySlug(p.category)?.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      ) : (
        <Section className="!pt-14">
          <div className="slab-inset p-6 sm:p-8">
            <p className="text-[1.02rem] font-semibold text-ink">The first guides are being written now.</p>
            <p className="mt-2 max-w-2xl text-[0.98rem] leading-relaxed text-ink-3">
              In the meantime, the{" "}
              <Link href="/situations" className="text-accent-text underline underline-offset-4">
                Situation Finder
              </Link>{" "}
              answers 36 of the most common questions in a sentence or two, and{" "}
              <Link href="/book/sample" className="text-accent-text underline underline-offset-4">
                Part 1 of the book
              </Link>{" "}
              is free to read.
            </p>
          </div>
        </Section>
      )}

      <Section>
        <CtaSlab />
      </Section>
    </>
  );
}
