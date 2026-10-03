"use client";

import Link from "next/link";
import { useEffect } from "react";
import { reportClientError } from "@/instrumentation-client";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    reportClientError(error, "error-boundary");
  }, [error]);

  return (
    <main id="main" className="px-3 pt-24 sm:px-5">
      <div className="slab mx-auto max-w-xl px-6 py-12 text-center sm:px-10">
        <p className="eyebrow">Something broke</p>
        <h1 className="display mt-4 text-[2.2rem] text-ink">That one’s on us.</h1>
        <p className="mx-auto mt-4 max-w-sm text-[1rem] leading-relaxed text-ink-3">
          The error has been logged and we’ll look at it. Try again, or head back home.
          {error.digest ? <span className="mt-2 block text-[0.8rem] text-ink-4">Reference: {error.digest}</span> : null}
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <button type="button" className="btn btn-primary" onClick={() => reset()}>
            Try again
          </button>
          <Link href="/" className="btn btn-ghost">
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
