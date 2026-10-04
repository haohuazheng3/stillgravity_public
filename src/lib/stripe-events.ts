import "server-only";
import type Stripe from "stripe";
import { eq, sql } from "drizzle-orm";
import { db } from "./db";
import { orders, stripeEvents } from "./db/schema";
import { CHECKOUT_BRAND, stripe } from "./stripe";
import { grantFromCheckoutSession, reinstateByPaymentIntent, revokeByPaymentIntent } from "./entitlements";
import { captureError } from "./errors";
import { notifyOwner } from "./notify";
import { getState, setState } from "./app-state";

/*
 * Stripe events reach us two ways, and both go through applyEvent():
 *  - push: /api/stripe/webhook (signature-verified), when an endpoint is registered;
 *  - pull: syncStripeEvents(), every 30 minutes from the mail worker's cron. The shared
 *    Stripe account has no free webhook slot, so pull is what runs today.
 * stripe_events is the idempotency ledger for both: an event id is applied once.
 */

export const HANDLED_EVENT_TYPES = [
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
  "checkout.session.async_payment_failed",
  "charge.refunded",
  "charge.dispute.created",
  "charge.dispute.closed",
] as const;

export type EventSource = "webhook" | "sync";
export type EventOutcome = "processed" | "ignored";

function idOf(v: string | { id: string } | null | undefined): string | null {
  if (!v) return null;
  return typeof v === "string" ? v : v.id;
}

async function handle(event: Stripe.Event, source: EventSource): Promise<EventOutcome> {
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const obj = event.data.object as Stripe.Checkout.Session;
      if (obj.metadata?.site !== CHECKOUT_BRAND.site) return "ignored";
      const full = await stripe().checkout.sessions.retrieve(obj.id, { expand: ["payment_intent.latest_charge"] });
      const r = await grantFromCheckoutSession(full, source);
      if (!r.ok) {
        if (["other-site", "other-env", "other-product"].includes(r.reason)) return "ignored";
        if (r.reason.startsWith("payment-")) return "ignored"; // async methods: wait for async_payment_succeeded
        if (r.reason.startsWith("order-")) return "ignored"; // refunded/disputed before this event arrived
        throw new Error(`grant failed for ${obj.id}: ${r.reason}`);
      }
      return "processed";
    }
    case "checkout.session.async_payment_failed": {
      const obj = event.data.object as Stripe.Checkout.Session;
      if (obj.metadata?.site !== CHECKOUT_BRAND.site) return "ignored";
      await notifyOwner({ subject: "Async payment failed", text: `Checkout ${obj.id} for ${obj.customer_details?.email ?? "?"} failed to clear.` });
      return "processed";
    }
    case "charge.refunded": {
      const ch = event.data.object as Stripe.Charge;
      const pi = idOf(ch.payment_intent);
      if (!pi) return "ignored";
      if (!ch.refunded) return "ignored"; // partial refund: access stays
      const userId = await revokeByPaymentIntent(pi, "refunded");
      return userId ? "processed" : "ignored";
    }
    case "charge.dispute.created": {
      const d = event.data.object as Stripe.Dispute;
      const pi = idOf(d.payment_intent);
      if (!pi) return "ignored";
      const userId = await revokeByPaymentIntent(pi, "disputed");
      if (userId) await notifyOwner({ subject: "Dispute opened", text: `Dispute ${d.id} on ${pi} (${d.reason}). Access revoked while open.` });
      return userId ? "processed" : "ignored";
    }
    case "charge.dispute.closed": {
      const d = event.data.object as Stripe.Dispute;
      const pi = idOf(d.payment_intent);
      if (!pi || d.status !== "won") return "ignored";
      const userId = await reinstateByPaymentIntent(pi);
      return userId ? "processed" : "ignored";
    }
    default:
      return "ignored";
  }
}

/**
 * Applies one event exactly once (ledger on event.id). A row left "received" or "failed"
 * by an earlier crash is processed again, which is safe because every grant/revoke is idempotent.
 * Throws after marking the row "failed", so the caller decides how to retry.
 */
export async function applyEvent(event: Stripe.Event, source: EventSource): Promise<EventOutcome | "duplicate"> {
  const inserted = await db
    .insert(stripeEvents)
    .values({ id: event.id, type: event.type, status: "received" })
    .onConflictDoNothing()
    .returning({ id: stripeEvents.id });
  if (!inserted.length) {
    const prev = await db.select({ status: stripeEvents.status }).from(stripeEvents).where(eq(stripeEvents.id, event.id)).limit(1);
    if (prev[0]?.status === "processed" || prev[0]?.status === "ignored") return "duplicate";
  }
  try {
    const outcome = await handle(event, source);
    await db.update(stripeEvents).set({ status: outcome, processedAt: sql`now()`, error: null }).where(eq(stripeEvents.id, event.id));
    return outcome;
  } catch (err) {
    await db
      .update(stripeEvents)
      .set({ status: "failed", error: err instanceof Error ? err.message.slice(0, 500) : String(err) })
      .where(eq(stripeEvents.id, event.id))
      .catch(() => {});
    throw err;
  }
}

