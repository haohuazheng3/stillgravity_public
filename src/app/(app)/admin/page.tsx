import Link from "next/link";
import { and, count, desc, eq, isNull, sql, sum } from "drizzle-orm";
import { db } from "@/lib/db";
import { appState, contactMessages, downloads, entitlements, errorGroups, inboxMessages, orders, users } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/admin";
import { stripeMode } from "@/lib/stripe";
import { env, missingEnv } from "@/lib/env";
import { SYNC_LAST_KEY, type SyncReport } from "@/lib/stripe-events";
import { orderRef } from "@/lib/ids";

export const dynamic = "force-dynamic";

function money(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

export default async function AdminOverview() {
  await requireAdmin();
  const [u, paid, revenue, ents, errs, msgs, inbox, dls, recent, last, syncRow] = await Promise.all([
    db.select({ n: count() }).from(users),
    db.select({ n: count() }).from(orders).where(eq(orders.status, "paid")),
    db.select({ s: sum(orders.amountTotal) }).from(orders).where(eq(orders.status, "paid")),
    db.select({ n: count() }).from(entitlements).where(eq(entitlements.status, "active")),
    db.select({ n: count() }).from(errorGroups).where(and(isNull(errorGroups.resolvedAt), eq(errorGroups.severity, "error"))),
    db.select({ n: count() }).from(contactMessages).where(eq(contactMessages.status, "new")),
    db.select({ n: count() }).from(inboxMessages),
    db.select({ n: count() }).from(downloads).where(sql`${downloads.createdAt} > now() - interval '7 days'`),
    db.select().from(orders).orderBy(desc(orders.createdAt)).limit(8),
    db.select().from(appState).where(eq(appState.key, "reconcile:last")).limit(1),
    db.select().from(appState).where(eq(appState.key, SYNC_LAST_KEY)).limit(1),
  ]);
  const missing = missingEnv();
  const stats = [
    ["Accounts", u[0]?.n ?? 0, null],
    ["Paid orders", paid[0]?.n ?? 0, null],
    ["Revenue", money(Number(revenue[0]?.s ?? 0)), null],
    ["Active owners", ents[0]?.n ?? 0, null],
    ["Unresolved errors", errs[0]?.n ?? 0, "/admin/errors"],
    ["New messages", msgs[0]?.n ?? 0, "/admin/messages"],
    ["Test inbox", inbox[0]?.n ?? 0, "/admin/inbox"],
    ["Downloads (7d)", dls[0]?.n ?? 0, null],
  ] as const;
  const rec = last[0]?.value as { ranAt?: string; repaired?: unknown[]; failed?: unknown[] } | undefined;
  const sync = syncRow[0]?.value as SyncReport | undefined;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map(([label, value, href]) => {
          const inner = (
            <>
              <p className="text-[0.8rem] text-ink-3">{label}</p>
              <p className="mt-1 font-serif text-[1.9rem] font-semibold leading-none text-ink">{String(value)}</p>
            </>
          );
          return href ? (
            <Link key={label} href={href} className="slab slab-hover p-5">
              {inner}
            </Link>
          ) : (
            <div key={label} className="slab p-5">
              {inner}
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="slab p-5">
          <p className="eyebrow">System</p>
          <ul className="mt-3 space-y-1.5 text-[0.92rem] text-ink-2">
            <li>Stripe mode: <strong>{stripeMode()}</strong></li>
            <li>
              Stripe events: {env("STRIPE_WEBHOOK_SECRET") ? "webhook + " : ""}pull sync ·{" "}
              {sync?.ranAt
                ? `last ${new Date(sync.ranAt).toLocaleString()} · scanned ${sync.scanned} · ours ${sync.ours} · failed ${sync.failed.length}`
                : "never ran"}
            </li>
            <li>Missing env: {missing.length ? <strong className="text-bad">{missing.join(", ")}</strong> : <span className="text-ok">none</span>}</li>
            <li>
              Last reconcile: {rec?.ranAt ? `${new Date(rec.ranAt).toLocaleString()} · repaired ${rec.repaired?.length ?? 0} · failed ${rec.failed?.length ?? 0}` : "never"}
            </li>
            <li>
              <a href="/api/health" className="text-accent-text underline">/api/health</a>
            </li>
          </ul>
        </div>
        <div className="slab p-5">
          <p className="eyebrow">Recent orders</p>
          <ul className="mt-3 space-y-2 text-[0.9rem]">
            {recent.length ? (
              recent.map((o) => (
                <li key={o.id} className="flex justify-between gap-3">
                  <span className="text-ink-2">
                    {orderRef(o.id)} · {o.email ?? o.userId}
                  </span>
                  <span className="text-ink-3">
                    {money(o.amountTotal)} · {o.status}
                  </span>
                </li>
              ))
            ) : (
              <li className="text-ink-4">No orders yet.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
