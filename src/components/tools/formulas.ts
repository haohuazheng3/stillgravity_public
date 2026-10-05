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
};
