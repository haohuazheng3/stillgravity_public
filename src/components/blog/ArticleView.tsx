import Link from "next/link";
import Image from "next/image";
import type { ComponentType } from "react";
import { Breadcrumbs, BuyButton, Container, FaqList } from "@/components/ui";
import { JsonLd } from "@/components/JsonLd";
import { BookVisual } from "@/components/BookVisual";
import { Chat, Compare, FieldDrill, Mistake, Points, SayThis, Science, Table, Truth } from "@/components/book/BookBlocks";
import { categoryBySlug } from "@/content/categories";
import { chapterById } from "@/content/book";
import { autolinkTerms, postUrl, relatedPosts, type Post } from "@/lib/blog";
import { renderMdx } from "@/lib/mdx";
import { articleLd, faqLd } from "@/lib/seo";
import { BOOK } from "@/lib/site";

function formatDate(iso: string) {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function BookCTA({ chapter }: { chapter?: string }) {
  const ch = chapter ? chapterById(chapter) : null;
  return (
    <aside className="slab-ink not-prose my-8 flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:p-7">
      <div className="w-24 shrink-0">
        <BookVisual sizes="96px" />
      </div>
      <div className="font-sans">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[#f0b752]">
          {ch ? `Chapter ${ch.id} of ${BOOK.title}` : BOOK.title}
        </p>
        <p className="mt-2 text-[1.05rem] font-semibold text-[#edf0f6]">
          {ch ? ch.title : "The full playbook: 83 one-page chapters"}
        </p>
        <p className="mt-1 text-[0.92rem] text-[#aeb8c8]">Exact words, the weak version beside the good one, and the research behind it.</p>
        <Link href="/book" className="mt-3 inline-flex min-h-[44px] items-center gap-2 text-[0.95rem] font-semibold text-[#f0b752] hover:text-[#f5c76a]">
          See the book · {BOOK.priceLabel} <span aria-hidden>→</span>
        </Link>
      </div>
    </aside>
  );
}

function Callout({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <aside className="slab-inset my-6 px-5 py-4 font-sans text-[0.98rem] leading-relaxed text-ink-2">
      {title ? <p className="mb-1 font-semibold text-ink">{title}</p> : null}
      {children}
    </aside>
  );
}

const COMPONENTS = { SayThis, Truth, FieldDrill, Mistake, Science, Chat, Compare, Table, Points, BookCTA, Callout } as unknown as Record<
  string,
  ComponentType<Record<string, unknown>>
>;

export async function ArticleView({ post, preview = false }: { post: Post; preview?: boolean }) {
  const cat = categoryBySlug(post.category)!;
  const url = postUrl(post);
  const body = await renderMdx(post.body, { format: post.format, components: COMPONENTS, autolink: autolinkTerms(), self: url });
  const related = relatedPosts(post, 3);
  const chapter = post.chapters[0];

  return (
    <>
      {!preview ? <JsonLd data={[articleLd(post, url), ...(post.faq.length ? [faqLd(post.faq)] : [])]} /> : null}
      <Container className="pt-10 sm:pt-14">
        {preview ? (
          <p className="tag tag-accent mb-4">Preview · {post.draft ? "draft" : `scheduled ${post.publishedAt}`} · not public</p>
        ) : null}
        <Breadcrumbs
          items={[
            { name: "Guides", path: "/blog" },
            { name: cat.name, path: `/blog/${cat.slug}` },
            { name: post.title, path: url },
          ]}
        />
        <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
          <article className="min-w-0">
            <header className="max-w-3xl">
              <Link href={`/blog/${cat.slug}`} className="eyebrow eyebrow-accent hover:underline">
                {cat.name}
              </Link>
              <h1 className="display mt-4 text-[2.3rem] text-ink sm:text-[3.2rem]">{post.title}</h1>
              {post.description ? <p className="dek mt-4 text-[1.2rem] leading-snug">{post.description}</p> : null}
              <p className="mt-5 flex flex-wrap gap-x-4 gap-y-1 text-[0.86rem] text-ink-4">
                <span>
                  By <Link href="/about" className="text-ink-3 hover:text-ink">Still Gravity</Link>
                </span>
                <span>
                  Published <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                </span>
                {post.updatedAt !== post.publishedAt ? (
                  <span>
                    Updated <time dateTime={post.updatedAt}>{formatDate(post.updatedAt)}</time>
                  </span>
                ) : null}
                <span>{post.readingMinutes} min read</span>
              </p>
            </header>

            {post.image ? (
              <figure className="slab mt-8 overflow-hidden p-2">
                <Image
                  src={post.image.src}
                  alt={post.image.alt}
                  width={post.image.width ?? 1600}
                  height={post.image.height ?? 1000}
                  priority
                  sizes="(max-width: 1024px) 100vw, 780px"
                  className="h-auto w-full rounded-[22px]"
                />
                {post.image.credit ? (
                  <figcaption className="px-3 pb-1 pt-2 text-[0.78rem] text-ink-4">
                    Photo:{" "}
                    {post.image.creditUrl ? (
                      <a href={post.image.creditUrl} rel="nofollow noopener" target="_blank" className="underline">
                        {post.image.credit}
                      </a>
                    ) : (
                      post.image.credit
                    )}
                  </figcaption>
                ) : null}
              </figure>
            ) : null}

            {post.headings.length >= 3 ? (
              <nav aria-label="On this page" className="slab-inset mt-8 p-5 lg:hidden">
                <p className="eyebrow">On this page</p>
                <ol className="mt-2 space-y-1 text-[0.95rem]">
                  {post.headings.map((h) => (
                    <li key={h.id}>
                      <a href={`#${h.id}`} className="text-ink-3 hover:text-ink">
                        {h.text}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            ) : null}

            <div className="slab mt-8 px-5 py-8 sm:px-10 sm:py-12">
              <div className="prose-sg">{body}</div>
            </div>

            {post.faq.length ? (
              <section className="mt-10" aria-labelledby="faq">
                <h2 id="faq" className="headline mb-5 text-[1.7rem] text-ink">
                  Questions men ask
                </h2>
                <FaqList faqs={post.faq} />
              </section>
            ) : null}

            <BookCTA chapter={chapter} />

            {related.length ? (
              <section className="mt-10" aria-labelledby="related">
                <h2 id="related" className="eyebrow">
                  Keep reading
                </h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  {related.map((r) => (
                    <Link key={postUrl(r)} href={postUrl(r)} className="slab slab-hover p-5">
                      <span className="text-[0.78rem] font-semibold text-accent-text">{categoryBySlug(r.category)?.name}</span>
                      <span className="mt-2 block text-[1.02rem] font-semibold leading-snug text-ink">{r.title}</span>
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}
          </article>

          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-4">
              {post.headings.length >= 3 ? (
                <nav aria-label="On this page" className="slab p-5">
                  <p className="eyebrow">On this page</p>
                  <ol className="mt-3 space-y-1.5 text-[0.9rem]">
                    {post.headings.map((h) => (
                      <li key={h.id}>
                        <a href={`#${h.id}`} className="block rounded-lg px-2 py-1 text-ink-3 hover:bg-slab-2 hover:text-ink">
                          {h.text}
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
              ) : null}
              <div className="slab p-5">
                <p className="text-[0.95rem] font-semibold text-ink">{BOOK.title}</p>
                <p className="mt-1 text-[0.86rem] text-ink-3">83 chapters for the moments that keep men up at night.</p>
                <BuyButton size="md" className="btn-block mt-4" />
                <Link href="/book/sample" className="btn btn-quiet btn-sm btn-block mt-2">
                  Read Part 1 free
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </Container>
    </>
  );
}
