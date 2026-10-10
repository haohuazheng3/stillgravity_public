/**
 * Interactive tools that sit at the top of a guide (the "tool-first" pages).
 *
 * A tool is plain data, so the server hands the one tool a page needs to the client
 * renderer as props: no page ships the other tools. Every result ends the same way the
 * Situation Finder does: an honest verdict, the first move, and the chapter that holds
 * the full playbook.
 */

export type Tone = "good" | "mixed" | "low" | "stop";

export interface ToolResult {
  id: string;
  /** The verdict in a few words: "She's interested." */
  title: string;
  /** One or two sentences: the honest read of the answers. */
  verdict: string;
  /** What to do now. */
  move: string;
  /** Optional exact words to adapt. */
  say?: string;
  /** Book chapter with the full playbook, e.g. "5.1". */
  chapter: string;
  tone: Tone;
}

export interface QuizOption {
  label: string;
  points: number;
  /** A deciding answer (e.g. she said no): sends straight to `flags[flag]`. */
  flag?: string;
}

export interface QuizQuestion {
  q: string;
  help?: string;
  /** For two-axis quizzes: which axis this question's points count toward. */
  axis?: "x" | "y";
  options: QuizOption[];
}

/**
 * Two-axis scoring (e.g. attachment anxiety × avoidance). Each axis total is compared
 * with its cut-off (high = total ≥ cut) and the pair picks one of four results.
 */
export interface QuizAxes {
  cut: { x: number; y: number };
  cells: { lowLow: string; highLow: string; lowHigh: string; highHigh: string };
}

export interface QuizTool {
  kind: "quiz";
  id: string;
  name: string;
  /** One line under the tool name. */
  intro: string;
  questions: QuizQuestion[];
  /** Score ranges (inclusive) → result id. Scores are the sum of the chosen points. */
  bands: { min: number; max: number; result: string }[];
  /** When set, results come from the two axis totals instead of `bands`. */
  axes?: QuizAxes;
  /** flag → result id, checked in this order before the score. */
  flags?: { flag: string; result: string }[];
  results: ToolResult[];
  /** How the score works, shown under the result. */
  method: string;
}

export interface DecisionNode {
  id: string;
  q: string;
  help?: string;
  /** `next` is another node id, or "result:<id>". */
  options: { label: string; next: string }[];
}

export interface DecisionTool {
  kind: "decision";
  id: string;
  name: string;
  intro: string;
  start: string;
  nodes: DecisionNode[];
  results: ToolResult[];
  method: string;
}

export interface CalcInput {
  id: string;
  label: string;
  help?: string;
  type: "number" | "select";
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  /** null leaves an optional number field empty. */
  default: number | null;
  /** For selects: value is a number the formula reads. */
  options?: { label: string; value: number }[];
}

/** Calculators are fixed formulas implemented in the renderer; the data only names one. */
export type Formula = "ageRule" | "datesToRelationship" | "breakupRecovery" | "engagementTiming" | "ringBudget";

export interface CalculatorTool {
  kind: "calculator";
  id: string;
  name: string;
  intro: string;
  formula: Formula;
  inputs: CalcInput[];
  /** Results the formula can point to (by id), each with the honest framing. */
  results: ToolResult[];
  method: string;
}

export interface GeneratorItem {
  text: string;
  /** Filter values this item belongs to. Items without a value for a filter match any choice. */
  tags: string[];
  /** Why it works, one short line. */
  why?: string;
}

export interface GeneratorTool {
  kind: "generator";
  id: string;
  name: string;
  intro: string;
  filters: { id: string; label: string; options: { value: string; label: string }[] }[];
  items: GeneratorItem[];
  /** How many to show at once. */
  show: number;
  /** Items are things to send or say: offer a copy button. */
  copyable: boolean;
  /** Shown under the list. */
  note: string;
  /** The obvious next step after using the tool (e.g. picked prompts → write the answers). */
  next?: { href: string; label: string };
  chapter: string;
}

export interface CheckerRule {
  id: string;
  /** Regex source tested against the text (case-insensitive), or a length rule. */
  test: { pattern?: string; minChars?: number; maxChars?: number; minMatches?: number };
  /** true: the rule passing is good (e.g. "mentions a specific plan"); false: passing is a problem. */
  good: boolean;
  weight: number;
  label: string;
  fix: string;
}

export interface CheckerTool {
  kind: "checker";
  id: string;
  name: string;
  intro: string;
  input: { label: string; placeholder: string; maxLength: number };
  rules: CheckerRule[];
  /** Score bands (0–100) → result id. */
  bands: { min: number; max: number; result: string }[];
  results: ToolResult[];
  method: string;
}

export type Tool = QuizTool | DecisionTool | CalculatorTool | GeneratorTool | CheckerTool;
