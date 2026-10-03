"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LogoLink } from "./Logo";
import { BOOK } from "@/lib/site";

const NAV = [
  { href: "/book", label: "The book" },
  { href: "/situations", label: "Situations" },
  { href: "/book/sample", label: "Free chapters" },
  { href: "/blog", label: "Guides" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  // close the mobile sheet on navigation (state adjusted during render, no effect needed)
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const isActive = (href: string) => (href === "/book" ? pathname === "/book" : pathname === href || pathname.startsWith(`${href}/`));

  return (
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-5 sm:pt-4">
      <div className="pill mx-auto flex h-[60px] max-w-[1120px] items-center justify-between gap-2 pl-4 pr-2 sm:pl-5">
        <LogoLink />
        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              aria-current={isActive(n.href) ? "page" : undefined}
              className={`rounded-full px-3.5 py-2 text-[0.95rem] font-medium transition-colors ${
                isActive(n.href) ? "bg-slab-2 text-ink" : "text-ink-3 hover:text-ink"
              }`}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1.5">
          <Link
            href="/account"
            className="hidden rounded-full px-3.5 py-2 text-[0.95rem] font-medium text-ink-3 transition-colors hover:text-ink sm:inline-flex"
          >
            Library
          </Link>
          <Link href="/checkout" prefetch={false} className="btn btn-primary btn-sm">
            Get the book
            <span className="hidden font-normal opacity-70 sm:inline">· {BOOK.priceLabel}</span>
          </Link>
          <button
            type="button"
            className="btn btn-quiet btn-sm !px-3 md:hidden"
            aria-label="Open menu"
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M3 6h14M3 10h14M3 14h9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      <dialog
        ref={dialogRef}
        onClose={() => setOpen(false)}
        onClick={(e) => {
          if (e.target === dialogRef.current) setOpen(false);
        }}
        className="m-0 mt-3 w-[calc(100%-24px)] max-w-none translate-x-3 bg-transparent p-0 backdrop:bg-[rgba(3,5,10,0.55)] backdrop:backdrop-blur-sm"
      >
        <div className="slab animate-rise p-3">
          <div className="flex items-center justify-between px-2 pb-2">
            <span className="eyebrow">Menu</span>
            <button type="button" className="btn btn-quiet btn-sm !px-3" aria-label="Close menu" onClick={() => setOpen(false)}>
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <nav aria-label="Mobile" className="flex flex-col">
            {[{ href: "/", label: "Home" }, ...NAV, { href: "/account", label: "Your library" }, { href: "/faq", label: "FAQ" }].map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className={`flex min-h-[52px] items-center justify-between rounded-2xl px-4 text-[1.08rem] font-medium active:bg-slab-3 ${
                  pathname === n.href ? "bg-slab-2 text-ink" : "text-ink-2"
                }`}
              >
                {n.label}
                <span aria-hidden className="text-ink-4">→</span>
              </Link>
            ))}
          </nav>
          <Link href="/checkout" prefetch={false} onClick={() => setOpen(false)} className="btn btn-primary btn-lg btn-block mt-3">
            Get the book · {BOOK.priceLabel}
          </Link>
        </div>
      </dialog>
    </header>
  );
}
