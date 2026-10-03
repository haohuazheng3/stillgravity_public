import Link from "next/link";

/**
 * The mark: a plumb bob at rest. A plumb line finds true vertical by being still and
 * letting gravity work, which is the whole brand in one shape. It holds up in one
 * colour, at 16px, and on a stage screen.
 */
export function LogoMark({ size = 28, className = "", mono = false }: { size?: number; className?: string; mono?: boolean }) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="16" cy="3" r="1.6" fill={mono ? "currentColor" : "var(--ink-3)"} />
      <line x1="16" y1="3.8" x2="16" y2="12.6" stroke={mono ? "currentColor" : "var(--ink-3)"} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M13.6 12.4h4.8l3.3 7.1L16 30.2l-5.7-10.7z" fill={mono ? "currentColor" : "var(--accent)"} />
      <path d="M16 12.4h2.4l3.3 7.1L16 30.2z" fill={mono ? "currentColor" : "#b8761a"} opacity={mono ? 0.55 : 0.55} />
    </svg>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`font-serif font-semibold tracking-[-0.012em] text-ink ${className}`}
      style={{ fontVariationSettings: '"opsz" 30' }}
    >
      Still Gravity
    </span>
  );
}

export function LogoLink({ className = "", size = 26 }: { className?: string; size?: number }) {
  return (
    <Link
      href="/"
      aria-label="Still Gravity, home"
      className={`group inline-flex min-h-[44px] items-center gap-2 rounded-full pr-1 ${className}`}
    >
      <LogoMark size={size} className="transition-transform duration-500 group-hover:translate-y-[1px]" />
      <Wordmark className="text-[1.12rem] leading-none" />
    </Link>
  );
}
