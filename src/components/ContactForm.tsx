"use client";

import { useState } from "react";
import { track } from "./Consent";

const TOPICS = [
  { id: "book", label: "A question about the book" },
  { id: "order", label: "My order, access or a refund" },
  { id: "privacy", label: "A privacy or data request" },
  { id: "idea", label: "A topic you should cover" },
  { id: "press", label: "Press or partnership" },
  { id: "other", label: "Something else" },
];

type State = { status: "idle" } | { status: "sending" } | { status: "sent"; email: string } | { status: "error"; message: string };

export function ContactForm() {
  const [state, setState] = useState<State>({ status: "idle" });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state.status === "sending") return;
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    setState({ status: "sending" }); // instant feedback, before the network
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setState({ status: "error", message: body.error ?? "Something went wrong. Please try again." });
        return;
      }
      track("contact_submit", { topic: data.topic });
      setState({ status: "sent", email: data.email });
      form.reset();
    } catch {
      setState({ status: "error", message: "We couldn’t reach the server. Check your connection and try again." });
    }
  }

  if (state.status === "sent") {
    return (
      <div className="slab animate-rise p-7 sm:p-9" role="status">
        <p className="tag tag-ok">Message received</p>
        <p className="headline mt-4 text-[1.6rem] text-ink">Thanks, we’ve got it.</p>
        <p className="mt-2 text-[1rem] leading-relaxed text-ink-3">
          We’ll reply to <strong className="text-ink">{state.email}</strong> within two business days. If it’s about an order, the
          email you bought with helps us find it fast.
        </p>
        <button type="button" className="btn btn-ghost btn-sm mt-6" onClick={() => setState({ status: "idle" })}>
          Send another message
        </button>
      </div>
    );
  }

  const sending = state.status === "sending";
  return (
    <form onSubmit={onSubmit} className="slab p-6 sm:p-9" noValidate={false}>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="c-name" className="field-label">
            Name <span className="font-normal text-ink-4">(optional)</span>
          </label>
          <input id="c-name" name="name" autoComplete="name" maxLength={120} className="input" placeholder="Alex" />
        </div>
        <div>
          <label htmlFor="c-email" className="field-label">
            Email
          </label>
          <input id="c-email" name="email" type="email" required autoComplete="email" maxLength={254} className="input" placeholder="you@example.com" />
        </div>
      </div>
      <div className="mt-5">
        <label htmlFor="c-topic" className="field-label">
          Topic
        </label>
        <select id="c-topic" name="topic" className="input appearance-none" defaultValue="book">
          {TOPICS.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-5">
        <label htmlFor="c-message" className="field-label">
          Message
        </label>
        <textarea id="c-message" name="message" required minLength={10} maxLength={5000} className="input" placeholder="What’s on your mind?" />
      </div>
      {/* honeypot: real people never see or fill this */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="c-website">Website</label>
        <input id="c-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      {state.status === "error" ? (
        <p role="alert" className="mt-5 rounded-2xl bg-bad-soft px-4 py-3 text-[0.95rem] text-bad">
          {state.message}
        </p>
      ) : null}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[0.85rem] text-ink-4">We reply within two business days. See our privacy policy for how messages are stored.</p>
        <button type="submit" className="btn btn-primary btn-lg shrink-0" aria-disabled={sending} disabled={sending}>
          {sending ? (
            <>
              <span className="spinner" aria-hidden /> Sending…
            </>
          ) : (
            "Send message"
          )}
        </button>
      </div>
    </form>
  );
}
