import type { ReactNode } from "react";

/*
 * The book's five recurring tools, rendered as nested slabs so a sample chapter on the
 * site reads like the page in the PDF: The science · Say this · Field drill · Mistake · The truth.
 */

function Box({ label, title, tone, children }: { label: string; title?: string; tone: "science" | "say" | "drill" | "mistake"; children: ReactNode }) {
  const toneClass = {
    science: "before:bg-[#7c8cff]",
    say: "before:bg-accent",
    drill: "before:bg-ok",
    mistake: "before:bg-bad",
  }[tone];
  return (
    <aside
      className={`slab-inset relative my-6 overflow-hidden px-5 py-4 sm:px-6 sm:py-5 font-sans before:absolute before:inset-y-4 before:left-0 before:w-[3px] before:rounded-r-full ${toneClass}`}
    >
      <p className="eyebrow">
        {label}
        {title ? <span className="normal-case tracking-normal text-ink-2 font-semibold">: {title}</span> : null}
      </p>
      <div className="mt-2 text-[0.98rem] leading-relaxed text-ink-2 [&_p+p]:mt-2 [&_strong]:text-ink">{children}</div>
    </aside>
  );
}

export function Science({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <Box label="The science" title={title} tone="science">
      {children}
    </Box>
  );
}

export function SayThis({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <Box label="Say this" title={title} tone="say">
      {children}
    </Box>
  );
}

export function FieldDrill({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <Box label="Field drill" title={title} tone="drill">
      {children}
    </Box>
  );
}

export function Mistake({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <Box label="Mistake" title={title} tone="mistake">
      {children}
    </Box>
  );
}

export function Truth({ children }: { children: ReactNode }) {
  return (
    <div className="mt-8 rounded-[20px] bg-accent-soft px-5 py-5 sm:px-6">
      <p className="eyebrow eyebrow-accent">The truth</p>
      <p className="mt-2 font-serif text-[1.25rem] leading-snug text-ink" style={{ fontVariationSettings: '"opsz" 30' }}>
        {children}
      </p>
    </div>
  );
}

export function Compare({ left, right, rows }: { left: string; right: string; rows: [string, string][] }) {
  return (
    <div className="my-6 overflow-hidden rounded-[20px] font-sans text-[0.95rem] shadow-[inset_0_0_0_1px_var(--line)]">
      <div className="grid grid-cols-2 bg-slab-2 text-ink">
        <p className="px-4 py-3 font-semibold text-bad">{left}</p>
        <p className="px-4 py-3 font-semibold text-ok">{right}</p>
      </div>
      {rows.map(([a, b]) => (
        <div key={a} className="grid grid-cols-2 border-t border-line">
          <p className="px-4 py-3 text-ink-3">{a}</p>
          <p className="px-4 py-3 text-ink-2">{b}</p>
        </div>
      ))}
    </div>
  );
}

export function Table({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <div className="my-6 overflow-x-auto rounded-[20px] shadow-[inset_0_0_0_1px_var(--line)]">
      <table className="w-full min-w-[30rem] font-sans text-[0.93rem]">
        <thead className="bg-slab-2">
          <tr>
            {head.map((h) => (
              <th key={h} className="px-4 py-3 text-left font-semibold text-ink">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r[0]} className="border-t border-line align-top">
              {r.map((c, i) => (
                <td key={i} className={`px-4 py-3 ${i === 0 ? "font-semibold text-ink-2" : "text-ink-2"}`}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export type ChatLine = { from: "me" | "her" | "note"; text: string };

export function Chat({ kind, label, lines }: { kind: "Text" | "In person" | "App"; label: string; lines: ChatLine[] }) {
  return (
    <figure className="slab-ink my-6 px-4 py-4 sm:px-5" aria-label={`${kind} example: ${label}`}>
      <figcaption className="mb-3 flex items-center gap-2 font-sans text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-[#9aa5b8]">
        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[#f0b752]">{kind}</span>
        {label}
      </figcaption>
      <div className="flex flex-col gap-2 font-sans">
        {lines.map((l, i) =>
          l.from === "note" ? (
            <p key={i} className="py-1 text-center text-[0.78rem] italic text-[#8d98ab]">
              {l.text}
            </p>
          ) : (
            <p key={i} className={l.from === "me" ? "self-end bubble bubble-out" : "self-start bubble bubble-in"}>
              {l.text}
            </p>
          ),
        )}
      </div>
    </figure>
  );
}

export function Points({ title, items }: { title: string; items: { lead?: string; text: string }[] }) {
  return (
    <div className="my-6">
      <h3 className="font-sans text-[1.02rem] font-bold text-ink">{title}</h3>
      <ul className="mt-3 space-y-2.5">
        {items.map((it) => (
          <li key={it.text} className="flex gap-3">
            <span aria-hidden className="mt-[0.62em] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
            <span>
              {it.lead ? <strong className="text-ink">{it.lead} </strong> : null}
              {it.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ChapterShell({
  id,
  title,
  standfirst,
  children,
}: {
  id: string;
  title: string;
  standfirst: string;
  children: ReactNode;
}) {
  return (
    <article id={`chapter-${id}`} className="slab scroll-mt-28 px-5 py-8 sm:px-10 sm:py-12">
      <p className="eyebrow eyebrow-accent">Chapter {id}</p>
      <h2 className="headline mt-3 text-[2rem] sm:text-[2.5rem] text-ink">{title}</h2>
      <p className="dek mt-4 text-[1.18rem] leading-snug">{standfirst}</p>
      <div className="prose-sg mt-6">{children}</div>
    </article>
  );
}
