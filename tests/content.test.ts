import { describe, expect, it } from "vitest";
import { extractHeadings } from "@/lib/blog";
import { maskEmail } from "@/lib/watermark";
import { PARTS, ALL_CHAPTERS } from "@/content/book";
import { ALL_SITUATIONS } from "@/content/situations";
import { CATEGORIES } from "@/content/categories";

describe("content integrity", () => {
  it("has 12 parts and 83 chapters, as printed", () => {
    expect(PARTS).toHaveLength(12);
    expect(ALL_CHAPTERS).toHaveLength(83);
  });
  it("maps all 36 situations to real chapters", () => {
    expect(ALL_SITUATIONS).toHaveLength(36);
    const ids = new Set(ALL_CHAPTERS.map((c) => c.id));
    for (const s of ALL_SITUATIONS) expect(ids.has(s.chapter)).toBe(true);
    expect(new Set(ALL_SITUATIONS.map((s) => s.slug)).size).toBe(36);
  });
  it("points every category at real chapters", () => {
    const ids = new Set(ALL_CHAPTERS.map((c) => c.id));
    for (const c of CATEGORIES) for (const ch of c.chapters) expect(ids.has(ch)).toBe(true);
  });
  it("extracts H2 headings with GitHub-style ids", () => {
    expect(extractHeadings("intro\n## What it means\ntext\n```\n## not a heading\n```\n## What to do next?")).toEqual([
      { id: "what-it-means", text: "What it means" },
      { id: "what-to-do-next", text: "What to do next?" },
    ]);
  });
  it("masks emails for the PDF stamp", () => {
    expect(maskEmail("jonathan@gmail.com")).toBe("j***n@gmail.com");
    expect(maskEmail("ab@x.io")).toBe("a***@x.io");
  });
});
