import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "./db";
import { licensedCopies, orders } from "./db/schema";
import { readFile, writeFile, fileExists } from "./files";
import { maskEmail, stampCopy } from "./watermark";
import { activeEntitlement } from "./entitlements";
import { BOOK, PRODUCT_ID } from "./site";
import { orderRef } from "./ids";
import { captureError } from "./errors";

/**
 * Returns the R2 key of the buyer's personal copy, creating it on first use.
 * If personalisation fails for any reason the buyer still gets the master file:
 * the failure goes to the error inbox, never to the reader.
 */
export async function licensedCopyKey(userId: string, email: string): Promise<{ key: string; personalised: boolean }> {
  const existing = await db
    .select()
    .from(licensedCopies)
    .where(and(eq(licensedCopies.userId, userId), eq(licensedCopies.product, PRODUCT_ID)))
    .limit(1);
  if (existing[0]) return { key: existing[0].objectKey, personalised: true };

  const key = `licensed/${userId}/${BOOK.sku}.pdf`;
  try {
    const ent = await activeEntitlement(userId);
    let ref = "";
    if (ent) {
      const o = await db.select({ id: orders.id }).from(orders).where(eq(orders.id, ent.orderId)).limit(1);
      if (o[0]) ref = orderRef(o[0].id);
    }
    if (!(await fileExists(key))) {
      const master = await readFile(BOOK.fileKey);
      const line = `Personal copy for ${maskEmail(email)}${ref ? ` | Order ${ref}` : ""} | stillgravity.com | Please don't share this file.`;
      const stamped = await stampCopy(master, line, { subject: `${BOOK.title} - personal copy ${ref}`.trim() });
      await writeFile(key, stamped, "application/pdf");
      await db
        .insert(licensedCopies)
        .values({ userId, product: PRODUCT_ID, objectKey: key, bytes: stamped.byteLength })
        .onConflictDoNothing();
    } else {
      await db.insert(licensedCopies).values({ userId, product: PRODUCT_ID, objectKey: key }).onConflictDoNothing();
    }
    return { key, personalised: true };
  } catch (err) {
    await captureError(err, { route: "library.licensedCopyKey", source: "server", context: { userId } });
    return { key: BOOK.fileKey, personalised: false };
  }
}
