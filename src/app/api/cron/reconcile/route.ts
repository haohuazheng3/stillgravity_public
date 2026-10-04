import { timingSafeEqual } from "node:crypto";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { appState } from "@/lib/db/schema";
import { reconcile } from "@/lib/reconcile";
import { captureError } from "@/lib/errors";
import { notifyOwner } from "@/lib/notify";
import { env } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

function authorized(req: Request): boolean {
  const secret = env("CRON_SECRET");
  const got = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!secret || !got || got.length !== secret.length) return false;
  return timingSafeEqual(Buffer.from(got), Buffer.from(secret));
}

/** Daily (GitHub Actions) or on demand: Stripe paid vs database granted, with repairs. */
export async function POST(req: Request) {
  if (!authorized(req)) return Response.json({ error: "unauthorized" }, { status: 401 });
  const days = Math.min(90, Math.max(1, Number(new URL(req.url).searchParams.get("days") ?? 7) || 7));
  try {
    const report = await reconcile(days);
    await db
      .insert(appState)
      .values({ key: "reconcile:last", value: report })
      .onConflictDoUpdate({ target: appState.key, set: { value: report, updatedAt: sql`now()` } });
    if (report.repaired.length || report.failed.length || report.refundsApplied.length) {
      await notifyOwner({ subject: "Reconcile found differences", text: JSON.stringify(report, null, 2) });
    }
    return Response.json(report, { status: report.failed.length ? 409 : 200 });
  } catch (err) {
    await captureError(err, { route: "/api/cron/reconcile", source: "cron" });
    return Response.json({ error: "reconcile failed" }, { status: 500 });
  }
}
