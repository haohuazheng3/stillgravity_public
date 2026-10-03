import { describe, expect, it } from "vitest";
import type Stripe from "stripe";
import { validateSession } from "@/lib/entitlements";

const base = {
  id: "cs_test_1",
  mode: "payment",
  status: "complete",
  payment_status: "paid",
  client_reference_id: "user_1",
  metadata: { site: "stillgravity", product: "wstty-ebook-v1", env: "production", userId: "user_1" },
} as unknown as Stripe.Checkout.Session;

const s = (patch: Record<string, unknown>) => ({ ...base, ...patch }) as unknown as Stripe.Checkout.Session;

describe("validateSession", () => {
  it("accepts a paid session for the book on this site", () => {
    expect(validateSession(base, "production")).toEqual({ ok: true });
  });
  it("accepts a 100%-off order (no payment required)", () => {
    expect(validateSession(s({ payment_status: "no_payment_required" }), "production").ok).toBe(true);
  });
  it("ignores sessions from the other brands sharing the Stripe account", () => {
    expect(validateSession(s({ metadata: { ...base.metadata, site: "liftdecode" } }), "production")).toEqual({ ok: false, reason: "other-site" });
  });
  it("ignores sessions created by another environment", () => {
    expect(validateSession(base, "preview")).toEqual({ ok: false, reason: "other-env" });
  });
  it("refuses unpaid and open sessions", () => {
    expect(validateSession(s({ payment_status: "unpaid" }), "production")).toEqual({ ok: false, reason: "payment-unpaid" });
    expect(validateSession(s({ status: "open" }), "production")).toEqual({ ok: false, reason: "status-open" });
  });
  it("refuses a session without a user", () => {
    expect(validateSession(s({ client_reference_id: null, metadata: { ...base.metadata, userId: undefined } }), "production")).toEqual({ ok: false, reason: "no-user" });
  });
});
