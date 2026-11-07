import "server-only";
import { and, count, desc, eq, isNull, sql } from "drizzle-orm";
import { db } from "./db";
import { appState, errorGroups } from "./db/schema";
import { notifyOwner } from "./notify";
import { SITE } from "./site";

/**
 * Daily summary of the error inbox: one email per UTC day while unresolved errors of
 * severity "error" exist, none when there are zero. Read-only on `error_groups`; the
 * "already sent today" marker lives in `app_state` under DIGEST_KEY.
 */
export const DIGEST_KEY = "errors:digest";
const TOP = 10;

export interface DigestGroup {
  name: string;
  message: string;
  route: string | null;
  source: string;
  count: number;
  firstSeen: Date;
  lastSeen: Date;
}

export function utcDay(now: Date): string {
  return now.toISOString().slice(0, 10);
}

function stamp(d: Date): string {
  return `${d.toISOString().slice(0, 16).replace("T", " ")} UTC`;
}

/** Subject and body of the digest email, or null when there is nothing to report. */
export function buildDigest(input: { day: string; severe: number; warnings: number; top: DigestGroup[]; inboxUrl: string }): { subject: string; text: string } | null {
  if (input.severe <= 0) return null;
  const lines = input.top.map((g, i) => {
    const message = g.message.replace(/\s+/g, " ").trim();
    return [
      `${i + 1}. ${g.name}: ${message.length > 160 ? `${message.slice(0, 157)}...` : message}`,
      `   ${g.route ?? "-"} · ${g.source} · ${g.count}× · first ${stamp(g.firstSeen)} · last ${stamp(g.lastSeen)}`,
    ].join("\n");
  });
  const more = input.severe > input.top.length ? [`...and ${input.severe - input.top.length} more.`] : [];
  const text = [
    `Unresolved errors in the inbox on ${input.day}: ${input.severe} group${input.severe === 1 ? "" : "s"} of severity "error"${input.warnings ? `, plus ${input.warnings} warning group${input.warnings === 1 ? "" : "s"}` : ""}.`,
    "The site itself is up: open errors no longer turn /api/health red. This digest goes out at most once a day until the inbox has no unresolved errors.",
    "",
    ...lines,
    ...more,
    "",
    `Review and resolve: ${input.inboxUrl}`,
  ].join("\n");
  return { subject: `Daily error digest: ${input.severe} unresolved error${input.severe === 1 ? "" : "s"}`, text };
}

export type DigestResult = { status: "none" | "already-sent" | "sent" | "notify-failed"; day: string; severe: number; warnings: number };

export async function sendErrorDigest(now = new Date()): Promise<DigestResult> {
  const day = utcDay(now);
  const counts = await db
    .select({ severity: errorGroups.severity, n: count() })
    .from(errorGroups)
    .where(isNull(errorGroups.resolvedAt))
    .groupBy(errorGroups.severity);
  const severe = Number(counts.find((c) => c.severity === "error")?.n ?? 0);
  const warnings = counts.filter((c) => c.severity !== "error").reduce((n, c) => n + Number(c.n), 0);
  if (severe === 0) return { status: "none", day, severe, warnings };

  // Claim today atomically before sending, so a re-run or a concurrent call can't send twice.
  const claimed = await db
    .insert(appState)
    .values({ key: DIGEST_KEY, value: { day, severe } })
    .onConflictDoUpdate({
      target: appState.key,
      set: { value: { day, severe }, updatedAt: sql`now()` },
      setWhere: sql`${appState.value}->>'day' IS DISTINCT FROM ${day}`,
    })
    .returning({ key: appState.key });
  if (claimed.length === 0) return { status: "already-sent", day, severe, warnings };

  const top = await db
    .select({
      name: errorGroups.name,
      message: errorGroups.message,
      route: errorGroups.route,
      source: errorGroups.source,
      count: errorGroups.count,
      firstSeen: errorGroups.firstSeen,
      lastSeen: errorGroups.lastSeen,
    })
    .from(errorGroups)
    .where(and(isNull(errorGroups.resolvedAt), eq(errorGroups.severity, "error")))
    .orderBy(desc(errorGroups.lastSeen))
    .limit(TOP);
  const mail = buildDigest({ day, severe, warnings, top, inboxUrl: `${SITE.url}/admin/errors` });
  if (!mail) return { status: "none", day, severe, warnings };

  if (await notifyOwner(mail)) return { status: "sent", day, severe, warnings };
  // Release today's claim so the next run can try again.
  await db
    .update(appState)
    .set({ value: { day: null, failedDay: day }, updatedAt: sql`now()` })
    .where(eq(appState.key, DIGEST_KEY))
    .catch(() => {});
  return { status: "notify-failed", day, severe, warnings };
}
