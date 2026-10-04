import { describe, expect, it } from "vitest";
import type Stripe from "stripe";
import { validateSession } from "@/lib/entitlements";

// Guest checkout: the buyer is the email Stripe collected, there is no user id.
const base = {
  id: "cs_test_1",
  mode: "payment",
  status: "complete",
  payment_status: "paid",
  customer_details: { email: "Buyer@Example.com" },
  metadata: { site: "stillgravity", product: "wstty-ebook-v1", env: "production" },
} as unknown as Stripe.Checkout.Session;

const s = (patch: Record<string, unknown>) => ({ ...base, ...patch }) as unknown as Stripe.Checkout.Session;

describe("validateSession", () => {
  it("accepts a paid session for the book on this site", () => {
    expect(validateSession(base, "production")).toEqual({ ok: true });
  });
  it("accepts a 100%-off order (no payment required)", () => {
    expect(validateSession(s({ payment_status: "no_payment_required" }), "production").ok).toBe(true);
  });
  it("ignores sessions from other sites or products", () => {
    expect(validateSession(s({ metadata: { ...base.metadata, site: "liftdecode" } }), "production")).toEqual({ ok: false, reason: "other-site" });
    expect(validateSession(s({ metadata: { ...base.metadata, product: "other" } }), "production")).toEqual({ ok: false, reason: "other-product" });
  });
  it("ignores sessions created by another environment", () => {
    expect(validateSession(base, "preview")).toEqual({ ok: false, reason: "other-env" });
  });
  it("refuses unpaid and open sessions", () => {
    expect(validateSession(s({ payment_status: "unpaid" }), "production")).toEqual({ ok: false, reason: "payment-unpaid" });
    expect(validateSession(s({ status: "open" }), "production")).toEqual({ ok: false, reason: "status-open" });
  });
  it("refuses a session without an email to deliver to", () => {
    expect(validateSession(s({ customer_details: { email: null }, customer_email: null }), "production")).toEqual({ ok: false, reason: "no-email" });
  });
});
