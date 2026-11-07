import { describe, expect, it } from "vitest";
import { buildDigest, utcDay, type DigestGroup } from "@/lib/error-digest";

const group = (i: number): DigestGroup => ({
  name: "TypeError",
  message: `x is undefined   (case ${i})`,
  route: `/api/r${i}`,
  source: "server",
  count: i + 1,
  firstSeen: new Date("2026-11-01T10:00:00Z"),
  lastSeen: new Date("2026-11-06T09:30:00Z"),
});

describe("daily error digest", () => {
  it("sends nothing when there are no unresolved severe errors", () => {
    expect(buildDigest({ day: "2026-11-06", severe: 0, warnings: 4, top: [], inboxUrl: "https://x/admin/errors" })).toBeNull();
  });
  it("summarizes count, top items and links to the inbox", () => {
    const mail = buildDigest({ day: "2026-11-06", severe: 12, warnings: 1, top: Array.from({ length: 10 }, (_, i) => group(i)), inboxUrl: "https://x/admin/errors" })!;
    expect(mail.subject).toBe("Daily error digest: 12 unresolved errors");
    expect(mail.text).toContain("12 groups of severity \"error\", plus 1 warning group");
    expect(mail.text).toContain("1. TypeError: x is undefined (case 0)");
    expect(mail.text).toContain("/api/r0 · server · 1× · first 2026-11-01 10:00 UTC · last 2026-11-06 09:30 UTC");
    expect(mail.text).toContain("...and 2 more.");
    expect(mail.text).toContain("https://x/admin/errors");
  });
  it("keys the once-a-day marker on the UTC date", () => {
    expect(utcDay(new Date("2026-11-06T23:59:59Z"))).toBe("2026-11-06");
    expect(utcDay(new Date("2026-11-07T00:00:00Z"))).toBe("2026-11-07");
  });
});
