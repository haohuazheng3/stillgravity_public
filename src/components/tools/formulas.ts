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
};
