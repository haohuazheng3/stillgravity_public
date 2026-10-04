import "server-only";
import { eq, sql } from "drizzle-orm";
import { db } from "./db";
import { users } from "./db/schema";
import { sha256 } from "./ids";

/*
 * Guest checkout: there are no accounts. A buyer is the email they typed on Stripe's
 * checkout page, stored once in `users` under a stable id derived from that email, so
 * ids, file keys and logs never carry the address itself.
 */

export type BuyerRow = typeof users.$inferSelect;

/** Emails compare case-insensitively and without surrounding spaces. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Stable, non-reversible buyer id for an email address. */
export function buyerIdFor(email: string): string {
  return `b_${sha256(normalizeEmail(email)).slice(0, 24)}`;
}

/** The buyer record for an email, created on their first purchase. */
export async function ensureBuyer(email: string): Promise<BuyerRow> {
  const id = buyerIdFor(email);
  await db
    .insert(users)
    .values({ id, email: normalizeEmail(email) })
    .onConflictDoUpdate({ target: users.id, set: { lastSeenAt: sql`now()` } });
  const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
  if (!rows[0]) throw new Error("buyer record was not persisted");
  return rows[0];
}

export async function buyerById(id: string): Promise<BuyerRow | null> {
  const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return rows[0] ?? null;
}
