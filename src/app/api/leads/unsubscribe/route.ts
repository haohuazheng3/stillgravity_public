import { unsubscribeLead } from "@/lib/leads";
import { captureError } from "@/lib/errors";
import { SITE } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function token(req: Request): string {
  return new URL(req.url).searchParams.get("t") ?? "";
}

/** The link in every email: unsubscribe, then show the confirmation page. */
export async function GET(req: Request) {
  try {
    await unsubscribeLead(token(req));
  } catch (err) {
    await captureError(err, { route: "/api/leads/unsubscribe" });
  }
  return Response.redirect(`${SITE.url}/unsubscribed`, 303);
}

/** RFC 8058 one-click unsubscribe from the mail client (List-Unsubscribe-Post). */
export async function POST(req: Request) {
  try {
    await unsubscribeLead(token(req));
    return new Response(null, { status: 200 });
  } catch (err) {
    await captureError(err, { route: "/api/leads/unsubscribe" });
    return new Response(null, { status: 500 });
  }
}
