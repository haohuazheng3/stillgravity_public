import type { Formula } from "@/content/tools/types";

export type FormulaOutput = { result: string; lines: { label: string; value: string }[] };

const ok = (n: number) => Number.isFinite(n) && n > 0;

/**
 * Calculator formulas. Each one is small and transparent on purpose: the page's
 * "How this result is worked out" note says exactly what it does.
 */
export const FORMULAS: Record<Formula, (v: Record<string, number>) => FormulaOutput> = {
  /** "Half your age plus seven": youngest = age/2 + 7; oldest = (age − 7) × 2. */
  ageRule: (v) => {
    const age = Math.floor(v.age);
    if (!ok(age) || age < 18) return { result: "adult-only", lines: [] };
    const youngest = Math.ceil(age / 2 + 7);
    const oldest = (age - 7) * 2;
    const lines = [
      { label: "Youngest the rule allows", value: `${youngest}` },
      { label: "Oldest the rule allows", value: `${oldest}` },
    ];
    const partner = Math.floor(v.partner);
    if (!ok(partner)) return { result: "rule", lines };
    if (partner < 18) return { result: "adult-only", lines };
    lines.push({ label: "Age gap", value: `${Math.abs(age - partner)} years` });
    return { result: partner >= youngest && partner <= oldest ? "inside" : "outside", lines };
  },
  /**
   * "How many dates before a relationship?" A rule of thumb, not a research finding:
   * about five dates over about a month, with steady contact, is when most couples can
   * reasonably talk about exclusivity; three months with no talk means it's overdue.
   */
  datesToRelationship: (v) => {
    const dates = Math.floor(v.dates);
    const weeks = Math.floor(v.weeks);
    if (!(dates >= 0) || !(weeks >= 0)) return { result: "early", lines: [] };
    const lines = [
      { label: "Dates so far", value: `${dates}` },
      { label: "Weeks since the first date", value: `${weeks}` },
    ];
    if (weeks > 0) lines.push({ label: "Dates per week", value: (dates / weeks).toFixed(1) });
    if (v.talked >= 1) return { result: "talked", lines };
    if (weeks >= 12 && dates >= 5) return { result: "overdue", lines };
    if (dates >= 5 && weeks >= 4 && v.contact >= 2) return { result: "ready", lines };
    if (dates < 3 || weeks < 3) return { result: "early", lines };
    return { result: "building", lines };
  },
  /**
   * Breakup recovery. Shows the popular "half the length of the relationship" rule as a
   * folk rule, then reads the three things research links to slower recovery: ongoing
   * contact, checking her profiles, and going through it alone.
   */
  breakupRecovery: (v) => {
    const months = Math.max(0, v.months || 0);
    const weeks = Math.max(0, Math.floor(v.weeks || 0));
    const slowing = (v.contact >= 1 ? 1 : 0) + (v.checking >= 1 ? 1 : 0) + (v.support === 0 ? 1 : 0);
    const half = months / 2;
    const lines = [
      { label: "The popular rule (half the relationship)", value: half >= 1 ? `${Math.round(half)} months` : `${Math.max(1, Math.round(half * 4.3))} weeks` },
      { label: "Weeks since the breakup", value: `${weeks}` },
      { label: "Things slowing you down", value: `${slowing} of 3` },
    ];
    if (weeks < 2) return { result: "fresh", lines };
    if (weeks >= 26 && v.checking >= 2) return { result: "stuck", lines };
    if (slowing >= 2) return { result: "slowed", lines };
    return { result: "healing", lines };
  },
  /**
   * When to propose. A readiness check, not a countdown: it counts the four big
   * conversations couples usually have first, and treats under a year as early.
   */
  engagementTiming: (v) => {
    const months = Math.max(0, Math.floor(v.months || 0));
    const done = (v.talked >= 2 ? 1 : 0) + (v.bigthings >= 2 ? 1 : 0) + (v.conflict >= 1 ? 1 : 0) + (v.families >= 1 ? 1 : 0);
    const lines = [
      { label: "Months together", value: `${months}` },
      { label: "Big conversations done", value: `${done} of 4` },
    ];
    if (!(v.talked >= 1)) return { result: "talk-first", lines };
    if (months < 12) return { result: "early", lines };
    if (done < 4) return { result: "almost", lines };
    return { result: "ready", lines };
  },
  /**
   * "How long should the talking stage last?" Rules of thumb, stated as such: meet within
   * about two weeks of messaging (online daters who switch to meeting sooner tend to do
   * better than those who message for weeks), and have the "what are we" talk once you've
   * been dating steadily for roughly one to two months.
   */
  talkingStage: (v) => {
    const weeks = Math.max(0, Math.floor(v.weeks || 0));
    const met = Math.max(0, Math.floor(v.dates || 0));
    const lines = [
      { label: "Weeks talking", value: `${weeks}` },
      { label: "Times you’ve met", value: met >= 4 ? "4+" : `${met}` },
      { label: "Usual point to meet", value: "within 1–2 weeks" },
      { label: "Usual point for “what are we?”", value: "after 4–8 weeks of dating" },
    ];
    if (v.talked >= 2) return { result: "defined", lines };
    if (met === 0) return { result: weeks >= 2 ? "meet-now" : "ask-out", lines };
    if (weeks >= 12) return { result: "overdue", lines };
    if (met >= 4 && weeks >= 6 && v.talked < 1) return { result: "time-to-talk", lines };
    if (v.plans === 0 && weeks >= 3) return { result: "stalled", lines };
    return { result: "on-track", lines };
  },
  /**
   * Engagement ring budget. Shows the advertising rule (two months of pay) and the
   * average spend for reference, then a cash-only comfortable budget: money already
   * saved, capped at about one month of take-home pay; high-interest debt comes first.
   */
  ringBudget: (v) => {
    const pay = Math.max(0, v.takehome || 0);
    const saved = Math.max(0, v.saved || 0);
    const usd = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
    const lines = [
      { label: "The ad rule: two months of take-home pay", value: usd(pay * 2) },
      { label: "Average spend in 2025 (The Knot)", value: "$4,600" },
      { label: "A comfortable budget for you", value: usd(v.debt >= 1 ? 0 : Math.min(saved, pay)) },
    ];
    if (v.debt >= 1) return { result: "debt-first", lines };
    if (saved < 300) return { result: "save-first", lines };
    return { result: "budget", lines };
  },
};
