import type { Metadata } from "next";
import { Breadcrumbs, Container, Section } from "@/components/ui";
import { ContactForm } from "@/components/ContactForm";
import { JsonLd } from "@/components/JsonLd";
import { organizationLd, pageMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Contact",
  description: `Questions about the book, an order, a refund or your data: email ${SITE.email} or use the form. A real person replies within two business days.`,
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "ContactPage", url: "https://stillgravity.com/contact", about: organizationLd() }} />
      <Container className="pt-10 sm:pt-14">
        <Breadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: "Contact", path: "/contact" },
          ]}
        />
        <div className="mt-6 max-w-3xl">
          <p className="eyebrow eyebrow-accent">Contact</p>
          <h1 className="display mt-4 text-[2.6rem] text-ink sm:text-[3.8rem]">Write to a real person.</h1>
          <p className="mt-5 text-[1.12rem] leading-relaxed text-ink-3">
            Email{" "}
            <a href={`mailto:${SITE.email}`} className="text-accent-text underline underline-offset-4">
              {SITE.email}
            </a>{" "}
            or use the form below. {SITE.replyTime}
          </p>
        </div>
      </Container>
      <Section className="!pt-10">
        <div className="mx-auto max-w-3xl">
          <ContactForm />
        </div>
      </Section>
    </>
  );
}
