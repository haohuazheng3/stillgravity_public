import { and, count, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { errorGroups } from "@/lib/db/schema";
import { env, IS_PRODUCTION_DEPLOY, missingEnv, REQUIRED_ENV, VERCEL_ENV } from "@/lib/env";
import { stripeMode } from "@/lib/stripe";
import { getState } from "@/lib/app-state";
import { SYNC_LAST_KEY } from "@/lib/stripe-events";

/** The mail worker runs the Stripe event sync every 30 minutes; two missed runs is an outage. */
const SYNC_STALE_MINUTES = 75;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Self-diagnosis, safe to expose: names only, never values.
 * Non-200 when the database is unreachable, a required variable is missing, the error
 * inbox holds unresolved errors of severity "error", or (production) the Stripe event sync
 * has not completed for SYNC_STALE_MINUTES.
 */
export async function GET() {
  const started = Date.now();
  let dbOk = false;
  let dbMs = 0;
  let unresolved = -1;
  let dbError: string | undefined;
  let syncAt: string | undefined;
  try {
    const t = Date.now();
    const rows = await db
      .select({ n: count() })
      .from(errorGroups)
      .where(and(isNull(errorGroups.resolvedAt), eq(errorGroups.severity, "error")));
    dbMs = Date.now() - t;
    dbOk = true;
    unresolved = Number(rows[0]?.n ?? 0);
    syncAt = (await getState<{ ranAt?: string }>(SYNC_LAST_KEY))?.ranAt;
  } catch (e) {
    dbError = e instanceof Error ? e.message.slice(0, 120) : "unknown";
  }

  const missing = missingEnv();
  const syncAgeMinutes = syncAt ? Math.round((Date.now() - Date.parse(syncAt)) / 60000) : null;
  const syncRequired = IS_PRODUCTION_DEPLOY && Boolean(env("STRIPE_SECRET_KEY"));
  const syncOk = !syncRequired || (syncAgeMinutes !== null && syncAgeMinutes <= SYNC_STALE_MINUTES);
  const ok = dbOk && missing.length === 0 && unresolved === 0 && syncOk;
  const body = {
    ok,
    env: VERCEL_ENV,
    commit: (process.env.VERCEL_GIT_COMMIT_SHA ?? "local").slice(0, 12),
    time: new Date().toISOString(),
    db: { ok: dbOk, ms: dbMs, ...(dbError ? { error: dbError } : {}) },
    config: { required: REQUIRED_ENV.length, missing },
    stripe: {
      mode: stripeMode(),
      webhook: Boolean(env("STRIPE_WEBHOOK_SECRET")),
      eventSync: { ok: syncOk, lastRunMinutesAgo: syncAgeMinutes },
    },
    errors: { unresolvedSevere: unresolved },
    tookMs: Date.now() - started,
  };
  return Response.json(body, { status: ok ? 200 : 503, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } });
}
