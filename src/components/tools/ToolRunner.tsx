"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { track } from "@/components/Consent";
import type {
  CalculatorTool,
  ChatTool,
  CheckerTool,
  DecisionTool,
  DecoderTool,
  LadderTool,
  SendCheckTool,
  GeneratorItem,
  GeneratorTool,
  QuizTool,
  ToolNext,
  Tone,
  Tool,
  ToolResult,
} from "@/content/tools/types";
import { FORMULAS } from "./formulas";
import { analyzeChat, formatMins, manualChat, parseWhatsApp, readZipText, type ChatMsg, type ChatStats } from "./chat";
import { buildPlan, checkSend, decodePhrase } from "./logic";

export type ChapterInfo = { id: string; title: string; page: number; teaser?: string };

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
        {tool.kind === "decoder" ? <DecoderView tool={tool} {...shared} /> : null}
        {tool.kind === "sendcheck" ? <SendCheckView tool={tool} {...shared} /> : null}
        {tool.kind === "chat" ? <ChatView tool={tool} {...shared} /> : null}
        {tool.kind === "ladder" ? <LadderView tool={tool} {...shared} /> : null}
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

function NextStep({ toolId, next }: { toolId: string; next: ToolNext }) {
  return (
    <p className="mt-4 text-[0.95rem] font-semibold">
      <Link href={next.href} className="text-accent-text underline-offset-4 hover:underline" onClick={() => track("tool_next", { tool: toolId, to: next.href })}>
        Next: {next.label} →
      </Link>
    </p>
  );
}

