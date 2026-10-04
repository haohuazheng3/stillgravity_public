import "server-only";
import type Stripe from "stripe";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "./db";
import { entitlements, orders } from "./db/schema";
import { newId } from "./ids";
import { PRODUCT_ID } from "./site";
import { CHECKOUT_BRAND, stripeEnvTag } from "./stripe";
import { ensureBuyer, normalizeEmail } from "./buyers";

/*
 * The ONLY place that decides who owns the book. Checkout is a guest checkout: the buyer
 * is the email entered on Stripe's page. The success page (primary path), the webhook
 * (fallback) and the reconcile job all call grantFromCheckoutSession, which is
 * idempotent on the Checkout Session id.
 */

export type OrderRow = typeof orders.$inferSelect;
export type EntitlementRow = typeof entitlements.$inferSelect;

export async function activeEntitlement(buyerId: string): Promise<EntitlementRow | null> {
  const rows = await db
    .select()
    .from(entitlements)
    .where(and(eq(entitlements.userId, buyerId), eq(entitlements.product, PRODUCT_ID), eq(entitlements.status, "active")))
    .limit(1);
  return rows[0] ?? null;
}

export async function ordersForBuyer(buyerId: string): Promise<OrderRow[]> {
  return db.select().from(orders).where(eq(orders.userId, buyerId)).orderBy(desc(orders.createdAt)).limit(20);
}

export type GrantResult =
  | { ok: true; userId: string; email: string; orderId: string; newlyGranted: boolean; amountTotal: number; currency: string }
  | { ok: false; reason: string };

function sessionEmail(s: Stripe.Checkout.Session): string | null {
  return s.customer_details?.email ?? s.customer_email ?? null;
}

/** Pure validation, exported for tests: is this session a completed purchase of the book on this site? */
export function validateSession(s: Stripe.Checkout.Session, envTag: string): { ok: true } | { ok: false; reason: string } {
  if (s.metadata?.site !== CHECKOUT_BRAND.site) return { ok: false, reason: "other-site" };
  if (s.metadata?.product !== PRODUCT_ID) return { ok: false, reason: "other-product" };
  if ((s.metadata?.env ?? "production") !== envTag) return { ok: false, reason: "other-env" };
  if (s.mode !== "payment") return { ok: false, reason: "not-payment-mode" };
  if (s.status !== "complete") return { ok: false, reason: `status-${s.status}` };
  if (s.payment_status !== "paid" && s.payment_status !== "no_payment_required") {
    return { ok: false, reason: `payment-${s.payment_status}` };
  }
  if (!sessionEmail(s)) return { ok: false, reason: "no-email" };
  return { ok: true };
}

function idOf(v: string | { id: string } | null | undefined): string | null {
  if (!v) return null;
  return typeof v === "string" ? v : v.id;
}

export async function grantFromCheckoutSession(
  s: Stripe.Checkout.Session,
  source: "success_page" | "webhook" | "reconcile",
): Promise<GrantResult> {
  const valid = validateSession(s, stripeEnvTag());
  if (!valid.ok) return valid;
  const email = normalizeEmail(sessionEmail(s)!);
  const userId = (await ensureBuyer(email)).id;

  const pi = s.payment_intent;
  const piId = idOf(pi as string | { id: string } | null);
  let receiptUrl: string | null = null;
  if (pi && typeof pi !== "string") {
    const charge = pi.latest_charge;
    if (charge && typeof charge !== "string") receiptUrl = charge.receipt_url ?? null;
  }
  const promo = s.discounts?.[0]?.promotion_code;

  await db
    .insert(orders)
    .values({
      id: newId("ord"),
      userId,
      product: PRODUCT_ID,
      stripeSessionId: s.id,
      stripePaymentIntent: piId,
      stripeCustomerId: idOf(s.customer as string | { id: string } | null),
      amountTotal: s.amount_total ?? 0,
      currency: s.currency ?? "usd",
      status: "paid",
      promoCode: idOf(promo as string | { id: string } | null | undefined),
      receiptUrl,
      email,
      source,
    })
    .onConflictDoNothing({ target: orders.stripeSessionId });

  const orderRows = await db.select().from(orders).where(eq(orders.stripeSessionId, s.id)).limit(1);
  const order = orderRows[0];
  if (!order) return { ok: false, reason: "order-not-persisted" };
  if (order.userId !== userId) return { ok: false, reason: "user-mismatch" };
  // A refunded or disputed order must never be re-granted by a late or replayed event.
  if (order.status !== "paid") return { ok: false, reason: `order-${order.status}` };
  if (receiptUrl && !order.receiptUrl) {
    await db.update(orders).set({ receiptUrl, updatedAt: sql`now()` }).where(eq(orders.id, order.id));
  }

  const before = await activeEntitlement(userId);
  await db
    .insert(entitlements)
    .values({ id: newId("ent"), userId, product: PRODUCT_ID, orderId: order.id, status: "active" })
    .onConflictDoUpdate({
      target: [entitlements.userId, entitlements.product],
      set: {
        orderId: sql`CASE WHEN ${entitlements.status} = 'revoked' THEN ${order.id} ELSE ${entitlements.orderId} END`,
        status: "active",
        revokedAt: null,
        revokeReason: null,
        grantedAt: sql`CASE WHEN ${entitlements.status} = 'revoked' THEN now() ELSE ${entitlements.grantedAt} END`,
      },
    });

  return {
    ok: true,
    userId,
    email,
    orderId: order.id,
    newlyGranted: before === null,
    amountTotal: order.amountTotal,
    currency: order.currency,
  };
}

/** Refund or lost dispute: mark the order and revoke access. Returns the affected user, if any. */
export async function revokeByPaymentIntent(paymentIntentId: string, reason: "refunded" | "disputed"): Promise<string | null> {
  const rows = await db.select().from(orders).where(eq(orders.stripePaymentIntent, paymentIntentId)).limit(1);
  const order = rows[0];
  if (!order) return null;
  await db
    .update(orders)
    .set({ status: reason, updatedAt: sql`now()`, refundedAt: reason === "refunded" ? sql`now()` : order.refundedAt })
    .where(eq(orders.id, order.id));
  await db
    .update(entitlements)
    .set({ status: "revoked", revokedAt: sql`now()`, revokeReason: reason })
    .where(and(eq(entitlements.userId, order.userId), eq(entitlements.orderId, order.id)));
  return order.userId;
}

/** Dispute closed in our favour: restore the order and the access it paid for. */
export async function reinstateByPaymentIntent(paymentIntentId: string): Promise<string | null> {
  const rows = await db.select().from(orders).where(eq(orders.stripePaymentIntent, paymentIntentId)).limit(1);
  const order = rows[0];
  if (!order || order.status !== "disputed") return null;
  await db.update(orders).set({ status: "paid", updatedAt: sql`now()` }).where(eq(orders.id, order.id));
  await db
    .update(entitlements)
    .set({ status: "active", revokedAt: null, revokeReason: null })
    .where(and(eq(entitlements.userId, order.userId), eq(entitlements.orderId, order.id)));
  return order.userId;
}
