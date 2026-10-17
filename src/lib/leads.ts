import "server-only";
import { and, eq, isNull, lte, sql } from "drizzle-orm";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { db } from "./db";
import { leads } from "./db/schema";
import { readFile, writeFile, fileExists } from "./files";
import { sendEmail } from "./mailer";
import { normalizeEmail } from "./buyers";
import { newToken, sha256 } from "./ids";
import { captureError } from "./errors";
import { env } from "./env";
import { BOOK, SITE } from "./site";
import { ALL_CHAPTERS, PARTS } from "@/content/book";
import { chapterTeaser } from "@/content/book-teasers";

/*
 * Part 1 by email. Someone asks for the free chapters; we send them once, right away
 * (that email is the thing they asked for). Two follow-ups, the chapter for the page they
 * came from and a tour of the rest of the book, go out only if they ticked the box AND a
 * postal address is configured (MAIL_POSTAL_ADDRESS): US commercial email must carry one.
 * Every email has a one-click unsubscribe.
 */

export const SAMPLE_KEY = "samples/wstty-v1-part-1.pdf";
export const SAMPLE_FILENAME = "What-She-Wont-Tell-You-Part-1-free.pdf";
/** Master pages in the free sample: cover, foreword, how to use, contents, Situation Finder, Part 1, back cover. */
export const SAMPLE_PAGES = [1, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 115];
const FOLLOW_UP_DAYS = [2, 3]; // step 2 two days after Part 1, step 3 three days after that

export function leadIdFor(email: string): string {
  return `l_${sha256(normalizeEmail(email))}`;
}