/** The account is shared with other brands: decide cheaply, before touching the ledger, whether an event can be ours. */
export async function concernsUs(event: Stripe.Event): Promise<boolean> {
  const obj = event.data.object as { metadata?: Record<string, string> | null; payment_intent?: string | { id: string } | null };
  if (event.type.startsWith("checkout.session.")) return obj.metadata?.site === CHECKOUT_BRAND.site;
  const pi = idOf(obj.payment_intent);
  if (!pi) return false;
  const rows = await db.select({ id: orders.id }).from(orders).where(eq(orders.stripePaymentIntent, pi)).limit(1);
  return rows.length > 0;
}

/* ---------- pull sync ---------- */

export const SYNC_CURSOR_KEY = "stripe-sync:cursor";
export const SYNC_LAST_KEY = "stripe-sync:last";
const OVERLAP_S = 600; // re-read the last 10 minutes: an event can appear in the list a little after its `created`
const FIRST_RUN_LOOKBACK_S = 3 * 86400;
const RETENTION_S = 29 * 86400; // Stripe lists events from the last 30 days
const HOLD_FAILURES_S = 86400; // retry a failed event for a day; after that the daily reconcile owns it
const MAX_EVENTS = 5000;

/** Pure, exported for tests: the `created` timestamp the next run continues from. */
export function nextCursor(prev: number, seen: number[], failed: number[], now: number): number {
  let next = seen.length ? Math.max(prev, ...seen) : prev;
  const holding = failed.filter((c) => now - c < HOLD_FAILURES_S);
  if (holding.length) next = Math.min(next, Math.min(...holding) - 1);
  return next;
}

export interface SyncReport {
  ranAt: string;
  since: number;
  cursor: number;
  scanned: number;
  ours: number;
  processed: number;
  ignored: number;
  duplicates: number;
  failed: { id: string; type: string; error: string }[];
  truncated: boolean;
  tookMs: number;
}

export async function syncStripeEvents(): Promise<SyncReport> {
  const started = Date.now();
  const now = Math.floor(started / 1000);
  const prev = (await getState<{ created: number }>(SYNC_CURSOR_KEY))?.created ?? now - FIRST_RUN_LOOKBACK_S;
  const since = Math.max(prev - OVERLAP_S, now - RETENTION_S);

  const events: Stripe.Event[] = [];
  let truncated = false;
  for await (const e of stripe().events.list({ types: [...HANDLED_EVENT_TYPES], created: { gte: since }, limit: 100 })) {
    events.push(e);
    if (events.length >= MAX_EVENTS) {
      truncated = true;
      break;
    }
  }
  // Oldest first, so a purchase is applied before its refund.
  events.sort((a, b) => a.created - b.created || a.id.localeCompare(b.id));

  const report: SyncReport = { ranAt: new Date().toISOString(), since, cursor: prev, scanned: events.length, ours: 0, processed: 0, ignored: 0, duplicates: 0, failed: [], truncated, tookMs: 0 };
  const failedCreated: number[] = [];
  for (const e of events) {
    if (!(await concernsUs(e))) continue;
    report.ours++;
    try {
      const outcome = await applyEvent(e, "sync");
      if (outcome === "processed") report.processed++;
      else if (outcome === "ignored") report.ignored++;
      else report.duplicates++;
    } catch (err) {
      failedCreated.push(e.created);
      report.failed.push({ id: e.id, type: e.type, error: err instanceof Error ? err.message.slice(0, 200) : String(err) });
      await captureError(err, { route: "/api/cron/stripe-sync", source: "cron", context: { eventId: e.id, type: e.type } });
    }
  }
  if (truncated) {
    // Only the newest MAX_EVENTS were read; older gaps are repaired by the daily reconcile.
    await captureError(new Error(`Stripe event sync read the ${MAX_EVENTS}-event cap since ${since}`), { route: "/api/cron/stripe-sync", source: "cron", severity: "warn" });
  }

  report.cursor = nextCursor(prev, events.map((e) => e.created), failedCreated, now);
  report.tookMs = Date.now() - started;
  await setState(SYNC_CURSOR_KEY, { created: report.cursor });
  await setState(SYNC_LAST_KEY, report);
  return report;
}
