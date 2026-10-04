import "server-only";
import Stripe from "stripe";
import { env, IS_PRODUCTION_DEPLOY, VERCEL_ENV } from "./env";
import { SITE } from "./site";

let client: Stripe | null = null;

/** An organization API key (`sk_org…`) works for every account in the organization. */
function isOrgKey(key: string): boolean {
  return key.startsWith("sk_org");
}

/**
 * The account every request acts on. Required with an organization key, which Stripe
 * only accepts together with a `Stripe-Context` header naming the target account.
 */
export function stripeContext(): string | undefined {
  return env("STRIPE_CONTEXT");
}

export function stripe(): Stripe {
  if (!client) {
    const key = env("STRIPE_SECRET_KEY");
    if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
    const context = stripeContext();
    if (isOrgKey(key) && !context) throw new Error("STRIPE_CONTEXT (acct_…) is required with an organization key");
    client = new Stripe(key, {
      typescript: true,
      maxNetworkRetries: 2,
      appInfo: { name: "stillgravity.com" },
      ...(context ? { stripeContext: context } : {}),
    });
  }
  return client;
}

/** Test-mode keys carry `_test_` in their prefix; live and organization keys are treated as live. */
export function stripeMode(): "live" | "test" | "missing" {
  const key = env("STRIPE_SECRET_KEY") ?? "";
  if (!key) return "missing";
  return key.includes("_test_") ? "test" : "live";
}

/** Tag written into every session's metadata; the webhook ignores sessions from other environments. */
export function stripeEnvTag(): string {
  return VERCEL_ENV;
}

/**
 * Live keys only take money on the production deployment. Preview/dev deployments
 * refuse to open a live Checkout unless explicitly allowed for a supervised test.
 */
export function paymentsEnabled(): { ok: true } | { ok: false; reason: string } {
  const mode = stripeMode();
  if (mode === "missing") return { ok: false, reason: "Payments are not configured yet." };
  if (!env("STRIPE_PRICE_BOOK")) return { ok: false, reason: "Pricing is not configured yet." };
  if (mode === "live" && !IS_PRODUCTION_DEPLOY && process.env.ALLOW_LIVE_CHECKOUT_NONPROD !== "1") {
    return { ok: false, reason: "Checkout is only open on stillgravity.com." };
  }
  return { ok: true };
}

/**
 * Brand shown on Stripe Checkout. This is a server-side whitelist: the browser can
 * never choose which name appears on the payment page or the card statement.
 */
export const CHECKOUT_BRAND = {
  site: "stillgravity",
  displayName: "Still Gravity",
  buttonColor: "#E9A93B",
  /** Square brand mark next to the name at the top of Checkout (Stripe fetches it from our own domain). */
  iconUrl: `${SITE.url}/brand/logo-512.png`,
  /** Shown by the pay button, so buyers know where the book goes before they pay. */
  deliveryNote: "Your PDF is emailed to the address above as soon as you pay, and it’s ready to download on the next page.",
  /**
   * Optional suffix after the account prefix on card statements (max 22 chars in total).
   * Unset on Still Gravity's own Stripe account: the statement shows the account's descriptor.
   */
  statementSuffix: () => env("STRIPE_DESCRIPTOR_SUFFIX"),
  /**
   * Optional line under the pay button. Only needed on a Stripe account shared with other
   * brands, to say who operates the site before the buyer pays.
   */
  operatorNote: () => env("CHECKOUT_OPERATOR_NOTE"),
} as const;
