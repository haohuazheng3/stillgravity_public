import { timingSafeEqual } from "node:crypto";
import { sendDueLeadEmails } from "@/lib/leads";
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

/** Daily (GitHub Actions): send the Part 1 follow-ups that are due (opted-in leads only). */
export async function POST(req: Request) {
  if (!authorized(req)) return Response.json({ error: "unauthorized" }, { status: 401 });
  try {
    const report = await sendDueLeadEmails();
    return Response.json(report, { status: report.failed ? 409 : 200 });
  } catch (err) {
    await captureError(err, { route: "/api/cron/leads", source: "cron" });
    return Response.json({ error: "lead follow-ups failed" }, { status: 500 });
  }
}
