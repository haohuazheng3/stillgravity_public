import Link from "next/link";
import type { Metadata } from "next";
import { SituationFinder, type ChapterInfo } from "@/components/SituationFinder";
import { Breadcrumbs, Container, CtaSlab, Section } from "@/components/ui";
import { ALL_CHAPTERS, chapterById } from "@/content/book";
import { SITUATION_GROUPS } from "@/content/situations";
import { pageMetadata } from "@/lib/seo";
import { BOOK } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "The Situation Finder: 36 dating situations and the honest first move",
  description:
    "Left on read, slow replies, mixed signals, the friend zone, hot and cold, ghosted, no spark: find the thought keeping you up, get the honest first move, and the chapter with the full playbook.",
  path: "/situations",
});

export default function SituationsPage() {
  const chapters: Record<string, ChapterInfo> = Object.fromEntries(ALL_CHAPTERS.map((c) => [c.id, { id: c.id, title: c.title, page: c.page }]));
  return (
    <>
      <Container className="pt-10 sm:pt-14">
        <Breadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: "Situation Finder", path: "/situations" },
          ]}
        />
        <div className="mt-6 max-w-3xl">
          <p className="eyebrow eyebrow-accent">The Situation Finder</p>
          <h1 className="display mt-4 text-[2.6rem] text-ink sm:text-[3.8rem]">Find the thought that’s keeping you up.</h1>
          <p className="mt-5 text-[1.12rem] leading-relaxed text-ink-3">
            Thirty-six real situations, each with an honest first move and the chapter of {BOOK.displayTitle} that handles it in full:
            the scripts, the science, and the mistakes to avoid.
          </p>
        </div>
        <div className="mt-10">
          <SituationFinder chapters={chapters} />
        </div>
      </Container>

      <Section>
        <h2 className="headline text-[1.9rem] text-ink sm:text-[2.3rem]">All 36 situations</h2>
        <div className="mt-8 grid gap-6">
          {SITUATION_GROUPS.map((g) => (
            <section key={g.id} aria-labelledby={`g-${g.id}`} className="slab p-5 sm:p-8">
              <h3 id={`g-${g.id}`} className="eyebrow eyebrow-accent">
                {g.title}
              </h3>
              <ul className="mt-4 divide-y divide-[var(--line)]">
                {g.items.map((s) => {
                  const ch = chapterById(s.chapter);
                  return (
                    <li key={s.slug} id={s.slug} className="scroll-mt-28 py-5 first:pt-2 last:pb-1">
                      <p className="font-serif text-[1.25rem] font-semibold leading-snug text-ink" style={{ fontVariationSettings: '"opsz" 30' }}>
                        {s.quote}
                      </p>
                      <p className="mt-2 max-w-3xl text-[0.99rem] leading-relaxed text-ink-3">{s.first}</p>
                      {ch ? (
                        <p className="mt-2 text-[0.86rem] text-ink-4">
                          Full playbook: Chapter {ch.id}, {ch.title} (p. {ch.page})
                        </p>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
        <p className="mt-6 text-[0.92rem] text-ink-4">
          The first moves above are summaries. The chapters give you the exact words, the weak version beside the good one, and the
          research behind each move.{" "}
          <Link href="/book/sample" className="text-ink-3 underline underline-offset-4 hover:text-ink">
            Read Part 1 free
          </Link>
          .
        </p>
      </Section>

      <Section>
        <CtaSlab />
      </Section>
    </>
  );
}
