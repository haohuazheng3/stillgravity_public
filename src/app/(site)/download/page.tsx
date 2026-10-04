import type { Metadata } from "next";
import Link from "next/link";
import { ResendForm } from "@/components/ResendForm";
import { Container } from "@/components/ui";
import { BOOK, SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Get your copy again",
  description: `Bought ${BOOK.displayTitle}? Enter the email you used at checkout and we’ll send your PDF again with a fresh download link.`,
  robots: { index: false, follow: true },
  alternates: { canonical: "/download" },
};

export default function DownloadPage() {
  return (
    <Container className="pt-10 sm:pt-16">
      <div className="mx-auto grid max-w-[1000px] items-start gap-8 lg:grid-cols-[1fr_440px] lg:gap-14">
        <div className="min-w-0">
          <p className="eyebrow eyebrow-accent">Already bought the book?</p>
          <h1 className="display mt-4 text-[2.3rem] text-ink sm:text-[3.1rem]">Get your copy again.</h1>
          <p className="mt-4 max-w-md text-[1.05rem] leading-relaxed text-ink-3">
            There are no accounts here. Your purchase is tied to the email you entered at checkout: type it in and we’ll send your
            personal PDF again, with a fresh download link.
          </p>
          <ul className="mt-6 space-y-2 text-[0.95rem] text-ink-3">
            <li>· Nothing arrived after buying? Check spam or promotions first; it comes from {SITE.deliveryEmail}.</li>
            <li>· Used a different email, or still stuck? Write to us and we’ll find your order.</li>
          </ul>
          <p className="mt-6 text-[0.9rem] text-ink-4">
            <Link href="/contact" className="underline underline-offset-4">
              Contact us
            </Link>{" "}
            · {BOOK.refundDays}-day refund on every order.
          </p>
        </div>
        <div className="min-w-0">
          <ResendForm />
        </div>
      </div>
    </Container>
  );
}
