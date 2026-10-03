import { createHash, randomBytes } from "node:crypto";

const ALPHABET = "0123456789abcdefghjkmnpqrstvwxyz"; // Crockford-ish, no i/l/o/u

/** Short, URL-safe, sortable-enough random id with a type prefix, e.g. `ord_k3v9…`. */
export function newId(prefix: string, length = 16): string {
  const bytes = randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
  return `${prefix}_${out}`;
}

export function newToken(bytes = 32): string {
  return randomBytes(bytes).toString("hex");
}

export function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

/** Human-friendly order reference shown to buyers and stamped into their copy. */
export function orderRef(orderId: string): string {
  return `SG-${orderId.replace(/^ord_/, "").slice(0, 8).toUpperCase()}`;
}
