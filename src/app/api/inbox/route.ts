import { timingSafeEqual } from "node:crypto";
import { and, desc, eq, gt, ilike } from "drizzle-orm";
import { db } from "@/lib/db";
import { inboxMessages } from "@/lib/db/schema";
import { env } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorized(req: Request): boolean {
  const token = env("INBOX_READ_TOKEN");
  const got = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token || !got || got.length !== token.length) return false;
  return timingSafeEqual(Buffer.from(got), Buffer.from(token));
}

/**
 * Protected read access to the test inbox, for automated sign-up tests:
 * GET /api/inbox?to=test@stillgravity.com&since=ISO → latest messages, with the
 * six-digit code (if any) pulled out and the SPF/DKIM/DMARC verdicts.
 */
export async function GET(req: Request) {
  if (!authorized(req)) return Response.json({ error: "unauthorized" }, { status: 401 });
  const url = new URL(req.url);
  const to = url.searchParams.get("to");
  const since = url.searchParams.get("since");
  const conds = [];
  if (to) conds.push(ilike(inboxMessages.toAddr, to.toLowerCase()));
  if (since && !Number.isNaN(Date.parse(since))) conds.push(gt(inboxMessages.receivedAt, new Date(since)));
  const rows = await db
    .select()
    .from(inboxMessages)
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(desc(inboxMessages.receivedAt))
    .limit(Math.min(20, Number(url.searchParams.get("limit") ?? 5) || 5));
  const messages = rows.map((m) => {
    const code = /\b(\d{6})\b/.exec(`${m.subject ?? ""}\n${m.textBody ?? ""}`)?.[1] ?? null;
    return {
      id: m.id,
      to: m.toAddr,
      from: m.fromAddr,
      subject: m.subject,
      code,
      spf: m.spf,
      dkim: m.dkim,
      dmarc: m.dmarc,
      authResults: m.authResults,
      receivedAt: m.receivedAt,
      text: (m.textBody ?? "").slice(0, 2000),
    };
  });
  return Response.json({ messages }, { headers: { "Cache-Control": "no-store" } });
}

/** Clear one message (used by tests to keep the inbox tidy). */
export async function DELETE(req: Request) {
  if (!authorized(req)) return Response.json({ error: "unauthorized" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return Response.json({ error: "id required" }, { status: 400 });
  await db.delete(inboxMessages).where(eq(inboxMessages.id, id));
  return Response.json({ ok: true });
}
