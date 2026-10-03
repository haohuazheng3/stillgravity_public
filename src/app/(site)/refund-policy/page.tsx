import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { pageMetadata } from "@/lib/seo";
import { BOOK, SITE } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Refund policy",
  description: `Full refund within ${BOOK.refundDays} days of purchase, no forms and no arguments. How to ask, how long it takes, and what happens to your copy.`,
  path: "/refund-policy",
});

export default function RefundPolicyPage() {
  return (
    <LegalPage
      title="Refund policy"
      path="/refund-policy"
      updated="2026-10-03"
      intro={`Short version: if the book isn’t for you, email us within ${BOOK.refundDays} days and you’ll get every cent back.`}
    >
      <h2>The promise</h2>
      <p>
        If {BOOK.displayTitle} doesn’t help you, you can have a full refund within {BOOK.refundDays} days of your purchase. You don’t
        need to explain why, though we always appreciate knowing what we could do better.
      </p>

      <h2>How to ask</h2>
      <ol>
        <li>
          Email <a href={`mailto:${SITE.email}?subject=Refund%20request`}>{SITE.email}</a> from the address you used to buy, with
          “Refund” in the subject. Your order reference (it starts with SG-) helps but isn’t required.
        </li>
        <li>We confirm within two business days and issue the refund through Stripe to your original payment method.</li>
        <li>Your bank usually shows it within 5–10 business days, depending on the card issuer.</li>
      </ol>

      <h2>What happens to your copy</h2>
      <p>
        When a refund is issued, the book is removed from your library and download links stop working. Please delete the copies
        you downloaded.
      </p>

      <h2>After {BOOK.refundDays} days</h2>
      <p>
        Outside the window we look at requests case by case, for example if you were charged twice or couldn’t access the book
        because of a problem on our side. In those cases we always make it right.
      </p>

      <h2>Chargebacks</h2>
      <p>
        If something went wrong, please email us before disputing a charge with your bank: a refund from us is faster and simpler
        for you. Disputed purchases lose access to the book while the dispute is open.
      </p>

      <h2>Free orders</h2>
      <p>Orders completed with a 100% promotional code have nothing to refund, but you can still ask us to remove the book and your data.</p>
    </LegalPage>
  );
}
