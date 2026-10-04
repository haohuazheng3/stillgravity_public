import { reconcile } from "@/lib/reconcile";
import { captureError } from "@/lib/errors";
import { notifyOwner } from "@/lib/notify";
import { cronAuthorized } from "@/lib/cron-auth";
import { setState } from "@/lib/app-state";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

/** Daily (GitHub Actions) or on demand: Stripe paid vs database granted, with repairs. */
export async function POST(req: Request) {
  if (!cronAuthorized(req)) return Response.json({ error: "unauthorized" }, { status: 401 });
  const days = Math.min(90, Math.max(1, Number(new URL(req.url).searchParams.get("days") ?? 7) || 7));
  try {
    const report = await reconcile(days);
    await setState("reconcile:last", report);
    if (report.repaired.length || report.failed.length || report.refundsApplied.length) {
      await notifyOwner({ subject: "Reconcile found differences", text: JSON.stringify(report, null, 2) });
    }
    return Response.json(report, { status: report.failed.length ? 409 : 200 });
  } catch (err) {
    await captureError(err, { route: "/api/cron/reconcile", source: "cron" });
    return Response.json({ error: "reconcile failed" }, { status: 500 });
  }
}
