"use client";

import { useState } from "react";
import { track } from "./Consent";

type State = { status: "idle" } | { status: "sending" } | { status: "sent"; email: string } | { status: "error"; message: string };

/** "Send my copy again": the only thing a buyer can do without an account, and all they need. */
export function ResendForm() {
  const [state, setState] = useState<State>({ status: "idle" });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state.status === "sending") return;
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    setState({ status: "sending" }); // instant feedback, before the network
    try {
      const res = await fetch("/api/resend-copy", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setState({ status: "error", message: body.error ?? "Something went wrong. Please try again." });
        return;
      }
      track("copy_resend", {});
      setState({ status: "sent", email: data.email });
    } catch {
      setState({ status: "error", message: "We couldn’t reach the server. Check your connection and try again." });
    }
  }

  if (state.status === "sent") {
    return (
      <div className="slab animate-rise p-7 sm:p-9" role="status">
        <p className="tag tag-ok">On its way</p>
        <p className="headline mt-4 text-[1.6rem] text-ink">Check your inbox.</p>
        <p className="mt-2 text-[1rem] leading-relaxed text-ink-3">
          If <strong className="break-all text-ink">{state.email}</strong> bought the book, a fresh copy with a new download link is on its
          way. It usually arrives within a minute; look in spam or promotions too.
        </p>
        <button type="button" className="btn btn-ghost btn-sm mt-6" onClick={() => setState({ status: "idle" })}>
          Use a different email
        </button>
      </div>
    );
  }

  const sending = state.status === "sending";
  return (
    <form onSubmit={onSubmit} className="slab p-6 sm:p-9">
      <label htmlFor="r-email" className="field-label">
        The email you used at checkout
      </label>
      <input id="r-email" name="email" type="email" required autoComplete="email" maxLength={254} className="input" placeholder="you@example.com" />
      {/* honeypot: real people never see or fill this */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="r-website">Website</label>
        <input id="r-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      {state.status === "error" ? (
        <p role="alert" className="mt-5 rounded-2xl bg-bad-soft px-4 py-3 text-[0.95rem] text-bad">
          {state.message}
        </p>
      ) : null}
      <button type="submit" className="btn btn-primary btn-lg btn-block mt-5" aria-disabled={sending} disabled={sending}>
        {sending ? (
          <>
            <span className="spinner" aria-hidden /> Sending…
          </>
        ) : (
          "Send my copy again"
        )}
      </button>
    </form>
  );
}
