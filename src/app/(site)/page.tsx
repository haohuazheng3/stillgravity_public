import Link from "next/link";
import type { Metadata } from "next";
import { ChatHook } from "@/components/ChatHook";
import { BookVisual } from "@/components/BookVisual";
import { SituationFinder, type ChapterInfo } from "@/components/SituationFinder";
import { BuyButton, Container, CtaSlab, FaqList, Section, SectionHead, ThreeRules, TrustLine } from "@/components/ui";
import { JsonLd } from "@/components/JsonLd";
import { ALL_CHAPTERS, BACK_COVER, COVER_PROMISES } from "@/content/book";
import { faqsFor } from "@/content/faq";
import { BOOK, SITE } from "@/lib/site";
import { faqLd, organizationLd, pageMetadata, websiteLd } from "@/lib/seo";
import { publishedPosts, postUrl } from "@/lib/blog";
import { categoryBySlug } from "@/content/categories";

export const metadata: Metadata = pageMetadata({
  title: `${SITE.name} — Attraction isn’t a trick. It’s gravity.`,
  absoluteTitle: true,
  description:
    "Honest, research-backed answers for the dating moments that keep men up at night: left on read, mixed signals, the friend zone, the slow fade. Plus the deeper work of becoming a man worth choosing.",
  path: "/",
});

const TRUTHS = [
  { id: "1.1", title: "Attraction isn’t earned. It’s felt.", truth: "Kindness is attractive. Kindness with a hidden invoice isn’t." },
  { id: "1.2", title: "Clear intent, loose grip", truth: "Make your interest obvious and your happiness independent of her answer." },
  { id: "1.3", title: "Stop auditioning. Start selecting.", truth: "Stop asking “does she like me?” Start asking “do I like her?”" },
  { id: "1.4", title: "Neediness is the universal repellent", truth: "You can’t fake not needing her. You can only build a life where you don’t." },
  { id: "1.5", title: "Words lie. Effort doesn’t.", truth: "Judge interest by effort, not explanations." },
  { id: "1.6", title: "Your texting problem is a meeting problem", truth: "Texting is for setting up the date, not replacing it." },
  { id: "1.7", title: "Rejection is a filter, not a verdict", truth: "Every no is a mismatch you didn’t have to discover the hard way." },
  { id: "1.8", title: "Lines don’t work. Presence does.", truth: "She’ll forget your best line. She’ll remember how it felt to be around you." },
];

