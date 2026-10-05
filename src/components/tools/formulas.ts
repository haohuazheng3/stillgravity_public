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
};
