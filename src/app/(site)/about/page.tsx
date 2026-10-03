import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/Logo";
import { Breadcrumbs, Container, CtaSlab, Section, SectionHead, ThreeRules } from "@/components/ui";
import { JsonLd } from "@/components/JsonLd";
import { organizationLd, pageMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "About Still Gravity",
  description:
    "Still Gravity is an independent publisher of honest, research-backed guides for men on attraction, dating, relationships and becoming the man worth choosing. Why the name, what we believe, how we work.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <JsonLd data={organizationLd()} />
      <Container className="pt-10 sm:pt-14">
        <Breadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: "About", path: "/about" },
          ]}
        />
        <div className="mt-6 grid items-center gap-10 lg:grid-cols-[1.3fr_0.7fr]">
          <div>
            <p className="eyebrow eyebrow-accent">About</p>
            <h1 className="display mt-4 text-[2.6rem] text-ink sm:text-[3.8rem]">The manual nobody handed you.</h1>
            <p className="mt-5 max-w-2xl text-[1.12rem] leading-relaxed text-ink-3">
              {SITE.name} is an independent publisher of practical, research-backed guides for men: on attraction, dating and
              relationships, and on the deeper work of becoming someone whose life is attractive on its own.
            </p>
          </div>
          <div className="slab-ink mx-auto grid aspect-square w-full max-w-[300px] place-items-center">
            <div className="text-center">
              <LogoMark size={110} />
              <p className="mt-4 font-sans text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#8f9bb0]">A plumb bob, at rest</p>
            </div>
          </div>
        </div>
      </Container>

      <Section>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="slab p-7 sm:p-9">
            <p className="eyebrow eyebrow-accent">Why “Still Gravity”</p>
            <div className="prose-ui mt-3">
              <p>
                A plumb line is the oldest tool for finding what’s true. You let the weight hang, you stop moving, and gravity shows
                you true vertical. It only works when it’s still.
              </p>
              <p>
                Attraction works the same way. It isn’t a trick you perform; it’s a pull that shows up around a man who is
                grounded, clear about what he wants, and calm enough to let other people choose. That’s the man our guides are
                written to help you become.
              </p>
            </div>
          </div>
          <div className="slab p-7 sm:p-9">
            <p className="eyebrow eyebrow-accent">How we work</p>
            <ul className="prose-ui mt-3">
              <li>
                <strong>Research, summarized honestly.</strong> When a famous study is debated or hasn’t replicated well, we say so.
                Researchers are named so you can look them up.
              </li>
              <li>
                <strong>Words you can actually say.</strong> Scripts are starting points to adapt to your own voice, shown next to
                the weak version so you can see the difference.
              </li>
              <li>
                <strong>Composites, not case studies.</strong> Examples and conversations are illustrative; they aren’t real people.
              </li>
              <li>
                <strong>No invented authority.</strong> We don’t make up experts, ratings or testimonials. Everything we publish
                has to stand on its reasoning and its sources.
              </li>
            </ul>
          </div>
        </div>
      </Section>

      <Section>
        <SectionHead eyebrow="What we believe" title="Three rules we never break." />
        <ThreeRules />
      </Section>

      <Section>
        <div className="slab p-7 sm:p-10">
          <p className="eyebrow">Talk to us</p>
          <p className="headline mt-3 text-[1.6rem] text-ink">A real person reads every message.</p>
          <p className="mt-3 max-w-2xl text-[1rem] leading-relaxed text-ink-3">
            Questions about the book, an order, a privacy request, or a topic you want us to cover: write to{" "}
            <a href={`mailto:${SITE.email}`} className="text-accent-text underline underline-offset-4">
              {SITE.email}
            </a>{" "}
            or use the <Link href="/contact" className="text-accent-text underline underline-offset-4">contact form</Link>. {SITE.replyTime}
          </p>
        </div>
      </Section>

      <Section>
        <CtaSlab />
      </Section>
    </>
  );
}
