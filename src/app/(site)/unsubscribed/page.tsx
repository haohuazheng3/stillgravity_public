import Link from "next/link";
import type { Metadata } from "next";
import { Container } from "@/components/ui";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "You’re unsubscribed",
  description: "You won’t get any more emails from this series. The free chapters and the guides are still here whenever you want them.",
  path: "/unsubscribed",
  noindex: true,
});

export default function UnsubscribedPage() {
  return (
    <Container className="py-20 sm:py-28">
      <div className="mx-auto max-w-xl text-center">
        <p className="eyebrow eyebrow-accent">Done</p>
        <h1 className="display mt-4 text-[2.4rem] text-ink sm:text-[3rem]">You’re unsubscribed.</h1>
        <p className="mt-5 text-[1.08rem] leading-relaxed text-ink-3">
          You won’t get any more emails from this series. Nothing else changes: the free chapters and the guides are still here whenever you want them.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/book/sample" className="btn btn-ghost">
            Read Part 1 online
          </Link>
          <Link href="/blog" className="btn btn-quiet">
            Browse the guides
          </Link>
        </div>
      </div>
    </Container>
  );
}
