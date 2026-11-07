import { describe, expect, it } from "vitest";
import { DOWN_AFTER_FAILURES, REMINDER_EVERY_MS, duration, healthyState, nextAlert, parseState, type AlertAction, type AlertState } from "../infra/workers/mail/src/alerting";

const MIN = 60_000;

/** Feed a sequence of probe results (every 30 minutes) and collect the emails it would send. */
function run(results: boolean[], start: AlertState = healthyState(), every = 30 * MIN): { actions: AlertAction[]; state: AlertState } {
  let state = start;
  const actions: AlertAction[] = [];
  results.forEach((ok, i) => {
    const step = nextAlert(state, ok, 1_000_000_000_000 + i * every);
    state = step.state;
    if (step.action !== "none") actions.push(step.action);
  });
  return { actions, state };
}

describe("health probe alerting", () => {
  it("needs two failed probes in a row before a DOWN email", () => {
    expect(DOWN_AFTER_FAILURES).toBe(2);
    expect(run([false]).actions).toEqual([]);
    expect(run([false, true, false, true]).actions).toEqual([]);
    expect(run([false, false]).actions).toEqual(["down"]);
  });
  it("stays silent while down, reminds once a day, recovers once", () => {
    // 25 hours down (50 probes), then back: DOWN, one reminder, RECOVERED.
    const results = [...Array(50).fill(false), true, true];
    expect(run(results).actions).toEqual(["down", "reminder", "recovered"]);
  });
  it("sends at most one reminder per 24 hours however long it lasts", () => {
    const threeDays = Array(3 * 48).fill(false);
    const { actions } = run(threeDays);
    expect(actions.filter((a) => a === "down")).toHaveLength(1);
    expect(actions.filter((a) => a === "reminder").length).toBeLessThanOrEqual(3);
  });
  it("tracks the first failure of the streak for the recovery message", () => {
    const { state } = run([false, false, false]);
    expect(state).toMatchObject({ failures: 3, alerted: true, firstFailureAt: 1_000_000_000_000 });
    expect(REMINDER_EVERY_MS).toBe(24 * 60 * MIN);
  });
  it("reads the old worker's state and junk safely", () => {
    expect(parseState(null)).toEqual(healthyState());
    expect(parseState("nope")).toEqual(healthyState());
    expect(parseState({ failing: false, lastAlertAt: 0, since: 0 })).toEqual(healthyState());
    const old = parseState({ failing: true, lastAlertAt: 5, since: 3 });
    expect(old).toEqual({ failures: DOWN_AFTER_FAILURES, firstFailureAt: 3, alerted: true, lastAlertAt: 5 });
    expect(nextAlert(old, true, 10).action).toBe("recovered");
  });
  it("formats durations", () => {
    expect(duration(45 * MIN)).toBe("45 min");
    expect(duration(190 * MIN)).toBe("3 h 10 min");
    expect(duration(52 * 60 * MIN)).toBe("2 d 4 h");
  });
});
