import Link from "next/link";
import { Breadcrumbs, Container, CtaSlab, Section } from "@/components/ui";
import { JsonLd } from "@/components/JsonLd";
import { chapterById } from "@/content/book";
import type { Category } from "@/content/categories";
import { PAGE_SIZE, postUrl, type Post } from "@/lib/blog";
import { absoluteUrl } from "@/lib/seo";
import { ALL_SITUATIONS } from "@/content/situations";

export function CategoryView({ cat, posts, page }: { cat: Category; posts: Post[]; page: number }) {
  const totalPages = Math.max(1, Math.ceil(posts.length / PAGE_SIZE));
  const slice = posts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const base = `/blog/${cat.slug}`;
  const pageHref = (n: number) => (n === 1 ? base : `${base}/page/${n}`);
  const situations = ALL_SITUATIONS.filter((s) => cat.chapters.includes(s.chapter)).slice(0, 6);

  return (
    <>
      {slice.length ? (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: cat.title,
            description: cat.description,
            url: absoluteUrl(pageHref(page)),
            mainEntity: {
              "@type": "ItemList",
              itemListElement: slice.map((p, i) => ({ "@type": "ListItem", position: (page - 1) * PAGE_SIZE + i + 1, url: absoluteUrl(postUrl(p)), name: p.title })),
            },
          }}
        />
      ) : null}
      <Container className="pt-10 sm:pt-14">
        <Breadcrumbs
          items={[
            { name: "Guides", path: "/blog" },
            { name: cat.name, path: base },
            ...(page > 1 ? [{ name: `Page ${page}`, path: pageHref(page) }] : []),
          ]}
        />
        <div className="mt-6 max-w-3xl">
          <p className="eyebrow eyebrow-accent">{cat.name}</p>
          <h1 className="display mt-4 text-[2.3rem] text-ink sm:text-[3.3rem]">{cat.title}</h1>
          <p className="mt-5 text-[1.1rem] leading-relaxed text-ink-3">{cat.intro}</p>
        </div>
        {cat.guide?.length && page === 1 ? (
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {cat.guide.map((g) => (
              <section key={g.q} className="slab-inset p-5 sm:p-6">
                <h2 className="text-[1.08rem] font-semibold leading-snug text-ink">{g.q}</h2>
                <p className="mt-2 text-[0.97rem] leading-relaxed text-ink-3">{g.a}</p>
              </section>
            ))}
          </div>
        ) : null}
      </Container>

      <Section className="!pt-12">
        {slice.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {slice.map((p) => (
              <Link key={postUrl(p)} href={postUrl(p)} className="slab slab-hover flex flex-col p-6 sm:p-7">
                <span className="headline text-[1.3rem] text-ink">{p.title}</span>
                <span className="mt-3 text-[0.96rem] leading-relaxed text-ink-3">{p.description}</span>
                <span className="mt-auto pt-5 text-[0.82rem] text-ink-4">
                  {p.readingMinutes} min read · Updated {p.updatedAt}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="slab-inset p-6 sm:p-8">
            <p className="text-[1.02rem] font-semibold text-ink">Guides for this topic are on the way.</p>
            <p className="mt-2 text-[0.98rem] text-ink-3">
              Meanwhile, here’s where the book handles it, and the quick answers from the Situation Finder.
            </p>
          </div>
        )}

        {totalPages > 1 ? (
          <nav aria-label="Pagination" className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {page > 1 ? (
              <Link href={pageHref(page - 1)} className="btn btn-ghost btn-sm" rel="prev">
                ← Newer
              </Link>
            ) : null}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <Link
                key={n}
                href={pageHref(n)}
                aria-current={n === page ? "page" : undefined}
                className={`grid h-10 w-10 place-items-center rounded-full text-[0.92rem] font-semibold ${n === page ? "bg-ink text-void" : "bg-slab-2 text-ink-3 hover:text-ink"}`}
              >
                {n}
              </Link>
            ))}
            {page < totalPages ? (
              <Link href={pageHref(page + 1)} className="btn btn-ghost btn-sm" rel="next">
                Older →
              </Link>
            ) : null}
          </nav>
        ) : null}
      </Section>

      <Section className="!pt-14">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="slab p-6 sm:p-7">
            <p className="eyebrow">In the book</p>
            <ul className="mt-4 space-y-2">
              {cat.chapters.map((id) => {
                const c = chapterById(id);
                return c ? (
                  <li key={id} className="flex gap-3 text-[0.95rem]">
                    <span className="w-10 shrink-0 font-semibold text-accent-text">{c.id}</span>
                    <span className="text-ink-2">{c.title}</span>
                  </li>
                ) : null;
              })}
            </ul>
            <Link href="/book#contents" className="mt-5 inline-flex min-h-[44px] items-center text-[0.95rem] font-semibold text-accent-text hover:underline">
              See the full contents →
            </Link>
          </div>
          {situations.length ? (
            <div className="slab p-6 sm:p-7">
              <p className="eyebrow">Quick answers</p>
              <ul className="mt-4 space-y-4">
                {situations.map((s) => (
                  <li key={s.slug}>
                    <Link href={`/situations#${s.slug}`} className="group block">
                      <span className="block text-[1rem] font-semibold text-ink group-hover:underline">{s.quote}</span>
                      <span className="mt-1 line-clamp-2 block text-[0.9rem] text-ink-3">{s.first}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </Section>

      <Section>
        <CtaSlab />
      </Section>
    </>
  );
}
