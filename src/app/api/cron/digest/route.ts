import { timingSafeEqual } from "node:crypto";
import { captureError } from "@/lib/errors";
import { sendErrorDigest } from "@/lib/error-digest";
import { env } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorized(req: Request): boolean {
  const secret = env("CRON_SECRET");
  const got = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!secret || !got || got.length !== secret.length) return false;
  return timingSafeEqual(Buffer.from(got), Buffer.from(secret));
}

/**
 * Daily (the reconcile workflow) or on demand: emails the owner a summary of unresolved
 * errors, at most once per UTC day and only when there are any. Safe to call repeatedly.
 */
export async function POST(req: Request) {
  if (!authorized(req)) return Response.json({ error: "unauthorized" }, { status: 401 });
  try {
    const result = await sendErrorDigest();
    return Response.json(result, { status: result.status === "notify-failed" ? 502 : 200 });
  } catch (err) {
    await captureError(err, { route: "/api/cron/digest", source: "cron" });
    return Response.json({ error: "digest failed" }, { status: 500 });
  }
}
