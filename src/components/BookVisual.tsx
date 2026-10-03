import Image from "next/image";
import { BOOK } from "@/lib/site";

/** The real first-edition cover, floating in the void with a soft spine and shadow. */
export function BookVisual({ priority = false, className = "", sizes = "(max-width: 768px) 70vw, 380px" }: { priority?: boolean; className?: string; sizes?: string }) {
  return (
    <div className={`relative ${className}`}>
      <div
        aria-hidden
        className="absolute inset-x-[8%] bottom-[-6%] h-[14%] rounded-[50%] bg-black/55 blur-2xl"
      />
      <div className="animate-float relative" style={{ animationDuration: "10s" }}>
        <div className="relative overflow-hidden rounded-[10px] shadow-[0_50px_90px_-30px_rgba(3,6,14,0.85),0_18px_36px_-18px_rgba(3,6,14,0.7)] ring-1 ring-white/10">
          <Image
            src="/book/cover.webp"
            alt={`${BOOK.title}: ${BOOK.subtitle}. Book cover.`}
            width={1200}
            height={1800}
            priority={priority}
            sizes={sizes}
            className="block h-auto w-full"
          />
          {/* spine highlight */}
          <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-[5%] bg-gradient-to-r from-white/12 via-white/5 to-transparent" />
          <span aria-hidden className="pointer-events-none absolute inset-y-0 left-[5%] w-px bg-black/30" />
        </div>
      </div>
    </div>
  );
}

const PAGES = [
  { n: 4, title: "Nobody hands you the manual", note: "The opening page" },
  { n: 10, title: "The Situation Finder", note: "36 thoughts, mapped to the page" },
  { n: 41, title: "She left you on read", note: "Chapter 4.4" },
  { n: 74, title: "The counterfeit table", note: "Chapter 8.6" },
];

export function LookInside() {
  return (
    <div className="-mx-3 overflow-x-auto px-3 pb-4 [scrollbar-width:none] sm:-mx-5 sm:px-5">
      <ul className="flex w-max gap-4 sm:gap-6">
        {PAGES.map((p) => (
          <li key={p.n} className="w-[240px] sm:w-[280px]">
            <figure className="slab slab-hover overflow-hidden p-3">
              <div className="overflow-hidden rounded-[14px] bg-white ring-1 ring-black/5">
                <Image
                  src={`/book/page-${p.n}.webp`}
                  alt={`Page ${p.n} of ${BOOK.title}: ${p.title}`}
                  width={900}
                  height={1350}
                  sizes="280px"
                  loading="lazy"
                  className="block h-auto w-full"
                />
              </div>
              <figcaption className="px-1 pb-1 pt-3">
                <p className="text-[0.95rem] font-semibold text-ink">{p.title}</p>
                <p className="text-[0.82rem] text-ink-3">
                  {p.note} · page {p.n}
                </p>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </div>
  );
}
