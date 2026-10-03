import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { downloads } from "@/lib/db/schema";
import { activeEntitlement } from "@/lib/entitlements";
import { ensureUser } from "@/lib/users";
import { licensedCopyKey } from "@/lib/library";
import { signedFileUrl } from "@/lib/files";
import { captureError } from "@/lib/errors";
import { rateLimit } from "@/lib/ratelimit";
import { newId } from "@/lib/ids";
import { BOOK, PRODUCT_ID } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Owner-only: personal copy → short-lived signed link on files.stillgravity.com (302). */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("mode") === "download" ? "download" : "read";
  try {
    const { userId } = await auth();
    if (!userId) return Response.redirect(new URL("/sign-in?redirect_url=%2Faccount", url), 303);

    const ent = await activeEntitlement(userId);
    if (!ent) return Response.redirect(new URL("/book", url), 303);

    const rl = await rateLimit(`dl:${userId}`, 40, 24 * 3600);
    if (!rl.ok) {
      return new Response("You’ve opened the book many times today. For your security links are paused for a few hours; your copy is safe in your library.", {
        status: 429,
        headers: { "Content-Type": "text/plain; charset=utf-8", "Retry-After": String(rl.resetIn) },
      });
    }

    const user = await ensureUser(userId);
    const { key } = await licensedCopyKey(userId, user.email);
    const h = await headers();
    await db.insert(downloads).values({ id: newId("dl"), userId, product: PRODUCT_ID, mode, country: h.get("x-vercel-ip-country") });

    const signed = signedFileUrl(key, {
      disposition: mode === "download" ? "attachment" : "inline",
      filename: BOOK.fileName,
      ttlSeconds: 300,
    });
    return new Response(null, { status: 302, headers: { Location: signed, "Cache-Control": "no-store" } });
  } catch (err) {
    await captureError(err, { route: "/api/library/file", context: { mode } });
    return new Response("We couldn’t open your copy just now. Please try again; the problem has been logged.", {
      status: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
