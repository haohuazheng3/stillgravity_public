/**
 * Still Gravity mail worker.
 *
 * email()     Cloudflare Email Routing hands over mail for test@stillgravity.com and every
 *             unrouted address. We parse it and POST it to the app's test inbox, keeping the
 *             receiving server's SPF / DKIM / DMARC verdicts. Never rejects: a broken app must
 *             not bounce mail back to a sender.
 * fetch()     POST /notify (Bearer NOTIFY_TOKEN) emails the owner through the send_email
 *             binding. POST /probe (same token; `?dry=1` sends and stores nothing) runs the
 *             health probe now. GET /health answers 200.
 * scheduled() Every 30 minutes: probe https://stillgravity.com/api/health (200 = the site can
 *             serve; open errors in the inbox don't count). Emails only on state changes
 *             (rules in alerting.ts): DOWN after 2 failed probes in a row, one reminder a day
 *             while it stays down, one RECOVERED when it passes again. State lives in the
 *             STATE KV namespace (the Cache API is per data center, so cron runs landing in
 *             different places lost it and re-alerted).
 */
import PostalMime from "postal-mime";
import { EmailMessage } from "cloudflare:email";
import { duration, nextAlert, parseState, type AlertAction, type AlertState } from "./alerting";

export interface Env {
  APP_URL: string;
  OWNER_EMAIL: string;
  INBOX_INGEST_SECRET: string;
  NOTIFY_TOKEN: string;
  OWNER_MAIL: { send(message: EmailMessage): Promise<void> };
  /** Probe alert state. Provisioned by `wrangler deploy` from wrangler.toml; Cache API fallback if unbound. */
  STATE?: KVNamespace;
}

interface IncomingEmail {
  readonly from: string;
  readonly to: string;
  readonly headers: Headers;
  readonly raw: ReadableStream<Uint8Array>;
  readonly rawSize: number;
}

const FROM_ADDRESS = "alerts@stillgravity.com";
const FROM_DISPLAY = "Still Gravity Alerts";
const MAX_BODY_CHARS = 200_000;
const STATE_KEY = "health-probe";
const STATE_URL = "https://stillgravity-mail.internal/health-state";

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
}

