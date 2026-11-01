import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { checkSend } from "@/components/tools/logic";
import type { SendCheckTool } from "@/content/tools/types";

const file = path.join(process.cwd(), "content", "tools", "should-i-send-this-text.json");
const tool = fs.existsSync(file) ? (JSON.parse(fs.readFileSync(file, "utf8")) as SendCheckTool) : null;
const ids = (draft: string, her: string, ctx: Record<string, number>) => {
  const r = checkSend(tool!, draft, her, ctx);
  return { result: r.result.id, flags: [...r.stops, ...r.edits].map((x) => x.id), goods: r.goods.map((x) => x.id) };
};

describe.skipIf(!tool)("should-i-send-this-text rules", () => {
  it("passes a short reply with a question", () => {
    const r = ids("Haha no way. Was the opener any good?", "the concert was amazing", { streak: 0, since: 0, purpose: 0 });
    expect(r.result).toBe("send");
    expect(r.goods).toContain("g-question");
  });
  it("waits on a third message in a row", () => {
    expect(ids("hello??", "", { streak: 2, since: 3, purpose: 4 }).result).toBe("wait");
  });
  it("flags a vague invitation and passes a specific one", () => {
    expect(ids("we should hang out sometime", "", { streak: 0, since: 1, purpose: 2 }).flags).toEqual(expect.arrayContaining(["no-day", "sometime"]));
    const ok = ids("Tacos on Thursday after work?", "", { streak: 0, since: 1, purpose: 2 });
    expect(ok.result).toBe("send");
    expect(ok.goods).toContain("g-day");
  });
  it("counts pressure patterns into a rewrite", () => {
    const r = ids("Sorry to bother you, just checking in. Did I do something wrong?? You never replied to my last message", "", { streak: 0, since: 3, purpose: 4 });
    expect(r.flags).toEqual(expect.arrayContaining(["apology", "checkin", "needy", "qmarks", "silence"]));
    expect(r.result).toBe("rewrite");
  });
  it("does not read 'I sat down' as a day", () => {
    expect(ids("I sat down and thought we should grab a drink", "", { streak: 0, since: 1, purpose: 2 }).flags).toContain("no-day");
  });
});
