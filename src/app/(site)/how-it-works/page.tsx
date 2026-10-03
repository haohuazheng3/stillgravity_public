import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs, BuyButton, Container, CtaSlab, Section, TrustLine } from "@/components/ui";
import { JsonLd } from "@/components/JsonLd";
import { pageMetadata } from "@/lib/seo";
import { BOOK } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "How it works",
  description: `Read free, create your library with just your email, pay ${BOOK.priceLabel} once through Stripe, and read instantly in your browser or as a PDF on any device.`,
  path: "/how-it-works",
});

const STEPS = [
  {
    title: "Start free",
    body: "Read all of Part 1, use the Situation Finder, and browse the guides. No account needed.",
    cta: { href: "/book/sample", label: "Read Part 1" },
  },
  {
    title: "Open your library with just your email",
    body: "Type your email, then the six-digit code we send. No password to create or forget. New or returning, it’s the same three steps.",
  },
  {
    title: `Pay ${BOOK.priceLabel}, once`,
    body: "Secure checkout by Stripe: cards, Apple Pay and Google Pay where available. No subscription. Your statement shows a discreet descriptor, never the title.",
  },
  {
    title: "Read it instantly",
    body: "You land back in your library with the book unlocked. Read it in the browser or download the PDF; it’s there on every device you sign in on.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "HowTo",
          name: `How to get ${BOOK.title}`,
          step: STEPS.map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: s.title, text: s.body })),
        }}
      />
      <Container className="pt-10 sm:pt-14">
        <Breadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: "How it works", path: "/how-it-works" },
          ]}
        />
        <div className="mt-6 max-w-3xl">
          <p className="eyebrow eyebrow-accent">How it works</p>
          <h1 className="display mt-4 text-[2.6rem] text-ink sm:text-[3.8rem]">Four steps. About a minute.</h1>
          <p className="mt-5 text-[1.12rem] leading-relaxed text-ink-3">From curious to reading, with nothing to install and nothing to remember.</p>
        </div>
      </Container>

      <Section className="!pt-12">
        <ol className="grid gap-4 md:grid-cols-2">
          {STEPS.map((s, i) => (
            <li key={s.title} className="slab p-7 sm:p-8">
              <span className="condensed text-[2.4rem] text-accent-text">{String(i + 1).padStart(2, "0")}</span>
              <p className="headline mt-3 text-[1.4rem] text-ink">{s.title}</p>
              <p className="mt-2 text-[1rem] leading-relaxed text-ink-3">{s.body}</p>
              {s.cta ? (
                <Link href={s.cta.href} className="mt-4 inline-flex min-h-[44px] items-center font-semibold text-accent-text hover:underline">
                  {s.cta.label} →
                </Link>
              ) : null}
            </li>
          ))}
        </ol>
        <div className="slab mt-6 flex flex-col items-start gap-5 p-7 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[1.1rem] font-semibold text-ink">Ready when you are.</p>
            <TrustLine className="mt-2" />
          </div>
          <BuyButton />
        </div>
      </Section>

      <Section>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["Your copy is yours", "Each PDF carries a quiet line with a masked version of your email and order reference. It never gets in the way of reading."],
            ["Your data stays small", "We store your email, your order and your messages. Payments stay with Stripe. We don’t sell data or run ads."],
            ["Changed your mind?", `Email us within ${BOOK.refundDays} days for a full refund. No forms, no arguments.`],
          ].map(([t, b]) => (
            <div key={t} className="slab p-6">
              <p className="text-[1.05rem] font-semibold text-ink">{t}</p>
              <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-3">{b}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <CtaSlab />
      </Section>
    </>
  );
}
