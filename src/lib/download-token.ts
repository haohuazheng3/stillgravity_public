import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { requireEnv } from "./env";

/*
 * Download links in the delivery email and on the success page carry a signed token
 * instead of a login: `v1.<buyerId>.<expiry>.<signature>`. The route re-checks the
 * purchase on every use, so a refund disables old links even before they expire.
 */

const VERSION = "v1";
export const DOWNLOAD_LINK_DAYS = 30;

function sign(body: string): string {
  return createHmac("sha256", requireEnv("DOWNLOAD_TOKEN_SECRET")).update(`download:${body}`).digest("base64url");
}

export function createDownloadToken(buyerId: string, days = DOWNLOAD_LINK_DAYS, now = Date.now()): string {
  const exp = Math.floor(now / 1000) + days * 86400;
  const body = `${VERSION}.${buyerId}.${exp}`;
  return `${body}.${sign(body)}`;
}

/** The buyer id a valid, unexpired token was issued for, or null. */
export function verifyDownloadToken(token: string, now = Date.now()): string | null {
  const parts = token.split(".");
  if (parts.length !== 4 || parts[0] !== VERSION) return null;
  const [, buyerId, exp, sig] = parts;
  if (!/^b_[0-9a-f]{24}$/.test(buyerId) || !/^\d{9,11}$/.test(exp)) return null;
  if (Number(exp) * 1000 < now) return null;
  const expected = Buffer.from(sign(`${VERSION}.${buyerId}.${exp}`));
  const got = Buffer.from(sig);
  if (expected.length !== got.length || !timingSafeEqual(expected, got)) return null;
  return buyerId;
}

/** Same-origin path that turns a token into the buyer's personal copy. */
export function downloadPath(token: string, mode: "read" | "download"): string {
  return `/api/library/file?mode=${mode}&t=${encodeURIComponent(token)}`;
}
