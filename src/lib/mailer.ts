import "server-only";
import { requireEnv } from "./env";
import { SITE } from "./site";

/*
 * Transactional email to buyers (the book delivery) goes through Resend, sent from
 * stillgravity.com. Owner alerts keep using the mail worker (src/lib/notify.ts).
 */

export interface MailAttachment {
  filename: string;
  content: Uint8Array;
  contentType?: string;
}

export interface MailInput {
  to: string;
  subject: string;
  text: string;
  html: string;
  attachments?: MailAttachment[];
  /** Resend drops a repeat of the same key for 24 hours: a second guard against double sends. */
  idempotencyKey?: string;
}

export async function sendEmail(m: MailInput): Promise<{ id: string }> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${requireEnv("RESEND_API_KEY")}`,
      "Content-Type": "application/json",
      ...(m.idempotencyKey ? { "Idempotency-Key": m.idempotencyKey } : {}),
    },
    body: JSON.stringify({
      from: `${SITE.name} <${SITE.deliveryEmail}>`,
      to: [m.to],
      reply_to: SITE.email,
      subject: m.subject,
      text: m.text,
      html: m.html,
      attachments: m.attachments?.map((a) => ({
        filename: a.filename,
        content: Buffer.from(a.content).toString("base64"),
        ...(a.contentType ? { content_type: a.contentType } : {}),
      })),
    }),
  });
  const body = (await res.json().catch(() => ({}))) as { id?: string; message?: string; name?: string };
  if (!res.ok || !body.id) throw new Error(`Resend ${res.status}: ${body.message ?? body.name ?? "send failed"}`);
  return { id: body.id };
}
