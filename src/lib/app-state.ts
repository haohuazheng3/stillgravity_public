import "server-only";
import { eq, sql } from "drizzle-orm";
import { db } from "./db";
import { appState } from "./db/schema";

/** Small key/value store for job cursors and last-run reports (`app_state`). */
export async function getState<T>(key: string): Promise<T | null> {
  const rows = await db.select({ value: appState.value }).from(appState).where(eq(appState.key, key)).limit(1);
  return (rows[0]?.value as T | undefined) ?? null;
}

export async function setState(key: string, value: unknown): Promise<void> {
  await db
    .insert(appState)
    .values({ key, value })
    .onConflictDoUpdate({ target: appState.key, set: { value, updatedAt: sql`now()` } });
}
