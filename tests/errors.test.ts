import { describe, expect, it } from "vitest";
import { fingerprintOf, firstFrame } from "@/lib/errors";

describe("error fingerprinting", () => {
  it("strips line/column numbers and build hashes so deploys don't split groups", () => {
    const a = firstFrame("Error: x\n    at handler (/var/task/.next/server/chunks/8a7f3c2d9e1b.js:12:345)");
    const b = firstFrame("Error: x\n    at handler (/var/task/.next/server/chunks/1b2c3d4e5f6a.js:99:1)");
    expect(a).toBe(b);
    expect(a).toContain("at handler");
  });
  it("groups by name + frame + route", () => {
    const f = firstFrame("TypeError: y\n    at go (file.js:1:2)");
    expect(fingerprintOf("TypeError", f, "/a", "y")).toBe(fingerprintOf("TypeError", f, "/a", "different message"));
    expect(fingerprintOf("TypeError", f, "/a", "y")).not.toBe(fingerprintOf("TypeError", f, "/b", "y"));
  });
  it("falls back to the message when there is no stack", () => {
    expect(fingerprintOf("Error", "", "/a", "boom 1")).toBe(fingerprintOf("Error", "", "/a", "boom 2"));
    expect(fingerprintOf("Error", "", "/a", "boom")).not.toBe(fingerprintOf("Error", "", "/a", "other"));
  });
});
