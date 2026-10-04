import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";
import { BookVisual, LookInside } from "@/components/BookVisual";
import { BuyButton, Container, CtaSlab, DeliveryNote, FaqList, PartsAccordion, Section, SectionHead, ThreeRules, TrustLine } from "@/components/ui";
import { JsonLd } from "@/components/JsonLd";
import { CheckoutNotice } from "@/components/CheckoutNotice";
import { BACK_COVER, COVER_PROMISES, TOOLKIT, TOOLS } from "@/content/book";
import { faqsFor } from "@/content/faq";
import { BOOK } from "@/lib/site";
import { bookLd, breadcrumbLd, faqLd, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: `${BOOK.displayTitle}: the dating playbook nobody gave you`,
  description: `${BOOK.chapters} one-page chapters on approaching, texting, reading her signals, dates, the talking stage, rejection and relationships, plus the deeper skills that make scripts unnecessary. PDF, ${BOOK.priceLabel}.`,
  path: "/book",
  image: "/og/book",
});

const FOR = [
  "You replay conversations at 2 a.m., hunting for the one wrong word.",
  "You get matches, numbers or first dates, and then it quietly fades.",
  "You’re tired of “just be confident” and of men selling scripts.",
  "You want to understand women, not outsmart them.",
  "You want a life that’s attractive on its own, not just better texts.",
];

const NOT_FOR = [
  "You want lines that “make her obsessed.” They don’t exist.",
  "You’re looking for ways to pressure, trick or wear someone down.",
  "You want a theory about why women are the problem.",
];

