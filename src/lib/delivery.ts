import "server-only";
import { and, eq, gte, isNull, lt, or, sql } from "drizzle-orm";
import { db } from "./db";
import { orders } from "./db/schema";
import { licensedCopyKey } from "./library";
import { readFile } from "./files";
import { sendEmail } from "./mailer";
import { createDownloadToken, downloadPath, DOWNLOAD_LINK_DAYS } from "./download-token";
import { activeEntitlement } from "./entitlements";
import { buyerIdFor, normalizeEmail } from "./buyers";
import { captureError } from "./errors";
import { orderRef } from "./ids";
import { BOOK, SITE } from "./site";

/*
 * After payment the personal (watermarked) PDF is emailed to the checkout address.
 * deliverOrder is safe to call from the success page, the webhook and the reconcile
 * job at the same time: an order is claimed before sending, marked once sent, and
 * Resend's idempotency key drops any duplicate that slips through.
 */

export type DeliveryResult = "sent" | "already-sent" | "busy" | "not-deliverable" | "failed";

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

/** The delivery email, exported for tests. */
export function deliveryMessage({ ref, link }: { ref: string; link: string }): { subject: string; text: string; html: string } {
  const subject = `Your copy of ${BOOK.displayTitle}`;
  const text = [
    `Thanks for buying ${BOOK.displayTitle}.`,
    "",
    `Your personal copy is attached as a PDF (${BOOK.pages} pages). Each page carries a small line with your email and order number, so please keep it to yourself.`,
    "",
    `Can't open the attachment? Download it here (the link works for ${DOWNLOAD_LINK_DAYS} days):`,
    link,
    "",
    "Where to start: the Situation Finder on page 10 sends you to the chapter for whatever you're facing right now. Or read Part 1 tonight; it's eight short chapters.",
    "",
    `Order: ${ref}`,
    `Need the file again later? Get a fresh link at ${SITE.url}/download`,
    `Changed your mind? You have ${BOOK.refundDays} days for a full refund. Just reply to this email.`,
    "",
    SITE.name,
    SITE.url,
  ].join("\n");

  const p = (s: string) => `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#1f2430">${s}</p>`;
  const html = `<!doctype html><html><body style="margin:0;background:#f2f3f6;padding:24px 12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif">
<div style="display:none;max-height:0;overflow:hidden">Your PDF is attached. Order ${escapeHtml(ref)}.</div>
<div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:20px;padding:32px 28px">
<p style="margin:0 0 20px;font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:#9a6a12">${escapeHtml(SITE.name)}</p>
${p(`Thanks for buying <strong>${escapeHtml(BOOK.displayTitle)}</strong>.`)}
${p(`Your personal copy is attached as a PDF (${BOOK.pages} pages). Each page carries a small line with your email and order number, so please keep it to yourself.`)}
<p style="margin:24px 0"><a href="${escapeHtml(link)}" style="display:inline-block;background:#e9a93b;color:#16120a;text-decoration:none;font-weight:600;padding:13px 22px;border-radius:999px">Download the PDF</a></p>
${p(`Can't open the attachment? The button above works for ${DOWNLOAD_LINK_DAYS} days.`)}
${p("Where to start: the Situation Finder on page 10 sends you to the chapter for whatever you're facing right now. Or read Part 1 tonight; it's eight short chapters.")}
<hr style="border:none;border-top:1px solid #e3e5ea;margin:24px 0">
<p style="margin:0 0 6px;font-size:14px;color:#5b6272">Order: ${escapeHtml(ref)}</p>
<p style="margin:0 0 6px;font-size:14px;color:#5b6272">Need the file again later? <a href="${escapeHtml(`${SITE.url}/download`)}" style="color:#9a6a12">Get a fresh link</a>.</p>
<p style="margin:0;font-size:14px;color:#5b6272">Changed your mind? You have ${BOOK.refundDays} days for a full refund. Just reply to this email.</p>
</div></body></html>`;
  return { subject, text, html };
}

async function sendCopy(buyerId: string, email: string, ref: string, idempotencyKey: string): Promise<void> {
  const { key } = await licensedCopyKey(buyerId, email);
  const pdf = await readFile(key);
  const link = `${SITE.url}${downloadPath(createDownloadToken(buyerId), "download")}`;
  await sendEmail({
    to: email,
    ...deliveryMessage({ ref, link }),
    attachments: [{ filename: BOOK.fileName, content: pdf, contentType: "application/pdf" }],
    idempotencyKey,
  });
}

/** Emails the personal copy for a paid order, exactly once. */
export async function deliverOrder(orderId: string): Promise<DeliveryResult> {
  const claimed = await db
    .update(orders)
    .set({ emailClaimedAt: sql`now()`, emailAttempts: sql`${orders.emailAttempts} + 1`, updatedAt: sql`now()` })
    .where(
      and(
        eq(orders.id, orderId),
        eq(orders.status, "paid"),
        isNull(orders.emailSentAt),
        or(isNull(orders.emailClaimedAt), lt(orders.emailClaimedAt, sql`now() - interval '5 minutes'`)),
      ),
    )
    .returning();
  const order = claimed[0];
  if (!order) {
    const row = (await db.select({ sent: orders.emailSentAt, status: orders.status }).from(orders).where(eq(orders.id, orderId)).limit(1))[0];
    if (!row || row.status !== "paid") return "not-deliverable";
    return row.sent ? "already-sent" : "busy";
  }
  if (!order.email) {
    await db.update(orders).set({ emailError: "no email on the order", emailClaimedAt: null }).where(eq(orders.id, order.id));
    return "not-deliverable";
  }

  try {
    await sendCopy(order.userId, order.email, orderRef(order.id), `sg-deliver-${order.id}`);
    await db.update(orders).set({ emailSentAt: sql`now()`, emailError: null, emailClaimedAt: null, updatedAt: sql`now()` }).where(eq(orders.id, order.id));
    return "sent";
  } catch (err) {
    const message = err instanceof Error ? err.message.slice(0, 500) : String(err);
    await db
      .update(orders)
      .set({ emailError: message, emailClaimedAt: null, updatedAt: sql`now()` })
      .where(eq(orders.id, order.id))
      .catch(() => {});
    // The buyer already has the download on the success page; page the owner once retries keep failing.
    await captureError(err, {
      route: "delivery.deliverOrder",
      severity: order.emailAttempts >= 3 ? "error" : "warn",
      context: { orderId: order.id, attempt: order.emailAttempts },
    });
    return "failed";
  }
}

/** "Send it again": a fresh copy for an email that owns the book. Callers rate-limit. */
export async function resendCopy(email: string): Promise<"sent" | "not-owned"> {
  const address = normalizeEmail(email);
  const buyerId = buyerIdFor(address);
  const ent = await activeEntitlement(buyerId);
  if (!ent) return "not-owned";
  const hour = Math.floor(Date.now() / 3_600_000);
  await sendCopy(buyerId, address, orderRef(ent.orderId), `sg-resend-${buyerId}-${hour}`);
  return "sent";
}

/** Paid orders from the last 30 days whose email hasn't gone out yet (the reconcile job retries them). */
export async function deliverPending(limit = 25): Promise<{ sent: string[]; failed: string[] }> {
  const rows = await db
    .select({ id: orders.id })
    .from(orders)
    .where(
      and(
        eq(orders.status, "paid"),
        isNull(orders.emailSentAt),
        lt(orders.emailAttempts, 8),
        gte(orders.createdAt, new Date(Date.now() - 30 * 86400 * 1000)),
      ),
    )
    .limit(limit);
  const out = { sent: [] as string[], failed: [] as string[] };
  for (const r of rows) {
    const result = await deliverOrder(r.id);
    if (result === "sent") out.sent.push(r.id);
    else if (result === "failed") out.failed.push(r.id);
  }
  return out;
}
