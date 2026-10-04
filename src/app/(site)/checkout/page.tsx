import type { Metadata } from "next";
import Link from "next/link";
import { CheckoutStarter } from "@/components/CheckoutStarter";
import { BookVisual } from "@/components/BookVisual";
import { Container, DeliveryNote } from "@/components/ui";
import { paymentsEnabled } from "@/lib/stripe";
import { BOOK } from "@/lib/site";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Checkout", robots: { index: false, follow: false } };

/** No account needed: this page only hands over to Stripe, where the buyer enters their email. */
export default function CheckoutPage() {
  const payments = paymentsEnabled();

  return (
    <Container className="pt-10 sm:pt-16">
      <div className="mx-auto max-w-2xl">
        <div className="slab p-6 sm:p-9">
          <p className="eyebrow eyebrow-accent">Checkout</p>
          <div className="mt-5 flex gap-5">
            <div className="w-20 shrink-0 sm:w-24">
              <BookVisual sizes="96px" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[1.1rem] font-semibold text-ink">{BOOK.displayTitle}</p>
              <p className="text-[0.9rem] text-ink-3">
                PDF ebook · {BOOK.pages} pages · {BOOK.chapters} chapters
              </p>
              <p className="mt-3 font-serif text-[1.8rem] font-semibold leading-none text-ink">{BOOK.priceLabel}</p>
              <p className="text-[0.82rem] text-ink-4">One-time payment · USD</p>
            </div>
          </div>
          <hr className="hairline my-6" />
          {payments.ok ? (
            <CheckoutStarter />
          ) : (
            <div role="status">
              <p className="text-[1rem] text-ink-2">{payments.reason}</p>
              <Link href="/book" className="btn btn-ghost mt-4">
                Back to the book
              </Link>
            </div>
          )}
          <DeliveryNote className="mt-6" />
          <p className="mt-3 text-[0.85rem] leading-relaxed text-ink-4">
            Payment happens on Stripe’s secure page; we never see your card. Have a promo code? Enter it there. Your statement
            shows a discreet descriptor, never the title. {BOOK.refundDays}-day refund.
          </p>
        </div>
      </div>
    </Container>
  );
}
