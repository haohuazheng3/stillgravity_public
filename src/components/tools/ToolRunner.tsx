"use client";

import Link from "next/link";
import { useMemo, useRef, useState, type ReactNode } from "react";
import { track } from "@/components/Consent";
import type {
  CalculatorTool,
  CheckerTool,
  DecisionTool,
  GeneratorItem,
  GeneratorTool,
  QuizTool,
  Tone,
  Tool,
  ToolResult,
} from "@/content/tools/types";
import { FORMULAS } from "./formulas";

export type ChapterInfo = { id: string; title: string; page: number };

type Shared = { chapters: Record<string, ChapterInfo>; price: string };

const TONE: Record<Tone, { ring: string; label: string }> = {
  good: { ring: "before:bg-[var(--ok)]", label: "text-ok" },
  mixed: { ring: "before:bg-[var(--accent)]", label: "text-accent-text" },
  low: { ring: "before:bg-[var(--ink-4)]", label: "text-ink-3" },
  stop: { ring: "before:bg-[var(--bad)]", label: "text-bad" },
};

export function ToolRunner({ tool, chapters, price }: { tool: Tool } & Shared) {
  const shared = { chapters, price };
  return (
    <section aria-labelledby={`tool-${tool.id}`} className="slab relative overflow-hidden p-5 sm:p-7">
      <p className="eyebrow eyebrow-accent">Free tool · no sign-up</p>
      <h2 id={`tool-${tool.id}`} className="headline mt-2 text-[1.55rem] leading-tight text-ink sm:text-[1.8rem]">
        {tool.name}
      </h2>
      <p className="mt-2 text-[0.98rem] leading-relaxed text-ink-3">{tool.intro}</p>
      <div className="mt-5">
        {tool.kind === "quiz" ? <QuizView tool={tool} {...shared} /> : null}
        {tool.kind === "decision" ? <DecisionView tool={tool} {...shared} /> : null}
        {tool.kind === "calculator" ? <CalculatorView tool={tool} {...shared} /> : null}
        {tool.kind === "generator" ? <GeneratorView tool={tool} {...shared} /> : null}
        {tool.kind === "checker" ? <CheckerView tool={tool} {...shared} /> : null}
      </div>
    </section>
  );
}

/* ---------- shared pieces ---------- */

function useStartOnce(id: string) {
  const started = useRef(false);
  return () => {
    if (started.current) return;
    started.current = true;
    track("tool_start", { tool: id });
  };
}

function CopyButton({ text, toolId }: { text: string; toolId: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="btn btn-quiet btn-sm shrink-0"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          track("tool_copy", { tool: toolId });
          setTimeout(() => setDone(false), 1600);
        } catch (e) {
          console.warn("[tool] copy failed", e);
        }
      }}
    >
      {done ? "Copied" : "Copy"}
    </button>
  );
}

