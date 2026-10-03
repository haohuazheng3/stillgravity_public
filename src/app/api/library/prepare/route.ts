import { auth } from "@clerk/nextjs/server";
import { activeEntitlement } from "@/lib/entitlements";
import { ensureUser } from "@/lib/users";
import { licensedCopyKey } from "@/lib/library";
import { captureError } from "@/lib/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Warms the buyer's personal copy in the background while the library page is open. */
export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) return Response.json({ error: "sign_in_required" }, { status: 401 });
    if (!(await activeEntitlement(userId))) return Response.json({ error: "not_owned" }, { status: 403 });
    const user = await ensureUser(userId);
    const r = await licensedCopyKey(userId, user.email);
    return Response.json({ ready: true, personalised: r.personalised });
  } catch (err) {
    await captureError(err, { route: "/api/library/prepare" });
    return Response.json({ error: "prepare failed" }, { status: 500 });
  }
}
