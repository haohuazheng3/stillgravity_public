import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buyerIdFor, normalizeEmail } from "@/lib/buyers";
import { createDownloadToken, downloadPath, verifyDownloadToken } from "@/lib/download-token";
import { deliveryMessage } from "@/lib/delivery";

beforeEach(() => vi.stubEnv("DOWNLOAD_TOKEN_SECRET", "test-secret-for-download-tokens"));
afterEach(() => vi.unstubAllEnvs());

describe("buyers", () => {
  it("derives one stable id per email, ignoring case and spaces", () => {
    const id = buyerIdFor("Buyer@Example.com");
    expect(id).toMatch(/^b_[0-9a-f]{24}$/);
    expect(buyerIdFor("  buyer@example.com ")).toBe(id);
    expect(buyerIdFor("other@example.com")).not.toBe(id);
    expect(normalizeEmail(" A@B.CO ")).toBe("a@b.co");
  });
});

describe("download tokens", () => {
  const buyer = buyerIdFor("buyer@example.com");

  it("round-trips a valid token", () => {
    expect(verifyDownloadToken(createDownloadToken(buyer))).toBe(buyer);
  });
  it("rejects tampered, expired, malformed and foreign tokens", () => {
    const token = createDownloadToken(buyer);
    const last = token.slice(-1);
    expect(verifyDownloadToken(token.slice(0, -1) + (last === "A" ? "B" : "A"))).toBeNull();
    expect(verifyDownloadToken(token.replace(buyer, buyerIdFor("thief@example.com")))).toBeNull();
    expect(verifyDownloadToken(createDownloadToken(buyer, 30, Date.now() - 31 * 86400 * 1000))).toBeNull();
    expect(verifyDownloadToken("v2" + token.slice(2))).toBeNull();
    expect(verifyDownloadToken("not-a-token")).toBeNull();
    vi.stubEnv("DOWNLOAD_TOKEN_SECRET", "another-secret");
    expect(verifyDownloadToken(token)).toBeNull();
  });
  it("builds a same-origin download path", () => {
    expect(downloadPath("v1.x.y.z", "read")).toBe("/api/library/file?mode=read&t=v1.x.y.z");
  });
});

describe("delivery email", () => {
  it("carries the download link, the order reference and the refund window", () => {
    const m = deliveryMessage({ ref: "SG-ABCD1234", link: "https://stillgravity.com/api/library/file?mode=download&t=v1.a.b.c" });
    expect(m.subject).toContain("What She Won’t Tell You");
    for (const body of [m.text, m.html]) {
      expect(body).toContain("SG-ABCD1234");
      expect(body).toContain("14 days");
      expect(body).toContain("/download");
    }
    expect(m.text).toContain("https://stillgravity.com/api/library/file?mode=download&t=v1.a.b.c");
    expect(m.html).toContain("mode=download&amp;t=v1.a.b.c"); // escaped inside the HTML attribute
  });
});
