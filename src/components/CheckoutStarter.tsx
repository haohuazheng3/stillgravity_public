"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { track } from "./Consent";

type State = { phase: "starting" } | { phase: "redirecting" } | { phase: "owned" } | { phase: "error"; message: string };

const STASH = "sg_checkout_url";

/**
 * Opens Stripe Checkout as soon as the page renders. A ref plus a short-lived stash
 * of the session URL make it idempotent: refreshes, double mounts and double taps
 * all land on the same Checkout Session (the server also reuses open sessions).
 */
export function CheckoutStarter() {
  const [state, setState] = useState<State>({ phase: "starting" });
  const started = useRef(false);
  const router = useRouter();

  const start = useCallback(async () => {
    setState({ phase: "starting" });
    try {
      const stashed = sessionStorage.getItem(STASH);
      if (stashed) {
        const { url, at } = JSON.parse(stashed) as { url: string; at: number };
        if (Date.now() - at < 20 * 60 * 1000 && url.startsWith("https://checkout.stripe.com/")) {
          setState({ phase: "redirecting" });
          window.location.assign(url);
          return;
        }
      }
    } catch {
      /* storage unavailable: just create a session */
    }
    try {
      const res = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
      const body = (await res.json().catch(() => ({}))) as { url?: string; owned?: boolean; error?: string };
      if (res.status === 401) {
        router.replace("/sign-in?redirect_url=%2Fcheckout");
        return;
      }
      if (body.owned) {
        setState({ phase: "owned" });
        router.replace("/account?owned=1");
        return;
      }
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
  }, [router]);

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
              try {
                sessionStorage.removeItem(STASH);
              } catch {
                /* fine */
              }
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
        {state.phase === "owned" ? "You already own it, opening your library…" : "Taking you to Stripe’s secure checkout…"}
      </div>
      <div className="mt-5 space-y-2">
        <div className="skeleton h-3 w-full" />
        <div className="skeleton h-3 w-4/5" />
      </div>
    </div>
  );
}