function ChapterCard({ toolId, chapter: ch, price, result }: { toolId: string; chapter: ChapterInfo; price: string; result?: string }) {
  return (
    <div className="slab-ink mt-5 px-5 py-4 font-sans">
      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[#f0b752]">The full playbook · chapter {ch.id}</p>
      <p className="mt-1.5 text-[1.02rem] font-semibold text-[#edf0f6]">{ch.title}</p>
      <p className="mt-1 text-[0.9rem] text-[#aeb8c8]">Page {ch.page} of What She Won’t Tell You: the exact words, the weak version beside the good one, and why it works.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link href="/book" className="btn btn-primary btn-sm" onClick={() => track("tool_cta", { tool: toolId, to: "book", result })}>
          Get the book · {price}
        </Link>
        <Link href="/book/sample" className="btn btn-ghost btn-sm" onClick={() => track("tool_cta", { tool: toolId, to: "sample", result })}>
          Read Part 1 free
        </Link>
      </div>
    </div>
  );
}

function ResultCard({
  toolId,
  result,
  chapters,
  price,
  onRestart,
  restartLabel = "Start over",
  children,
  method,
}: {
  toolId: string;
  result: ToolResult;
  onRestart: () => void;
  restartLabel?: string;
  children?: ReactNode;
  method?: string;
} & Shared) {
  const ch = chapters[result.chapter];
  const tone = TONE[result.tone];
  return (
    <div aria-live="polite" className={`slab-inset relative overflow-hidden px-5 py-5 sm:px-6 before:absolute before:inset-y-4 before:left-0 before:w-[3px] before:rounded-r-full ${tone.ring}`}>
      <p className={`text-[0.74rem] font-semibold uppercase tracking-[0.16em] ${tone.label}`}>Your result</p>
      <h3 className="headline mt-2 text-[1.45rem] leading-snug text-ink sm:text-[1.6rem]">{result.title}</h3>
      <p className="mt-3 text-[1rem] leading-relaxed text-ink-2">{result.verdict}</p>
      {children}
      <p className="mt-4 text-[0.82rem] font-semibold uppercase tracking-[0.12em] text-ink-4">Your move</p>
      <p className="mt-1 text-[1rem] leading-relaxed text-ink">{result.move}</p>
      {result.say ? (
        <div className="mt-4 flex items-start gap-3 rounded-2xl bg-slab-2 px-4 py-3">
          <p className="flex-1 text-[0.98rem] italic leading-relaxed text-ink-2">“{result.say}”</p>
          <CopyButton text={result.say} toolId={toolId} />
        </div>
      ) : null}
      {ch ? <ChapterCard toolId={toolId} chapter={ch} price={price} result={result.id} /> : null}
      {method ? (
        <details className="mt-4 text-[0.88rem] text-ink-3">
          <summary className="cursor-pointer select-none font-semibold text-ink-3 hover:text-ink">How this result is worked out</summary>
          <p className="mt-2 leading-relaxed">{method}</p>
        </details>
      ) : null}
      <button type="button" className="btn btn-quiet btn-sm mt-4" onClick={onRestart}>
        {restartLabel}
      </button>
    </div>
  );
}

function Progress({ at, of }: { at: number; of: number }) {
  return (
    <div className="mb-4">
      <div className="flex justify-between text-[0.8rem] text-ink-4">
        <span>
          Question {Math.min(at + 1, of)} of {of}
        </span>
        <span>{Math.round((at / of) * 100)}%</span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slab-2">
        <div className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-300" style={{ width: `${(at / of) * 100}%` }} />
      </div>
    </div>
  );
}

function OptionList({ options, onPick, selected }: { options: string[]; onPick: (i: number) => void; selected?: number }) {
  return (
    <div className="grid gap-2" role="list">
      {options.map((label, i) => (
        <button
          key={label}
          type="button"
          role="listitem"
          data-selected={selected === i ? "true" : undefined}
          className="chip w-full justify-start !rounded-2xl !px-4 !py-3 text-left text-[0.98rem] leading-snug"
          onClick={() => onPick(i)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

/* ---------- quiz ---------- */

function scoreQuiz(tool: QuizTool, answers: number[]): ToolResult {
  const chosen = answers.map((a, qi) => tool.questions[qi].options[a]);
  for (const f of tool.flags ?? []) {
    if (chosen.some((o) => o?.flag === f.flag)) return tool.results.find((r) => r.id === f.result)!;
  }
  const score = chosen.reduce((s, o) => s + (o?.points ?? 0), 0);
  const band = tool.bands.find((b) => score >= b.min && score <= b.max) ?? tool.bands[tool.bands.length - 1];
  return tool.results.find((r) => r.id === band.result)!;
}

function QuizView({ tool, ...shared }: { tool: QuizTool } & Shared) {
  const [answers, setAnswers] = useState<number[]>([]);
  const [at, setAt] = useState(0);
  const start = useStartOnce(tool.id);
  const done = answers.length === tool.questions.length && at >= tool.questions.length;
  const result = useMemo(() => (done ? scoreQuiz(tool, answers) : null), [done, tool, answers]);

  if (result) {
    return (
      <ResultCard
        toolId={tool.id}
        result={result}
        method={tool.method}
        onRestart={() => {
          setAnswers([]);
          setAt(0);
        }}
        {...shared}
      />
    );
  }
  const q = tool.questions[at];
  return (
    <div>
      <Progress at={at} of={tool.questions.length} />
      <p className="text-[1.08rem] font-semibold leading-snug text-ink">{q.q}</p>
      {q.help ? <p className="mt-1 text-[0.9rem] text-ink-4">{q.help}</p> : null}
      <div className="mt-4">
        <OptionList
          options={q.options.map((o) => o.label)}
          selected={answers[at]}
          onPick={(i) => {
            start();
            const next = [...answers.slice(0, at), i];
            setAnswers(next);
            setAt(at + 1);
            if (at + 1 === tool.questions.length) {
              track("tool_complete", { tool: tool.id, result: scoreQuiz(tool, next).id });
            }
          }}
        />
      </div>
      {at > 0 ? (
        <button type="button" className="btn btn-quiet btn-sm mt-4" onClick={() => setAt(at - 1)}>
          ← Back
        </button>
      ) : null}
    </div>
  );
}

/* ---------- decision tree ---------- */

function DecisionView({ tool, ...shared }: { tool: DecisionTool } & Shared) {
  const [path, setPath] = useState<string[]>([tool.start]);
  const [resultId, setResultId] = useState<string | null>(null);
  const start = useStartOnce(tool.id);
  const node = tool.nodes.find((n) => n.id === path[path.length - 1])!;
  const result = resultId ? tool.results.find((r) => r.id === resultId)! : null;

  if (result) {
    return (
      <ResultCard
        toolId={tool.id}
        result={result}
        method={tool.method}
        onRestart={() => {
          setPath([tool.start]);
          setResultId(null);
        }}
        {...shared}
      />
    );
  }
  return (
    <div>
      <p className="mb-3 text-[0.8rem] text-ink-4">Step {path.length}</p>
      <p className="text-[1.08rem] font-semibold leading-snug text-ink">{node.q}</p>
      {node.help ? <p className="mt-1 text-[0.9rem] text-ink-4">{node.help}</p> : null}
      <div className="mt-4">
        <OptionList
          options={node.options.map((o) => o.label)}
          onPick={(i) => {
            start();
            const next = node.options[i].next;
            if (next.startsWith("result:")) {
              const id = next.slice(7);
              setResultId(id);
              track("tool_complete", { tool: tool.id, result: id });
            } else {
              setPath([...path, next]);
            }
          }}
        />
      </div>
      {path.length > 1 ? (
        <button type="button" className="btn btn-quiet btn-sm mt-4" onClick={() => setPath(path.slice(0, -1))}>
          ← Back
        </button>
      ) : null}
    </div>
  );
}

/* ---------- calculator ---------- */

function CalculatorView({ tool, ...shared }: { tool: CalculatorTool } & Shared) {
  const initial: Record<string, number> = Object.fromEntries(tool.inputs.map((i) => [i.id, i.default ?? NaN]));
  const [values, setValues] = useState<Record<string, number>>(initial);
  const [shown, setShown] = useState(false);
  const start = useStartOnce(tool.id);
  const out = FORMULAS[tool.formula](values);
  const result = tool.results.find((r) => r.id === out.result)!;

  return (
    <div>
      <form
        className="grid gap-4 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          start();
          setShown(true);
          track("tool_complete", { tool: tool.id, result: out.result });
        }}
      >
        {tool.inputs.map((inp) => (
          <label key={inp.id} className="block min-w-0">
            <span className="text-[0.92rem] font-semibold text-ink">{inp.label}</span>
            {inp.help ? <span className="mt-0.5 block text-[0.82rem] text-ink-4">{inp.help}</span> : null}
            {inp.type === "select" ? (
              <select
                className="input mt-1.5 w-full"
                value={values[inp.id]}
                onChange={(e) => {
                  start();
                  setValues({ ...values, [inp.id]: Number(e.target.value) });
                }}
              >
                {inp.options!.map((o) => (
                  <option key={o.label} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            ) : (
              <span className="mt-1.5 flex items-center gap-2">
                <input
                  className="input w-full"
                  type="number"
                  inputMode="numeric"
                  min={inp.min}
                  max={inp.max}
                  step={inp.step ?? 1}
                  value={Number.isFinite(values[inp.id]) ? values[inp.id] : ""}
                  onChange={(e) => {
                    start();
                    setValues({ ...values, [inp.id]: e.target.value === "" ? NaN : Number(e.target.value) });
                  }}
                />
                {inp.unit ? <span className="shrink-0 text-[0.9rem] text-ink-4">{inp.unit}</span> : null}
              </span>
            )}
          </label>
        ))}
        <div className="sm:col-span-2">
          <button type="submit" className="btn btn-primary">
            Show my result
          </button>
        </div>
      </form>
      {shown && result ? (
        <div className="mt-5">
          <ResultCard toolId={tool.id} result={result} method={tool.method} onRestart={() => { setValues(initial); setShown(false); }} {...shared}>
            {out.lines.length ? (
              <dl className="mt-4 grid gap-2 sm:grid-cols-2">
                {out.lines.map((l) => (
                  <div key={l.label} className="rounded-2xl bg-slab-2 px-4 py-3">
                    <dt className="text-[0.8rem] text-ink-4">{l.label}</dt>
                    <dd className="condensed mt-0.5 text-[1.5rem] font-semibold text-ink">{l.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </ResultCard>
        </div>
      ) : null}
    </div>
  );
}

/* ---------- generator ---------- */

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed * 9301 + 49297;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function matches(item: GeneratorItem, tool: GeneratorTool, picked: Record<string, string>): boolean {
  for (const f of tool.filters) {
    const want = picked[f.id];
    if (!want || want === "any") continue;
    const values = new Set(f.options.map((o) => o.value));
    const own = item.tags.filter((t) => values.has(t));
    if (own.length && !own.includes(want)) return false;
  }
  return true;
}

function GeneratorView({ tool, chapters, price }: { tool: GeneratorTool } & Shared) {
  const [picked, setPicked] = useState<Record<string, string>>(Object.fromEntries(tool.filters.map((f) => [f.id, f.options[0].value])));
  const [seed, setSeed] = useState(1);
  const [open, setOpen] = useState<number | null>(null);
  const start = useStartOnce(tool.id);
  const pool = tool.items.filter((it) => matches(it, tool, picked));
  const list = seededShuffle(pool, seed).slice(0, tool.show);
  const ch = chapters[tool.chapter];

  return (
    <div>
      {tool.filters.map((f) => (
        <fieldset key={f.id} className="mb-4">
          <legend className="text-[0.92rem] font-semibold text-ink">{f.label}</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {f.options.map((o) => (
              <button
                key={o.value}
                type="button"
                className="chip"
                data-selected={picked[f.id] === o.value ? "true" : undefined}
                aria-pressed={picked[f.id] === o.value}
                onClick={() => {
                  start();
                  setPicked({ ...picked, [f.id]: o.value });
                  setOpen(null);
                }}
              >
                {o.label}
              </button>
            ))}
          </div>
        </fieldset>
      ))}
      <ol className="grid gap-2" aria-live="polite">
        {list.map((it, i) => (
          <li key={it.text} className="rounded-2xl bg-slab-2 px-4 py-3">
            <div className="flex items-start gap-3">
              <p className="flex-1 text-[0.99rem] leading-relaxed text-ink">{it.text}</p>
              {tool.copyable ? <CopyButton text={it.text} toolId={tool.id} /> : null}
            </div>
            {it.why ? (
              <button type="button" className="mt-1 text-[0.82rem] font-semibold text-accent-text hover:underline" onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i}>
                {open === i ? "Hide why" : "Why it works"}
              </button>
            ) : null}
            {open === i && it.why ? <p className="mt-1 text-[0.9rem] leading-relaxed text-ink-3">{it.why}</p> : null}
          </li>
        ))}
      </ol>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => {
            start();
            setSeed(seed + 1);
            setOpen(null);
            track("tool_complete", { tool: tool.id, result: "shuffle" });
          }}
        >
          Show me different ones
        </button>
        <span className="text-[0.82rem] text-ink-4">{pool.length} in this set</span>
      </div>
      <p className="mt-4 text-[0.9rem] leading-relaxed text-ink-3">{tool.note}</p>
      {ch ? <ChapterCard toolId={tool.id} chapter={ch} price={price} /> : null}
    </div>
  );
}

/* ---------- checker ---------- */

function runRule(text: string, rule: CheckerTool["rules"][number]): boolean {
  const t = rule.test;
  if (t.pattern) {
    const n = text.match(new RegExp(t.pattern, "gi"))?.length ?? 0;
    return n >= (t.minMatches ?? 1);
  }
  if (t.minChars !== undefined) return text.trim().length >= t.minChars;
  if (t.maxChars !== undefined) return text.trim().length <= t.maxChars;
  return false;
}

function CheckerView({ tool, ...shared }: { tool: CheckerTool } & Shared) {
  const [text, setText] = useState("");
  const [checked, setChecked] = useState<string | null>(null);
  const start = useStartOnce(tool.id);
  const report = useMemo(() => {
    if (checked === null) return null;
    const rows = tool.rules.map((r) => {
      const hit = runRule(checked, r);
      return { rule: r, ok: r.good ? hit : !hit };
    });
    const total = rows.reduce((s, r) => s + r.rule.weight, 0);
    const got = rows.reduce((s, r) => s + (r.ok ? r.rule.weight : 0), 0);
    const score = total ? Math.round((got / total) * 100) : 0;
    const band = tool.bands.find((b) => score >= b.min && score <= b.max) ?? tool.bands[0];
    return { rows, score, result: tool.results.find((r) => r.id === band.result)! };
  }, [checked, tool]);

  return (
    <div>
      <label className="block">
        <span className="text-[0.92rem] font-semibold text-ink">{tool.input.label}</span>
        <textarea
          className="input mt-1.5 min-h-[150px] w-full resize-y"
          maxLength={tool.input.maxLength}
          placeholder={tool.input.placeholder}
          value={text}
          onChange={(e) => {
            start();
            setText(e.target.value);
          }}
        />
      </label>
      <p className="mt-1 text-[0.8rem] text-ink-4">Checked in your browser. Nothing you paste is sent or stored.</p>
      <button
        type="button"
        className="btn btn-primary mt-3"
        disabled={text.trim().length < 20}
        onClick={() => {
          setChecked(text);
          const rows = tool.rules.map((r) => (r.good ? runRule(text, r) : !runRule(text, r)));
          track("tool_complete", { tool: tool.id, passed: rows.filter(Boolean).length, of: rows.length });
        }}
      >
        Check it
      </button>
      {report ? (
        <div className="mt-5">
          <ResultCard toolId={tool.id} result={report.result} method={tool.method} restartLabel="Edit and check again" onRestart={() => setChecked(null)} {...shared}>
            <p className="condensed mt-3 text-[2rem] font-semibold text-ink">
              {report.score}
              <span className="text-[1rem] text-ink-4">/100</span>
            </p>
            <ul className="mt-3 grid gap-2">
              {report.rows.map(({ rule, ok }) => (
                <li key={rule.id} className="flex gap-3 rounded-2xl bg-slab-2 px-4 py-3 text-[0.94rem]">
                  <span aria-hidden className={ok ? "text-ok" : "text-bad"}>
                    {ok ? "✓" : "✗"}
                  </span>
                  <span className="min-w-0">
                    <span className="font-semibold text-ink">{rule.label}</span>
                    {!ok ? <span className="mt-0.5 block text-ink-3">{rule.fix}</span> : null}
                  </span>
                </li>
              ))}
            </ul>
          </ResultCard>
        </div>
      ) : null}
    </div>
  );
}
