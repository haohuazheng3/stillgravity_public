import { z } from "zod";
import { timingSafeEqual } from "node:crypto";
import { db } from "@/lib/db";
import { inboxMessages } from "@/lib/db/schema";
import { newId } from "@/lib/ids";
import { captureError } from "@/lib/errors";
import { env } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  to: z.string().max(320),
  from: z.string().max(500),
  subject: z.string().max(1000).optional(),
  text: z.string().max(200000).optional(),
  html: z.string().max(400000).optional(),
  spf: z.string().max(40).optional(),
  dkim: z.string().max(40).optional(),
  dmarc: z.string().max(40).optional(),
  authResults: z.string().max(4000).optional(),
  headers: z.record(z.string(), z.string()).optional(),
  rawSize: z.number().int().nonnegative().optional(),
});

function authorized(req: Request): boolean {
  const secret = env("INBOX_INGEST_SECRET");
  const got = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!secret || !got || got.length !== secret.length) return false;
  return timingSafeEqual(Buffer.from(got), Buffer.from(secret));
}

/** Called only by the Cloudflare Email Worker for mail sent to test@ / catch-all addresses. */
export async function POST(req: Request) {
  if (!authorized(req)) return Response.json({ error: "unauthorized" }, { status: 401 });
  try {
    const parsed = Body.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return Response.json({ error: "bad payload" }, { status: 400 });
    const d = parsed.data;
    const id = newId("inb");
    await db.insert(inboxMessages).values({
      id,
      toAddr: d.to.toLowerCase(),
      fromAddr: d.from,
      subject: d.subject ?? null,
      textBody: d.text ?? null,
      htmlBody: d.html ? d.html.slice(0, 200000) : null,
      spf: d.spf ?? null,
      dkim: d.dkim ?? null,
      dmarc: d.dmarc ?? null,
      authResults: d.authResults ?? null,
      headers: d.headers ?? null,
      rawSize: d.rawSize ?? 0,
    });
    return Response.json({ ok: true, id });
  } catch (err) {
    await captureError(err, { route: "/api/inbox/ingest", source: "worker" });
    return Response.json({ error: "store failed" }, { status: 500 });
  }
}
