import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/db", () => ({ db: {} }));
vi.mock("@/lib/files", () => ({ readFile: vi.fn(), writeFile: vi.fn(), fileExists: vi.fn() }));
vi.mock("@/lib/mailer", () => ({ sendEmail: vi.fn() }));
vi.mock("@/lib/errors", () => ({ captureError: vi.fn() }));

const { leadMessage, nextSendAfter, unsubscribeUrl, leadIdFor, SAMPLE_PAGES } = await import("@/lib/leads");

describe("Part 1 lead emails", () => {
  it("always carries an unsubscribe link", () => {
    for (const step of [1, 2, 3] as const) {
      const m = leadMessage(step, { token: "tok123", chapter: "4.4", postal: "PO Box 1, Ann Arbor, MI 48104" });
      expect(m.text).toContain(unsubscribeUrl("tok123"));
      expect(m.html).toContain("api/leads/unsubscribe?t=tok123");
    }
  });

  it("puts the postal address on follow-ups when one is configured", () => {
    const m = leadMessage(2, { token: "t", chapter: "4.4", postal: "PO Box 1, Ann Arbor, MI 48104" });
    expect(m.text).toContain("PO Box 1, Ann Arbor, MI 48104");
  });

  it("quotes the chapter for the page the reader came from", () => {
    const m = leadMessage(2, { token: "t", chapter: "4.4", postal: "x" });
    expect(m.subject).toContain("4.4");
    expect(m.text).toContain("left you on read");
  });

  it("schedules follow-ups only with consent and a postal address", () => {
    const now = new Date("2026-10-17T00:00:00Z");
    expect(nextSendAfter(1, false, "x", now)).toBeNull();
    expect(nextSendAfter(1, true, null, now)).toBeNull();
    expect(nextSendAfter(1, true, "x", now)?.toISOString()).toBe("2026-10-19T00:00:00.000Z");
    expect(nextSendAfter(2, true, "x", now)?.toISOString()).toBe("2026-10-20T00:00:00.000Z");
    expect(nextSendAfter(3, true, "x", now)).toBeNull();
  });

  it("keys a lead by its normalised email", () => {
    expect(leadIdFor("  Pat@Example.com ")).toBe(leadIdFor("pat@example.com"));
  });

  it("samples Part 1 and the pages that show what's inside", () => {
    expect(SAMPLE_PAGES).toContain(13); // 1.1
    expect(SAMPLE_PAGES).toContain(20); // 1.8
    expect(SAMPLE_PAGES).toContain(10); // Situation Finder
    expect(SAMPLE_PAGES).not.toContain(41); // 4.4 stays in the paid book
  });
});
