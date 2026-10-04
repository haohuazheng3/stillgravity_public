import { describe, expect, it } from "vitest";
import { HANDLED_EVENT_TYPES, nextCursor } from "@/lib/stripe-events";

const NOW = 1_800_000_000;

describe("nextCursor", () => {
  it("stays put when nothing new arrived", () => {
    expect(nextCursor(NOW - 100, [], [], NOW)).toBe(NOW - 100);
  });

  it("advances to the newest event seen", () => {
    expect(nextCursor(NOW - 1000, [NOW - 900, NOW - 10, NOW - 500], [], NOW)).toBe(NOW - 10);
  });

  it("never moves backwards because of old events in the overlap window", () => {
    expect(nextCursor(NOW - 100, [NOW - 400, NOW - 300], [], NOW)).toBe(NOW - 100);
  });

  it("holds just before a recent failure so the next run retries it", () => {
    expect(nextCursor(NOW - 1000, [NOW - 900, NOW - 10], [NOW - 500], NOW)).toBe(NOW - 501);
  });

  it("stops holding for failures older than a day (reconcile owns them)", () => {
    const old = NOW - 2 * 86400;
    expect(nextCursor(old - 10, [old, NOW - 10], [old], NOW)).toBe(NOW - 10);
  });
});

describe("handled event types", () => {
  it("covers purchase, async payment, refund and dispute paths", () => {
    expect(HANDLED_EVENT_TYPES).toEqual(
      expect.arrayContaining([
        "checkout.session.completed",
        "checkout.session.async_payment_succeeded",
        "charge.refunded",
        "charge.dispute.created",
        "charge.dispute.closed",
      ]),
    );
  });
});
