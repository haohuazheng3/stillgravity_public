import Link from "next/link";

/**
 * The book's cover moment, replayed: a good night, a hopeful question, "Read 11:42 PM",
 * three dots… and nothing. Pure CSS timing (no JS), so it costs nothing to hydrate and
 * collapses to a still frame for reduced-motion visitors.
 */
export function ChatHook({ className = "" }: { className?: string }) {
  return (
    <div className={`slab-ink overflow-hidden p-5 sm:p-7 ${className}`}>
      <div className="flex items-center justify-between font-sans text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[#8f9bb0]">
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#63d3a6]" aria-hidden />
          Friday plans
        </span>
        <span>11:42 PM</span>
      </div>

      <div className="mt-6 flex flex-col gap-2.5 font-sans" role="log" aria-label="A text conversation">
        <p className="bubble bubble-out bubble-enter self-end" style={{ animationDelay: "0.2s" }}>
          had a really good time tonight
        </p>
        <p className="bubble bubble-in bubble-enter self-start" style={{ animationDelay: "1.1s" }}>
          haha yeah
        </p>
        <p className="bubble bubble-out bubble-enter self-end" style={{ animationDelay: "2.1s" }}>
          so… are we still on for friday?
        </p>
        <p className="bubble-enter self-end pr-1 text-[0.72rem] text-[#8f9bb0]" style={{ animationDelay: "2.6s" }}>
          Read 11:42 PM
        </p>
        <div className="bubble-enter self-start" style={{ animationDelay: "3.4s" }}>
          <span className="bubble bubble-in inline-flex items-center gap-1.5 !px-4 !py-3.5">
            <span className="sr-only">She is typing</span>
            <span className="typing-dot" aria-hidden="true" />
            <span className="typing-dot" aria-hidden="true" />
            <span className="typing-dot" aria-hidden="true" />
          </span>
        </div>
      </div>

      <div className="mt-7 border-t border-white/10 pt-5">
        <p className="font-serif text-[1.15rem] leading-snug text-[#edf0f6]" style={{ fontVariationSettings: '"opsz" 30' }}>
          Is she interested, busy, or gone? And what do you send now?
        </p>
        <Link
          href="/situations#left-on-read"
          className="mt-3 inline-flex min-h-[44px] items-center gap-2 text-[0.95rem] font-semibold text-[#f0b752] hover:text-[#f5c76a]"
        >
          The honest answer, from Chapter 4.4 <span aria-hidden>→</span>
        </Link>
      </div>
    </div>
  );
}
