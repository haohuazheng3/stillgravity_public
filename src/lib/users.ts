import "server-only";
import { eq, sql } from "drizzle-orm";
import { clerkClient } from "@clerk/nextjs/server";
import { db } from "./db";
import { users } from "./db/schema";

export type UserRow = typeof users.$inferSelect;

async function primaryEmailOf(userId: string): Promise<string> {
  const client = await clerkClient();
  const u = await client.users.getUser(userId);
  const primary = u.emailAddresses.find((e) => e.id === u.primaryEmailAddressId) ?? u.emailAddresses[0];
  if (!primary) throw new Error(`Clerk user ${userId} has no email address`);
  return primary.emailAddress.toLowerCase();
}

/**
 * Returns the local mirror of a Clerk user, creating it on first contact.
 * Always a fresh read: callers use it right before money or access decisions.
 */
export async function ensureUser(userId: string): Promise<UserRow> {
  const existing = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (existing[0]) {
    const row = existing[0];
    if (Date.now() - new Date(row.lastSeenAt).getTime() > 60 * 60 * 1000) {
      await db.update(users).set({ lastSeenAt: sql`now()` }).where(eq(users.id, userId));
    }
    return row;
  }
  const email = await primaryEmailOf(userId);
  await db.insert(users).values({ id: userId, email }).onConflictDoNothing();
  const created = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!created[0]) throw new Error(`could not create local user ${userId}`);
  return created[0];
}

export async function setStripeCustomer(userId: string, customerId: string): Promise<void> {
  await db.update(users).set({ stripeCustomerId: customerId }).where(eq(users.id, userId));
}
