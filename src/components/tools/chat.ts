/*
 * "Who's carrying this conversation?" Everything here runs in the visitor's browser: a WhatsApp
 * export is read, counted and thrown away. No message text leaves the page, and the only
 * analytics event is the result id.
 */

export type ChatMsg = { t: number; from: string; text: string; media: boolean };

const INVISIBLE = /[‎‏‪-‮⁦-⁩﻿]/g;
const SPACES = /[   ]/g;
// [12/31/23, 9:15:23 PM] Name: text   ·   12/31/23, 9:15 PM - Name: text   ·   31.12.2023, 21:15 - Name: text
const LINE = /^\[?(\d{1,4})[./-](\d{1,2})[./-](\d{2,4}),?\s+(\d{1,2})[:.](\d{2})(?:[:.](\d{2}))?\s*([ap]\.?\s?m\.?)?\]?\s*(?:[-–]\s*)?([^:]{1,60}?):\s?(.*)$/i;
const MEDIA = /<media omitted>|<attached:|\b(image|video|audio|sticker|gif|document|photo) omitted\b|^‎?(image|video|audio|sticker|gif) omitted$/i;

/** Parses a WhatsApp chat export (Android or iPhone, 12- or 24-hour, day- or month-first dates). */
export function parseWhatsApp(raw: string): { msgs: ChatMsg[]; senders: { name: string; count: number }[]; dayFirst: boolean } {
  const lines = raw.replace(INVISIBLE, "").replace(SPACES, " ").split(/\r?\n/);
  type Row = { a: number; b: number; y: number; h: number; m: number; s: number; ap: string; from: string; text: string };
  const rows: Row[] = [];
  let dayFirst: boolean | null = null;
  for (const line of lines) {
    const x = LINE.exec(line.trim());
    if (!x) {
      if (rows.length && line.trim()) rows[rows.length - 1].text += `\n${line.trim()}`;
      continue;
    }
    let a = Number(x[1]);
    let b = Number(x[2]);
    let y = Number(x[3]);
    if (x[1].length === 4) [y, a, b] = [a, b, y]; // 2023-12-31
    if (y < 100) y += 2000;
    if (dayFirst === null && x[1].length !== 4) {
      if (a > 12) dayFirst = true;
      else if (b > 12) dayFirst = false;
    }
    rows.push({ a, b, y, h: Number(x[4]), m: Number(x[5]), s: Number(x[6] ?? 0), ap: (x[7] ?? "").replace(/[\s.]/g, "").toLowerCase(), from: x[8].trim(), text: x[9] ?? "" });
  }
  const df = dayFirst ?? false;
  const msgs: ChatMsg[] = [];
  for (const r of rows) {
    const month = df ? r.b : r.a;
    const day = df ? r.a : r.b;
    let h = r.h;
    if (r.ap === "pm" && h < 12) h += 12;
    if (r.ap === "am" && h === 12) h = 0;
    const t = new Date(r.y, month - 1, day, h, r.m, r.s).getTime();
    if (!Number.isFinite(t)) continue;
    msgs.push({ t, from: r.from, text: r.text, media: MEDIA.test(r.text.trim()) });
  }
  msgs.sort((p, q) => p.t - q.t);
  const counts = new Map<string, number>();
  for (const m of msgs) counts.set(m.from, (counts.get(m.from) ?? 0) + 1);
  const senders = [...counts.entries()].map(([name, count]) => ({ name, count })).sort((p, q) => q.count - p.count);
  return { msgs, senders, dayFirst: df };
}

