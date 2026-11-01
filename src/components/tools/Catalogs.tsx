import type { DecoderTool, LadderTool } from "@/content/tools/types";

export const DECODER_ID = "all-phrases";
export const LADDER_ID = "the-ladder";

/**
 * Every phrase the decoder knows, server-rendered and grouped, with what it usually means and
 * what would change the read. The tool gives one answer at a time; this is the whole list.
 */
export function DecoderCatalog({ tool }: { tool: DecoderTool }) {
  const groups = tool.groups.map((g) => ({ ...g, items: tool.phrases.filter((p) => p.group === g.id) })).filter((g) => g.items.length);
  return (
    <section aria-labelledby={DECODER_ID} className="slab mt-8 px-5 py-7 sm:px-8 sm:py-9">
      <h2 id={DECODER_ID} className="headline scroll-mt-28 text-[1.55rem] leading-tight text-ink sm:text-[1.8rem]">
        {tool.catalog.title}
      </h2>
      {tool.catalog.intro ? <p className="mt-2 max-w-2xl text-[0.98rem] leading-relaxed text-ink-3">{tool.catalog.intro}</p> : null}
      <nav aria-label="Jump to a group" className="mt-5 flex flex-wrap gap-2">
        {groups.map((g) => (
          <a key={g.id} href={`#${DECODER_ID}-${g.id}`} className="chip">
            {g.label ?? g.heading} <span className="whitespace-nowrap text-ink-4">· {g.items.length}</span>
          </a>
        ))}
      </nav>
      {groups.map((g) => (
        <div key={g.id} className="mt-9">
          <h3 id={`${DECODER_ID}-${g.id}`} className="scroll-mt-28 text-[1.22rem] font-semibold leading-snug text-ink">
            {g.heading}
          </h3>
          {g.intro ? <p className="mt-1.5 max-w-2xl text-[0.95rem] leading-relaxed text-ink-3">{g.intro}</p> : null}
          <dl className="mt-3 grid gap-2">
            {g.items.map((p) => (
              <div key={p.id} className="rounded-2xl bg-slab-2 px-4 py-3">
                <dt className="text-[1rem] font-semibold text-ink">“{p.say}”</dt>
                <dd className="mt-1 text-[0.95rem] leading-relaxed text-ink-2">{p.usually}</dd>
                {!p.fixed && p.readings.warm ? (
                  <dd className="mt-1.5 text-[0.9rem] leading-relaxed text-ink-3">
                    <span className="font-semibold text-ok">When it’s a good sign:</span> {p.readings.warm.verdict}
                  </dd>
                ) : null}
                {!p.fixed && p.readings.no ? (
                  <dd className="mt-1 text-[0.9rem] leading-relaxed text-ink-3">
                    <span className="font-semibold text-ink-2">When it’s a no:</span> {p.readings.no.verdict}
                  </dd>
                ) : null}
                {p.href ? (
                  <dd className="mt-1 text-[0.88rem]">
                    <a href={p.href} className="font-semibold text-accent-text underline-offset-4 hover:underline">
                      The full guide →
                    </a>
                  </dd>
                ) : null}
              </div>
            ))}
          </dl>
        </div>
      ))}
    </section>
  );
}

/** The whole ladder, step by step, so the plan's logic is readable without the tool. */
export function LadderCatalog({ tool }: { tool: LadderTool }) {
  return (
    <section aria-labelledby={LADDER_ID} className="slab mt-8 px-5 py-7 sm:px-8 sm:py-9">
      <h2 id={LADDER_ID} className="headline scroll-mt-28 text-[1.55rem] leading-tight text-ink sm:text-[1.8rem]">
        {tool.catalog.title}
      </h2>
      {tool.catalog.intro ? <p className="mt-2 max-w-2xl text-[0.98rem] leading-relaxed text-ink-3">{tool.catalog.intro}</p> : null}
      {tool.levels.map((l) => {
        const steps = tool.steps.filter((s) => s.level === l.n);
        return (
          <div key={l.n} className="mt-9">
            <h3 id={`${LADDER_ID}-${l.n}`} className="scroll-mt-28 text-[1.22rem] font-semibold leading-snug text-ink">
              Step {l.n}: {l.heading}
            </h3>
            {l.intro ? <p className="mt-1.5 max-w-2xl text-[0.95rem] leading-relaxed text-ink-3">{l.intro}</p> : null}
            <ol className="mt-3 grid gap-2">
              {steps.map((s) => (
                <li key={s.text} className="rounded-2xl bg-slab-2 px-4 py-3">
                  <p className="text-[0.99rem] leading-relaxed text-ink">{s.text}</p>
                  {s.why ? <p className="mt-1 text-[0.86rem] leading-relaxed text-ink-4">{s.why}</p> : null}
                </li>
              ))}
            </ol>
          </div>
        );
      })}
    </section>
  );
}
