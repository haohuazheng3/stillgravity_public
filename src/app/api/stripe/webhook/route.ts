import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { applyEvent, concernsUs } from "@/lib/stripe-events";
import { captureError } from "@/lib/errors";
import { env } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/*
 * Push path for Stripe events (fallback unlock, refunds, disputes): verified signature,
 * idempotent on event.id via applyEvent(). Optional: without STRIPE_WEBHOOK_SECRET the
 * same events arrive through the scheduled pull sync (src/lib/stripe-events.ts).
 * The Stripe account is shared with other brands, so their events are acknowledged (200).
 */
export async function POST(req: Request) {
  const secret = env("STRIPE_WEBHOOK_SECRET");
  if (!secret) return Response.json({ error: "webhook not configured" }, { status: 404 });
  const signature = req.headers.get("stripe-signature");
  if (!signature) return Response.json({ error: "missing signature" }, { status: 400 });
  const payload = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(payload, signature, secret);
  } catch (err) {
    await captureError(err, { route: "/api/stripe/webhook", severity: "warn", context: { stage: "verify" } });
    return Response.json({ error: "invalid signature" }, { status: 400 });
  }

  try {
    if (!(await concernsUs(event))) return Response.json({ received: true, outcome: "ignored" });
    const outcome = await applyEvent(event, "webhook");
    return Response.json({ received: true, outcome });
  } catch (err) {
    await captureError(err, { route: "/api/stripe/webhook", context: { eventId: event.id, type: event.type } });
    // 500 makes Stripe retry with backoff; the success page, the pull sync and reconcile cover the gap meanwhile.
    return Response.json({ error: "processing failed" }, { status: 500 });
  }
}
