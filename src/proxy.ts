import { clerkClient, clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";

/*
 * Runs only on personal pages and APIs (see `config.matcher`): marketing and blog pages
 * never pass through here, so they're served straight from the CDN cache.
 */

const isProtected = createRouteMatcher(["/account(.*)", "/checkout(.*)", "/admin(.*)", "/api/library(.*)", "/api/admin(.*)"]);
const isAdmin = createRouteMatcher(["/admin(.*)", "/api/admin(.*)"]);

const adminCache = new Map<string, { ok: boolean; at: number }>();

async function isAdminUser(userId: string): Promise<boolean> {
  const hit = adminCache.get(userId);
  if (hit && Date.now() - hit.at < 5 * 60 * 1000) return hit.ok;
  const allowed = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  let ok = false;
  try {
    const client = await clerkClient();
    const u = await client.users.getUser(userId);
    ok = u.emailAddresses.some((e) => e.verification?.status === "verified" && allowed.includes(e.emailAddress.toLowerCase()));
  } catch (e) {
    console.error("[proxy] admin lookup failed", e);
    ok = false;
  }
  adminCache.set(userId, { ok, at: Date.now() });
  return ok;
}

const withClerk = clerkMiddleware(async (auth, req) => {
  try {
    if (!isProtected(req)) return NextResponse.next();
    const { userId } = await auth();
    if (!userId) {
      if (req.nextUrl.pathname.startsWith("/api/")) return NextResponse.json({ error: "sign_in_required" }, { status: 401 });
      if (isAdmin(req)) return NextResponse.rewrite(new URL("/__not-found", req.url)); // don't reveal the admin area exists
      const signIn = new URL("/sign-in", req.url);
      signIn.searchParams.set("redirect_url", `${req.nextUrl.pathname}${req.nextUrl.search}`);
      return NextResponse.redirect(signIn);
    }
    if (isAdmin(req) && !(await isAdminUser(userId))) {
      if (req.nextUrl.pathname.startsWith("/api/")) return NextResponse.json({ error: "not found" }, { status: 404 });
      // rewrite to a path with no route: Next renders the 404 page with a real 404 status
      return NextResponse.rewrite(new URL("/__not-found", req.url));
    }
    const res = NextResponse.next();
    res.headers.set("Cache-Control", "private, no-store");
    return res;
  } catch (err) {
    console.error("[proxy] failed", err);
    return NextResponse.next();
  }
});

/**
 * Degraded mode: until CLERK_SECRET_KEY is configured, public routes keep working (health,
 * webhooks, contact…) and personal pages answer a clear 503 instead of crashing everything.
 */
export default function proxy(req: NextRequest, ev: NextFetchEvent) {
  if (!process.env.CLERK_SECRET_KEY) {
    if (isProtected(req)) {
      return new NextResponse("Accounts are being set up. Please try again in a few minutes.", {
        status: 503,
        headers: { "Content-Type": "text/plain; charset=utf-8", "Retry-After": "300" },
      });
    }
    return NextResponse.next();
  }
  return withClerk(req, ev);
}

export const config = {
  matcher: ["/account/:path*", "/checkout/:path*", "/admin/:path*", "/sign-in/:path*", "/api/:path*"],
};
