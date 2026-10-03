import "server-only";
import Stripe from "stripe";
import { env, IS_PRODUCTION_DEPLOY, VERCEL_ENV } from "./env";

let client: Stripe | null = null;

export function stripe(): Stripe {
  if (!client) {
    const key = env("STRIPE_SECRET_KEY");
    if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
    client = new Stripe(key, { typescript: true, maxNetworkRetries: 2, appInfo: { name: "stillgravity.com" } });
  }
  return client;
}

export function stripeMode(): "live" | "test" | "missing" {
  const key = env("STRIPE_SECRET_KEY") ?? "";
  if (!key) return "missing";
  return key.includes("_live_") ? "live" : "test";
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
  /** Appended to the account prefix on card statements (max 22 chars in total). */
  statementSuffix: () => env("STRIPE_DESCRIPTOR_SUFFIX") ?? "STILLGRAV",
  /**
   * Optional line under the pay button. Only used while the Stripe account is shared
   * with other brands, to say who operates the site before the buyer pays.
   */
  operatorNote: () => env("CHECKOUT_OPERATOR_NOTE"),
} as const;