export function postalAddress(): string | null {
  const a = env("MAIL_POSTAL_ADDRESS")?.trim();
  return a ? a : null;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

export function unsubscribeUrl(token: string): string {
  return `${SITE.url}/api/leads/unsubscribe?t=${encodeURIComponent(token)}`;
}

function listHeaders(token: string): Record<string, string> {
  return { "List-Unsubscribe": `<${unsubscribeUrl(token)}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" };
}

/** Builds (once) and returns the free Part 1 PDF from the master file. */
export async function samplePdf(): Promise<Uint8Array> {
  if (await fileExists(SAMPLE_KEY)) return readFile(SAMPLE_KEY);
  const master = await PDFDocument.load(await readFile(BOOK.fileKey), { updateMetadata: false });
  const out = await PDFDocument.create();
  const pages = await out.copyPages(master, SAMPLE_PAGES.map((n) => n - 1));
  const font = await out.embedFont(StandardFonts.Helvetica);
  const line = "Free sample: the full book is at stillgravity.com/book";
  for (const page of pages) {
    out.addPage(page);
    const { width } = page.getSize();
    const w = font.widthOfTextAtSize(line, 6.2);
    page.drawText(line, { x: Math.max(12, (width - w) / 2), y: 7, size: 6.2, font, color: rgb(0.52, 0.56, 0.63), opacity: 0.9 });
  }
  out.setTitle(`${BOOK.title}: Part 1 (free sample)`);
  out.setAuthor(SITE.name);
  const bytes = await out.save();
  await writeFile(SAMPLE_KEY, bytes, "application/pdf");
  return bytes;
}

type Message = { subject: string; text: string; html: string };

function layout(preheader: string, blocks: string[], footer: string[]): string {
  return `<!doctype html><html><body style="margin:0;background:#f2f3f6;padding:24px 12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif">
<div style="display:none;max-height:0;overflow:hidden">${escapeHtml(preheader)}</div>
<div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:20px;padding:32px 28px">
<p style="margin:0 0 20px;font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:#9a6a12">${escapeHtml(SITE.name)}</p>
${blocks.join("\n")}
<hr style="border:none;border-top:1px solid #e3e5ea;margin:24px 0">
${footer.map((f) => `<p style="margin:0 0 6px;font-size:13px;line-height:1.5;color:#5b6272">${f}</p>`).join("\n")}
</div></body></html>`;
}
const P = (s: string) => `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#1f2430">${s}</p>`;
const BTN = (href: string, label: string) =>
  `<p style="margin:24px 0"><a href="${escapeHtml(href)}" style="display:inline-block;background:#e9a93b;color:#16120a;text-decoration:none;font-weight:600;padding:13px 22px;border-radius:999px">${escapeHtml(label)}</a></p>`;
const link = (href: string, label: string) => `<a href="${escapeHtml(href)}" style="color:#9a6a12">${escapeHtml(label)}</a>`;

function utm(path: string, step: number): string {
  return `${SITE.url}${path}${path.includes("?") ? "&" : "?"}utm_source=email&utm_medium=lead&utm_campaign=part1-${step}`;
}

/** The email for a given step, exported for tests. Step 1 is the requested Part 1; 2–3 are opt-in follow-ups. */
export function leadMessage(step: 1 | 2 | 3, ctx: { token: string; chapter?: string | null; postal?: string | null }): Message {
  const unsub = unsubscribeUrl(ctx.token);
  const why = "You’re getting this because you asked for Part 1 at stillgravity.com.";
  const footer = [escapeHtml(why), `${link(unsub, "Unsubscribe")} with one click, anytime.`, ...(ctx.postal ? [escapeHtml(`${SITE.name} · ${ctx.postal}`)] : [])];
  const footerText = [why, `Unsubscribe: ${unsub}`, ...(ctx.postal ? [`${SITE.name} · ${ctx.postal}`] : [])];
  const part1 = PARTS[0]!;

  if (step === 1) {
    const ch = ctx.chapter ? ALL_CHAPTERS.find((c) => c.id === ctx.chapter) : undefined;
    const subject = `Part 1 of ${BOOK.displayTitle}, free`;
    const lines = [
      `Here are the first eight chapters of ${BOOK.displayTitle}, attached as a PDF. It also has the full contents and the Situation Finder, so you can see which page handles whatever you’re facing.`,
      "Part 1 is the foundation the rest of the book stands on:",
      ...part1.chapters.map((c) => `  ${c.id}  ${c.title}`),
      ...(ch ? ["", `The page you came from is handled in Chapter ${ch.id}, “${ch.title}” (page ${ch.page}).`] : []),
      "",
      `Read it online instead: ${SITE.url}/book/sample`,
      `When you want the other 75 chapters: ${utm("/book", 1)} (${BOOK.priceLabel}, ${BOOK.refundDays}-day refund).`,
    ];
    const text = [...lines, "", ...footerText].join("\n");
    const html = layout(
      "Your free chapters are attached.",
      [
        P(`Here are the first eight chapters of <strong>${escapeHtml(BOOK.displayTitle)}</strong>, attached as a PDF. It also has the full contents and the Situation Finder, so you can see which page handles whatever you’re facing.`),
        P("Part 1 is the foundation the rest of the book stands on:"),
        `<ol style="margin:0 0 16px;padding-left:20px;font-size:15px;line-height:1.7;color:#1f2430">${part1.chapters.map((c) => `<li>${escapeHtml(c.title)}</li>`).join("")}</ol>`,
        ...(ch ? [P(`The page you came from is handled in <strong>Chapter ${escapeHtml(ch.id)}, “${escapeHtml(ch.title)}”</strong> (page ${ch.page}).`)] : []),
        BTN(`${SITE.url}/book/sample`, "Read it online"),
        P(`When you want the other 75 chapters: ${link(utm("/book", 1), `the full book, ${BOOK.priceLabel}`)}, with a ${BOOK.refundDays}-day refund.`),
      ],
      footer,
    );
    return { subject, text, html };
  }

  if (step === 2) {
    const ch = ALL_CHAPTERS.find((c) => c.id === (ctx.chapter ?? "4.4")) ?? ALL_CHAPTERS.find((c) => c.id === "4.4")!;
    const teaser = chapterTeaser(ch.id);
    const subject = `How Chapter ${ch.id} starts: ${ch.title}`;
    const text = [
      `You read Part 1. Here’s how the chapter for the page you came from opens:`,
      "",
      `Chapter ${ch.id}: ${ch.title}`,
      ...(teaser ? [`“${teaser}”`] : []),
      "",
      `The rest of page ${ch.page} has the exact words, the weak version beside the good one, and the research behind it.`,
      `The full book: ${utm("/book", 2)} (${BOOK.priceLabel}, ${BOOK.refundDays}-day refund).`,
      `Or find the chapter for a different moment: ${utm("/situations", 2)}`,
      "",
      ...footerText,
    ].join("\n");
    const html = layout(
      `How Chapter ${ch.id} opens.`,
      [
        P("You read Part 1. Here’s how the chapter for the page you came from opens:"),
        `<p style="margin:0 0 8px;font-size:15px;font-weight:600;color:#1f2430">Chapter ${escapeHtml(ch.id)}: ${escapeHtml(ch.title)}</p>`,
        ...(teaser ? [`<blockquote style="margin:0 0 16px;padding-left:14px;border-left:3px solid #e9a93b;font-family:Georgia,serif;font-style:italic;font-size:16px;line-height:1.6;color:#3a4050">${escapeHtml(teaser)}</blockquote>`] : []),
        P(`The rest of page ${ch.page} has the exact words, the weak version beside the good one, and the research behind it.`),
        BTN(utm("/book", 2), `Get the book · ${BOOK.priceLabel}`),
        P(`Facing a different moment? ${link(utm("/situations", 2), "The Situation Finder")} sends you to the right chapter.`),
      ],
      footer,
    );
    return { subject, text, html };
  }

  const subject = "What’s in the other 75 chapters";
  const rest = PARTS.slice(1);
  const text = [
    "Part 1 was the foundation. Here’s what the rest of the book covers, one page per problem:",
    "",
    ...rest.map((p) => `Part ${p.n}: ${p.title}`),
    "",
    "Every chapter fits on one page: what to do tonight, the exact words, the weak version beside the good one, and the research behind it.",
    `The full book: ${utm("/book", 3)} (${BOOK.priceLabel}, once, with a ${BOOK.refundDays}-day refund).`,
    "",
    "This is the last email in this short series.",
    "",
    ...footerText,
  ].join("\n");
  const html = layout(
    "One page per problem, from the first text to the first fight.",
    [
      P("Part 1 was the foundation. Here’s what the rest of the book covers, one page per problem:"),
      `<ul style="margin:0 0 16px;padding-left:20px;font-size:15px;line-height:1.7;color:#1f2430">${rest.map((p) => `<li>Part ${p.n}: ${escapeHtml(p.title)}</li>`).join("")}</ul>`,
      P("Every chapter fits on one page: what to do tonight, the exact words, the weak version beside the good one, and the research behind it."),
      BTN(utm("/book", 3), `Get the book · ${BOOK.priceLabel}`),
      P(`${BOOK.priceLabel}, once, with a ${BOOK.refundDays}-day refund. This is the last email in this short series.`),
    ],
    footer,
  );
  return { subject, text, html };
}

/** When the next follow-up is due after `step` emails, or null if none should be scheduled. */
export function nextSendAfter(step: number, updates: boolean, postal: string | null, now = new Date()): Date | null {
  if (!updates || !postal) return null;
  const days = FOLLOW_UP_DAYS[step - 1];
  if (days == null) return null;
  return new Date(now.getTime() + days * 24 * 3600 * 1000);
}

/** Sign-up: store (or refresh) the lead and send Part 1 now. */
export async function subscribeLead(input: { email: string; source: string | null; chapter: string | null; updates: boolean; ipHash: string | null }): Promise<void> {
  const email = normalizeEmail(input.email);
  const id = leadIdFor(email);
  const chapter = input.chapter && ALL_CHAPTERS.some((c) => c.id === input.chapter) ? input.chapter : null;
  const postal = postalAddress();
  const next = nextSendAfter(1, input.updates, postal);
  const rows = await db
    .insert(leads)
    .values({ id, email, source: input.source, chapter, updates: input.updates ? 1 : 0, step: 1, nextSendAt: next, token: newToken(24), ipHash: input.ipHash })
    .onConflictDoUpdate({
      target: leads.id,
      // Asking again re-opts them in; a fresh opt-in restarts the follow-ups.
      set: {
        source: input.source,
        chapter,
        updates: input.updates ? 1 : sql`${leads.updates}`,
        unsubscribedAt: null,
        step: input.updates ? 1 : sql`${leads.step}`,
        nextSendAt: input.updates ? next : sql`${leads.nextSendAt}`,
      },
    })
    .returning({ token: leads.token });
  const token = rows[0]!.token;
  const pdf = await samplePdf();
  const day = new Date().toISOString().slice(0, 10);
  await sendEmail({
    to: email,
    ...leadMessage(1, { token, chapter, postal }),
    attachments: [{ filename: SAMPLE_FILENAME, content: pdf, contentType: "application/pdf" }],
    headers: listHeaders(token),
    idempotencyKey: `lead:${id}:1:${day}`,
  });
}

/** Cron: send the follow-ups that are due. Each is claimed before sending, so overlapping runs can't double-send. */
export async function sendDueLeadEmails(limit = 50): Promise<{ sent: number; failed: number }> {
  const postal = postalAddress();
  if (!postal) return { sent: 0, failed: 0 };
  const due = await db
    .select()
    .from(leads)
    .where(and(lte(leads.nextSendAt, sql`now()`), isNull(leads.unsubscribedAt), eq(leads.updates, 1)))
    .limit(limit);
  let sent = 0;
  let failed = 0;
  for (const lead of due) {
    const step = (lead.step + 1) as 2 | 3;
    if (step !== 2 && step !== 3) continue;
    const claimed = await db
      .update(leads)
      .set({ step, nextSendAt: nextSendAfter(step, true, postal) })
      .where(and(eq(leads.id, lead.id), eq(leads.step, lead.step), lte(leads.nextSendAt, sql`now()`)))
      .returning({ id: leads.id });
    if (!claimed.length) continue;
    try {
      await sendEmail({
        to: lead.email,
        ...leadMessage(step, { token: lead.token, chapter: lead.chapter, postal }),
        headers: listHeaders(lead.token),
        idempotencyKey: `lead:${lead.id}:${step}`,
      });
      sent++;
    } catch (err) {
      failed++;
      // Put it back so the next run retries.
      await db.update(leads).set({ step: lead.step, nextSendAt: new Date(Date.now() + 3600 * 1000) }).where(eq(leads.id, lead.id));
      await captureError(err, { route: "leads.sendDueLeadEmails", source: "cron", context: { lead: lead.id, step } });
    }
  }
  return { sent, failed };
}

/** One-click unsubscribe. Returns false for an unknown token. */
export async function unsubscribeLead(token: string): Promise<boolean> {
  if (!token || token.length > 128) return false;
  const rows = await db
    .update(leads)
    .set({ unsubscribedAt: sql`coalesce(${leads.unsubscribedAt}, now())`, nextSendAt: null })
    .where(eq(leads.token, token))
    .returning({ id: leads.id });
  return rows.length > 0;
}
