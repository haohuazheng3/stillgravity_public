import Link from "next/link";
import Image from "next/image";
import type { ComponentType } from "react";
import { Breadcrumbs, BuyButton, Container, FaqList } from "@/components/ui";
import { JsonLd } from "@/components/JsonLd";
import { BookVisual } from "@/components/BookVisual";
import { Chat, Compare, FieldDrill, Mistake, Points, SayThis, Science, Table, Truth } from "@/components/book/BookBlocks";
import { categoryBySlug } from "@/content/categories";
import { ALL_CHAPTERS, chapterById } from "@/content/book";
import { toolById, toolChapters } from "@/content/tools";
import { ToolRunner, type ChapterInfo } from "@/components/tools/ToolRunner";
import { autolinkTerms, postUrl, relatedPosts, type Post } from "@/lib/blog";
import { renderMdx } from "@/lib/mdx";
import { articleLd, faqLd, webAppLd } from "@/lib/seo";
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
          {ch ? `Chapter ${ch.id} of ${BOOK.displayTitle}` : BOOK.displayTitle}
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

/**
 * A Pexels photo inside an article. Pexels' CDN does the resizing (srcset), so no image
 * optimization runs on our side; width/height keep the layout from shifting.
 */
function Photo({ id, alt, credit, href, w = 1260, h = 840 }: { id: string; alt: string; credit: string; href: string; w?: number; h?: number }) {
  const base = `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb`;
  return (
    <figure className="not-prose my-8">
      {/* eslint-disable-next-line @next/next/no-img-element -- Pexels CDN serves the sizes; keeps Vercel image optimization out of the bill */}
      <img
        src={`${base}&w=960`}
        srcSet={`${base}&w=640 640w, ${base}&w=960 960w, ${base}&w=1280 1280w`}
        sizes="(max-width: 1024px) 92vw, 720px"
        alt={alt}
        width={w}
        height={h}
        loading="lazy"
        decoding="async"
        className="h-auto w-full rounded-[22px] bg-slab-2"
      />
      <figcaption className="mt-2 px-1 font-sans text-[0.78rem] text-ink-4">
        Photo:{" "}
        <a href={href} rel="nofollow noopener" target="_blank" className="underline hover:text-ink-2">
          {credit}
        </a>{" "}
        on Pexels
      </figcaption>
    </figure>
  );
}

function VerdictCard({ answer, points }: { answer: string; points: string[] }) {
  return (
    <section aria-label="The short answer" className="slab mt-8 p-5 sm:p-7">
      <p className="eyebrow eyebrow-accent">The short answer</p>
      <p className="mt-3 text-[1.12rem] font-semibold leading-snug text-ink sm:text-[1.2rem]">{answer}</p>
      {points.length ? (
        <ul className="mt-4 space-y-2">
          {points.map((pt) => (
            <li key={pt} className="flex gap-3 text-[0.98rem] leading-relaxed text-ink-2">
              <span aria-hidden className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
              <span>{pt}</span>
            </li>
          ))}
        </ul>
      ) : null}
      <div className="mt-5 flex flex-wrap gap-2">
        <BuyButton size="md" />
        <Link href="/book/sample" className="btn btn-ghost">
          Read Part 1 free
        </Link>
      </div>
    </section>
  );
}

const COMPONENTS = { SayThis, Truth, FieldDrill, Mistake, Science, Chat, Compare, Table, Points, BookCTA, Callout, Photo } as unknown as Record<
  string,
  ComponentType<Record<string, unknown>>
>;

export async function ArticleView({ post, preview = false }: { post: Post; preview?: boolean }) {
  const cat = categoryBySlug(post.category)!;
  const url = postUrl(post);
  const body = await renderMdx(post.body, { format: post.format, components: COMPONENTS, autolink: autolinkTerms(), self: url });
  const related = relatedPosts(post, 3);
  const chapter = post.chapters[0];
  const tool = toolById(post.tool);
  const chapterMap: Record<string, ChapterInfo> = {};
  if (tool) {
    for (const id of toolChapters(tool)) {
      const c = ALL_CHAPTERS.find((x) => x.id === id);
      if (c) chapterMap[id] = { id: c.id, title: c.title, page: c.page };
    }
  }

  return (
    <>
      {!preview ? (
        <JsonLd
          data={[articleLd(post, url), ...(tool ? [webAppLd(tool.name, post.description, url)] : []), ...(post.faq.length ? [faqLd(post.faq)] : [])]}
        />
      ) : null}
      <Container className="pt-10 sm:pt-14">
        {preview ? (
          <p className="tag tag-accent mb-4">Preview · {post.draft ? "draft" : `scheduled ${post.publishedAt}`} · not public</p>
        ) : null}
        <Breadcrumbs
          compact={Boolean(tool)}
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
              <h1 className={`display text-ink ${tool ? "mt-3 text-[1.75rem] leading-[1.12] sm:text-[2.6rem]" : "mt-4 text-[2.3rem] sm:text-[3.2rem]"}`}>{post.title}</h1>
              {post.description && !tool ? <p className="dek mt-4 text-[1.2rem] leading-snug">{post.description}</p> : null}
              <p className={`flex flex-wrap gap-x-4 gap-y-1 text-[0.86rem] text-ink-4 ${tool ? "hidden" : "mt-5"}`}>
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

            {tool ? (
              <>
                <div className="mt-5">
                  <ToolRunner tool={tool} chapters={chapterMap} price={BOOK.priceLabel} />
                </div>
                {post.description ? <p className="dek mt-8 max-w-3xl text-[1.12rem] leading-snug">{post.description}</p> : null}
                <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[0.86rem] text-ink-4">
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
                </p>
              </>
            ) : null}

            {post.verdict ? <VerdictCard answer={post.verdict.answer} points={post.verdict.points} /> : null}

            {post.image && !tool && !post.verdict ? (
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
                <p className="text-[0.95rem] font-semibold text-ink">{BOOK.displayTitle}</p>
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
