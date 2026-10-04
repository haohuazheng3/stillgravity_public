import "server-only";
import { timingSafeEqual } from "node:crypto";
import { env } from "./env";

/** Operator and scheduler endpoints: `Authorization: Bearer <CRON_SECRET>`, compared in constant time. */
export function cronAuthorized(req: Request): boolean {
  const secret = env("CRON_SECRET");
  const got = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!secret || !got || got.length !== secret.length) return false;
  return timingSafeEqual(Buffer.from(got), Buffer.from(secret));
}
