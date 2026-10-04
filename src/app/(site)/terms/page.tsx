import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { pageMetadata } from "@/lib/seo";
import { BOOK, SITE } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Terms of service",
  description: "The terms for using stillgravity.com and buying What She Won’t Tell You: your license, payments, refunds, and what the book is and isn’t.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <LegalPage title="Terms of service" path="/terms" updated="2026-10-04" intro={`By using ${SITE.domain} or buying the book you agree to these terms. They’re written to be read.`}>
      <h2>1. Who can use the site</h2>
      <p>You must be at least 18 years old to buy the book.</p>

      <h2>2. Delivery and your email</h2>
      <p>
        There are no accounts. Your purchase is tied to the email you enter at checkout: the PDF is sent there, the page you land
        on after paying lets you download it right away, and anyone who can read that inbox can ask us to send the book to it
        again. Use an address you control, and tell us at <a href={`mailto:${SITE.email}`}>{SITE.email}</a> if you think someone
        else got hold of your copy.
      </p>

      <h2>3. What you’re buying</h2>
      <p>
        {BOOK.displayTitle} is a digital book delivered as a PDF. When you buy it you receive a personal, non-exclusive,
        non-transferable license to read it and keep copies for your own use on your own devices, including updates to this
        edition that we publish. You may not resell, share, upload, sublicense or redistribute the book or any substantial part
        of it, or remove the personalization line printed on its pages.
      </p>

      <h2>4. Prices and payment</h2>
      <p>
        Prices are shown in US dollars and charged once at checkout; there is no subscription. Payments are processed by Stripe.
        Any taxes required by law are shown at checkout. If a payment is reversed (for example through a chargeback), access to
        the book ends.
      </p>

      <h2>5. Refunds</h2>
      <p>
        If the book isn’t for you, you can get a full refund within {BOOK.refundDays} days of purchase. See the{" "}
        <Link href="/refund-policy">refund policy</Link>.
      </p>

      <h2>6. What the book is, and isn’t</h2>
      <p>
        The book and our guides offer general information about dating, relationships and personal growth. They are not therapy,
        medical, psychological or legal advice, and they are not a substitute for a licensed professional. Examples and
        conversations are illustrative composites. Results depend on you and on other people; we don’t promise any particular
        outcome. If you are struggling with your mental health, please contact a qualified professional or someone you trust.
      </p>
      <p>
        Everything we publish rests on respect and consent. Nothing in it may be used to pressure, deceive, harass or harm
        anyone.
      </p>

      <h2>7. Acceptable use</h2>
      <p>
        Don’t misuse the site: no attempts to break or overload it, no scraping or bulk downloading, no sharing of download links,
        and no use of our content to train or build competing products without permission.
      </p>

      <h2>8. Intellectual property</h2>
      <p>
        The book, the site, the Still Gravity name and logo, and all guides are owned by Still Gravity and protected by copyright
        and trademark law. Brief quotations with attribution are welcome.
      </p>

      <h2>9. Disclaimers and limits of liability</h2>
      <p>
        The site and book are provided “as is.” To the maximum extent permitted by law, we are not liable for indirect,
        incidental or consequential damages, and our total liability for any claim relating to the book is limited to the amount
        you paid for it. Nothing in these terms limits rights you have under consumer protection laws that can’t be waived.
      </p>

      <h2>10. Ending access</h2>
      <p>
        You can stop using the site at any time and ask us to delete the data we hold about you. We may disable download links
        and refuse further sales to anyone who breaks these terms, for example by distributing the book.
      </p>

      <h2>11. Governing law</h2>
      <p>
        These terms are governed by the laws of the State of Michigan, United States, except where the law of your country of
        residence gives you protections that can’t be overridden.
      </p>

      <h2>12. Changes and contact</h2>
      <p>
        We may update these terms; the date above will change and the new version applies from then on. Questions:{" "}
        <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
      </p>
    </LegalPage>
  );
}
