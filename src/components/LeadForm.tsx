"use client";

import { useId, useState } from "react";
import { track } from "./Consent";

type State = { status: "idle" } | { status: "sending" } | { status: "sent"; email: string } | { status: "error"; message: string };

/**
 * "Email me Part 1": the free chapters as a PDF, for the reader who isn't ready to buy.
 * Follow-ups are a separate, unticked opt-in; the email itself is what they asked for.
 */
export function LeadForm({ source, chapter, compact = false }: { source: string; chapter?: string; compact?: boolean }) {
  const [state, setState] = useState<State>({ status: "idle" });
  const id = useId();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state.status === "sending") return;
    const form = e.currentTarget;
    const fd = new FormData(form);
    const email = String(fd.get("email") ?? "");
    const payload = { email, source, chapter, updates: fd.get("updates") === "on", website: String(fd.get("website") ?? "") };
    setState({ status: "sending" });
    try {
      const res = await fetch("/api/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setState({ status: "error", message: body.error ?? "Something went wrong. Please try again." });
        return;
      }
      track("lead_signup", { source, updates: payload.updates });
      setState({ status: "sent", email });
    } catch {
      setState({ status: "error", message: "We couldn’t reach the server. Check your connection and try again." });
    }
  }

  if (state.status === "sent") {
    return (
      <div role="status" className="font-sans">
        <p className="text-[1.02rem] font-semibold text-ink">Sent. Check your inbox.</p>
        <p className="mt-1 text-[0.94rem] leading-relaxed text-ink-3">
          Part 1 is on its way to <strong className="break-all text-ink">{state.email}</strong> as a PDF. It usually arrives within a minute; look in promotions or spam too.
        </p>
      </div>
    );
  }

  const sending = state.status === "sending";
  return (
    <form onSubmit={onSubmit} className="font-sans" noValidate={false}>
      <div className={`flex flex-col gap-2 ${compact ? "" : "sm:flex-row"}`}>
        <label htmlFor={`${id}-email`} className="sr-only">
          Your email
        </label>
        <input id={`${id}-email`} name="email" type="email" required autoComplete="email" maxLength={254} className="input flex-1" placeholder="you@example.com" />
        <button type="submit" className="btn btn-primary whitespace-nowrap" disabled={sending}>
          {sending ? "Sending…" : "Email me Part 1"}
        </button>
      </div>
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor={`${id}-website`}>Website</label>
        <input id={`${id}-website`} name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <label className="mt-3 flex cursor-pointer items-start gap-2.5 text-[0.86rem] leading-snug text-ink-3">
        <input type="checkbox" name="updates" className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--accent)]" />
        <span>Also send me two short follow-ups: how the chapter for my situation opens, and what’s in the rest of the book. Unsubscribe anytime.</span>
      </label>
      {state.status === "error" ? (
        <p role="alert" className="mt-2 text-[0.9rem] text-[var(--danger,#d4574e)]">
          {state.message}
        </p>
      ) : null}
      <p className="mt-2 text-[0.78rem] text-ink-4">
        The PDF arrives in one email; follow-ups only if you tick the box. We never sell your email. <a href="/privacy#email" className="underline hover:text-ink-2">Privacy</a>
      </p>
    </form>
  );
}
