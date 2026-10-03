import "server-only";
import { createHmac } from "node:crypto";
import { requireEnv } from "./env";

/**
 * Private files live in the R2 bucket behind the `stillgravity-files` Cloudflare Worker.
 * The site never holds R2 credentials:
 *  - buyers get short-lived HMAC-signed URLs (`/d/<key>?exp&disp&name&sig`) that the
 *    worker verifies before streaming the object;
 *  - the server reads and writes objects through the worker's bearer-protected `/o/<key>`.
 */

function base(): string {
  return requireEnv("FILES_BASE_URL").replace(/\/$/, "");
}

function encodeKey(key: string): string {
  return key
    .split("/")
    .map((p) => encodeURIComponent(p))
    .join("/");
}

export function signPayload(key: string, exp: number, disposition: string, filename: string): string {
  return createHmac("sha256", requireEnv("FILES_SIGNING_SECRET"))
    .update([key, String(exp), disposition, filename].join("\n"))
    .digest("hex");
}

export function signedFileUrl(
  key: string,
  opts: { disposition: "inline" | "attachment"; filename: string; ttlSeconds?: number },
): string {
  const exp = Math.floor(Date.now() / 1000) + (opts.ttlSeconds ?? 600);
  const sig = signPayload(key, exp, opts.disposition, opts.filename);
  const qs = new URLSearchParams({ exp: String(exp), disp: opts.disposition, name: opts.filename, sig });
  return `${base()}/d/${encodeKey(key)}?${qs.toString()}`;
}

function authHeaders(): Record<string, string> {
  return { Authorization: `Bearer ${requireEnv("FILES_API_TOKEN")}` };
}

export async function fileExists(key: string): Promise<boolean> {
  const res = await fetch(`${base()}/o/${encodeKey(key)}`, { method: "HEAD", headers: authHeaders(), cache: "no-store" });
  if (res.status === 404) return false;
  if (!res.ok) throw new Error(`files worker HEAD ${key} answered ${res.status}`);
  return true;
}

export async function readFile(key: string): Promise<Uint8Array> {
  const res = await fetch(`${base()}/o/${encodeKey(key)}`, { headers: authHeaders(), cache: "no-store" });
  if (!res.ok) throw new Error(`files worker GET ${key} answered ${res.status}`);
  return new Uint8Array(await res.arrayBuffer());
}

export async function writeFile(key: string, body: Uint8Array, contentType: string): Promise<void> {
  const res = await fetch(`${base()}/o/${encodeKey(key)}`, {
    method: "PUT",
    headers: { ...authHeaders(), "Content-Type": contentType },
    body: Buffer.from(body),
  });
  if (!res.ok) throw new Error(`files worker PUT ${key} answered ${res.status}: ${await res.text().catch(() => "")}`);
}
