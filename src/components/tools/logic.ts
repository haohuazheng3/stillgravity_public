import type { DecoderPhrase, DecoderTool, LadderStep, LadderTool, ReadingKey, SendCheckTool, SendRule, ToolResult, Tone } from "@/content/tools/types";

/* ---------- decoder ---------- */

const READING_TONE: Record<ReadingKey, Tone> = { warm: "good", unsure: "mixed", no: "low" };

export function readingKey(tool: DecoderTool, phrase: DecoderPhrase, answers: number[]): ReadingKey {
  if (phrase.fixed) return phrase.fixed;
  const score = answers.reduce((s, a, i) => s + (tool.questions[i]?.options[a]?.points ?? 0), 0);
  const key: ReadingKey = score >= tool.cut.warm ? "warm" : score <= tool.cut.no ? "no" : "unsure";
  // A phrase may not define every reading (some never mean "no"); fall back toward the middle.
  if (phrase.readings[key]) return key;
  if (phrase.readings.unsure) return "unsure";
  return (Object.keys(phrase.readings)[0] as ReadingKey) ?? "unsure";
}

export function decodePhrase(tool: DecoderTool, phrase: DecoderPhrase, answers: number[]): ToolResult {
  const key = readingKey(tool, phrase, answers);
  const r = phrase.readings[key]!;
  return { ...r, id: `${phrase.id}-${key}`, tone: phrase.fixed === "no" ? "stop" : READING_TONE[key], next: phrase.href ? { href: phrase.href, label: "the full guide to this one" } : undefined };
}

/* ---------- sendcheck ---------- */

export type SendContext = Record<string, number>;

export function ruleFires(rule: SendRule, draft: string, her: string, ctx: SendContext): boolean {
  const t = rule.test;
  const text = draft.trim();
  if (t.pattern !== undefined) {
    const n = text.match(new RegExp(t.pattern, "gi"))?.length ?? 0;
    if (n < (t.minMatches ?? 1)) return false;
  }
  if (t.absent !== undefined && new RegExp(t.absent, "i").test(text)) return false;
  if (t.minChars !== undefined && text.length < t.minChars) return false;
  if (t.maxChars !== undefined && text.length > t.maxChars) return false;
  if (t.longerThanHers !== undefined) {
    const h = her.trim().length;
    if (!h || text.length <= t.longerThanHers * h) return false;
  }
  for (const c of t.context ?? []) {
    const v = ctx[c.id];
    if (v === undefined) return false;
    if (c.min !== undefined && v < c.min) return false;
    if (c.max !== undefined && v > c.max) return false;
  }
  return true;
}

export function checkSend(tool: SendCheckTool, draft: string, her: string, ctx: SendContext) {
  const fired = tool.rules.filter((r) => ruleFires(r, draft, her, ctx));
  const stops = fired.filter((r) => r.kind === "stop");
  const edits = fired.filter((r) => r.kind === "edit");
  const goods = fired.filter((r) => r.kind === "good");
  const id = stops.length ? "wait" : edits.length === 0 ? "send" : edits.length <= 2 ? "edit" : "rewrite";
  return { result: tool.results.find((r) => r.id === id)!, stops, edits, goods };
}

/* ---------- ladder ---------- */

function seeded(seed: number) {
  let s = seed % 233280;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

/** A day-by-day plan: `perLevel` days on each level from `start` upward, then the top level. */
export function buildPlan(tool: LadderTool, start: number, setting: string): { day: number; level: number; step: LadderStep }[] {
  const top = Math.max(...tool.levels.map((l) => l.n));
  const rand = seeded(start * 31 + setting.length * 7 + 11);
  const used = new Set<string>();
  const out: { day: number; level: number; step: LadderStep }[] = [];
  for (let day = 1; day <= tool.days; day++) {
    const level = Math.min(top, start + Math.floor((day - 1) / tool.perLevel));
    const pool = tool.steps.filter((s) => s.level === level && (!s.tags.length || setting === "any" || s.tags.includes(setting)));
    const fresh = pool.filter((s) => !used.has(s.text));
    const from = fresh.length ? fresh : pool;
    if (!from.length) continue;
    const step = from[Math.floor(rand() * from.length)];
    used.add(step.text);
    out.push({ day, level, step });
  }
  return out;
}

/* ---------- trend log ---------- */

export type TrendDay = { first: "me" | "her" | "none"; reply: "quick" | "slow" | "none"; plan: boolean };

/** Compares the first and second half of the logged days. Needs seven days. */
export function trendVerdict(days: [string, TrendDay][]): { result: "early" | "warming" | "steady" | "cooling"; herFirst: [number, number]; quick: [number, number]; plans: [number, number] } {
  const sorted = [...days].sort((a, b) => (a[0] < b[0] ? -1 : 1)).map((d) => d[1]);
  const half = Math.floor(sorted.length / 2);
  const a = sorted.slice(0, half);
  const b = sorted.slice(sorted.length - half);
  const rate = (xs: TrendDay[], f: (d: TrendDay) => boolean) => (xs.length ? xs.filter(f).length / xs.length : 0);
  const herFirst: [number, number] = [rate(a, (d) => d.first === "her"), rate(b, (d) => d.first === "her")];
  const quick: [number, number] = [rate(a, (d) => d.reply === "quick"), rate(b, (d) => d.reply === "quick")];
  const silent: [number, number] = [rate(a, (d) => d.reply === "none" && d.first !== "her"), rate(b, (d) => d.reply === "none" && d.first !== "her")];
  const plans: [number, number] = [a.filter((d) => d.plan).length, b.filter((d) => d.plan).length];
  if (sorted.length < 7) return { result: "early", herFirst, quick, plans };
  const score = (herFirst[1] - herFirst[0]) + (quick[1] - quick[0]) - (silent[1] - silent[0]) + 0.25 * Math.sign(plans[1] - plans[0]);
  return { result: score <= -0.3 ? "cooling" : score >= 0.3 ? "warming" : "steady", herFirst, quick, plans };
}
