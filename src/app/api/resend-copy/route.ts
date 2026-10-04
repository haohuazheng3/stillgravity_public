import { z } from "zod";
import { resendCopy } from "@/lib/delivery";
import { buyerIdFor, normalizeEmail } from "@/lib/buyers";
import { captureError } from "@/lib/errors";
import { clientIp, ipHash, rateLimit, tooMany } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const Body = z.object({
  email: z.string().trim().email().max(254),
  website: z.string().max(0).optional(), // honeypot
});

const SENT = { ok: true } as const; // same answer whether or not the email bought: no account probing

/** Emails a fresh copy (attachment + new link) to an address that owns the book. */
export async function POST(req: Request) {
  try {
    const rl = await rateLimit(`resend:ip:${ipHash(clientIp(req.headers))}`, 5, 3600);
    if (!rl.ok) return tooMany(rl);

    const parsed = Body.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) {
      if (parsed.error.issues.some((i) => i.path[0] === "website")) return Response.json(SENT);
      return Response.json({ error: "Enter the email address you used at checkout." }, { status: 400 });
    }

    const email = normalizeEmail(parsed.data.email);
    const perEmail = await rateLimit(`resend:email:${buyerIdFor(email)}`, 3, 24 * 3600);
    if (!perEmail.ok) return Response.json(SENT);

    await resendCopy(email);
    return Response.json(SENT);
  } catch (err) {
    await captureError(err, { route: "/api/resend-copy" });
    return Response.json({ error: "We couldn’t send it just now. Please try again in a few minutes, or contact us." }, { status: 500 });
  }
}
