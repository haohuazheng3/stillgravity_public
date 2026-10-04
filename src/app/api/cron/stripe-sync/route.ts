import { syncStripeEvents } from "@/lib/stripe-events";
import { cronAuthorized } from "@/lib/cron-auth";
import { captureError } from "@/lib/errors";
import { env } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Pull sync of Stripe events (Bearer CRON_SECRET). Called every 30 minutes by the mail
 * worker's cron, and safe to call any time: events are applied once, the cursor only
 * moves forward past events that succeeded.
 */
export async function POST(req: Request) {
  if (!cronAuthorized(req)) return Response.json({ error: "unauthorized" }, { status: 401 });
  if (!env("STRIPE_SECRET_KEY")) return Response.json({ error: "stripe not configured" }, { status: 503 });
  try {
    const report = await syncStripeEvents();
    return Response.json(report, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    // Usually a transient Stripe/network error. A warning only: two missed runs turn /api/health red.
    await captureError(err, { route: "/api/cron/stripe-sync", source: "cron", severity: "warn" });
    return Response.json({ error: "sync failed" }, { status: 502 });
  }
}
