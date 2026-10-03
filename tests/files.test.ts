import { describe, expect, it, beforeAll } from "vitest";
import { createHmac } from "node:crypto";

beforeAll(() => {
  process.env.FILES_SIGNING_SECRET = "test-secret";
  process.env.FILES_BASE_URL = "https://files.example.com";
});

describe("signed file URLs", () => {
  it("signs key, expiry, disposition and filename exactly as the worker verifies them", async () => {
    const { signPayload, signedFileUrl } = await import("@/lib/files");
    const sig = signPayload("books/a b.pdf", 100, "inline", "x.pdf");
    const expected = createHmac("sha256", "test-secret").update(["books/a b.pdf", "100", "inline", "x.pdf"].join("\n")).digest("hex");
    expect(sig).toBe(expected);
    const url = new URL(signedFileUrl("licensed/u1/book.pdf", { disposition: "attachment", filename: "B.pdf", ttlSeconds: 60 }));
    expect(url.origin).toBe("https://files.example.com");
    expect(url.pathname).toBe("/d/licensed/u1/book.pdf");
    expect(url.searchParams.get("disp")).toBe("attachment");
    expect(url.searchParams.get("sig")).toHaveLength(64);
  });
});
