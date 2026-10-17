import { z } from "zod";
import { subscribeLead } from "@/lib/leads";
import { normalizeEmail } from "@/lib/buyers";
import { captureError } from "@/lib/errors";
import { clientIp, ipHash, rateLimit, tooMany } from "@/lib/ratelimit";
import { sha256 } from "@/lib/ids";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const Body = z.object({
  email: z.string().trim().email().max(254),
  source: z.string().trim().max(200).regex(/^\/[a-z0-9/#?=&_-]*$/i).optional(),
  chapter: z.string().trim().regex(/^\d{1,2}\.\d{1,2}$/).optional(),
  updates: z.boolean().optional(),
  website: z.string().max(0).optional(), // honeypot
});

const OK = { ok: true } as const;

/** Part 1 by email: store the lead and send the free chapters now. */
export async function POST(req: Request) {
  try {
    const ip = ipHash(clientIp(req.headers));
    const rl = await rateLimit(`lead:ip:${ip}`, 5, 3600);
    if (!rl.ok) return tooMany(rl);

    const parsed = Body.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) {
      if (parsed.error.issues.some((i) => i.path[0] === "website")) return Response.json(OK);
      return Response.json({ error: "Enter a valid email address." }, { status: 400 });
    }
    const email = normalizeEmail(parsed.data.email);
    const perEmail = await rateLimit(`lead:email:${sha256(email)}`, 3, 24 * 3600);
    if (!perEmail.ok) return Response.json(OK);

    await subscribeLead({
      email,
      source: parsed.data.source?.split(/[?#]/)[0] ?? null,
      chapter: parsed.data.chapter ?? null,
      updates: parsed.data.updates === true,
      ipHash: ip,
    });
    return Response.json(OK);
  } catch (err) {
    await captureError(err, { route: "/api/leads" });
    return Response.json({ error: "We couldn’t send it just now. Please try again in a few minutes." }, { status: 500 });
  }
}
