import Link from "next/link";
import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LogoMark } from "@/components/Logo";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <>
      <Header />
      <main id="main" className="px-3 pt-16 sm:px-5 sm:pt-24">
        <div className="slab mx-auto max-w-2xl px-6 py-14 text-center sm:px-12">
          <div className="mx-auto w-fit animate-float">
            <LogoMark size={64} />
          </div>
          <p className="eyebrow mt-6">404 · nothing here</p>
          <h1 className="display mt-4 text-[2.4rem] text-ink sm:text-[3rem]">This page left you on read.</h1>
          <p className="mx-auto mt-4 max-w-md text-[1.02rem] leading-relaxed text-ink-3">
            The link may be old or mistyped. Don’t double text it; try one of these instead.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/" className="btn btn-primary">
              Go home
            </Link>
            <Link href="/situations" className="btn btn-ghost">
              Situation Finder
            </Link>
            <Link href="/book" className="btn btn-quiet">
              The book
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
