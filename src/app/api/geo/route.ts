import { consentRequiredFor } from "@/lib/geo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Tells the consent manager whether this visitor must opt in before FlowGlance loads. */
export async function GET(req: Request) {
  const country = req.headers.get("x-vercel-ip-country")?.toUpperCase() ?? "";
  return Response.json(
    { consentRequired: consentRequiredFor(country), country: country || null },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