export function CopyButton({ text, toolId }: { text: string; toolId: string }) {
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
      {ch.teaser ? (
        <blockquote className="mt-2 border-l-2 border-[#f0b752]/60 pl-3 font-serif text-[0.98rem] italic leading-relaxed text-[#d7dce5]">
          {ch.teaser}
        </blockquote>
      ) : null}
      <p className="mt-2 text-[0.9rem] text-[#aeb8c8]">
        {ch.teaser ? `That’s how page ${ch.page} opens. The rest of the chapter has` : `Page ${ch.page} of What She Won’t Tell You:`} the exact words, the weak version beside the good one, and why it works.
      </p>
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
  next,
}: {
  toolId: string;
  result: ToolResult;
  next?: ToolNext;
  onRestart: () => void;
  restartLabel?: string;
  children?: ReactNode;
  method?: string;
} & Shared) {
  const ch = chapters[result.chapter];
  const step = result.next ?? next;
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
      {step ? <NextStep toolId={toolId} next={step} /> : null}
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
  if (tool.axes) {
    const total = (axis: "x" | "y") => chosen.reduce((s, o, qi) => s + (tool.questions[qi].axis === axis ? (o?.points ?? 0) : 0), 0);
    const hx = total("x") >= tool.axes.cut.x;
    const hy = total("y") >= tool.axes.cut.y;
    const c = tool.axes.cells;
    const id = hx ? (hy ? c.highHigh : c.highLow) : hy ? c.lowHigh : c.lowLow;
    return tool.results.find((r) => r.id === id)!;
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
        next={tool.next}
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
        next={tool.next}
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
          <ResultCard toolId={tool.id} result={result} next={tool.next} method={tool.method} onRestart={() => { setValues(initial); setShown(false); }} {...shared}>
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
      {tool.next ? <NextStep toolId={tool.id} next={tool.next} /> : null}
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
          <ResultCard toolId={tool.id} result={report.result} next={tool.next} method={tool.method} restartLabel="Edit and check again" onRestart={() => setChecked(null)} {...shared}>
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

/* ---------- decoder ---------- */

function DecoderView({ tool, ...shared }: { tool: DecoderTool } & Shared) {
  const [phraseId, setPhraseId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const start = useStartOnce(tool.id);
  const phrase = tool.phrases.find((p) => p.id === phraseId) ?? null;
  const asking = phrase && !phrase.fixed && answers.length < tool.questions.length;
  const result = phrase && !asking ? decodePhrase(tool, phrase, answers) : null;

  if (phrase && result) {
    return (
      <div>
        <p className="mb-3 text-[0.9rem] text-ink-3">
          She said: <span className="font-semibold text-ink">“{phrase.say}”</span>
        </p>
        <ResultCard
          toolId={tool.id}
          result={result}
          next={tool.next}
          method={tool.method}
          restartLabel="Decode something else"
          onRestart={() => {
            setPhraseId(null);
            setAnswers([]);
          }}
          {...shared}
        />
      </div>
    );
  }
  if (phrase && asking) {
    const q = tool.questions[answers.length];
    return (
      <div>
        <p className="mb-1 text-[0.9rem] text-ink-3">
          She said: <span className="font-semibold text-ink">“{phrase.say}”</span>
        </p>
        <Progress at={answers.length} of={tool.questions.length} />
        <p className="text-[1.08rem] font-semibold leading-snug text-ink">{q.q}</p>
        {q.help ? <p className="mt-1 text-[0.9rem] text-ink-4">{q.help}</p> : null}
        <div className="mt-4">
          <OptionList
            options={q.options.map((o) => o.label)}
            onPick={(i) => {
              const next = [...answers, i];
              setAnswers(next);
              if (next.length === tool.questions.length) track("tool_complete", { tool: tool.id, result: decodePhrase(tool, phrase, next).id });
            }}
          />
        </div>
        <button type="button" className="btn btn-quiet btn-sm mt-4" onClick={() => (answers.length ? setAnswers(answers.slice(0, -1)) : setPhraseId(null))}>
          ← Back
        </button>
      </div>
    );
  }
  return (
    <div>
      {tool.groups.map((g) => {
        const items = tool.phrases.filter((p) => p.group === g.id);
        if (!items.length) return null;
        return (
          <fieldset key={g.id} className="mb-4">
            <legend className="text-[0.92rem] font-semibold text-ink">{g.label ?? g.heading}</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {items.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className="chip"
                  onClick={() => {
                    start();
                    setPhraseId(p.id);
                    setAnswers([]);
                    if (p.fixed) track("tool_complete", { tool: tool.id, result: `${p.id}-${p.fixed}` });
                  }}
                >
                  “{p.say}”
                </button>
              ))}
            </div>
          </fieldset>
        );
      })}
    </div>
  );
}

/* ---------- sendcheck ---------- */

function SendCheckView({ tool, ...shared }: { tool: SendCheckTool } & Shared) {
  const [draft, setDraft] = useState("");
  const [her, setHer] = useState("");
  const [ctx, setCtx] = useState<Record<string, number>>({});
  const [checked, setChecked] = useState(false);
  const start = useStartOnce(tool.id);
  const ready = draft.trim().length >= 1 && tool.context.every((c) => ctx[c.id] !== undefined);
  const report = useMemo(() => (checked ? checkSend(tool, draft, her, ctx) : null), [checked, tool, draft, her, ctx]);

  if (report) {
    const flagged = [...report.stops, ...report.edits];
    return (
      <ResultCard toolId={tool.id} result={report.result} next={tool.next} method={tool.method} restartLabel="Edit and check again" onRestart={() => setChecked(false)} {...shared}>
        <div className="mt-4 rounded-2xl bg-slab-2 px-4 py-3">
          <p className="text-[0.8rem] text-ink-4">Your draft</p>
          <p className="mt-1 whitespace-pre-wrap break-words text-[0.98rem] text-ink">{draft.trim()}</p>
        </div>
        {flagged.length || report.goods.length ? (
          <ul className="mt-3 grid gap-2">
            {flagged.map((r) => (
              <li key={r.id} className="flex gap-3 rounded-2xl bg-slab-2 px-4 py-3 text-[0.94rem]">
                <span aria-hidden className={r.kind === "stop" ? "text-bad" : "text-accent-text"}>
                  {r.kind === "stop" ? "■" : "✗"}
                </span>
                <span className="min-w-0">
                  <span className="font-semibold text-ink">{r.label}</span>
                  <span className="mt-0.5 block text-ink-3">{r.fix}</span>
                </span>
              </li>
            ))}
            {report.goods.map((r) => (
              <li key={r.id} className="flex gap-3 rounded-2xl bg-slab-2 px-4 py-3 text-[0.94rem]">
                <span aria-hidden className="text-ok">
                  ✓
                </span>
                <span className="font-semibold text-ink">{r.label}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </ResultCard>
    );
  }
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!ready) return;
        setChecked(true);
        const r = checkSend(tool, draft, her, ctx);
        track("tool_complete", { tool: tool.id, result: r.result.id, flags: r.stops.length + r.edits.length });
      }}
    >
      <label className="block">
        <span className="text-[0.92rem] font-semibold text-ink">{tool.input.label}</span>
        <textarea
          className="input mt-1.5 min-h-[110px] w-full resize-y"
          maxLength={tool.input.maxLength}
          placeholder={tool.input.placeholder}
          value={draft}
          onChange={(e) => {
            start();
            setDraft(e.target.value);
          }}
        />
      </label>
      <label className="mt-4 block">
        <span className="text-[0.92rem] font-semibold text-ink">{tool.her.label}</span>
        <textarea className="input mt-1.5 min-h-[70px] w-full resize-y" maxLength={tool.her.maxLength} placeholder={tool.her.placeholder} value={her} onChange={(e) => setHer(e.target.value)} />
      </label>
      {tool.context.map((c) => (
        <fieldset key={c.id} className="mt-4">
          <legend className="text-[0.92rem] font-semibold text-ink">{c.label}</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {c.options.map((o) => (
              <button
                key={o.label}
                type="button"
                className="chip"
                data-selected={ctx[c.id] === o.value ? "true" : undefined}
                aria-pressed={ctx[c.id] === o.value}
                onClick={() => {
                  start();
                  setCtx({ ...ctx, [c.id]: o.value });
                }}
              >
                {o.label}
              </button>
            ))}
          </div>
        </fieldset>
      ))}
      <p className="mt-3 text-[0.8rem] text-ink-4">Checked in your browser. Nothing you type is sent or stored.</p>
      <button type="submit" className="btn btn-primary mt-3" disabled={!ready}>
        Check my text
      </button>
    </form>
  );
}

/* ---------- chat ---------- */

const pct = (a: number, b: number) => (a + b ? `${Math.round((a / (a + b)) * 100)}%` : "—");

function ChatView({ tool, ...shared }: { tool: ChatTool } & Shared) {
  const [mode, setMode] = useState<"file" | "manual">("file");
  const [msgs, setMsgs] = useState<ChatMsg[] | null>(null);
  const [senders, setSenders] = useState<{ name: string; count: number }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ChatStats | null>(null);
  const [paste, setPaste] = useState("");
  const [manual, setManual] = useState<Record<string, number>>({});
  const [manualResult, setManualResult] = useState<ChatStats["result"] | null>(null);
  const start = useStartOnce(tool.id);

  const load = (text: string) => {
    const parsed = parseWhatsApp(text);
    if (parsed.msgs.length < 2 || parsed.senders.length < 2) {
      setError("We couldn’t find a two-person chat in that. Export the chat from WhatsApp (Without media) and choose the file it creates, or paste the text.");
      return;
    }
    setError(null);
    setMsgs(parsed.msgs);
    setSenders(parsed.senders.slice(0, 2));
  };
  const reset = () => {
    setMsgs(null);
    setSenders([]);
    setStats(null);
    setPaste("");
    setManualResult(null);
    setManual({});
  };

  const result = stats ? tool.results.find((r) => r.id === stats.result) : manualResult ? tool.results.find((r) => r.id === manualResult) : null;
  if (result) {
    return (
      <ResultCard toolId={tool.id} result={result} next={tool.next} method={tool.method} restartLabel="Check another chat" onRestart={reset} {...shared}>
        {stats ? (
          <dl className="mt-4 grid gap-2 sm:grid-cols-2">
            {[
              ["Conversations you started", pct(stats.starts.me, stats.starts.her)],
              ["Your share of the words", pct(stats.words.me, stats.words.her)],
              ["Questions asked", `you ${stats.questions.me} · her ${stats.questions.her}`],
              ["Typical reply time", `you ${formatMins(stats.replyMins.me)} · her ${formatMins(stats.replyMins.her)}`],
              ["Messages after 6+ hours of no reply", `you ${stats.followUps.me} · her ${stats.followUps.her}`],
              ["Her messages a day, last 2 weeks vs the 2 before", `${stats.recent.herPerDay.toFixed(1)} vs ${stats.recent.herPerDayBefore.toFixed(1)}`],
            ].map(([k, v]) => (
              <div key={k} className="min-w-0 rounded-2xl bg-slab-2 px-4 py-3">
                <dt className="text-[0.8rem] text-ink-4">{k}</dt>
                <dd className="condensed mt-0.5 text-[1.3rem] font-semibold text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        {stats ? <p className="mt-3 text-[0.82rem] text-ink-4">{stats.messages.me + stats.messages.her} messages over {stats.days} days. Counted in your browser and then forgotten.</p> : null}
      </ResultCard>
    );
  }

  if (msgs && senders.length === 2) {
    return (
      <div>
        <p className="text-[1.08rem] font-semibold leading-snug text-ink">Which one is you?</p>
        <p className="mt-1 text-[0.9rem] text-ink-4">{msgs.length} messages found.</p>
        <div className="mt-4">
          <OptionList
            options={senders.map((s) => `${s.name} · ${s.count} messages`)}
            onPick={(i) => {
              const me = senders[i].name;
              const her = senders[1 - i].name;
              const s = analyzeChat(msgs, me, her);
              setStats(s);
              track("tool_complete", { tool: tool.id, result: s.result });
            }}
          />
        </div>
        <button type="button" className="btn btn-quiet btn-sm mt-4" onClick={reset}>
          ← Use a different chat
        </button>
      </div>
    );
  }

  const MANUAL: { id: string; q: string; options: [string, number][] }[] = [
    { id: "started", q: "Of your last 10 conversations, how many did you start?", options: [["2 or fewer", 2], ["3–5", 4], ["6–7", 6], ["8 or more", 9]] },
    { id: "reply", q: "When you text her, how long does she usually take to reply?", options: [["Minutes", 0], ["An hour or two", 1], ["Half a day", 2], ["A day or more", 3]] },
    { id: "questions", q: "Who asks more questions?", options: [["She does", 0], ["About even", 1], ["I do, a bit more", 2], ["Almost always me", 3]] },
    { id: "double", q: "How often do you text again before she’s replied?", options: [["Almost never", 0], ["Sometimes", 1], ["Often", 2]] },
    { id: "trend", q: "Compared with two weeks ago, she texts…", options: [["More, or the same", 0], ["A little less", 1], ["Much less", 2]] },
  ];

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2" role="tablist">
        <button type="button" role="tab" aria-selected={mode === "file"} className="chip" data-selected={mode === "file" ? "true" : undefined} onClick={() => setMode("file")}>
          Analyze a WhatsApp chat
        </button>
        <button type="button" role="tab" aria-selected={mode === "manual"} className="chip" data-selected={mode === "manual" ? "true" : undefined} onClick={() => setMode("manual")}>
          iMessage or other apps: 5 questions
        </button>
      </div>
      {mode === "file" ? (
        <div>
          <ol className="list-decimal space-y-1 pl-5 text-[0.92rem] text-ink-3">
            <li>In WhatsApp, open the chat with her and tap her name (iPhone) or ⋮ → More (Android).</li>
            <li>Choose Export chat → Without media, and save the file.</li>
            <li>Choose that file here, or open it and paste the text below.</li>
          </ol>
          <label className="btn btn-primary mt-4 cursor-pointer">
            Choose the export file
            <input
              type="file"
              accept=".txt,.zip,text/plain,application/zip"
              className="sr-only"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                start();
                try {
                  const text = /\.zip$/i.test(f.name) ? await readZipText(await f.arrayBuffer()) : await f.text();
                  if (!text) setError("That zip has no chat text we can read. Try exporting again, or paste the text instead.");
                  else load(text);
                } catch (err) {
                  console.warn("[chat] read failed", err);
                  setError("We couldn’t read that file. Paste the chat text instead.");
                }
              }}
            />
          </label>
          <label className="mt-4 block">
            <span className="text-[0.92rem] font-semibold text-ink">Or paste the exported text</span>
            <textarea className="input mt-1.5 min-h-[110px] w-full resize-y" placeholder="12/31/25, 9:15 PM - Sam: haha that place is so good" value={paste} onChange={(e) => setPaste(e.target.value)} />
          </label>
          <button
            type="button"
            className="btn btn-ghost btn-sm mt-3"
            disabled={paste.trim().length < 40}
            onClick={() => {
              start();
              load(paste);
            }}
          >
            Analyze the pasted chat
          </button>
          {error ? <p className="mt-3 text-[0.92rem] text-bad">{error}</p> : null}
          <p className="mt-3 text-[0.8rem] text-ink-4">Runs entirely in your browser. Nothing is uploaded, saved or seen by us: close the page and it’s gone.</p>
        </div>
      ) : (
        <div>
          <p className="text-[0.92rem] text-ink-3">{tool.manual.intro}</p>
          {MANUAL.map((m) => (
            <fieldset key={m.id} className="mt-4">
              <legend className="text-[0.95rem] font-semibold text-ink">{m.q}</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {m.options.map(([label, value]) => (
                  <button
                    key={label}
                    type="button"
                    className="chip"
                    data-selected={manual[m.id] === value ? "true" : undefined}
                    aria-pressed={manual[m.id] === value}
                    onClick={() => {
                      start();
                      setManual({ ...manual, [m.id]: value });
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </fieldset>
          ))}
          <button
            type="button"
            className="btn btn-primary mt-5"
            disabled={MANUAL.some((m) => manual[m.id] === undefined)}
            onClick={() => {
              const r = manualChat({ started: manual.started, reply: manual.reply, questions: manual.questions, double: manual.double, trend: manual.trend });
              setManualResult(r);
              track("tool_complete", { tool: tool.id, result: r, mode: "manual" });
            }}
          >
            Show my result
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------- ladder ---------- */

type LadderSave = { start: number; setting: string; done: Record<string, number> };

function readSave(key: string): LadderSave | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as LadderSave) : null;
  } catch {
    return null;
  }
}

function LadderView({ tool, chapters, price }: { tool: LadderTool } & Shared) {
  const key = `sg_ladder_${tool.id}`;
  const [start, setStart] = useState<number | null>(null);
  const [setting, setSetting] = useState<string>(tool.settings[0].value);
  const [done, setDone] = useState<Record<string, number>>({});
  const [made, setMade] = useState(false);
  const begin = useStartOnce(tool.id);

  useEffect(() => {
    const s = readSave(key);
    if (s) {
      setStart(s.start);
      setSetting(s.setting);
      setDone(s.done ?? {});
      setMade(true);
    }
  }, [key]);
  const save = (next: LadderSave) => {
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch (e) {
      console.warn("[ladder] could not save progress", e);
    }
  };

  const plan = made && start !== null ? buildPlan(tool, start, setting) : [];
  const ch = chapters[tool.chapter];
  const doneDays = Object.keys(done).length;
  const nerves = plan.filter((p) => done[p.day] !== undefined).map((p) => done[p.day]);
  const firstAvg = nerves.slice(0, 3).reduce((s, n) => s + n, 0) / Math.max(1, Math.min(3, nerves.length));
  const lastAvg = nerves.slice(-3).reduce((s, n) => s + n, 0) / Math.max(1, Math.min(3, nerves.length));

  if (!made || start === null) {
    return (
      <div>
        <fieldset>
          <legend className="text-[0.95rem] font-semibold text-ink">Where does it get hard? Pick the first step that makes you nervous.</legend>
          <div className="mt-2 grid gap-2">
            {tool.levels.map((l) => (
              <button key={l.n} type="button" className="chip w-full justify-start !rounded-2xl !px-4 !py-3 text-left" data-selected={start === l.n ? "true" : undefined} aria-pressed={start === l.n} onClick={() => { begin(); setStart(l.n); }}>
                <span className="condensed mr-2 text-ink-4">{l.n}</span> {l.label}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset className="mt-4">
          <legend className="text-[0.95rem] font-semibold text-ink">Where do you see women most?</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {tool.settings.map((s) => (
              <button key={s.value} type="button" className="chip" data-selected={setting === s.value ? "true" : undefined} aria-pressed={setting === s.value} onClick={() => setSetting(s.value)}>
                {s.label}
              </button>
            ))}
          </div>
        </fieldset>
        <button
          type="button"
          className="btn btn-primary mt-5"
          disabled={start === null}
          onClick={() => {
            if (start === null) return;
            setMade(true);
            setDone({});
            save({ start, setting, done: {} });
            track("tool_complete", { tool: tool.id, result: `level-${start}`, setting });
          }}
        >
          Build my {tool.days}-day plan
        </button>
      </div>
    );
  }

  return (
    <div>
      <p className="text-[0.95rem] text-ink-2">
        Your plan starts at step {start}: <span className="font-semibold text-ink">{tool.levels.find((l) => l.n === start)?.label}</span>. One task a day. Before each one, rate how nervous you are from 0 to 10; the number should fall as the days go by.
      </p>
      {doneDays ? (
        <p className="condensed mt-3 text-[1.2rem] font-semibold text-ink">
          {doneDays} of {plan.length} days done{nerves.length >= 4 ? ` · nerves ${firstAvg.toFixed(1)} → ${lastAvg.toFixed(1)}` : ""}
        </p>
      ) : null}
      <ol className="mt-4 grid gap-2">
        {plan.map((p) => {
          const n = done[p.day];
          return (
            <li key={p.day} className="rounded-2xl bg-slab-2 px-4 py-3" data-done={n !== undefined ? "true" : undefined}>
              <p className="text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-ink-4">
                Day {p.day} · step {p.level}
              </p>
              <p className={`mt-1 text-[0.99rem] leading-relaxed ${n !== undefined ? "text-ink-3 line-through decoration-ink-4/50" : "text-ink"}`}>{p.step.text}</p>
              {p.step.why ? <p className="mt-1 text-[0.86rem] text-ink-4">{p.step.why}</p> : null}
              <label className="mt-2 flex flex-wrap items-center gap-2 text-[0.88rem] text-ink-3">
                {n !== undefined ? "Done. Nerves before:" : "Done it? Nerves before (0–10):"}
                <select
                  className="input !min-h-0 w-auto !py-1"
                  value={n ?? ""}
                  onChange={(e) => {
                    const next = { ...done };
                    if (e.target.value === "") delete next[p.day];
                    else next[p.day] = Number(e.target.value);
                    setDone(next);
                    save({ start: start!, setting, done: next });
                    if (e.target.value !== "") track("tool_progress", { tool: tool.id, day: p.day });
                  }}
                >
                  <option value="">–</option>
                  {Array.from({ length: 11 }, (_, i) => (
                    <option key={i} value={i}>
                      {i}
                    </option>
                  ))}
                </select>
              </label>
            </li>
          );
        })}
      </ol>
      <p className="mt-4 text-[0.9rem] leading-relaxed text-ink-3">{tool.note}</p>
      <p className="mt-2 text-[0.8rem] text-ink-4">Your plan and progress are saved in this browser only.</p>
      <button
        type="button"
        className="btn btn-quiet btn-sm mt-3"
        onClick={() => {
          setMade(false);
          setDone({});
          try {
            localStorage.removeItem(key);
          } catch (e) {
            console.warn("[ladder] could not clear progress", e);
          }
        }}
      >
        Start a new plan
      </button>
      {tool.next ? <NextStep toolId={tool.id} next={tool.next} /> : null}
      {ch ? <ChapterCard toolId={tool.id} chapter={ch} price={price} /> : null}
    </div>
  );
}