export default function HomePage() {
  const chapters: Record<string, ChapterInfo> = Object.fromEntries(ALL_CHAPTERS.map((c) => [c.id, { id: c.id, title: c.title, page: c.page }]));
  const faqs = faqsFor("book", 5);
  const posts = publishedPosts().slice(0, 6);

  return (
    <>
      <JsonLd data={[organizationLd(), websiteLd(), faqLd(faqs)]} />

      {/* ---------- Hero ---------- */}
      <Container className="pt-10 sm:pt-16">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
          <div>
            <p className="eyebrow eyebrow-accent">Field guides for men · attraction, dating, becoming</p>
            <h1 className="display mt-5 text-[2.9rem] text-ink sm:text-[4.4rem] lg:text-[4.8rem]">
              Attraction isn’t a trick. <em>It’s gravity.</em>
            </h1>
            <p className="mt-6 max-w-xl text-[1.12rem] leading-relaxed text-ink-3 sm:text-[1.2rem]">
              Honest, research-backed answers for the moments that keep men up at night, and the deeper work that makes
              you someone worth choosing. No pickup lines. No mind games.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <BuyButton />
              <Link href="/book/sample" className="btn btn-ghost btn-lg">
                Read the first 8 chapters free
              </Link>
            </div>
            <TrustLine className="mt-6" />
          </div>
          <ChatHook className="lg:animate-float" />
        </div>
      </Container>

      {/* ---------- Situation Finder ---------- */}
      <Section id="finder">
        <SectionHead
          eyebrow="The Situation Finder"
          title="What’s keeping you up tonight?"
          lede="Pick the thought on your mind. You’ll get the honest first move right here, and the chapter that holds the full playbook."
        />
        <SituationFinder chapters={chapters} compact />
        <p className="mt-5 text-[0.92rem] text-ink-4">
          36 situations, mapped to the exact page.{" "}
          <Link href="/situations" className="text-ink-3 underline underline-offset-4 hover:text-ink">
            See them all with their first moves
          </Link>
        </p>
      </Section>

      {/* ---------- The eight truths ---------- */}
      <Section>
        <SectionHead
          eyebrow="Part 1 · free to read"
          title="Eight truths nobody told you"
          lede="Tactics built on wrong beliefs collapse the first time she doesn’t follow the script. Everything else in the book stands on these."
        />
        {/* phones: one swipeable row of floating cards; larger screens: a grid */}
        <div className="-mx-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-3 pb-4 [scrollbar-width:none] sm:mx-0 sm:grid sm:snap-none sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4">
          {TRUTHS.map((t) => (
            <Link key={t.id} href={`/book/sample#chapter-${t.id}`} className="slab slab-hover flex w-[78%] shrink-0 snap-start flex-col p-6 sm:w-auto">
              <span className="text-[0.8rem] font-semibold text-accent-text">Chapter {t.id}</span>
              <span className="headline mt-3 text-[1.25rem] text-ink">{t.title}</span>
              <span className="mt-auto pt-6 text-[0.92rem] leading-relaxed text-ink-3">{t.truth}</span>
            </Link>
          ))}
        </div>
      </Section>

      {/* ---------- Two layers ---------- */}
      <Section>
        <SectionHead eyebrow="How the book works" title="Two layers. One page per problem." />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="slab p-7 sm:p-9">
            <p className="eyebrow eyebrow-accent">The field manual</p>
            <p className="headline mt-3 text-[1.6rem] text-ink">Exactly what to do, tonight.</p>
            <p className="mt-3 text-[1rem] leading-relaxed text-ink-3">
              Approaching, the first text, the dead chat, mixed signals, the first kiss, the DTR talk, the slow fade. Word-for-word
              texts and conversations, with the weak version beside the good one.
            </p>
            <p className="mt-5 text-[0.88rem] text-ink-4">Parts 2–7 and 9</p>
          </div>
          <div className="slab p-7 sm:p-9">
            <p className="eyebrow eyebrow-accent">The deep game</p>
            <p className="headline mt-3 text-[1.6rem] text-ink">Why it works, so you never need a script.</p>
            <p className="mt-3 text-[1rem] leading-relaxed text-ink-3">
              How attraction actually works, what women report wanting, how to lead without manipulating, relationships that
              last, and the man behind it all: purpose, body, money, friends, habits.
            </p>
            <p className="mt-5 text-[0.88rem] text-ink-4">Parts 1, 8 and 10–12</p>
          </div>
        </div>
      </Section>

      {/* ---------- The book ---------- */}
      <Section>
        <div className="slab overflow-hidden p-6 sm:p-10 lg:p-12">
          <div className="grid items-center gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
            <BookVisual className="mx-auto w-[66%] max-w-[320px] lg:w-full" />
            <div>
              <p className="eyebrow eyebrow-accent">The book · {BOOK.edition}</p>
              <h2 className="display mt-4 text-[2.3rem] text-ink sm:text-[3rem]">{BOOK.displayTitle}</h2>
              <p className="dek mt-3 text-[1.2rem]">{BOOK.subtitle}</p>
              <ul className="mt-6 grid gap-2.5">
                {COVER_PROMISES.map((p) => (
                  <li key={p} className="flex gap-3 text-[1rem] text-ink-2">
                    <span aria-hidden className="mt-[0.5em] h-2 w-2 shrink-0 rounded-[2px] bg-accent" />
                    {p}
                  </li>
                ))}
              </ul>
              <hr className="hairline my-6" />
              <ul className="grid gap-1.5 text-[0.92rem] text-ink-3 sm:grid-cols-2">
                {BACK_COVER.map((b) => (
                  <li key={b}>· {b}</li>
                ))}
              </ul>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <BuyButton />
                <Link href="/book" className="btn btn-quiet btn-lg">
                  See all 83 chapters →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ---------- Guides (only once published) ---------- */}
      {posts.length > 0 ? (
        <Section>
          <SectionHead eyebrow="Field guides" title="Free guides for the specific moment" />
          <div className="grid gap-4 md:grid-cols-3">
            {posts.map((p) => (
              <Link key={postUrl(p)} href={postUrl(p)} className="slab slab-hover flex flex-col p-6">
                <span className="text-[0.8rem] font-semibold text-accent-text">{categoryBySlug(p.category)?.name}</span>
                <span className="headline mt-2 text-[1.2rem] text-ink">{p.title}</span>
                <span className="mt-3 line-clamp-3 text-[0.94rem] text-ink-3">{p.description}</span>
              </Link>
            ))}
          </div>
        </Section>
      ) : null}

      {/* ---------- Three rules ---------- */}
      <Section>
        <SectionHead
          eyebrow="Three rules we never break"
          title="Influence, never manipulation."
          lede="Tricks stop working the moment she notices, and the women worth keeping always notice. Every idea here gets stronger the more honest you are."
        />
        <ThreeRules />
      </Section>

      {/* ---------- FAQ ---------- */}
      <Section>
        <SectionHead eyebrow="Questions" title="Before you buy" />
        <FaqList faqs={faqs} />
        <p className="mt-5 text-[0.92rem] text-ink-4">
          More answers in the{" "}
          <Link href="/faq" className="text-ink-3 underline underline-offset-4 hover:text-ink">
            full FAQ
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
