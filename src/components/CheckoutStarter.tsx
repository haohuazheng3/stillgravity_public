"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { track } from "./Consent";

type State = { phase: "starting" } | { phase: "redirecting" } | { phase: "error"; message: string };

export const CHECKOUT_STASH = "sg_checkout_url";
export const CHECKOUT_NONCE = "sg_checkout_nonce";
const STASH = CHECKOUT_STASH;
const NONCE = CHECKOUT_NONCE;
// Sessions expire after 30 minutes, so an attempt (and its idempotency key) is reused for 20 at most.
const ATTEMPT_MS = 20 * 60 * 1000;

function attemptNonce(): string {
  try {
    const kept = sessionStorage.getItem(NONCE);
    if (kept) {
      const { value, at } = JSON.parse(kept) as { value: string; at: number };
      if (Date.now() - at < ATTEMPT_MS) return value;
    }
    const value = crypto.randomUUID();
    sessionStorage.setItem(NONCE, JSON.stringify({ value, at: Date.now() }));
    return value;
  } catch {
    return crypto.randomUUID();
  }
}

function forgetAttempt() {
  try {
    sessionStorage.removeItem(STASH);
    sessionStorage.removeItem(NONCE);
  } catch {
    /* fine */
  }
}

/**
 * Opens Stripe Checkout as soon as the page renders. A ref, a short-lived stash of the
 * session URL and a per-attempt nonce (the server's idempotency key) make it idempotent:
 * refreshes, double mounts and double taps all land on the same Checkout Session.
 */
export function CheckoutStarter() {
  const [state, setState] = useState<State>({ phase: "starting" });
  const started = useRef(false);

  const start = useCallback(async () => {
    setState({ phase: "starting" });
    try {
      const stashed = sessionStorage.getItem(STASH);
      if (stashed) {
        const { url, at } = JSON.parse(stashed) as { url: string; at: number };
        if (Date.now() - at < ATTEMPT_MS && url.startsWith("https://checkout.stripe.com/")) {
          setState({ phase: "redirecting" });
          window.location.assign(url);
          return;
        }
      }
    } catch {
      /* storage unavailable: just create a session */
    }
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nonce: attemptNonce() }),
      });
      const body = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok || !body.url) {
        setState({ phase: "error", message: body.error ?? "We couldn’t open checkout. Please try again." });
        return;
      }
      try {
        sessionStorage.setItem(STASH, JSON.stringify({ url: body.url, at: Date.now() }));
      } catch {
        /* fine */
      }
      track("checkout_start", { item: "book" });
      setState({ phase: "redirecting" });
      window.location.assign(body.url);
    } catch {
      setState({ phase: "error", message: "We couldn’t reach the server. Check your connection and try again." });
    }
  }, []);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void start();
  }, [start]);

  if (state.phase === "error") {
    return (
      <div role="alert">
        <p className="rounded-2xl bg-bad-soft px-4 py-3 text-[0.95rem] text-bad">{state.message}</p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            className="btn btn-primary btn-lg"
            onClick={() => {
              forgetAttempt();
              void start();
            }}
          >
            Try again
          </button>
          <Link href="/contact" className="btn btn-ghost btn-lg">
            Contact us
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div aria-live="polite">
      <div className="flex items-center gap-3 text-[1rem] text-ink-2">
        <span className="spinner inline-block h-5 w-5 rounded-full border-2 border-accent border-r-transparent" style={{ animation: "spin .7s linear infinite" }} />
        Taking you to Stripe’s secure checkout…
      </div>
      <div className="mt-5 space-y-2">
        <div className="skeleton h-3 w-full" />
        <div className="skeleton h-3 w-4/5" />
      </div>
    </div>
  );
}
