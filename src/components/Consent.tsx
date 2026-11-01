"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

declare global {
  interface Window {
    fw?: (...args: unknown[]) => void;
    __sgAnalyticsLoaded?: boolean;
  }
  interface Navigator {
    globalPrivacyControl?: boolean;
  }
}

const FW_KEY = process.env.NEXT_PUBLIC_FLOWGLANCE_KEY;
const COOKIE = "sg_consent";
const OPEN_EVENT = "sg:open-consent";
const CHANGE_EVENT = "sg:consent-change";
export const ANALYTICS_LOADED_EVENT = "sg:analytics-loaded";

type Consent = "all" | "essential";
type Mode = "hidden" | "optin" | "on";

function readConsent(): Consent | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(/(?:^|;\s*)sg_consent=([^;]+)/);
  if (!m) return null;
  return m[1] === "essential" ? "essential" : "all";
}

function writeConsent(v: Consent) {
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${COOKIE}=${v}; Path=/; Max-Age=${60 * 60 * 24 * 180}; SameSite=Lax${secure}`;
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function subscribeConsent(onChange: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => window.removeEventListener(CHANGE_EVENT, onChange);
}

function globalPrivacyControl(): boolean {
  return typeof navigator !== "undefined" && navigator.globalPrivacyControl === true;
}

/** Say no to analytics; reload if FlowGlance is already running on this page, since it can't be stopped. */
function refuse(): void {
  const running = window.__sgAnalyticsLoaded;
  writeConsent("essential");
  if (running) location.reload();
}

/** Inject the FlowGlance snippet once (the only analytics on this site). */
export function loadFlowGlance(): void {
  if (!FW_KEY || typeof document === "undefined" || window.__sgAnalyticsLoaded) return;
  window.__sgAnalyticsLoaded = true;
  const s = document.createElement("script");
  s.defer = true;
  s.src = "https://flowglance.com/fw.js";
  s.setAttribute("data-site", FW_KEY);
  s.onload = () => window.dispatchEvent(new Event(ANALYTICS_LOADED_EVENT));
  document.head.appendChild(s);
}

/** Fire a FlowGlance business event; queued until the snippet is ready, a no-op if analytics are off. */
export function track(name: string, props?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  const send = () => {
    try {
      window.fw?.("event", name, props ?? {});
    } catch (e) {
      console.warn("[analytics] event failed", name, e);
    }
  };
  if (window.fw) return send();
  if (!window.__sgAnalyticsLoaded) return;
  window.addEventListener(ANALYTICS_LOADED_EVENT, send, { once: true });
}

/**
 * Region-aware consent. Visitors in the EU/EEA, UK and Switzerland (or anywhere we can't
 * place) see a banner and FlowGlance loads only after they accept. Everywhere else it loads
 * straight away with no banner, unless the browser sends Global Privacy Control or the
 * visitor has said no ("Do not track me" in the footer). Choices last 180 days.
 */
export function ConsentManager() {
  const [mode, setMode] = useState<Mode>("hidden");

  useEffect(() => {
    const existing = readConsent();
    if (existing === "all") {
      loadFlowGlance();
      return;
    }
    if (existing === "essential") return;
    let cancelled = false;
    fetch("/api/geo", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { consentRequired: true }))
      .catch(() => ({ consentRequired: true }))
      .then((g: { consentRequired?: boolean }) => {
        if (cancelled || readConsent()) return;
        if (g.consentRequired !== false) setMode("optin");
        else if (!globalPrivacyControl()) loadFlowGlance();
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const open = () => setMode(window.__sgAnalyticsLoaded ? "on" : "optin");
    // "Do not track me" answers the banner too.
    const changed = () => {
      if (readConsent()) setMode("hidden");
    };
    window.addEventListener(OPEN_EVENT, open);
    window.addEventListener(CHANGE_EVENT, changed);
    return () => {
      window.removeEventListener(OPEN_EVENT, open);
      window.removeEventListener(CHANGE_EVENT, changed);
    };
  }, []);

  const accept = useCallback(() => {
    writeConsent("all");
    loadFlowGlance();
    setMode("hidden");
  }, []);

  const essentialOnly = useCallback(() => {
    setMode("hidden");
    refuse();
  }, []);

  if (mode === "hidden") return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-50 sm:inset-x-auto sm:bottom-5 sm:right-5 sm:w-[420px]" role="region" aria-label="Cookie choices">
      <div className="slab animate-rise p-5">
        <p className="font-serif text-[1.08rem] font-semibold text-ink">
          {mode === "optin" ? "Can we count your visit?" : "Analytics are on"}
        </p>
        {/* Two short blocks rather than one long one: the banner appears after hydration, and a
            single large text block here became the page's LCP element on mobile tool pages. */}
        <p className="mt-2 text-[0.88rem] leading-relaxed text-ink-3">
          {mode === "optin"
            ? "We’d like to use FlowGlance, our only analytics tool, to see which pages help."
            : "We use FlowGlance, our only analytics tool, to see which pages help."}
        </p>
        <p className="mt-1 text-[0.88rem] leading-relaxed text-ink-3">
          {mode === "optin"
            ? "It records page activity, including text you submit in forms. Essential cookies for sign-in and checkout are always on."
            : "It records page activity, including text you submit in forms. Turn it off and it stays off on every page."}{" "}
          <Link href="/cookie-policy" className="underline underline-offset-4 hover:text-ink">
            Details
          </Link>
        </p>
        <div className="mt-4 flex gap-2">
          <button type="button" className="btn btn-primary btn-sm flex-1" onClick={accept}>
            {mode === "optin" ? "Accept analytics" : "Keep it on"}
          </button>
          <button type="button" className="btn btn-ghost btn-sm flex-1" onClick={essentialOnly}>
            {mode === "optin" ? "Essential only" : "Turn it off"}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Footer opt-out for everyone. FlowGlance has no off switch once it runs, so a page where it
 * already loaded is reloaded; from then on the refusal cookie keeps it from loading at all.
 */
export function DoNotTrackLink() {
  const consent = useSyncExternalStore(subscribeConsent, readConsent, () => null);
  if (consent === "essential") {
    return (
      <span role="status" className="inline-flex min-h-[36px] items-center px-3 text-[0.85rem] text-ink-3">
        Tracking is off
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={refuse}
      className="min-h-[36px] rounded-full px-3 text-[0.85rem] text-ink-3 underline-offset-4 hover:text-ink hover:underline"
    >
      Do not track me
    </button>
  );
}

export function CookieSettingsLink() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}
      className="min-h-[36px] rounded-full px-3 text-[0.85rem] text-ink-3 underline-offset-4 hover:text-ink hover:underline"
    >
      Cookie settings
    </button>
  );
}
