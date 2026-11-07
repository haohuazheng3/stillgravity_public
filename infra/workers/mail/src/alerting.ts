/**
 * Debounced, state-change-only alerting for a periodic probe. Pure (no I/O), so the mail
 * worker's health probe and the GitHub Actions smoke test share one set of rules:
 *
 * - DOWN after DOWN_AFTER_FAILURES consecutive failed probes (one blip never emails);
 * - silence while it stays down, except one reminder every REMINDER_EVERY_MS;
 * - one RECOVERED on the first passing probe after a DOWN (a streak that never reached DOWN
 *   recovers silently).
 */
export const DOWN_AFTER_FAILURES = 2;
export const REMINDER_EVERY_MS = 24 * 60 * 60 * 1000;

export interface AlertState {
  /** Consecutive failed probes; 0 while healthy. */
  failures: number;
  /** First failure of the current streak (ms since epoch); 0 while healthy. */
  firstFailureAt: number;
  /** A DOWN email went out for the current incident. */
  alerted: boolean;
  /** Last DOWN or reminder email (ms since epoch); 0 while healthy. */
  lastAlertAt: number;
}

export type AlertAction = "none" | "down" | "reminder" | "recovered";

export function healthyState(): AlertState {
  return { failures: 0, firstFailureAt: 0, alerted: false, lastAlertAt: 0 };
}

function num(v: unknown): number {
  return typeof v === "number" && Number.isFinite(v) && v > 0 ? v : 0;
}

/** Reads a stored state; also accepts the old worker's `{ failing, lastAlertAt, since }`. */
export function parseState(raw: unknown): AlertState {
  if (!raw || typeof raw !== "object") return healthyState();
  const o = raw as Record<string, unknown>;
  if (typeof o.failures === "number" || typeof o.alerted === "boolean") {
    const failures = Math.floor(num(o.failures));
    if (failures === 0) return healthyState();
    return { failures, firstFailureAt: num(o.firstFailureAt), alerted: o.alerted === true, lastAlertAt: num(o.lastAlertAt) };
  }
  if (o.failing === true) {
    return { failures: DOWN_AFTER_FAILURES, firstFailureAt: num(o.since), alerted: true, lastAlertAt: num(o.lastAlertAt) };
  }
  return healthyState();
}

export function nextAlert(prev: AlertState, ok: boolean, now: number): { state: AlertState; action: AlertAction } {
  if (ok) return { state: healthyState(), action: prev.alerted ? "recovered" : "none" };
  const failures = prev.failures + 1;
  const firstFailureAt = prev.failures > 0 && prev.firstFailureAt > 0 ? prev.firstFailureAt : now;
  if (!prev.alerted) {
    if (failures >= DOWN_AFTER_FAILURES) return { state: { failures, firstFailureAt, alerted: true, lastAlertAt: now }, action: "down" };
    return { state: { failures, firstFailureAt, alerted: false, lastAlertAt: 0 }, action: "none" };
  }
  if (now - prev.lastAlertAt >= REMINDER_EVERY_MS) return { state: { failures, firstFailureAt, alerted: true, lastAlertAt: now }, action: "reminder" };
  return { state: { ...prev, failures, firstFailureAt }, action: "none" };
}

/** Human duration for alert text: "45 min", "3 h 10 min", "2 d 4 h". */
export function duration(ms: number): string {
  const min = Math.max(0, Math.round(ms / 60000));
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  if (h < 48) return `${h} h${min % 60 ? ` ${min % 60} min` : ""}`;
  return `${Math.floor(h / 24)} d${h % 24 ? ` ${h % 24} h` : ""}`;
}
