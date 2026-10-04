import { z } from "zod";
import { CHECKOUT_BRAND, paymentsEnabled, stripe, stripeEnvTag } from "@/lib/stripe";
import { captureError } from "@/lib/errors";
import { clientIp, ipHash, rateLimit, tooMany } from "@/lib/ratelimit";
import { newToken } from "@/lib/ids";
import { IS_PRODUCTION_DEPLOY, requireEnv } from "@/lib/env";
import { BOOK, PRODUCT_ID, SITE } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** A per-attempt nonce from the browser: double taps and retries of one attempt reuse one session. */
const Body = z.object({ nonce: z.string().regex(/^[A-Za-z0-9_-]{16,64}$/).optional() });

/**
 * Guest checkout: no account. Stripe collects the buyer's email; the success page, the
 * webhook and the reconcile job grant the book to that email and send the PDF there.
 */
export async function POST(req: Request) {
  try {
    const rl = await rateLimit(`checkout:${ipHash(clientIp(req.headers))}`, 10, 300);
    if (!rl.ok) return tooMany(rl);

    const payments = paymentsEnabled();
    if (!payments.ok) return Response.json({ error: payments.reason }, { status: 503 });

    const parsed = Body.safeParse(await req.json().catch(() => ({})));
    const nonce = parsed.success && parsed.data.nonce ? parsed.data.nonce : newToken(12);

    const origin = IS_PRODUCTION_DEPLOY ? SITE.url : new URL(req.url).origin;
    const metadata = { product: PRODUCT_ID, site: CHECKOUT_BRAND.site, env: stripeEnvTag() };
    const note = CHECKOUT_BRAND.operatorNote();
    const suffix = CHECKOUT_BRAND.statementSuffix();

    const session = await stripe().checkout.sessions.create(
      {
        mode: "payment",
        line_items: [{ price: requireEnv("STRIPE_PRICE_BOOK"), quantity: 1 }],
        customer_creation: "always",
        metadata,
        payment_intent_data: {
          metadata,
          description: `${BOOK.title} (ebook)`,
          ...(suffix ? { statement_descriptor_suffix: suffix } : {}),
        },
        allow_promotion_codes: true,
        success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/book?checkout=cancelled`,
        expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
        branding_settings: {
          display_name: CHECKOUT_BRAND.displayName,
          button_color: CHECKOUT_BRAND.buttonColor,
          border_style: "rounded",
          icon: { type: "url", url: CHECKOUT_BRAND.iconUrl },
        },
        custom_text: { submit: { message: note ? `${CHECKOUT_BRAND.deliveryNote} ${note}` : CHECKOUT_BRAND.deliveryNote } },
      },
      { idempotencyKey: `sg-co-${nonce}` },
    );

    if (!session.url) throw new Error("Stripe returned a session without a URL");
    return Response.json({ url: session.url });
  } catch (err) {
    await captureError(err, { route: "/api/checkout" });
    return Response.json({ error: "We couldn’t open checkout. Please try again in a moment." }, { status: 500 });
  }
}
