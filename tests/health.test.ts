import { beforeEach, describe, expect, it, vi } from "vitest";

// /api/health semantics: 200 whenever the site can serve (database answers, required env
// set). Unresolved errors are reported in the JSON but never make it non-200.
const state = vi.hoisted(() => ({ unresolved: 0, dbDown: false, missing: [] as string[] }));

vi.mock("@/lib/db", () => ({
  db: {
    select: () => ({
      from: () => ({
        where: async () => {
          if (state.dbDown) throw new Error("connect ECONNREFUSED");
          return [{ n: state.unresolved }];
        },
      }),
    }),
  },
}));
vi.mock("@/lib/env", () => ({ missingEnv: () => state.missing, REQUIRED_ENV: ["DATABASE_URL", "CRON_SECRET"], VERCEL_ENV: "test" }));
vi.mock("@/lib/stripe", () => ({ stripeMode: () => "test" }));

const { GET } = await import("@/app/api/health/route");

beforeEach(() => Object.assign(state, { unresolved: 0, dbDown: false, missing: [] }));

describe("/api/health", () => {
  it("is 200 and ok when the database answers and config is complete", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ ok: true, db: { ok: true }, config: { required: 2, missing: [] }, errors: { unresolvedSevere: 0 } });
  });
  it("stays 200 with unresolved severe errors and still reports their count", async () => {
    state.unresolved = 7;
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ ok: true, errors: { unresolvedSevere: 7 } });
  });
  it("is 503 when the database is unreachable", async () => {
    state.dbDown = true;
    const res = await GET();
    expect(res.status).toBe(503);
    expect(await res.json()).toMatchObject({ ok: false, db: { ok: false }, errors: { unresolvedSevere: -1 } });
  });
  it("is 503 when a required variable is missing", async () => {
    state.missing = ["CRON_SECRET"];
    const res = await GET();
    expect(res.status).toBe(503);
    expect(await res.json()).toMatchObject({ ok: false, config: { missing: ["CRON_SECRET"] } });
  });
});
