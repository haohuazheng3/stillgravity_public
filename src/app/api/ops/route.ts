import { timingSafeEqual } from "node:crypto";
import { isNull, sql, and, like } from "drizzle-orm";
import { db } from "@/lib/db";
import { errorGroups } from "@/lib/db/schema";
import { env } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorized(req: Request): boolean {
  const secret = env("CRON_SECRET");
  const got = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!secret || !got || got.length !== secret.length) return false;
  return timingSafeEqual(Buffer.from(got), Buffer.from(secret));
}

/**
 * Operator endpoint (Bearer CRON_SECRET), used by verification scripts:
 *  POST ?action=throw           → a real unhandled server error (captured by onRequestError)
 *  POST ?action=resolve-drills  → resolve the deliberate "Diagnostics:" errors after a drill
 */
export async function POST(req: Request) {
  if (!authorized(req)) return Response.json({ error: "unauthorized" }, { status: 401 });
  const action = new URL(req.url).searchParams.get("action");
  if (action === "throw") {
    throw new Error(`Diagnostics: deliberate server error via ops at ${new Date().toISOString()}`);
  }
  if (action === "resolve-drills") {
    const rows = await db
      .update(errorGroups)
      .set({ resolvedAt: sql`now()` })
      .where(and(isNull(errorGroups.resolvedAt), like(errorGroups.message, "Diagnostics:%")))
      .returning({ id: errorGroups.id });
    return Response.json({ resolved: rows.length });
  }
  return Response.json({ error: "unknown action" }, { status: 400 });
}