/** Reads the chat text out of a WhatsApp .zip export (iPhone exports are zipped). */
export async function readZipText(buf: ArrayBuffer): Promise<string | null> {
  const v = new DataView(buf);
  let eocd = -1;
  for (let i = buf.byteLength - 22; i >= Math.max(0, buf.byteLength - 66000); i--) {
    if (v.getUint32(i, true) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) return null;
  const count = v.getUint16(eocd + 10, true);
  let p = v.getUint32(eocd + 16, true);
  const dec = new TextDecoder();
  let pick: { method: number; size: number; offset: number } | null = null;
  for (let n = 0; n < count && p + 46 <= buf.byteLength; n++) {
    if (v.getUint32(p, true) !== 0x02014b50) break;
    const method = v.getUint16(p + 10, true);
    const size = v.getUint32(p + 20, true);
    const nameLen = v.getUint16(p + 28, true);
    const extraLen = v.getUint16(p + 30, true);
    const commentLen = v.getUint16(p + 32, true);
    const offset = v.getUint32(p + 42, true);
    const name = dec.decode(new Uint8Array(buf, p + 46, nameLen));
    if (/\.txt$/i.test(name) && !name.startsWith("__MACOSX")) {
      pick = { method, size, offset };
      if (/_chat\.txt$|whatsapp/i.test(name)) break;
    }
    p += 46 + nameLen + extraLen + commentLen;
  }
  if (!pick) return null;
  const lh = pick.offset;
  if (v.getUint32(lh, true) !== 0x04034b50) return null;
  const start = lh + 30 + v.getUint16(lh + 26, true) + v.getUint16(lh + 28, true);
  const data = new Uint8Array(buf, start, pick.size);
  if (pick.method === 0) return dec.decode(data);
  if (pick.method !== 8 || typeof DecompressionStream === "undefined") return null;
  const stream = new Blob([data]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  return await new Response(stream).text();
}

export type ChatStats = {
  me: string;
  her: string;
  messages: { me: number; her: number };
  days: number;
  starts: { me: number; her: number };
  words: { me: number; her: number };
  questions: { me: number; her: number };
  /** Messages sent again after ≥ 6 hours with no reply in between. */
  followUps: { me: number; her: number };
  /** Median minutes to reply, counting replies within 48 hours. */
  replyMins: { me: number | null; her: number | null };
  recent: { herPerDay: number; herPerDayBefore: number; herReplyMins: number | null; herReplyMinsBefore: number | null; herStartShare: number | null; herStartShareBefore: number | null };
  result: "balanced" | "leaning" | "you-carry" | "she-carries" | "cooling" | "thin";
};

const HOUR = 3_600_000;
const median = (xs: number[]) => {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const words = (t: string) => t.split(/\s+/).filter(Boolean).length;

function tally(msgs: ChatMsg[], me: string, her: string) {
  const starts = { me: 0, her: 0 };
  const reply: Record<"me" | "her", number[]> = { me: [], her: [] };
  const follow = { me: 0, her: 0 };
  let prev: ChatMsg | null = null;
  for (const m of msgs) {
    const who = m.from === me ? "me" : "her";
    if (!prev || m.t - prev.t >= 6 * HOUR) starts[who]++;
    if (prev) {
      const prevWho = prev.from === me ? "me" : "her";
      if (prevWho !== who && m.t - prev.t <= 48 * HOUR) reply[who].push((m.t - prev.t) / 60000);
      if (prevWho === who && m.t - prev.t >= 6 * HOUR) follow[who]++;
    }
    prev = m;
  }
  return { starts, reply, follow, her: msgs.filter((m) => m.from === her).length };
}

/** Counts who starts, who writes, who asks and how fast each replies; then reads the balance. */
export function analyzeChat(all: ChatMsg[], me: string, herName?: string): ChatStats {
  const others = new Map<string, number>();
  for (const m of all) if (m.from !== me) others.set(m.from, (others.get(m.from) ?? 0) + 1);
  const her = herName ?? [...others.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";
  const msgs = all.filter((m) => m.from === me || m.from === her);
  const mine = msgs.filter((m) => m.from === me);
  const hers = msgs.filter((m) => m.from === her);
  const span = msgs.length ? (msgs[msgs.length - 1].t - msgs[0].t) / (24 * HOUR) : 0;
  const w = tally(msgs, me, her);
  const end = msgs.length ? msgs[msgs.length - 1].t : 0;
  const last = msgs.filter((m) => m.t > end - 14 * 24 * HOUR);
  const before = msgs.filter((m) => m.t <= end - 14 * 24 * HOUR && m.t > end - 28 * 24 * HOUR);
  const wl = tally(last, me, her);
  const wb = tally(before, me, her);
  const share = (s: { me: number; her: number }) => (s.me + s.her ? s.her / (s.me + s.her) : null);

  const stats: ChatStats = {
    me,
    her,
    messages: { me: mine.length, her: hers.length },
    days: Math.max(1, Math.round(span)),
    starts: w.starts,
    words: { me: mine.reduce((s, m) => s + (m.media ? 0 : words(m.text)), 0), her: hers.reduce((s, m) => s + (m.media ? 0 : words(m.text)), 0) },
    questions: { me: mine.filter((m) => m.text.includes("?")).length, her: hers.filter((m) => m.text.includes("?")).length },
    followUps: w.follow,
    replyMins: { me: median(w.reply.me), her: median(w.reply.her) },
    recent: {
      herPerDay: wl.her / 14,
      herPerDayBefore: wb.her / 14,
      herReplyMins: median(wl.reply.her),
      herReplyMinsBefore: median(wb.reply.her),
      herStartShare: share(wl.starts),
      herStartShareBefore: share(wb.starts),
    },
    result: "balanced",
  };
  stats.result = readBalance(stats, span);
  return stats;
}

function readBalance(s: ChatStats, span: number): ChatStats["result"] {
  const total = s.messages.me + s.messages.her;
  if (total < 40 || span < 5 || s.messages.her < 10) return "thin";
  const r = s.recent;
  const before = r.herPerDayBefore * 14;
  const slower = r.herReplyMins !== null && r.herReplyMinsBefore !== null && r.herReplyMins >= 1.5 * r.herReplyMinsBefore;
  const startsLess = r.herStartShare !== null && r.herStartShareBefore !== null && r.herStartShare <= r.herStartShareBefore - 0.15;
  if (span >= 28 && before >= 20 && r.herPerDay < 0.6 * r.herPerDayBefore && (slower || startsLess)) return "cooling";
  const starts = s.starts.me + s.starts.her;
  const myStarts = starts ? s.starts.me / starts : 0.5;
  const allWords = s.words.me + s.words.her;
  const myWords = allWords ? s.words.me / allWords : 0.5;
  const allQ = s.questions.me + s.questions.her;
  const myQ = allQ ? s.questions.me / allQ : 0.5;
  if (myStarts >= 0.7 && (myWords >= 0.6 || myQ >= 0.65)) return "you-carry";
  if (myStarts <= 0.3 && myWords <= 0.45) return "she-carries";
  if (myStarts >= 0.6 || myWords >= 0.6 || myQ >= 0.65) return "leaning";
  return "balanced";
}

/** The no-export version: five answers mapped to the same results. */
export function manualChat(a: { started: number; reply: number; questions: number; double: number; trend: number }): ChatStats["result"] {
  if (a.trend >= 2) return "cooling";
  const carry = (a.started >= 8 ? 2 : a.started >= 6 ? 1 : 0) + (a.questions >= 2 ? 1 : 0) + (a.double >= 2 ? 1 : 0) + (a.reply >= 3 ? 1 : 0);
  if (a.started <= 3 && a.questions === 0) return "she-carries";
  if (carry >= 3) return "you-carry";
  if (carry >= 1) return "leaning";
  return "balanced";
}

export function formatMins(m: number | null): string {
  if (m === null) return "—";
  if (m < 1) return "under a minute";
  if (m < 60) return `${Math.round(m)} min`;
  const h = Math.floor(m / 60);
  const r = Math.round(m % 60);
  if (h >= 24) return `${Math.round(m / 60)} h`;
  return r ? `${h} h ${r} min` : `${h} h`;
}
