import type Stripe from "stripe";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { stripeEvents } from "@/lib/db/schema";
import { stripe } from "@/lib/stripe";
import { grantFromCheckoutSession, reinstateByPaymentIntent, revokeByPaymentIntent } from "@/lib/entitlements";
import { captureError } from "@/lib/errors";
import { notifyOwner } from "@/lib/notify";
import { requireEnv } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/*
 * Fallback unlock path + refunds/disputes. Verified signature, idempotent on event.id.
 * The Stripe account is shared with other brands, so events that aren't ours are
 * acknowledged (200) and marked "ignored".
 */

async function handle(event: Stripe.Event): Promise<"processed" | "ignored"> {
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const obj = event.data.object as Stripe.Checkout.Session;
      if (obj.metadata?.site !== "stillgravity") return "ignored";
      const full = await stripe().checkout.sessions.retrieve(obj.id, { expand: ["payment_intent.latest_charge"] });
      const r = await grantFromCheckoutSession(full, "webhook");
      if (!r.ok) {
        if (["other-site", "other-env", "other-product"].includes(r.reason)) return "ignored";
        if (r.reason.startsWith("payment-")) return "ignored"; // async methods: wait for async_payment_succeeded
        throw new Error(`grant failed for ${obj.id}: ${r.reason}`);
      }
      return "processed";
    }
    case "checkout.session.async_payment_failed": {
      const obj = event.data.object as Stripe.Checkout.Session;
      if (obj.metadata?.site !== "stillgravity") return "ignored";
      await notifyOwner({ subject: "Async payment failed", text: `Checkout ${obj.id} for ${obj.customer_details?.email ?? "?"} failed to clear.` });
      return "processed";
    }
    case "charge.refunded": {
      const ch = event.data.object as Stripe.Charge;
      const pi = typeof ch.payment_intent === "string" ? ch.payment_intent : ch.payment_intent?.id;
      if (!pi) return "ignored";
      if (!ch.refunded) return "ignored"; // partial refund: access stays
      const userId = await revokeByPaymentIntent(pi, "refunded");
      return userId ? "processed" : "ignored";
    }
    case "charge.dispute.created": {
      const d = event.data.object as Stripe.Dispute;
      const pi = typeof d.payment_intent === "string" ? d.payment_intent : d.payment_intent?.id;
      if (!pi) return "ignored";
      const userId = await revokeByPaymentIntent(pi, "disputed");
      if (userId) await notifyOwner({ subject: "Dispute opened", text: `Dispute ${d.id} on ${pi} (${d.reason}). Access revoked while open.` });
      return userId ? "processed" : "ignored";
    }
    case "charge.dispute.closed": {
      const d = event.data.object as Stripe.Dispute;
      const pi = typeof d.payment_intent === "string" ? d.payment_intent : d.payment_intent?.id;
      if (!pi || d.status !== "won") return "ignored";
      const userId = await reinstateByPaymentIntent(pi);
      return userId ? "processed" : "ignored";
    }
    default:
      return "ignored";
  }
}

export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");
  if (!signature) return Response.json({ error: "missing signature" }, { status: 400 });
  const payload = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(payload, signature, requireEnv("STRIPE_WEBHOOK_SECRET"));
  } catch (err) {
    await captureError(err, { route: "/api/stripe/webhook", severity: "warn", context: { stage: "verify" } });
    return Response.json({ error: "invalid signature" }, { status: 400 });
  }

  try {
    const inserted = await db
      .insert(stripeEvents)
      .values({ id: event.id, type: event.type, status: "received" })
      .onConflictDoNothing()
      .returning({ id: stripeEvents.id });
    if (!inserted.length) {
      const prev = await db.select().from(stripeEvents).where(eq(stripeEvents.id, event.id)).limit(1);
      if (prev[0] && (prev[0].status === "processed" || prev[0].status === "ignored")) {
        return Response.json({ received: true, duplicate: true });
      }
      // a previous attempt failed or crashed mid-way: processing again is safe (grants are idempotent)
    }

    const outcome = await handle(event);
    await db.update(stripeEvents).set({ status: outcome, processedAt: sql`now()`, error: null }).where(eq(stripeEvents.id, event.id));
    return Response.json({ received: true, outcome });
  } catch (err) {
    await db
      .update(stripeEvents)
      .set({ status: "failed", error: err instanceof Error ? err.message.slice(0, 500) : String(err) })
      .where(eq(stripeEvents.id, event.id))
      .catch(() => {});
    await captureError(err, { route: "/api/stripe/webhook", context: { eventId: event.id, type: event.type } });
    // 500 makes Stripe retry with backoff; the success page and reconcile job cover the gap meanwhile.
    return Response.json({ error: "processing failed" }, { status: 500 });
  }
}
