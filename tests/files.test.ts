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

describe("worker calls", () => {
  it("retries once after a network error and returns the second answer", async () => {
    const { workerFetch } = await import("@/lib/files");
    let calls = 0;
    const real = globalThis.fetch;
    globalThis.fetch = (async () => {
      calls++;
      if (calls === 1) throw new TypeError("fetch failed");
      return new Response("ok", { status: 200 });
    }) as typeof fetch;
    try {
      const res = await workerFetch("https://files.example.com/o/x", {}, 1000, "GET x");
      expect(res.status).toBe(200);
      expect(calls).toBe(2);
    } finally {
      globalThis.fetch = real;
    }
  });

  it("gives up after two failures with a clear error instead of hanging", async () => {
    const { workerFetch } = await import("@/lib/files");
    const real = globalThis.fetch;
    globalThis.fetch = ((_url: string, init?: RequestInit) =>
      new Promise((_, reject) => init?.signal?.addEventListener("abort", () => reject(init.signal!.reason)))) as typeof fetch;
    try {
      const started = Date.now();
      await expect(workerFetch("https://files.example.com/o/x", {}, 50, "GET x")).rejects.toThrow(/failed twice/);
      expect(Date.now() - started).toBeLessThan(2000);
    } finally {
      globalThis.fetch = real;
    }
  });
});
