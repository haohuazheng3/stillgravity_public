export const dynamic = "force-static";

/** IndexNow key file (keyLocation=https://stillgravity.com/indexnow.txt). */
export function GET() {
  const key = process.env.INDEXNOW_KEY ?? "";
  if (!key) return new Response("not configured", { status: 404 });
  return new Response(key, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
