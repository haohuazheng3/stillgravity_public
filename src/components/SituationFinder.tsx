"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { SITUATION_GROUPS, type Situation } from "@/content/situations";
import { track } from "./Consent";

export interface ChapterInfo {
  id: string;
  title: string;
  page: number;
}

/**
 * Pick the thought that's keeping you up → the first honest move, and the chapter that
 * holds the full playbook. Selection is local state: the answer swaps the instant a
 * chip is tapped, with no network involved.
 */
export function SituationFinder({
  chapters,
  initial = "left-on-read",
  compact = false,
}: {
  chapters: Record<string, ChapterInfo>;
  initial?: string;
  compact?: boolean;
}) {
  const all = useMemo(() => SITUATION_GROUPS.flatMap((g) => g.items.map((s) => ({ ...s, group: g.id }))), []);
  const find = (slug: string) => all.find((s) => s.slug === slug) ?? all[0];
  const [selected, setSelected] = useState<Situation & { group: string }>(() => find(initial));
  const [group, setGroup] = useState<string>(() => find(initial).group);
  const answerRef = useRef<HTMLDivElement>(null);

  // deep link: /situations#she-ghosted-me
  useEffect(() => {
    const fromHash = () => {
      const slug = decodeURIComponent(window.location.hash.replace(/^#/, ""));
      const hit = all.find((s) => s.slug === slug);
      if (hit) {
        setSelected(hit);
        setGroup(hit.group);
      }
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [all]);

  const choose = (s: Situation & { group: string }) => {
    setSelected(s);
    track("situation_select", { slug: s.slug, chapter: s.chapter });
    if (window.matchMedia("(max-width: 1023px)").matches) {
      requestAnimationFrame(() => answerRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }));
    }
  };

  const ch = chapters[selected.chapter];
  const activeGroup = SITUATION_GROUPS.find((g) => g.id === group) ?? SITUATION_GROUPS[0];

  return (
    <div className="grid gap-4 lg:grid-cols-[1.15fr_1fr] lg:gap-6">
      <div className="slab p-4 sm:p-6">
        <div role="tablist" aria-label="Situation groups" className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
          {SITUATION_GROUPS.map((g) => (
            <button
              key={g.id}
              role="tab"
              type="button"
              aria-selected={group === g.id}
              onClick={() => setGroup(g.id)}
              className={`shrink-0 rounded-full px-3.5 py-2 text-[0.85rem] font-semibold transition-colors active:scale-95 ${
                group === g.id ? "bg-ink text-void" : "bg-slab-2 text-ink-3 hover:text-ink"
              }`}
            >
              {g.title}
            </button>
          ))}
        </div>
        <ul className={`mt-4 flex flex-wrap gap-2 ${compact ? "" : "sm:gap-2.5"}`} aria-label={activeGroup.title}>
          {activeGroup.items.map((s) => (
            <li key={s.slug}>
              <button
                type="button"
                className="chip"
                data-selected={selected.slug === s.slug}
                aria-pressed={selected.slug === s.slug}
                onClick={() => choose({ ...s, group: activeGroup.id })}
              >
                {s.quote}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div ref={answerRef} className="slab-ink scroll-mt-28 p-6 sm:p-8" aria-live="polite">
        <p className="font-sans text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[#f0b752]">If you’re thinking</p>
        <p key={selected.slug} className="animate-rise mt-3 font-serif text-[1.55rem] leading-tight text-[#f3f5f9] sm:text-[1.8rem]" style={{ fontVariationSettings: '"opsz" 40' }}>
          {selected.quote}
        </p>
        <p className="mt-5 font-sans text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[#8f9bb0]">Your first move</p>
        <p key={`${selected.slug}-a`} className="mt-2 font-sans text-[1.02rem] leading-relaxed text-[#c9d1de]">
          {selected.first}
        </p>
        {ch ? (
          <div className="mt-6 rounded-[18px] bg-white/[0.06] p-4 ring-1 ring-white/10">
            <p className="font-sans text-[0.78rem] text-[#8f9bb0]">The full playbook</p>
            <p className="mt-1 font-sans text-[0.98rem] font-semibold text-[#edf0f6]">
              Chapter {ch.id}: {ch.title}
            </p>
            <p className="font-sans text-[0.82rem] text-[#8f9bb0]">Page {ch.page} · exact words, the weak version beside the good one</p>
          </div>
        ) : null}
        <div className="mt-6 flex flex-wrap gap-2.5">
          <Link href="/book" className="btn btn-primary">
            Get the full playbook
          </Link>
          <Link href="/book/sample" className="btn btn-ink !bg-white/10 !text-[#edf0f6] hover:!bg-white/15">
            Read Part 1 free
          </Link>
        </div>
      </div>
    </div>
  );
}
