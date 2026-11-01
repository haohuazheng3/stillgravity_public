import { describe, expect, it } from "vitest";
import { analyzeChat, manualChat, parseWhatsApp, readZipText } from "@/components/tools/chat";
import { buildPlan, checkSend, decodePhrase, trendVerdict, type TrendDay } from "@/components/tools/logic";
import { FORMULAS } from "@/components/tools/formulas";
import type { DecoderTool, LadderTool, SendCheckTool } from "@/content/tools/types";

const IOS = [
  "[1/5/26, 9:15:23 PM] Sam: ‎hey you",
  "[1/5/26, 9:16:02 PM] Alex: hey! how was the climb",
  "[1/5/26, 9:20:11 PM] Sam: brutal. my arms are gone",
  "second line of the same message",
  "[1/6/26, 8:01:00 AM] Alex: ‎image omitted",
].join("\n");

const ANDROID_DAY_FIRST = ["31/12/2025, 21:15 - Messages and calls are end-to-end encrypted.", "31/12/2025, 21:15 - Sam: happy new year?", "31/12/2025, 21:40 - Alex: you too!!"].join("\n");

describe("whatsapp parser", () => {
  it("reads iPhone exports with 12-hour times, invisible marks and multi-line messages", () => {
    const p = parseWhatsApp(IOS);
    expect(p.msgs).toHaveLength(4);
    expect(p.msgs[0]).toMatchObject({ from: "Sam", text: "hey you" });
    expect(p.msgs[2].text).toBe("brutal. my arms are gone\nsecond line of the same message");
    expect(p.msgs[3].media).toBe(true);
    expect(new Date(p.msgs[0].t).getHours()).toBe(21);
    expect(new Date(p.msgs[3].t).getHours()).toBe(8);
    expect(p.senders.map((s) => s.name).sort()).toEqual(["Alex", "Sam"]);
  });
  it("detects day-first dates and skips system lines", () => {
    const p = parseWhatsApp(ANDROID_DAY_FIRST);
    expect(p.dayFirst).toBe(true);
    expect(p.msgs).toHaveLength(2);
    expect(new Date(p.msgs[0].t).getMonth()).toBe(11);
  });
  it("reads a stored (uncompressed) zip entry", async () => {
    const enc = new TextEncoder();
    const name = enc.encode("_chat.txt");
    const data = enc.encode(ANDROID_DAY_FIRST);
    const local = new Uint8Array(30 + name.length + data.length);
    const lv = new DataView(local.buffer);
    lv.setUint32(0, 0x04034b50, true);
    lv.setUint16(8, 0, true);
    lv.setUint32(18, data.length, true);
    lv.setUint32(22, data.length, true);
    lv.setUint16(26, name.length, true);
    local.set(name, 30);
    local.set(data, 30 + name.length);
    const central = new Uint8Array(46 + name.length);
    const cv = new DataView(central.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(10, 0, true);
    cv.setUint32(20, data.length, true);
    cv.setUint32(24, data.length, true);
    cv.setUint16(28, name.length, true);
    cv.setUint32(42, 0, true);
    central.set(name, 46);
    const end = new Uint8Array(22);
    const ev = new DataView(end.buffer);
    ev.setUint32(0, 0x06054b50, true);
    ev.setUint16(10, 1, true);
    ev.setUint32(12, central.length, true);
    ev.setUint32(16, local.length, true);
    const zip = new Uint8Array(local.length + central.length + end.length);
    zip.set(local, 0);
    zip.set(central, local.length);
    zip.set(end, local.length + central.length);
    expect(await readZipText(zip.buffer)).toBe(ANDROID_DAY_FIRST);
  });
});

function chat(days: number, perDay: (d: number) => { me: number; her: number; herFirst: boolean; herWords?: number }) {
  const out: string[] = [];
  const base = new Date(2026, 0, 1, 10, 0).getTime();
  for (let d = 0; d < days; d++) {
    const p = perDay(d);
    let t = base + d * 86_400_000;
    const seq: ("me" | "her")[] = [];
    if (p.herFirst) seq.push("her");
    let me = p.me;
    let her = p.her - (p.herFirst ? 1 : 0);
    while (me > 0 || her > 0) {
      if (me > 0) {
        seq.push("me");
        me--;
      }
      if (her > 0) {
        seq.push("her");
        her--;
      }
    }
    for (const who of seq) {
      t += 20 * 60_000;
      const dt = new Date(t);
      const stamp = `${dt.getMonth() + 1}/${dt.getDate()}/26, ${((dt.getHours() + 11) % 12) + 1}:${String(dt.getMinutes()).padStart(2, "0")} ${dt.getHours() >= 12 ? "PM" : "AM"}`;
      out.push(who === "me" ? `${stamp} - Me: how was your day? tell me everything about it` : `${stamp} - Her: ${"good ".repeat(p.herWords ?? 3).trim()}${(p.herWords ?? 3) >= 9 ? " and yours?" : ""}`);
    }
  }
  return parseWhatsApp(out.join("\n")).msgs;
}

describe("chat balance", () => {
  it("says thin with too little data", () => {
    expect(analyzeChat(chat(2, () => ({ me: 3, her: 3, herFirst: false })), "Me").result).toBe("thin");
  });
  it("sees a man carrying the conversation", () => {
    const s = analyzeChat(chat(20, () => ({ me: 4, her: 2, herFirst: false, herWords: 2 })), "Me");
    expect(s.starts.me).toBeGreaterThan(s.starts.her);
    expect(s.result).toBe("you-carry");
  });
  it("sees a balanced chat", () => {
    expect(analyzeChat(chat(20, (d) => ({ me: 3, her: 3, herFirst: d % 2 === 0, herWords: 9 })), "Me").result).toBe("balanced");
  });
  it("sees cooling when her messages drop in the last two weeks", () => {
    const s = analyzeChat(chat(30, (d) => (d < 16 ? { me: 4, her: 4, herFirst: d % 2 === 0, herWords: 9 } : { me: 3, her: 1, herFirst: false, herWords: 9 })), "Me");
    expect(s.result).toBe("cooling");
  });
  it("maps the five-question version", () => {
    expect(manualChat({ started: 9, reply: 3, questions: 3, double: 2, trend: 0 })).toBe("you-carry");
    expect(manualChat({ started: 4, reply: 0, questions: 1, double: 0, trend: 0 })).toBe("balanced");
    expect(manualChat({ started: 4, reply: 0, questions: 1, double: 0, trend: 2 })).toBe("cooling");
  });
});

const R = (id: string) => ({ id, title: id, verdict: "v", move: "m", chapter: "4.6", tone: "mixed" as const });
const SEND: SendCheckTool = {
  kind: "sendcheck",
  id: "t",
  name: "t",
  intro: "",
  input: { label: "", placeholder: "", maxLength: 1000 },
  her: { label: "", placeholder: "", maxLength: 500 },
  context: [
    { id: "streak", label: "", options: [] },
    { id: "purpose", label: "", options: [] },
  ],
  rules: [
    { id: "two", kind: "stop", label: "two in a row", fix: "", test: { context: [{ id: "streak", min: 2 }] } },
    { id: "qq", kind: "edit", label: "??", fix: "", test: { pattern: "\\?\\?" } },
    { id: "long", kind: "edit", label: "long", fix: "", test: { longerThanHers: 3, minChars: 40 } },
    { id: "noplan", kind: "edit", label: "no day", fix: "", test: { context: [{ id: "purpose", min: 2, max: 2 }], absent: "monday|tuesday|friday|saturday|tonight|tomorrow" } },
    { id: "q", kind: "good", label: "question", fix: "", test: { pattern: "\\?" } },
  ],
  results: ["wait", "send", "edit", "rewrite"].map(R),
  method: "",
};

describe("send check", () => {
  it("stops a third message in a row", () => {
    expect(checkSend(SEND, "hello?", "", { streak: 2, purpose: 1 }).result.id).toBe("wait");
  });
  it("passes a short, specific ask", () => {
    const r = checkSend(SEND, "Want to get tacos Friday?", "haha yes", { streak: 0, purpose: 2 });
    expect(r.result.id).toBe("send");
    expect(r.goods.map((g) => g.id)).toEqual(["q"]);
  });
  it("counts edits: vague ask, long, question marks", () => {
    const r = checkSend(SEND, "we should hang out sometime, what do you think?? I had such a good time talking", "lol", { streak: 0, purpose: 2 });
    expect(r.edits.map((e) => e.id).sort()).toEqual(["long", "noplan", "qq"]);
    expect(r.result.id).toBe("rewrite");
  });
});

const DECODER: DecoderTool = {
  kind: "decoder",
  id: "d",
  name: "d",
  intro: "",
  groups: [{ id: "plans", heading: "Plans" }],
  phrases: [
    { id: "busy", say: "I'm busy", group: "plans", usually: "", readings: { warm: { title: "w", verdict: "", move: "", chapter: "5.2" }, unsure: { title: "u", verdict: "", move: "", chapter: "5.2" }, no: { title: "n", verdict: "", move: "", chapter: "5.2" } } },
    { id: "bf", say: "I have a boyfriend", group: "plans", usually: "", fixed: "no", readings: { no: { title: "n", verdict: "", move: "", chapter: "9.1" } } },
  ],
  questions: [
    { id: "alt", q: "", options: [{ label: "yes", points: 3 }, { label: "vague", points: 1 }, { label: "no", points: -1 }] },
    { id: "first", q: "", options: [{ label: "her", points: 2 }, { label: "even", points: 1 }, { label: "me", points: 0 }, { label: "only me", points: -1 }] },
  ],
  cut: { warm: 3, no: 0 },
  method: "",
  catalog: { title: "" },
};

describe("decoder", () => {
  it("reads context into warm, unsure or no", () => {
    expect(decodePhrase(DECODER, DECODER.phrases[0], [0, 1]).id).toBe("busy-warm");
    expect(decodePhrase(DECODER, DECODER.phrases[0], [1, 1]).id).toBe("busy-unsure");
    expect(decodePhrase(DECODER, DECODER.phrases[0], [2, 2]).id).toBe("busy-no");
  });
  it("keeps fixed phrases fixed", () => {
    const r = decodePhrase(DECODER, DECODER.phrases[1], []);
    expect(r.id).toBe("bf-no");
    expect(r.tone).toBe("stop");
  });
});

describe("ladder", () => {
  const tool: LadderTool = {
    kind: "ladder",
    id: "l",
    name: "",
    intro: "",
    levels: [1, 2, 3].map((n) => ({ n, label: `L${n}`, heading: `L${n}` })),
    settings: [{ value: "any", label: "Anywhere" }, { value: "gym", label: "Gym" }],
    steps: [
      { text: "a1", level: 1, tags: [] },
      { text: "a2", level: 1, tags: [] },
      { text: "b1", level: 2, tags: ["gym"] },
      { text: "b2", level: 2, tags: [] },
      { text: "c1", level: 3, tags: [] },
      { text: "c2", level: 3, tags: [] },
    ],
    days: 7,
    perLevel: 2,
    chapter: "2.2",
    note: "",
    catalog: { title: "" },
  };
  it("climbs one level every perLevel days and stays at the top", () => {
    expect(buildPlan(tool, 2, "gym").map((p) => p.level)).toEqual([2, 2, 3, 3, 3, 3, 3]);
    expect(buildPlan(tool, 1, "any")).toHaveLength(7);
  });
});

describe("trend log", () => {
  const day = (first: TrendDay["first"], reply: TrendDay["reply"], plan = false): TrendDay => ({ first, reply, plan });
  it("needs seven days", () => {
    expect(trendVerdict([["2026-01-01", day("her", "quick")]]).result).toBe("early");
  });
  it("reads cooling and warming", () => {
    const cooling: [string, TrendDay][] = Array.from({ length: 10 }, (_, i) => [`2026-01-${String(i + 1).padStart(2, "0")}`, i < 5 ? day("her", "quick", i === 2) : day("me", i % 2 ? "none" : "slow")]);
    expect(trendVerdict(cooling).result).toBe("cooling");
    const warming: [string, TrendDay][] = Array.from({ length: 8 }, (_, i) => [`2026-02-0${i + 1}`, i < 4 ? day("me", "slow") : day("her", "quick", true)]);
    expect(trendVerdict(warming).result).toBe("warming");
  });
});

describe("talking stage formula", () => {
  const f = FORMULAS.talkingStage;
  it("pushes to meet when they've never met", () => {
    expect(f({ weeks: 3, dates: 0, plans: 0, talked: 0 }).result).toBe("meet-now");
    expect(f({ weeks: 1, dates: 0, plans: 0, talked: 0 }).result).toBe("ask-out");
  });
  it("finds the time to talk, overdue and defined", () => {
    expect(f({ weeks: 7, dates: 4, plans: 2, talked: 0 }).result).toBe("time-to-talk");
    expect(f({ weeks: 14, dates: 4, plans: 2, talked: 1 }).result).toBe("overdue");
    expect(f({ weeks: 14, dates: 4, plans: 2, talked: 2 }).result).toBe("defined");
    expect(f({ weeks: 4, dates: 2, plans: 0, talked: 0 }).result).toBe("stalled");
    expect(f({ weeks: 2, dates: 2, plans: 2, talked: 0 }).result).toBe("on-track");
  });
});