function bearerMatches(req: Request, secret: string | undefined): boolean {
  if (!secret) return false;
  const header = req.headers.get("authorization") ?? "";
  const presented = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!presented) return false;
  const a = new TextEncoder().encode(presented);
  const b = new TextEncoder().encode(secret);
  if (a.byteLength !== b.byteLength) return false;
  let diff = 0;
  for (let i = 0; i < a.byteLength; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

function truncate(s: string | undefined | null, max: number): string | undefined {
  if (!s) return undefined;
  return s.length > max ? `${s.slice(0, max)}\n[truncated]` : s;
}

/* ---------- outbound: a plain-text RFC 5322 message, built by hand ---------- */

function base64Utf8(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

function wrap76(s: string): string {
  const out: string[] = [];
  for (let i = 0; i < s.length; i += 76) out.push(s.slice(i, i + 76));
  return out.join("\r\n");
}

function headerWord(s: string): string {
  return /^[\x20-\x7e]*$/.test(s) ? s : `=?utf-8?B?${base64Utf8(s)}?=`;
}

function buildMime(to: string, subject: string, text: string, replyTo?: string): string {
  const headers = [
    `From: ${FROM_DISPLAY} <${FROM_ADDRESS}>`,
    `To: <${to}>`,
    ...(replyTo && /^[^\s<>@]+@[^\s<>@]+$/.test(replyTo) ? [`Reply-To: <${replyTo}>`] : []),
    `Subject: ${headerWord(subject.replace(/[\r\n]+/g, " ").slice(0, 900))}`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${crypto.randomUUID()}@stillgravity.com>`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=utf-8",
    "Content-Transfer-Encoding: base64",
    "X-Mailer: stillgravity-mail",
  ];
  return `${headers.join("\r\n")}\r\n\r\n${wrap76(base64Utf8(text))}\r\n`;
}

async function sendToOwner(env: Env, subject: string, text: string, replyTo?: string): Promise<void> {
  await env.OWNER_MAIL.send(new EmailMessage(FROM_ADDRESS, env.OWNER_EMAIL, buildMime(env.OWNER_EMAIL, subject, text, replyTo)));
}

/* ---------- inbound ---------- */

function verdict(auth: string, mech: "spf" | "dkim" | "dmarc"): string | undefined {
  const m = new RegExp(`\\b${mech}=([a-z]+)`, "i").exec(auth);
  return m ? m[1].toLowerCase() : undefined;
}

async function ingest(message: IncomingEmail, env: Env): Promise<void> {
  const parsed = await PostalMime.parse(message.raw);
  const headers: Record<string, string> = {};
  for (const h of parsed.headers) {
    const key = h.key.toLowerCase();
    if (!["authentication-results", "arc-authentication-results", "received-spf", "dkim-signature", "from", "to", "subject", "date", "message-id", "return-path"].includes(key)) continue;
    headers[key] = key in headers ? `${headers[key]}\n${h.value}` : h.value;
  }
  for (const key of ["authentication-results", "arc-authentication-results", "received-spf"]) {
    const v = message.headers.get(key);
    if (v && !headers[key]) headers[key] = v;
  }
  const auth = [headers["authentication-results"], headers["arc-authentication-results"]].filter(Boolean).join("\n");

  const res = await fetch(`${env.APP_URL.replace(/\/$/, "")}/api/inbox/ingest`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${env.INBOX_INGEST_SECRET}`, "user-agent": "stillgravity-mail/1.0" },
    body: JSON.stringify({
      to: message.to,
      from: message.from,
      subject: parsed.subject?.slice(0, 998),
      text: truncate(parsed.text, MAX_BODY_CHARS),
      html: truncate(parsed.html, MAX_BODY_CHARS),
      spf: verdict(auth, "spf"),
      dkim: verdict(auth, "dkim"),
      dmarc: verdict(auth, "dmarc"),
      authResults: auth.slice(0, 4000) || undefined,
      headers,
      rawSize: message.rawSize,
    }),
  });
  if (!res.ok) throw new Error(`ingest responded ${res.status}: ${(await res.text().catch(() => "")).slice(0, 300)}`);
}

/* ---------- health probe ---------- */

/** null = the store could not be read; the run is skipped rather than risk a duplicate alert. */
async function readState(env: Env): Promise<AlertState | null> {
  try {
    if (env.STATE) return parseState(await env.STATE.get(STATE_KEY, "json"));
    const hit = await caches.default.match(STATE_URL);
    return parseState(hit ? await hit.json() : null);
  } catch (e) {
    console.error("[stillgravity-mail] probe state unreadable", e instanceof Error ? e.message : String(e));
    return null;
  }
}

async function writeState(env: Env, s: AlertState): Promise<void> {
  if (env.STATE) await env.STATE.put(STATE_KEY, JSON.stringify(s));
  else await caches.default.put(STATE_URL, new Response(JSON.stringify(s), { headers: { "cache-control": "max-age=604800" } }));
}

function alertMail(action: AlertAction, prev: AlertState, next: AlertState, now: number, site: string, url: string, detail: string): { subject: string; text: string } | null {
  const inbox = `https://${site}/admin/errors`;
  const rules = "You get one reminder a day while it stays down and one email when it recovers.";
  if (action === "down") {
    return {
      subject: `ALERT: ${site} health check failing`,
      text: `The health check at ${url} failed ${next.failures} probes in a row (first failure ${new Date(next.firstFailureAt).toISOString()}).\n\n${detail}\n\n${rules}\n\nError inbox: ${inbox}`,
    };
  }
  if (action === "reminder") {
    return {
      subject: `STILL DOWN: ${site} health check failing for ${duration(now - next.firstFailureAt)}`,
      text: `The health check at ${url} has been failing since ${new Date(next.firstFailureAt).toISOString()} (${next.failures} probes in a row).\n\n${detail}\n\n${rules}\n\nError inbox: ${inbox}`,
    };
  }
  if (action === "recovered") {
    return {
      subject: `Recovered: ${site} health check passing`,
      text: `${prev.firstFailureAt ? `Health is green again after ${duration(now - prev.firstFailureAt)} (first failed probe ${new Date(prev.firstFailureAt).toISOString()}).` : "Health is green again."}\n\n${detail}`,
    };
  }
  return null;
}

