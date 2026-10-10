import Link from "next/link";
import type { ReactNode } from "react";
import { PARTS, THREE_RULES } from "@/content/book";
import type { Faq } from "@/content/faq";
import { BOOK } from "@/lib/site";
import { JsonLd } from "./JsonLd";
import { breadcrumbLd } from "@/lib/seo";

export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1120px] px-3 sm:px-5 ${className}`}>{children}</div>;
}

export function Section({ children, className = "", id }: { children: ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={`scroll-mt-24 pt-20 sm:pt-28 ${className}`}>
      <Container>{children}</Container>
    </section>
  );
}

/** Section heading: lives in the void, deliberately quiet, so the slabs below carry the weight. */
export function SectionHead({ eyebrow, title, lede, align = "left" }: { eyebrow?: string; title: ReactNode; lede?: ReactNode; align?: "left" | "center" }) {
  return (
    <div className={`mb-8 sm:mb-10 ${align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}`}>
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h2 className="headline mt-3 text-[1.9rem] text-ink sm:text-[2.4rem]">{title}</h2>
      {lede ? <p className="mt-3 text-[1.04rem] leading-relaxed text-ink-3">{lede}</p> : null}
    </div>
  );
}

export function PageHero({ eyebrow, title, lede, children }: { eyebrow?: string; title: ReactNode; lede?: ReactNode; children?: ReactNode }) {
  return (
    <Container className="pt-12 sm:pt-20">
      <div className="max-w-3xl">
        {eyebrow ? <p className="eyebrow eyebrow-accent">{eyebrow}</p> : null}
        <h1 className="display mt-4 text-[2.5rem] text-ink sm:text-[3.6rem]">{title}</h1>
        {lede ? <p className="mt-5 max-w-2xl text-[1.12rem] leading-relaxed text-ink-3">{lede}</p> : null}
        {children}
      </div>
    </Container>
  );
}

export function Breadcrumbs({ items, compact = false }: { items: { name: string; path: string }[]; compact?: boolean }) {
  return (
    <>
      <nav aria-label="Breadcrumb" className="text-[0.85rem] text-ink-4">
        <ol className="flex flex-wrap items-center gap-1.5">
          {items.map((it, i) => (
            <li key={it.path} className={`items-center gap-1.5 ${compact && i === items.length - 1 ? "hidden sm:flex" : "flex"}`}>
              {i > 0 ? <span aria-hidden>/</span> : null}
              {i < items.length - 1 ? (
                <Link href={it.path} className="hover:text-ink-2">
                  {it.name}
                </Link>
              ) : (
                <span aria-current="page" className="text-ink-3">
                  {it.name}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd data={breadcrumbLd(items)} />
    </>
  );
}

export function FaqList({ faqs }: { faqs: Pick<Faq, "q" | "a">[] }) {
  return (
    <div className="slab divide-y divide-[var(--line)] px-2 sm:px-3">
      {faqs.map((f) => (
        <details key={f.q} className="group px-3 py-1 sm:px-4">
          <summary className="flex min-h-[64px] cursor-pointer list-none items-center justify-between gap-4 py-3 text-left text-[1.04rem] font-semibold text-ink [&::-webkit-details-marker]:hidden">
            {f.q}
            <span
              aria-hidden
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slab-2 text-ink-3 transition-transform duration-200 group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <p className="pb-5 pr-10 text-[0.99rem] leading-relaxed text-ink-3">{f.a}</p>
        </details>
      ))}
    </div>
  );
}

export function BuyButton({ className = "", label, size = "lg" }: { className?: string; label?: string; size?: "sm" | "lg" | "md" }) {
  return (
    <Link href="/checkout" prefetch={false} className={`btn btn-primary ${size === "lg" ? "btn-lg" : size === "sm" ? "btn-sm" : ""} ${className}`}>
      {label ?? `Get the book · ${BOOK.priceLabel}`}
    </Link>
  );
}

/** The delivery promise, shown wherever someone is about to pay. */
export function DeliveryNote({ className = "" }: { className?: string }) {
  return (
    <p className={`flex items-start gap-2 text-[0.85rem] leading-relaxed text-ink-3 ${className}`}>
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden className="mt-[3px] shrink-0 text-accent-text">
        <rect x="1.75" y="3.25" width="12.5" height="9.5" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M2.5 4.5 8 8.75l5.5-4.25" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span>No account needed. After payment, your PDF is emailed to the address you enter at checkout, and it’s ready to download on the next page.</span>
    </p>
  );
}

export function TrustLine({ className = "" }: { className?: string }) {
  return (
    <ul className={`flex flex-wrap gap-x-5 gap-y-2 text-[0.86rem] text-ink-3 ${className}`}>
      {["Instant download + PDF by email", `${BOOK.refundDays}-day refund`, "Secure checkout by Stripe", "Discreet billing"].map((t) => (
        <li key={t} className="flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden className="text-ok">
            <path d="M2.5 7.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {t}
        </li>
      ))}
    </ul>
  );
}

/** `secondary` replaces the "Read Part 1 free" link, e.g. on the sample page itself. */
export function CtaSlab({ title, body, secondary }: { title?: ReactNode; body?: ReactNode; secondary?: { href: string; label: string } }) {
  const alt = secondary ?? { href: "/book/sample", label: "Read Part 1 free" };
  return (
    <div className="slab-ink overflow-hidden px-6 py-12 text-center sm:px-12 sm:py-16">
      <p className="font-sans text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#f0b752]">{BOOK.displayTitle}</p>
      <h2 className="display mx-auto mt-4 max-w-2xl text-[2.1rem] text-[#f3f5f9] sm:text-[3rem]">
        {title ?? (
          <>
            Stop guessing. <em className="!text-[#f0b752]">Start reading the room.</em>
          </>
        )}
      </h2>
      <p className="mx-auto mt-4 max-w-xl text-[1.04rem] leading-relaxed text-[#aeb8c8]">
        {body ??
          `${BOOK.chapters} one-page chapters, a Situation Finder for the night you need it, and a 30-day reset. ${BOOK.priceLabel}, once.`}
      </p>
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <BuyButton />
        <Link href={alt.href} className="btn btn-lg !bg-white/10 !text-[#edf0f6] hover:!bg-white/15">
          {alt.label}
        </Link>
      </div>
      <p className="mt-6 text-[0.82rem] text-[#8f9bb0]">No pickup lines. No mind games. {BOOK.refundDays}-day refund, no questions asked.</p>
    </div>
  );
}

export function PartsAccordion({ openFirst = false }: { openFirst?: boolean }) {
  return (
    <div className="grid gap-3">
      {PARTS.map((p, i) => (
        <details key={p.n} className="slab group px-5 sm:px-7" open={openFirst && i === 0}>
          <summary className="flex min-h-[76px] cursor-pointer list-none items-center gap-4 py-4 [&::-webkit-details-marker]:hidden">
            <span className="condensed w-10 shrink-0 text-[1.9rem] text-ink-4">{String(p.n).padStart(2, "0")}</span>
            <span className="flex-1">
              <span className="block text-[1.08rem] font-semibold text-ink">{p.title}</span>
              <span className="mt-0.5 block text-[0.82rem] text-ink-3">
                {p.layer === "deep" ? "The deep game" : "The field manual"} · {p.chapters.length} chapters
              </span>
            </span>
            <span aria-hidden className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slab-2 text-ink-3 transition-transform duration-200 group-open:rotate-45">
              +
            </span>
          </summary>
          <div className="pb-6 pl-0 sm:pl-14">
            <p className="max-w-2xl text-[0.98rem] leading-relaxed text-ink-3">{p.intro}</p>
            <ol className="mt-4 grid gap-1.5 sm:grid-cols-2">
              {p.chapters.map((c) => (
                <li key={c.id} className="flex gap-3 rounded-xl px-2 py-1.5 text-[0.95rem]">
                  <span className="w-9 shrink-0 font-semibold text-accent-text">{c.id}</span>
                  <span className="text-ink-2">{c.title}</span>
                </li>
              ))}
            </ol>
          </div>
        </details>
      ))}
    </div>
  );
}

export function ThreeRules() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {THREE_RULES.map((r, i) => (
        <div key={r.title} className="slab p-6 sm:p-7">
          <span className="condensed text-[2.2rem] text-accent-text">{String(i + 1).padStart(2, "0")}</span>
          <p className="headline mt-3 text-[1.35rem] text-ink">{r.title}</p>
          <p className="mt-2 text-[0.98rem] leading-relaxed text-ink-3">{r.body}</p>
        </div>
      ))}
    </div>
  );
}
