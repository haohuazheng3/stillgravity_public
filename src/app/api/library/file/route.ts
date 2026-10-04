import { headers } from "next/headers";
import { db } from "@/lib/db";
import { downloads } from "@/lib/db/schema";
import { activeEntitlement } from "@/lib/entitlements";
import { buyerById } from "@/lib/buyers";
import { verifyDownloadToken } from "@/lib/download-token";
import { licensedCopyKey } from "@/lib/library";
import { signedFileUrl } from "@/lib/files";
import { captureError } from "@/lib/errors";
import { rateLimit } from "@/lib/ratelimit";
import { newId } from "@/lib/ids";
import { BOOK, PRODUCT_ID, SITE } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function plain(text: string, status: number, extra: Record<string, string> = {}): Response {
  return new Response(text, { status, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", ...extra } });
}

/** Signed download link (from the success page or the delivery email) → personal copy via a 5-minute file link (302). */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("mode") === "read" ? "read" : "download";
  try {
    const buyerId = verifyDownloadToken(url.searchParams.get("t") ?? "");
    if (!buyerId) return plain(`This download link has expired or isn’t valid. Get a fresh one at ${SITE.url}/download`, 403);

    const ent = await activeEntitlement(buyerId);
    const buyer = ent ? await buyerById(buyerId) : null;
    if (!ent || !buyer) return plain(`There’s no active purchase behind this link. If you think that’s wrong, email ${SITE.email}.`, 403);

    const rl = await rateLimit(`dl:${buyerId}`, 40, 24 * 3600);
    if (!rl.ok) {
      return plain("You’ve opened the book many times today. For your security links are paused for a few hours; your copy is safe.", 429, {
        "Retry-After": String(rl.resetIn),
      });
    }

    const { key } = await licensedCopyKey(buyerId, buyer.email);
    const h = await headers();
    await db.insert(downloads).values({ id: newId("dl"), userId: buyerId, product: PRODUCT_ID, mode, country: h.get("x-vercel-ip-country") });

    const signed = signedFileUrl(key, { disposition: mode === "download" ? "attachment" : "inline", filename: BOOK.fileName, ttlSeconds: 300 });
    return new Response(null, { status: 302, headers: { Location: signed, "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" } });
  } catch (err) {
    await captureError(err, { route: "/api/library/file", context: { mode } });
    return plain("We couldn’t open your copy just now. Please try again; the problem has been logged.", 500);
  }
}
