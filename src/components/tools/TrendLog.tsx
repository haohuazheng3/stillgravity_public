"use client";

import { useEffect, useState } from "react";
import { track } from "@/components/Consent";
import { trendVerdict, type TrendDay } from "./logic";

/*
 * A two-week log that replaces checking her messages all day with three taps at night.
 * Stored in this browser only (localStorage); the page works without it.
 */
const KEY = "sg_trend_v1";
const DAYS = 14;

type Saved = { days: Record<string, TrendDay> };

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const VERDICT: Record<"early" | "warming" | "steady" | "cooling", { title: string; text: string }> = {
  early: { title: "Keep logging", text: "A week is the minimum for a read. Log once a night and leave your phone alone in between." },
  warming: { title: "It’s warming up", text: "She’s starting more often or replying faster than she did at the start. Keep doing what you’re doing, and make the next plan." },
  steady: { title: "It’s steady", text: "Nothing has really changed between the first and second half of your log. Steady is fine. Judge it by how your time together goes, not by the texts." },
  cooling: { title: "It’s cooling", text: "She starts less and replies slower than she did at the start. Stop adding messages, make one clear plan, and let her answer show you where this stands." },
};

const CHOICES: { id: keyof TrendDay; q: string; options: [string, TrendDay[keyof TrendDay]][] }[] = [
  { id: "first", q: "Who texted first today?", options: [["Her", "her"], ["Me", "me"], ["Nobody", "none"]] },
  { id: "reply", q: "How were her replies?", options: [["Quick", "quick"], ["Slow", "slow"], ["She didn’t reply", "none"]] },
  { id: "plan", q: "Did either of you make or confirm a plan?", options: [["Yes", true], ["No", false]] },
];

export function TrendLog() {
  const [saved, setSaved] = useState<Saved>({ days: {} });
  const [draft, setDraft] = useState<Partial<TrendDay>>({});
  const [storage, setStorage] = useState(true);
  const day = today();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const s = JSON.parse(raw) as Saved;
        setSaved(s);
        if (s.days[day]) setDraft(s.days[day]);
      }
    } catch {
      setStorage(false);
    }
  }, [day]);

  const write = (next: Saved) => {
    setSaved(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      setStorage(false);
    }
  };

  const entries = Object.entries(saved.days)
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .slice(-DAYS);
  const v = trendVerdict(entries);
  const verdict = VERDICT[v.result];
  const complete = draft.first !== undefined && draft.reply !== undefined && draft.plan !== undefined;

  return (
    <section aria-labelledby="trend-log" className="slab not-prose my-8 p-5 font-sans sm:p-7">
      <p className="eyebrow eyebrow-accent">Free tool · two-week log</p>
      <h3 id="trend-log" className="headline mt-2 text-[1.35rem] leading-tight text-ink sm:text-[1.5rem]">
        Log it for two weeks instead of reading every text
      </h3>
      <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-3">Three taps, once a night. After seven days you get a read on the trend; after fourteen, stop logging and decide.</p>
      <div className="mt-4 grid gap-4">
        {CHOICES.map((c) => (
          <fieldset key={c.id}>
            <legend className="text-[0.95rem] font-semibold text-ink">{c.q}</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {c.options.map(([label, value]) => (
                <button
                  key={label}
                  type="button"
                  className="chip"
                  data-selected={draft[c.id] === value ? "true" : undefined}
                  aria-pressed={draft[c.id] === value}
                  onClick={() => setDraft({ ...draft, [c.id]: value })}
                >
                  {label}
                </button>
              ))}
            </div>
          </fieldset>
        ))}
      </div>
      <button
        type="button"
        className="btn btn-primary btn-sm mt-4"
        disabled={!complete}
        onClick={() => {
          if (!complete) return;
          const next = { days: { ...saved.days, [day]: draft as TrendDay } };
          write(next);
          track("tool_progress", { tool: "trend-log", days: Object.keys(next.days).length });
        }}
      >
        {saved.days[day] ? "Update today" : "Save today"}
      </button>
      <div className="mt-5 flex flex-wrap gap-1.5" aria-label={`${entries.length} of ${DAYS} days logged`}>
        {Array.from({ length: DAYS }, (_, i) => {
          const e = entries[i]?.[1];
          const tone = !e ? "bg-slab-2" : e.first === "her" ? "bg-[var(--ok)]" : e.reply === "none" ? "bg-[var(--ink-4)]" : "bg-[var(--accent)]";
          return <span key={i} className={`h-3 w-5 rounded-full ${tone}`} title={entries[i]?.[0] ?? "not logged"} />;
        })}
      </div>
      <p className="mt-1.5 text-[0.78rem] text-ink-4">Green: she texted first · amber: you did, she replied · grey: no reply.</p>
      <div className="slab-inset mt-4 px-4 py-3">
        <p className="text-[0.8rem] font-semibold uppercase tracking-[0.12em] text-ink-4">
          {entries.length} of {DAYS} days · {verdict.title}
        </p>
        <p className="mt-1 text-[0.95rem] leading-relaxed text-ink-2">{verdict.text}</p>
        {entries.length >= 7 ? (
          <p className="mt-2 text-[0.85rem] text-ink-3">
            She texted first on {Math.round(v.herFirst[0] * 100)}% of days in the first half, {Math.round(v.herFirst[1] * 100)}% in the second. Quick replies: {Math.round(v.quick[0] * 100)}% → {Math.round(v.quick[1] * 100)}%.
          </p>
        ) : null}
        {entries.length >= DAYS ? <p className="mt-2 text-[0.85rem] font-semibold text-ink">Two weeks are in. Stop logging, act on the read, and get your evenings back.</p> : null}
      </div>
      <p className="mt-3 text-[0.78rem] text-ink-4">
        {storage ? "Saved in this browser only. Nothing is sent to us." : "This browser won’t let the page save, so the log only lasts until you close it."}{" "}
        {entries.length ? (
          <button type="button" className="underline hover:text-ink" onClick={() => write({ days: {} })}>
            Clear the log
          </button>
        ) : null}
      </p>
    </section>
  );
}