export default function BookPage() {
  const faqs = faqsFor("buying");
  return (
    <>
      <JsonLd
        data={[
          ...bookLd(),
          faqLd(faqs),
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "The book", path: "/book" },
          ]),
        ]}
      />
      <Suspense fallback={null}>
        <CheckoutNotice />
      </Suspense>

      {/* ---------- Hero ---------- */}
      <Container className="pt-10 sm:pt-16">
        <div className="grid items-center gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <BookVisual priority className="mx-auto w-[64%] max-w-[360px] lg:order-none lg:w-full" sizes="(max-width: 1024px) 64vw, 400px" />
          <div>
            <p className="eyebrow eyebrow-accent">The dating playbook nobody gave you</p>
            <h1 className="display mt-4 text-[2.7rem] text-ink sm:text-[4rem]">{BOOK.displayTitle}</h1>
            <p className="dek mt-4 text-[1.25rem]">{BOOK.subtitle}</p>
            <ul className="mt-6 grid gap-2.5">
              {COVER_PROMISES.map((p) => (
                <li key={p} className="flex gap-3 text-[1.02rem] text-ink-2">
                  <span aria-hidden className="mt-[0.5em] h-2 w-2 shrink-0 rounded-[2px] bg-accent" />
                  {p}
                </li>
              ))}
            </ul>
            <div className="slab mt-8 p-5 sm:p-6">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-[0.85rem] text-ink-3">One-time purchase</p>
                  <p className="font-serif text-[2.6rem] font-semibold leading-none text-ink">{BOOK.priceLabel}</p>
                </div>
                <p className="text-right text-[0.85rem] text-ink-3">
                  PDF · {BOOK.pages} pages
                  <br />
                  {BOOK.chapters} chapters · {BOOK.parts} parts
                </p>
              </div>
              <BuyButton className="btn-block mt-5" label="Get the book now" />
              <TrustLine className="mt-4 justify-center" />
              <DeliveryNote className="mt-4" />
            </div>
          </div>
        </div>
      </Container>

      {/* ---------- Opening page ---------- */}
      <Section>
        <div className="slab mx-auto max-w-3xl px-6 py-10 sm:px-12 sm:py-14">
          <p className="eyebrow">From the first page</p>
          <h2 className="display mt-4 text-[2.2rem] text-ink sm:text-[2.8rem]">Nobody hands you the manual.</h2>
          <div className="prose-sg mt-6">
            <p>
              You learned algebra in a classroom and driving from an instructor. But the skill that shapes the biggest decisions
              of your life, meeting someone, earning her interest, building something that lasts, you were expected to pick up
              from movies, from friends who were guessing too, and from strangers online selling scripts.
            </p>
            <p>
              So you guessed. You texted too much, or not enough. You were “nice” and somehow ended up a friend. You got left on
              read and replayed the conversation at 2 a.m., hunting for the one wrong word.
            </p>
            <p>
              Here is the first thing she won’t tell you: most of what went wrong had nothing to do with your height, your face,
              or your bank account. It came down to a handful of patterns, invisible to you and obvious to her.{" "}
              <strong>Once you see them, you can’t unsee them.</strong> That’s what this book is for.
            </p>
          </div>
        </div>
      </Section>

      {/* ---------- Look inside ---------- */}
      <Section>
        <SectionHead
          eyebrow="Look inside"
          title="Every chapter fits on one page and solves one problem."
          lede="Read it front to back once. Then keep it close, and come back to the page you need on the night you need it."
        />
        <LookInside />
      </Section>

      {/* ---------- Tools ---------- */}
      <Section>
        <SectionHead eyebrow="Five recurring tools" title="Built to change what you do, not just what you know." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {TOOLS.map((t, i) => (
            <div key={t.name} className="slab p-6">
              <span className="condensed text-[1.6rem] text-ink-4">{String(i + 1).padStart(2, "0")}</span>
              <p className="mt-3 text-[1.08rem] font-semibold text-ink">{t.name}</p>
              <p className="mt-2 text-[0.93rem] leading-relaxed text-ink-3">{t.blurb}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ---------- Contents ---------- */}
      <Section id="contents">
        <SectionHead
          eyebrow="Contents"
          title="Twelve parts, eighty-three chapters."
          lede="From the first hello to the first fight, and the deeper skills that make scripts unnecessary: reading people, leading with calm, and building a life that is attractive on its own."
        />
        <PartsAccordion openFirst />
      </Section>

      {/* ---------- Toolkit ---------- */}
      <Section>
        <SectionHead eyebrow="The toolkit" title="The pages you’ll come back to." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLKIT.map((t) => (
            <div key={t.title} className="slab p-6">
              <p className="text-[0.8rem] font-semibold text-accent-text">Page {t.pages}</p>
              <p className="mt-2 text-[1.12rem] font-semibold text-ink">{t.title}</p>
              <p className="mt-2 text-[0.94rem] leading-relaxed text-ink-3">{t.blurb}</p>
            </div>
          ))}
          <div className="slab-inset flex flex-col justify-center p-6">
            <p className="text-[0.95rem] leading-relaxed text-ink-3">Also inside:</p>
            <ul className="mt-2 space-y-1 text-[0.93rem] text-ink-2">
              {BACK_COVER.slice(0, 3).map((b) => (
                <li key={b}>· {b}</li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* ---------- For / not for ---------- */}
      <Section>
        <div className="grid gap-4 md:grid-cols-[1.3fr_1fr]">
          <div className="slab p-7 sm:p-9">
            <p className="eyebrow eyebrow-accent">This book is for you if</p>
            <ul className="mt-5 space-y-3">
              {FOR.map((f) => (
                <li key={f} className="flex gap-3 text-[1rem] text-ink-2">
                  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden className="mt-1 shrink-0 text-ok">
                    <path d="M3.5 9.5l3.5 3.5 7.5-8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <div className="slab p-7 sm:p-9">
            <p className="eyebrow">It isn’t for you if</p>
            <ul className="mt-5 space-y-3">
              {NOT_FOR.map((f) => (
                <li key={f} className="flex gap-3 text-[1rem] text-ink-3">
                  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden className="mt-1 shrink-0 text-bad">
                    <path d="M5 5l8 8M13 5l-8 8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section>
        <SectionHead eyebrow="Three rules this book never breaks" title="Respect, consent, and influence without manipulation." />
        <ThreeRules />
      </Section>

      <Section>
        <SectionHead eyebrow="Buying" title="Questions about the purchase" />
        <FaqList faqs={faqs} />
        <p className="mt-5 text-[0.92rem] text-ink-4">
          Not sure yet?{" "}
          <Link href="/book/sample" className="text-ink-3 underline underline-offset-4 hover:text-ink">
            Read all of Part 1 free
          </Link>{" "}
          before you decide.
        </p>
      </Section>

      <Section>
        <CtaSlab />
      </Section>
    </>
  );
}
