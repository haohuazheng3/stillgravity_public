import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { pageMetadata } from "@/lib/seo";
import { BOOK, SITE } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Privacy policy",
  description: "What Still Gravity collects, why, who processes it (Clerk, Stripe, FlowGlance, Cloudflare, Vercel, Neon), how long we keep it, and your rights.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy policy"
      path="/privacy"
      updated="2026-10-04"
      intro="Plain language first: we collect what we need to sell and deliver your book, answer your messages and improve the site. There are no accounts to create. We don’t sell your data and we don’t run ads."
    >
      <h2>Who we are</h2>
      <p>
        Still Gravity (“we”, “us”) publishes {BOOK.displayTitle} and the guides on {SITE.domain}. For anything in this policy, write to{" "}
        <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
      </p>

      <h2>What we collect, and why</h2>
      <h3>No accounts</h3>
      <p>
        Buying the book doesn’t require an account or a password. The email address you enter on Stripe’s checkout page is the
        only identifier we keep for your purchase: it’s where we send your book, and it’s how we find your order when you ask for
        the file again at {SITE.domain}/download.
      </p>
      <h3>Purchases</h3>
      <p>
        Payments are processed by <strong>Stripe</strong>. We never see or store your card number. Stripe tells us the order
        details we need to deliver and support your purchase: an order reference, amount, currency, the email used at checkout,
        any promotion code, and Stripe’s customer and payment identifiers. Stripe processes your payment details under{" "}
        <a href="https://stripe.com/privacy" rel="noopener" target="_blank">
          its own privacy policy
        </a>
        .
      </p>
      <h3>Your personal copy and the delivery email</h3>
      <p>
        Each copy of the book is personalized: a small line at the bottom of every page shows a masked version of your email
        (for example j***n@example.com) and your order reference. Personalized copies are stored privately in{" "}
        <strong>Cloudflare R2</strong> and delivered through signed links that expire. After payment we email the PDF to your
        checkout address through <strong>Resend</strong>, our email delivery provider. We log each read or download (time,
        approximate country) and each delivery email to prevent abuse of download links.
      </p>
      <h3>Messages you send us</h3>
      <p>
        When you use the contact form we store your name (optional), email address, topic and message, together with a
        one-way hash of your IP address and your browser’s user agent to filter spam. We receive an email notification so we can
        reply.
      </p>
      <h3>Analytics (FlowGlance)</h3>
      <p>
        We use <strong>FlowGlance</strong> as our only analytics tool, to understand which pages help and where people get
        stuck. It records page views, clicks, scrolling and navigation between pages, device and browser type, and approximate
        location derived from your IP address. We have enabled FlowGlance’s detailed capture, which means it also records{" "}
        <strong>text you submit in forms</strong> (for example the email address you type to get your copy again, or a contact
        message) and <strong>images you upload</strong> through any upload field. Your card details are entered on Stripe’s page,
        never on ours, so FlowGlance cannot see them.
      </p>
      <p>
        If you visit from the European Union, the European Economic Area, the United Kingdom or Switzerland, FlowGlance only
        loads after you accept it. Elsewhere it loads by default and you can opt out at any time with the “Cookie settings”
        link in the footer. See our <Link href="/cookie-policy">cookie policy</Link>.
      </p>
      <h3>Error reports</h3>
      <p>
        If something breaks, our servers and your browser send a technical error report (error message, the page, browser and
        device details) to our own error log so we can fix it.
      </p>

      <h2>Who processes data for us</h2>
      <ul>
        <li>
          <strong>Vercel</strong> hosts the website (United States).
        </li>
        <li>
          <strong>Neon</strong> hosts our database: orders, the email each order was delivered to, messages and logs (United
          States).
        </li>
        <li>
          <strong>Resend</strong> sends the email that delivers your book.
        </li>
        <li>
          <strong>Clerk</strong> secures the sign-in to our own admin area (buyers never sign in).
        </li>
        <li>
          <strong>Stripe</strong> processes payments, receipts and refunds.
        </li>
        <li>
          <strong>Cloudflare</strong> provides DNS, email routing for our addresses, private file storage (R2) and the small
          workers that deliver files and route email.
        </li>
        <li>
          <strong>FlowGlance</strong> provides website analytics as described above.
        </li>
        <li>
          <strong>Google Search Console</strong> gives us aggregated search statistics about the site; it does not receive your
          personal data from us.
        </li>
      </ul>
      <p>We do not sell personal information and we do not share it for cross-context behavioral advertising.</p>

      <h2>Legal bases (EU/UK visitors)</h2>
      <ul>
        <li>Performing our contract with you: your purchase and delivering your book.</li>
        <li>Legitimate interests: security, fraud and abuse prevention, error monitoring, answering messages.</li>
        <li>Consent: analytics, for visitors in the EU, EEA, UK and Switzerland. You can withdraw consent at any time.</li>
        <li>Legal obligations: keeping transaction records for tax and accounting.</li>
      </ul>

      <h2>How long we keep it</h2>
      <ul>
        <li>Order records, including the email your book was delivered to: seven years, for tax and accounting.</li>
        <li>Contact messages: up to 24 months.</li>
        <li>Error logs and download logs: up to 12 months.</li>
        <li>Database backups: rolling 30 days.</li>
      </ul>

      <h2>Your rights</h2>
      <p>
        Depending on where you live, you can ask to access, correct, export or delete your personal data, object to or restrict
        certain processing, and withdraw consent. California residents have the right to know, delete and correct personal
        information and not to be discriminated against for exercising those rights. Email{" "}
        <a href={`mailto:${SITE.email}`}>{SITE.email}</a> from the address you bought with and we’ll respond within 30 days. You
        can also complain to your local data protection authority.
      </p>

      <h2>International transfers</h2>
      <p>
        Our providers process data in the United States and other countries. Where required, transfers rely on the providers’
        standard contractual clauses or equivalent safeguards.
      </p>

      <h2>Children</h2>
      <p>This site and the book are intended for adults (18+). We do not knowingly collect data from children.</p>

      <h2>Changes</h2>
      <p>
        If we change this policy we’ll update the date above, and for material changes we’ll tell buyers by email.
      </p>
    </LegalPage>
  );
}
