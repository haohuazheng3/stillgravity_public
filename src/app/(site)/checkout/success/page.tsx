import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { BookVisual } from "@/components/BookVisual";
import { LibraryActions } from "@/components/LibraryActions";
import { PurchaseEvents } from "@/components/PurchaseEvents";
import { AutoRefresh } from "@/components/AutoRefresh";
import { Container } from "@/components/ui";
import { grantFromCheckoutSession } from "@/lib/entitlements";
import { deliverOrder } from "@/lib/delivery";
import { createDownloadToken, DOWNLOAD_LINK_DAYS } from "@/lib/download-token";
import { stripe } from "@/lib/stripe";
import { captureError } from "@/lib/errors";
import { orderRef } from "@/lib/ids";
import { BOOK, SITE } from "@/lib/site";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "You’re in", robots: { index: false, follow: false } };

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <Container className="pt-10 sm:pt-16">
      <div className="mx-auto max-w-3xl">{children}</div>
    </Container>
  );
}

function ContactLine() {
  return (
    <>
      email{" "}
      <a href={`mailto:${SITE.email}`} className="text-accent-text underline">
        {SITE.email}
      </a>
    </>
  );
}

/**
 * Primary unlock path: verify the Checkout Session with Stripe right here, grant the book
 * to the checkout email on the spot and show the download. The delivery email goes out
 * after the response; the webhook and the reconcile job are the fallbacks for both.
 */
export default async function SuccessPage(props: PageProps<"/checkout/success">) {
  const sp = await props.searchParams;
  const sessionId = typeof sp.session_id === "string" ? sp.session_id : "";
  if (!/^cs_(live|test)_[A-Za-z0-9]+$/.test(sessionId)) redirect("/book");

  let session;
  try {
    session = await stripe().checkout.sessions.retrieve(sessionId, { expand: ["payment_intent.latest_charge"] });
  } catch (err) {
    await captureError(err, { route: "/checkout/success", context: { sessionId } });
    return (
      <Shell>
        <div className="slab p-7 sm:p-10" role="alert">
          <h1 className="headline text-[1.8rem] text-ink">We couldn’t confirm that checkout yet.</h1>
          <p className="mt-3 text-[1rem] text-ink-3">
            If you were charged, your PDF is on its way to the email you entered at checkout. Nothing there in ten minutes? <ContactLine />{" "}
            and we’ll sort it out right away.
          </p>
        </div>
      </Shell>
    );
  }

  if (session.status === "open" || session.payment_status === "unpaid") {
    return (
      <Shell>
        <AutoRefresh seconds={4} max={20} />
        <div className="slab p-7 sm:p-10" role="status">
          <p className="tag tag-accent">Confirming payment</p>
          <h1 className="headline mt-4 text-[1.8rem] text-ink">Your bank is still confirming the payment.</h1>
          <p className="mt-3 text-[1rem] text-ink-3">
            This page checks again every few seconds. Some payment methods take a moment; the download appears here and the PDF goes to
            your email the second it clears.
          </p>
          <div className="mt-5 space-y-2">
            <div className="skeleton h-3 w-full" />
            <div className="skeleton h-3 w-3/4" />
          </div>
        </div>
      </Shell>
    );
  }

  const grant = await grantFromCheckoutSession(session, "success_page");
  if (!grant.ok) {
    await captureError(new Error(`success page could not grant: ${grant.reason}`), { route: "/checkout/success", context: { sessionId, reason: grant.reason } });
    return (
      <Shell>
        <div className="slab p-7 sm:p-10" role="alert">
          <h1 className="headline text-[1.8rem] text-ink">Something doesn’t add up with this checkout.</h1>
          <p className="mt-3 text-[1rem] text-ink-3">
            We’ve been alerted and will check it now. If you paid, you won’t lose anything: <ContactLine /> and we’ll reply quickly.
          </p>
        </div>
      </Shell>
    );
  }

  // Email the personal copy after the page is sent (idempotent; the webhook may race us).
  after(async () => {
    await deliverOrder(grant.orderId).catch((err) => captureError(err, { route: "/checkout/success", context: { stage: "deliver", orderId: grant.orderId } }));
  });
  const token = createDownloadToken(grant.userId);

  return (
    <Shell>
      <PurchaseEvents sessionId={session.id} orderId={grant.orderId} amount={grant.amountTotal} currency={grant.currency} />
      <div className="slab overflow-hidden p-6 sm:p-10">
        <div className="grid items-center gap-8 md:grid-cols-[200px_1fr] md:gap-12">
          <BookVisual className="mx-auto w-[48%] max-w-[200px] md:w-full" sizes="200px" />
          <div className="min-w-0">
            <p className="tag tag-ok">Paid · order {orderRef(grant.orderId)}</p>
            <h1 className="display mt-4 text-[2.3rem] text-ink sm:text-[2.8rem]">You’re in.</h1>
            <p className="mt-3 text-[1.02rem] leading-relaxed text-ink-3">
              Your personal copy of {BOOK.displayTitle} is ready. Start with the Situation Finder on page 10, or read Part 1 tonight.
            </p>
            <div className="mt-6">
              <LibraryActions token={token} />
            </div>
            <div className="slab-inset mt-5 p-4 text-[0.9rem] leading-relaxed text-ink-3">
              We’ve also emailed the PDF to <strong className="break-all text-ink">{grant.email}</strong>. It usually arrives within a
              minute; check spam or promotions if you don’t see it. These buttons keep working for {DOWNLOAD_LINK_DAYS} days, and you can
              always get a fresh link at{" "}
              <Link href="/download" className="underline underline-offset-4">
                stillgravity.com/download
              </Link>
              .
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}
