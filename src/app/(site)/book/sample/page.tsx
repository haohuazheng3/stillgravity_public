import Link from "next/link";
import type { Metadata } from "next";
import { Breadcrumbs, BuyButton, Container, CtaSlab, Section, TrustLine } from "@/components/ui";
import { SAMPLE_CHAPTERS, SampleChapters } from "@/content/sample";
import { BOOK } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { SampleProgress } from "@/components/SampleProgress";

export const metadata: Metadata = pageMetadata({
  title: "The truths nobody told you: read Part 1 free",
  description:
    "Eight one-page chapters on how attraction actually works: why kindness with a hidden invoice fails, clear intent with a loose grip, neediness, effort over words, rejection as a filter, and presence over lines.",
  path: "/book/sample",
  image: "/og/book",
});

export default function SamplePage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Chapter",
          name: "Part 1: The truths nobody told you",
          isPartOf: { "@type": "Book", name: BOOK.displayTitle, "@id": "https://stillgravity.com/book#book" },
          url: "https://stillgravity.com/book/sample",
        }}
      />
      <SampleProgress />
      <Container className="pt-10 sm:pt-14">
        <Breadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: "The book", path: "/book" },
            { name: "Free chapters", path: "/book/sample" },
          ]}
        />
        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-10">
          <div className="min-w-0">
            <p className="eyebrow eyebrow-accent">Part 1 · The deep game · free to read</p>
            <h1 className="display mt-4 text-[2.6rem] text-ink sm:text-[3.8rem]">The truths nobody told you</h1>
            <p className="mt-5 max-w-2xl text-[1.12rem] leading-relaxed text-ink-3">
              Most dating advice fails because it starts with tactics. Tactics built on wrong beliefs collapse the first time she
              doesn’t follow the script. These eight truths come first because everything else in {BOOK.displayTitle} is built on them.
            </p>
            <div className="mt-10">
              <SampleChapters />
            </div>

            <div className="slab mt-8 px-6 py-8 sm:px-10">
              <p className="eyebrow">That’s Part 1</p>
              <p className="headline mt-3 text-[1.6rem] text-ink">Seventy-five chapters to go.</p>
              <p className="mt-3 max-w-xl text-[1rem] leading-relaxed text-ink-3">
                Next: the man she notices, the first hello, the texting playbook, reading her signals, the date, the talking stage,
                leading the dynamic, when it goes wrong, relationships that last, understanding women, and the man behind it all.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <BuyButton />
                <Link href="/book#contents" className="btn btn-ghost btn-lg">
                  See every chapter
                </Link>
              </div>
            </div>
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-4">
              <nav aria-label="Chapters in Part 1" className="slab p-5">
                <p className="eyebrow">In this part</p>
                <ol className="mt-3 space-y-1">
                  {SAMPLE_CHAPTERS.map((c) => (
                    <li key={c.id}>
                      <a href={`#chapter-${c.id}`} className="flex gap-2.5 rounded-xl px-2 py-1.5 text-[0.9rem] text-ink-3 hover:bg-slab-2 hover:text-ink">
                        <span className="w-7 shrink-0 font-semibold text-accent-text">{c.id}</span>
                        <span>{c.title}</span>
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
              <div className="slab p-5">
                <p className="text-[0.95rem] font-semibold text-ink">Liking it?</p>
                <p className="mt-1 text-[0.88rem] text-ink-3">The whole book is {BOOK.priceLabel}, once.</p>
                <BuyButton size="md" className="btn-block mt-4" label="Get the book" />
                <TrustLine className="mt-4 flex-col !gap-y-1.5" />
              </div>
            </div>
          </aside>
        </div>
      </Container>
      <Section>
        <CtaSlab title={<>Part 1 is the foundation. <em className="!text-[#f0b752]">The rest is the field manual.</em></>} />
      </Section>
    </>
  );
}
