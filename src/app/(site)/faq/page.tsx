import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs, Container, CtaSlab, FaqList, Section } from "@/components/ui";
import { JsonLd } from "@/components/JsonLd";
import { FAQS } from "@/content/faq";
import { faqLd, pageMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Frequently asked questions",
  description:
    "What’s in the book, how buying and delivery work, refunds, billing, privacy, whether it teaches pickup lines (it doesn’t), and who is behind Still Gravity.",
  path: "/faq",
});

export default function FaqPage() {
  return (
    <>
      <JsonLd data={faqLd(FAQS)} />
      <Container className="pt-10 sm:pt-14">
        <Breadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: "FAQ", path: "/faq" },
          ]}
        />
        <div className="mt-6 max-w-3xl">
          <p className="eyebrow eyebrow-accent">FAQ</p>
          <h1 className="display mt-4 text-[2.6rem] text-ink sm:text-[3.8rem]">Straight answers.</h1>
          <p className="mt-5 text-[1.12rem] leading-relaxed text-ink-3">
            Can’t find yours? Write to{" "}
            <a href={`mailto:${SITE.email}`} className="text-accent-text underline underline-offset-4">
              {SITE.email}
            </a>{" "}
            or use the <Link href="/contact" className="text-accent-text underline underline-offset-4">contact form</Link>.
          </p>
        </div>
      </Container>
      <Section className="!pt-12">
        <FaqList faqs={FAQS} />
      </Section>
      <Section>
        <CtaSlab />
      </Section>
    </>
  );
}
