import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { SignOutButton } from "@clerk/nextjs";
import { BookVisual } from "@/components/BookVisual";
import { LibraryActions } from "@/components/LibraryActions";
import { BuyButton, Container, TrustLine } from "@/components/ui";
import { ensureUser } from "@/lib/users";
import { activeEntitlement, healFromRecentCheckouts, ordersForUser } from "@/lib/entitlements";
import { BOOK, SITE } from "@/lib/site";
import { orderRef } from "@/lib/ids";
import { db } from "@/lib/db";
import { licensedCopies } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { PRODUCT_ID } from "@/lib/site";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your library", robots: { index: false, follow: false } };

function money(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(cents / 100);
}

export default async function AccountPage(props: PageProps<"/account">) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in?redirect_url=/account");
  const sp = await props.searchParams;

  const [user, firstEnt, firstOrders, copy] = await Promise.all([
    ensureUser(userId),
    activeEntitlement(userId),
    ordersForUser(userId),
    db
      .select({ key: licensedCopies.objectKey })
      .from(licensedCopies)
      .where(and(eq(licensedCopies.userId, userId), eq(licensedCopies.product, PRODUCT_ID)))
      .limit(1),
  ]);
  // Paid but never reached the success page? Recover it here, before showing an empty shelf.
  const healed = !firstEnt && (await healFromRecentCheckouts(userId));
  const [ent, orders] = healed ? await Promise.all([activeEntitlement(userId), ordersForUser(userId)]) : [firstEnt, firstOrders];

  return (
    <Container className="pt-10 sm:pt-14">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow eyebrow-accent">Your library</p>
          <h1 className="display mt-3 text-[2.3rem] text-ink sm:text-[3rem]">{ent ? "Welcome back." : "Your shelf is ready."}</h1>
          <p className="mt-2 text-[0.98rem] text-ink-3">
            Signed in as <strong className="text-ink-2">{user.email}</strong>
          </p>
        </div>
        <SignOutButton redirectUrl="/">
          <button type="button" className="btn btn-quiet btn-sm self-start sm:self-auto">
            Sign out
          </button>
        </SignOutButton>
      </div>

      {sp.owned === "1" && ent ? (
        <p className="slab-inset mt-6 px-5 py-3 text-[0.95rem] text-ink-2" role="status">
          You already own the book, so there’s nothing to pay. It’s right here.
        </p>
      ) : null}

      {ent ? (
        <div className="slab mt-8 overflow-hidden p-6 sm:p-10">
          <div className="grid items-center gap-8 md:grid-cols-[220px_1fr] md:gap-12">
            <BookVisual className="mx-auto w-[52%] max-w-[220px] md:w-full" sizes="220px" />
            <div>
              <p className="tag tag-ok">Owned · {BOOK.edition}</p>
              <h2 className="headline mt-4 text-[1.9rem] text-ink">{BOOK.displayTitle}</h2>
              <p className="dek mt-2 text-[1.05rem]">{BOOK.subtitle}</p>
              <div className="mt-6">
                <LibraryActions prepared={Boolean(copy[0])} />
              </div>
              <p className="mt-4 text-[0.85rem] leading-relaxed text-ink-4">
                Your PDF is a personal copy: each page carries a quiet line with a masked version of your email and your order
                reference. Links are private and expire after a few minutes; come back here any time for a fresh one.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="slab mt-8 p-6 sm:p-10">
          <div className="grid items-center gap-8 md:grid-cols-[200px_1fr] md:gap-12">
            <BookVisual className="mx-auto w-[48%] max-w-[200px] md:w-full" sizes="200px" />
            <div>
              <h2 className="headline text-[1.7rem] text-ink">{BOOK.displayTitle} isn’t in your library yet.</h2>
              <p className="mt-3 max-w-xl text-[1rem] leading-relaxed text-ink-3">
                {BOOK.chapters} one-page chapters for the moments that keep men up at night, {BOOK.priceLabel} once. It appears
                here the second checkout completes.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <BuyButton />
                <Link href="/book/sample" className="btn btn-ghost btn-lg">
                  Read Part 1 free
                </Link>
              </div>
              <TrustLine className="mt-5" />
              <p className="mt-5 text-[0.88rem] text-ink-4">
                Bought it with a different email? Sign out and sign in with that address, or write to{" "}
                <a href={`mailto:${SITE.email}`} className="underline underline-offset-4">
                  {SITE.email}
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      )}

      {orders.length ? (
        <section className="mt-8" aria-labelledby="orders">
          <h2 id="orders" className="eyebrow">
            Orders
          </h2>
          <ul className="slab mt-3 divide-y divide-[var(--line)] px-2">
            {orders.map((o) => (
              <li key={o.id} className="flex flex-col gap-1 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[0.98rem] font-semibold text-ink">
                    {BOOK.displayTitle} · {orderRef(o.id)}
                  </p>
                  <p className="text-[0.85rem] text-ink-3">
                    {new Date(o.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} ·{" "}
                    {money(o.amountTotal, o.currency)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`tag ${o.status === "paid" ? "tag-ok" : "tag-bad"}`}>{o.status}</span>
                  {o.receiptUrl ? (
                    <a href={o.receiptUrl} target="_blank" rel="noopener" className="text-[0.88rem] text-accent-text underline underline-offset-4">
                      Receipt
                    </a>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[0.85rem] text-ink-4">
            Need a refund? Email{" "}
            <a href={`mailto:${SITE.email}?subject=Refund`} className="underline underline-offset-4">
              {SITE.email}
            </a>{" "}
            within {BOOK.refundDays} days of purchase.
          </p>
        </section>
      ) : null}
    </Container>
  );
}