async function probe(env: Env, dry = false): Promise<{ ok: boolean; action: AlertAction; sent: boolean; state: AlertState } | null> {
  const base = env.APP_URL.replace(/\/$/, "");
  const url = `${base}/api/health`;
  let ok = false;
  let detail = "";
  try {
    const res = await fetch(`${url}?probe=${Date.now()}`, { headers: { "user-agent": "stillgravity-health-probe/1.0" }, signal: AbortSignal.timeout(20000) });
    const body = await res.text();
    ok = res.status === 200;
    detail = `HTTP ${res.status}\n${body.slice(0, 1500)}`;
  } catch (e) {
    detail = `request failed: ${e instanceof Error ? e.message : String(e)}`;
  }
  const prev = await readState(env);
  if (!prev) return null;
  const now = Date.now();
  const { state, action } = nextAlert(prev, ok, now);
  if (dry) return { ok, action, sent: false, state };
  const mail = alertMail(action, prev, state, now, new URL(base).host, url, detail);
  if (mail) {
    try {
      await sendToOwner(env, mail.subject, mail.text);
    } catch (e) {
      // Keep the old state so the next probe tries this email again.
      console.error("[stillgravity-mail] alert email failed", action, e instanceof Error ? e.message : String(e));
      return { ok, action, sent: false, state: prev };
    }
  }
  if (JSON.stringify(state) !== JSON.stringify(prev)) await writeState(env, state);
  return { ok, action, sent: Boolean(mail), state };
}

export default {
  async email(message: IncomingEmail, env: Env): Promise<void> {
    try {
      await ingest(message, env);
    } catch (e) {
      console.error("[stillgravity-mail] ingest failed", { to: message.to, from: message.from, error: e instanceof Error ? e.message : String(e) });
    }
  },

  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    if (req.method === "GET" && url.pathname === "/health") return json({ ok: true, service: "stillgravity-mail", at: new Date().toISOString() });
    if (url.pathname === "/notify") {
      if (req.method !== "POST") return json({ error: "method not allowed" }, 405);
      if (!bearerMatches(req, env.NOTIFY_TOKEN)) return json({ error: "unauthorized" }, 401);
      type NotifyBody = { subject?: unknown; text?: unknown; replyTo?: unknown } | null;
      let b: NotifyBody;
      try {
        b = (await req.json()) as NotifyBody;
      } catch {
        return json({ error: "body must be JSON" }, 400);
      }
      const subject = typeof b?.subject === "string" ? b.subject.trim() : "";
      const text = typeof b?.text === "string" ? b.text : "";
      const replyTo = typeof b?.replyTo === "string" ? b.replyTo : undefined;
      if (!subject || !text) return json({ error: "subject and text are required" }, 400);
      if (text.length > MAX_BODY_CHARS) return json({ error: "text too long" }, 413);
      try {
        await sendToOwner(env, subject, text, replyTo);
        return json({ ok: true });
      } catch (e) {
        console.error("[stillgravity-mail] notify failed", e instanceof Error ? e.message : String(e));
        return json({ error: "send failed" }, 500);
      }
    }
    if (url.pathname === "/probe" && req.method === "POST") {
      if (!bearerMatches(req, env.NOTIFY_TOKEN)) return json({ error: "unauthorized" }, 401);
      const result = await probe(env, url.searchParams.get("dry") === "1");
      return result ? json({ ...result, healthy: result.ok, ok: true, store: env.STATE ? "kv" : "cache" }) : json({ error: "state store unreadable" }, 503);
    }
    return json({ error: "not found" }, 404);
  },

  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(probe(env));
  },
};
