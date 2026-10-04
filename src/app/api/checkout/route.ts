import { auth } from "@clerk/nextjs/server";
import { and, desc, eq, gt, sql } from "drizzle-orm";
import type Stripe from "stripe";
import { db } from "@/lib/db";
import { checkoutAttempts } from "@/lib/db/schema";
import { ensureUser, setStripeCustomer } from "@/lib/users";
import { hasBook, healFromRecentCheckouts } from "@/lib/entitlements";
import { CHECKOUT_BRAND, paymentsEnabled, stripe, stripeEnvTag } from "@/lib/stripe";
import { captureError } from "@/lib/errors";
import { rateLimit, tooMany } from "@/lib/ratelimit";
import { newId } from "@/lib/ids";
import { IS_PRODUCTION_DEPLOY, requireEnv } from "@/lib/env";
import { BOOK, PRODUCT_ID, SITE } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return Response.json({ error: "sign_in_required" }, { status: 401 });

    const rl = await rateLimit(`checkout:${userId}`, 10, 300);
    if (!rl.ok) return tooMany(rl);

    const payments = paymentsEnabled();
    if (!payments.ok) return Response.json({ error: payments.reason }, { status: 503 });

    // Never sell the book twice, including a payment whose success page never loaded.
    if (await hasBook(userId)) return Response.json({ owned: true });
    if (await healFromRecentCheckouts(userId)) return Response.json({ owned: true });

    const user = await ensureUser(userId);
    const s = stripe();

    // Reuse a still-open session (double taps, back button, a second tab).
    const open = await db
      .select()
      .from(checkoutAttempts)
      .where(and(eq(checkoutAttempts.userId, userId), gt(checkoutAttempts.expiresAt, sql`now() + interval '2 minutes'`)))
      .orderBy(desc(checkoutAttempts.createdAt))
      .limit(1);
    if (open[0]) {
      const existing = await s.checkout.sessions.retrieve(open[0].sessionId).catch(() => null);
      if (existing?.status === "open" && existing.url) return Response.json({ url: existing.url, reused: true });
    }

    // One Stripe customer per account, so receipts and refunds share a history.
    let customerId = user.stripeCustomerId;
    if (customerId) {
      const c = await s.customers.retrieve(customerId).catch(() => null);
      if (!c || (c as Stripe.DeletedCustomer).deleted) customerId = null;
    }
    if (!customerId) {
      const c = await s.customers.create(
        { email: user.email, metadata: { userId, site: CHECKOUT_BRAND.site } },
        { idempotencyKey: `sg-cus-${userId}` },
      );
      customerId = c.id;
      await setStripeCustomer(userId, customerId);
    }

    const origin = IS_PRODUCTION_DEPLOY ? SITE.url : new URL(req.url).origin;
    const metadata = { userId, product: PRODUCT_ID, site: CHECKOUT_BRAND.site, env: stripeEnvTag() };
    const note = CHECKOUT_BRAND.operatorNote();
    const minute = Math.floor(Date.now() / 60000);

    const session = await s.checkout.sessions.create(
      {
        mode: "payment",
        line_items: [{ price: requireEnv("STRIPE_PRICE_BOOK"), quantity: 1 }],
        customer: customerId,
        client_reference_id: userId,
        metadata,
        payment_intent_data: {
          metadata,
          description: `${BOOK.title} (ebook)`,
          statement_descriptor_suffix: CHECKOUT_BRAND.statementSuffix(),
        },
        allow_promotion_codes: true,
        success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/book?checkout=cancelled`,
        expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
        branding_settings: {
          display_name: CHECKOUT_BRAND.displayName,
          button_color: CHECKOUT_BRAND.buttonColor,
          border_style: "rounded",
        },
        ...(note ? { custom_text: { submit: { message: note } } } : {}),
      },
      { idempotencyKey: `sg-co-${userId}-${minute}` },
    );

    if (!session.url) throw new Error("Stripe returned a session without a URL");
    await db
      .insert(checkoutAttempts)
      .values({
        id: newId("cha"),
        userId,
        sessionId: session.id,
        url: session.url,
        expiresAt: new Date((session.expires_at ?? Math.floor(Date.now() / 1000) + 1800) * 1000),
      })
      .onConflictDoNothing();

    return Response.json({ url: session.url });
  } catch (err) {
    await captureError(err, { route: "/api/checkout" });
    return Response.json({ error: "We couldn’t open checkout. Please try again in a moment." }, { status: 500 });
  }
}
