import Link from "next/link";
import { LogoMark, Wordmark } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { CookieSettingsLink } from "./Consent";
import { SITE } from "@/lib/site";

const COLS = [
  {
    title: "The book",
    links: [
      { href: "/book", label: "What She Won’t Tell You" },
      { href: "/book/sample", label: "Read Part 1 free" },
      { href: "/situations", label: "Situation Finder" },
      { href: "/pricing", label: "Pricing" },
    ],
  },
  {
    title: "Guides",
    links: [
      { href: "/blog", label: "All guides" },
      { href: "/blog/texting", label: "Texting" },
      { href: "/blog/signals", label: "Reading her signals" },
      { href: "/blog/self-improvement", label: "Becoming the man" },
    ],
  },
  {
    title: "Still Gravity",
    links: [
      { href: "/about", label: "About" },
      { href: "/how-it-works", label: "How it works" },
      { href: "/faq", label: "FAQ" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy policy" },
      { href: "/terms", label: "Terms of service" },
      { href: "/refund-policy", label: "Refund policy" },
      { href: "/cookie-policy", label: "Cookie policy" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="px-3 pb-6 pt-16 sm:px-5 sm:pt-24">
      <div className="slab mx-auto max-w-[1120px] px-6 py-10 sm:px-10 sm:py-12">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5" aria-label="Still Gravity, home">
              <LogoMark size={30} />
              <Wordmark className="text-[1.25rem]" />
            </Link>
            <p className="mt-4 max-w-sm text-[0.96rem] leading-relaxed text-ink-3">
              Honest, research-backed guidance for men on attraction, dating and relationships, and on becoming a man whose life
              is attractive on its own.
            </p>
            <p className="mt-5 text-[0.95rem] text-ink-2">
              <a href={`mailto:${SITE.email}`} className="underline decoration-line-2 underline-offset-4 hover:text-ink">
                {SITE.email}
              </a>
            </p>
            <p className="mt-1 text-[0.85rem] text-ink-4">{SITE.replyTime}</p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {COLS.map((c) => (
              <div key={c.title}>
                <p className="eyebrow">{c.title}</p>
                <ul className="mt-3 space-y-1">
                  {c.links.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className="inline-flex min-h-[36px] items-center text-[0.94rem] text-ink-2 transition-colors hover:text-ink"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <hr className="hairline my-8" />
        <div className="flex flex-col-reverse gap-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[0.85rem] text-ink-4">
            © {SITE.foundingYear} {SITE.name}. Not professional advice; see our{" "}
            <Link href="/terms" className="underline underline-offset-4 hover:text-ink-2">
              terms
            </Link>
            .
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <CookieSettingsLink />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}
