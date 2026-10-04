import "server-only";
import type Stripe from "stripe";
import { and, eq, gte } from "drizzle-orm";
import { db } from "./db";
import { entitlements, orders } from "./db/schema";
import { stripe, stripeEnvTag } from "./stripe";
import { grantFromCheckoutSession, revokeByPaymentIntent } from "./entitlements";
import { deliverPending } from "./delivery";
import { PRODUCT_ID } from "./site";

export interface ReconcileReport {
  scannedSessions: number;
  ours: number;
  alreadyGranted: number;
  repaired: { sessionId: string; userId: string; orderId: string }[];
  failed: { sessionId: string; reason: string }[];
  refundsApplied: string[];
  /** Delivery emails that hadn't gone out yet: sent now, or still failing. */
  delivery: { sent: string[]; failed: string[] };
  ranAt: string;
}

/**
 * Compares what Stripe says was paid with what the database granted, over the last
 * `days`, and repairs the difference (missing grants, missed refunds). Safe to run
 * any number of times.
 */
export async function reconcile(days = 7): Promise<ReconcileReport> {
  const s = stripe();
  const since = Math.floor(Date.now() / 1000) - days * 86400;
  const report: ReconcileReport = {
    scannedSessions: 0,
    ours: 0,
    alreadyGranted: 0,
    repaired: [],
    failed: [],
    refundsApplied: [],
    delivery: { sent: [], failed: [] },
    ranAt: new Date().toISOString(),
  };

  for await (const session of s.checkout.sessions.list({ created: { gte: since }, status: "complete", limit: 100 })) {
    report.scannedSessions++;
    if (session.metadata?.site !== "stillgravity" || session.metadata?.product !== PRODUCT_ID) continue;
    if ((session.metadata?.env ?? "production") !== stripeEnvTag()) continue;
    report.ours++;
    const existing = await db.select({ id: orders.id }).from(orders).where(eq(orders.stripeSessionId, session.id)).limit(1);
    const full = await s.checkout.sessions.retrieve(session.id, { expand: ["payment_intent.latest_charge"] });
    const r = await grantFromCheckoutSession(full, "reconcile");
    if (!r.ok) {
      if (!r.reason.startsWith("order-")) report.failed.push({ sessionId: session.id, reason: r.reason });
      continue;
    }
    if (existing.length && !r.newlyGranted) report.alreadyGranted++;
    else report.repaired.push({ sessionId: session.id, userId: r.userId, orderId: r.orderId });
  }

  // Refunds Stripe knows about but we missed (e.g. a webhook outage).
  const recent = await db
    .select()
    .from(orders)
    .where(and(eq(orders.status, "paid"), gte(orders.createdAt, new Date(Date.now() - 90 * 86400 * 1000))));
  for (const o of recent) {
    if (!o.stripePaymentIntent) continue;
    const pi = (await s.paymentIntents.retrieve(o.stripePaymentIntent, { expand: ["latest_charge"] }).catch(() => null)) as Stripe.PaymentIntent | null;
    const charge = pi?.latest_charge && typeof pi.latest_charge !== "string" ? pi.latest_charge : null;
    if (charge?.refunded) {
      await revokeByPaymentIntent(o.stripePaymentIntent, "refunded");
      report.refundsApplied.push(o.id);
    }
  }

  // Sanity: every paid order must have an active entitlement.
  const paid = await db.select().from(orders).where(eq(orders.status, "paid"));
  for (const o of paid) {
    const ent = await db
      .select({ id: entitlements.id, status: entitlements.status })
      .from(entitlements)
      .where(and(eq(entitlements.userId, o.userId), eq(entitlements.product, o.product)))
      .limit(1);
    if (!ent[0] || ent[0].status !== "active") report.failed.push({ sessionId: o.stripeSessionId, reason: "paid-order-without-active-entitlement" });
  }

  // Every paid order gets its delivery email, even if the success page and the webhook both missed it.
  report.delivery = await deliverPending();
  return report;
}
