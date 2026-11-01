"use client";

import { useSyncExternalStore } from "react";

/*
 * Per-viewer conveniences saved in this browser only (a plan's progress, a two-week log).
 * Reads go through useSyncExternalStore so the server render and hydration see "nothing
 * saved", then the client shows what's stored without a hydration mismatch.
 */
const EVENT = "sg:local-change";

function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener(EVENT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(EVENT, cb);
  };
}

export function readLocal(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/** Returns false when the browser refuses storage (private mode, blocked site data). */
export function writeLocal(key: string, value: string | null): boolean {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
    window.dispatchEvent(new Event(EVENT));
    return true;
  } catch (e) {
    console.warn("[local] storage unavailable", e);
    return false;
  }
}

export function useLocal(key: string): string | null {
  return useSyncExternalStore(
    subscribe,
    () => readLocal(key),
    () => null,
  );
}

export function parseJson<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}
