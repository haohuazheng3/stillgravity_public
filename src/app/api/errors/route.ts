import { z } from "zod";
import { captureError } from "@/lib/errors";
import { clientIp, ipHash, rateLimit } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  name: z.string().max(200).default("Error"),
  message: z.string().max(2000).default("(no message)"),
  stack: z.string().max(8000).optional(),
  route: z.string().max(300).optional(),
  source: z.string().max(60).optional(),
  severity: z.enum(["error", "warn"]).default("warn"),
  userAgent: z.string().max(400).optional(),
});

/** Client-side error ingest (sendBeacon). Always answers 204 so the browser never retries or logs noise. */
export async function POST(req: Request) {
  try {
    const rl = await rateLimit(`errors:${ipHash(clientIp(req.headers))}`, 30, 60);
    if (!rl.ok) return new Response(null, { status: 204 });
    const raw = await req.text();
    if (raw.length > 20000) return new Response(null, { status: 204 });
    const parsed = Body.safeParse(JSON.parse(raw || "{}"));
    if (!parsed.success) return new Response(null, { status: 204 });
    const d = parsed.data;
    const err = Object.assign(new Error(d.message), { name: d.name, stack: d.stack ?? "" });
    await captureError(err, {
      route: d.route ?? null,
      source: "client",
      severity: d.severity,
      context: { via: d.source, userAgent: d.userAgent },
    });
  } catch (e) {
    console.error("[api/errors] ingest failed", e);
  }
  return new Response(null, { status: 204 });
}
