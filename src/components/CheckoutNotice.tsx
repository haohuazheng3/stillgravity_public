"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

/** Shown on /book when a buyer comes back from Stripe without paying (?checkout=cancelled). */
export function CheckoutNotice() {
  const params = useSearchParams();
  const [dismissed, setDismissed] = useState(false);
  if (dismissed || params.get("checkout") !== "cancelled") return null;
  return (
    <div className="mx-auto max-w-[1120px] px-3 pt-4 sm:px-5">
      <div className="slab flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between" role="status">
        <p className="text-[0.98rem] text-ink-2">
          <strong className="text-ink">Checkout was cancelled.</strong> Nothing was charged. The book is here whenever you’re ready.
        </p>
        <div className="flex gap-2">
          <Link href="/checkout" prefetch={false} className="btn btn-primary btn-sm">
            Try again
          </Link>
          <button type="button" className="btn btn-quiet btn-sm" onClick={() => setDismissed(true)}>
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
