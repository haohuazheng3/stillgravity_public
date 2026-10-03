import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs, BuyButton, Container, FaqList, Section, SectionHead, TrustLine } from "@/components/ui";
import { JsonLd } from "@/components/JsonLd";
import { faqsFor } from "@/content/faq";
import { bookLd, faqLd, pageMetadata } from "@/lib/seo";
import { BOOK } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Pricing",
  description: `Part 1, the Situation Finder and every guide are free. The full book is ${BOOK.priceLabel}, once: no subscription, instant PDF, ${BOOK.refundDays}-day refund.`,
  path: "/pricing",
  image: "/og/book",
});

export default function PricingPage() {
  const faqs = faqsFor("buying");
  return (
    <>
      <JsonLd data={[...bookLd(), faqLd(faqs)]} />
      <Container className="pt-10 sm:pt-14">
        <Breadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: "Pricing", path: "/pricing" },
          ]}
        />
        <div className="mx-auto mt-6 max-w-2xl text-center">
          <p className="eyebrow eyebrow-accent">Pricing</p>
          <h1 className="display mt-4 text-[2.6rem] text-ink sm:text-[3.8rem]">One price. Once.</h1>
          <p className="mt-5 text-[1.12rem] leading-relaxed text-ink-3">No subscription, no upsells, no “premium tier.” Most of what we publish is free.</p>
        </div>
      </Container>

      <Section className="!pt-12">
        <div className="mx-auto grid max-w-4xl gap-4 md:grid-cols-2">
          <div className="slab flex flex-col p-7 sm:p-9">
            <p className="eyebrow">Free</p>
            <p className="mt-3 font-serif text-[2.8rem] font-semibold leading-none text-ink">$0</p>
            <ul className="mt-6 space-y-2.5 text-[0.98rem] text-ink-2">
              <li>· Part 1 of the book, all eight chapters</li>
              <li>· The Situation Finder: 36 situations, first moves</li>
              <li>· Every field guide on the site</li>
            </ul>
            <div className="mt-auto pt-8">
              <Link href="/book/sample" className="btn btn-ghost btn-lg btn-block">
                Start reading
              </Link>
            </div>
          </div>
          <div className="slab-ink flex flex-col p-7 sm:p-9">
            <p className="font-sans text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[#f0b752]">The book</p>
            <p className="mt-3 font-serif text-[2.8rem] font-semibold leading-none text-[#f3f5f9]">{BOOK.priceLabel}</p>
            <p className="mt-1 text-[0.88rem] text-[#8f9bb0]">one-time · USD</p>
            <ul className="mt-6 space-y-2.5 text-[0.98rem] text-[#c9d1de]">
              <li>· All {BOOK.chapters} chapters, {BOOK.pages}-page PDF</li>
              <li>· The toolkit: 30-day reset, texting cheat sheet, first-date checklist</li>
              <li>· Read in the browser or download, any device</li>
              <li>· Free updates to this edition</li>
              <li>· {BOOK.refundDays}-day refund, no questions</li>
            </ul>
            <div className="mt-auto pt-8">
              <BuyButton className="btn-block" label="Get the book" />
            </div>
          </div>
        </div>
        <TrustLine className="mt-6 justify-center" />
      </Section>

      <Section>
        <SectionHead eyebrow="Buying" title="Questions about paying" />
        <FaqList faqs={faqs} />
      </Section>
    </>
  );
}
