import { timingSafeEqual } from "node:crypto";
import { deliverPending } from "@/lib/delivery";
import { captureError } from "@/lib/errors";
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

/**
 * Every 30 minutes (Vercel Cron, aligned with the mail worker's health probe so Neon wakes once):
 * retries delivery emails that haven't gone out. One small query when nothing is pending.
 */
async function run(req: Request): Promise<Response> {
  if (!authorized(req)) return Response.json({ error: "unauthorized" }, { status: 401 });
  try {
    const report = await deliverPending(25, 100_000);
    return Response.json(report, { status: report.failed.length ? 409 : 200 });
  } catch (err) {
    await captureError(err, { route: "/api/cron/deliver", source: "cron" });
    return Response.json({ error: "deliver failed" }, { status: 500 });
  }
}

export const GET = run;
export const POST = run;
