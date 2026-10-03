import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { BookVisual } from "@/components/BookVisual";
import { LibraryActions } from "@/components/LibraryActions";
import { PurchaseEvents } from "@/components/PurchaseEvents";
import { AutoRefresh } from "@/components/AutoRefresh";
import { Container } from "@/components/ui";
import { grantFromCheckoutSession } from "@/lib/entitlements";
import { stripe } from "@/lib/stripe";
import { captureError } from "@/lib/errors";
import { ensureUser } from "@/lib/users";
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

/**
 * Primary unlock path: verify the Checkout Session with Stripe right here and grant on
 * the spot (never wait for the webhook). The webhook and the reconcile job are the
 * fallbacks; all three share the same idempotent grant.
 */
export default async function SuccessPage(props: PageProps<"/checkout/success">) {
  const { userId } = await auth();
  const sp = await props.searchParams;
  const sessionId = typeof sp.session_id === "string" ? sp.session_id : "";
  if (!userId) redirect(`/sign-in?redirect_url=${encodeURIComponent(`/checkout/success?session_id=${sessionId}`)}`);
  if (!/^cs_(live|test)_[A-Za-z0-9]+$/.test(sessionId)) redirect("/account");

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
            If you were charged, your book will appear in your library within a minute. If it doesn’t, email{" "}
            <a href={`mailto:${SITE.email}`} className="text-accent-text underline">
              {SITE.email}
            </a>{" "}
            and we’ll sort it out right away.
          </p>
          <Link href="/account" className="btn btn-primary mt-6">
            Open my library
          </Link>
        </div>
      </Shell>
    );
  }

  const owner = session.client_reference_id || session.metadata?.userId;
  if (owner && owner !== userId) {
    return (
      <Shell>
        <div className="slab p-7 sm:p-10" role="alert">
          <h1 className="headline text-[1.8rem] text-ink">This purchase belongs to another account.</h1>
          <p className="mt-3 text-[1rem] text-ink-3">Sign out and sign in with the email you used before checkout to see the book.</p>
          <Link href="/account" className="btn btn-ghost mt-6">
            Go to my library
          </Link>
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
            This page checks again every few seconds. Some payment methods take a moment; the book unlocks automatically the
            second it clears.
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
            We’ve been alerted and will check it now. If you paid, you won’t lose anything: email{" "}
            <a href={`mailto:${SITE.email}`} className="text-accent-text underline">
              {SITE.email}
            </a>{" "}
            and we’ll reply quickly.
          </p>
          <Link href="/account" className="btn btn-ghost mt-6">
            Open my library
          </Link>
        </div>
      </Shell>
    );
  }

  const user = await ensureUser(userId);

  return (
    <Shell>
      <PurchaseEvents sessionId={session.id} orderId={grant.orderId} amount={grant.amountTotal} currency={grant.currency} />
      <div className="slab overflow-hidden p-6 sm:p-10">
        <div className="grid items-center gap-8 md:grid-cols-[200px_1fr] md:gap-12">
          <BookVisual className="mx-auto w-[48%] max-w-[200px] md:w-full" sizes="200px" />
          <div>
            <p className="tag tag-ok">Unlocked · order {orderRef(grant.orderId)}</p>
            <h1 className="display mt-4 text-[2.3rem] text-ink sm:text-[2.8rem]">You’re in.</h1>
            <p className="mt-3 text-[1.02rem] leading-relaxed text-ink-3">
              {BOOK.title} is in your library for good. Start with the Situation Finder on page 10, or read Part 1 tonight.
            </p>
            <div className="mt-6">
              <LibraryActions />
            </div>
            <p className="mt-4 text-[0.85rem] text-ink-4">
              A receipt goes to {session.customer_details?.email ?? user.email}. Your library is always at{" "}
              <Link href="/account" className="underline underline-offset-4">
                stillgravity.com/account
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </Shell>
  );
}
