/**
 * Still Gravity files worker: the only door to the private R2 bucket.
 *
 * GET  /d/<key>?exp&disp&name&sig   Buyer delivery. The app signs
 *      HMAC-SHA256(SIGNING_SECRET, key \n exp \n disp \n name) for a few minutes; we verify,
 *      then stream the object with the requested disposition. Links can't be widened or reused.
 * GET|HEAD|PUT|DELETE /o/<key>       Server-to-server object API, Bearer API_TOKEN.
 * GET  /health
 */

export interface Env {
  BUCKET: R2Bucket;
  SIGNING_SECRET: string;
  API_TOKEN: string;
}

const enc = new TextEncoder();

function text(body: string, status: number): Response {
  return new Response(body, { status, headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex" } });
}

function equal(a: string, b: string): boolean {
  const x = enc.encode(a);
  const y = enc.encode(b);
  if (x.byteLength !== y.byteLength) return false;
  let d = 0;
  for (let i = 0; i < x.byteLength; i++) d |= x[i] ^ y[i];
  return d === 0;
}

async function hmacHex(secret: string, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function keyFrom(pathname: string, prefix: string): string | null {
  const rest = pathname.slice(prefix.length);
  if (!rest) return null;
  try {
    const key = rest
      .split("/")
      .map((p) => decodeURIComponent(p))
      .join("/");
    if (key.includes("..") || key.startsWith("/")) return null;
    return key;
  } catch {
    return null;
  }
}

function bearer(req: Request, token: string): boolean {
  const h = req.headers.get("authorization") ?? "";
  const got = h.startsWith("Bearer ") ? h.slice(7).trim() : "";
  return Boolean(token) && Boolean(got) && equal(got, token);
}

function safeFilename(name: string): string {
  const clean = name.replace(/[^A-Za-z0-9._ -]/g, "").slice(0, 120) || "download.pdf";
  return clean;
}

async function download(req: Request, env: Env, url: URL): Promise<Response> {
  const key = keyFrom(url.pathname, "/d/");
  const exp = Number(url.searchParams.get("exp") ?? "");
  const disp = url.searchParams.get("disp") === "attachment" ? "attachment" : "inline";
  const name = url.searchParams.get("name") ?? "";
  const sig = url.searchParams.get("sig") ?? "";
  if (!key || !exp || !sig || !name) return text("Bad link.", 400);
  if (Math.floor(Date.now() / 1000) > exp) return text("This link has expired. Open your library at stillgravity.com/account for a fresh one.", 403);
  const expected = await hmacHex(env.SIGNING_SECRET, [key, String(exp), url.searchParams.get("disp") ?? "", name].join("\n"));
  if (!equal(expected, sig)) return text("This link isn't valid.", 403);

  const obj = await env.BUCKET.get(key);
  if (!obj) return text("File not found.", 404);
  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  if (!headers.get("content-type")) headers.set("content-type", "application/pdf");
  headers.set("content-length", String(obj.size));
  headers.set("content-disposition", `${disp}; filename="${safeFilename(name)}"`);
  headers.set("cache-control", "private, no-store");
  headers.set("x-robots-tag", "noindex, nofollow");
  headers.set("referrer-policy", "no-referrer");
  headers.set("x-content-type-options", "nosniff");
  return new Response(req.method === "HEAD" ? null : obj.body, { status: 200, headers });
}

async function objects(req: Request, env: Env, url: URL): Promise<Response> {
  if (!bearer(req, env.API_TOKEN)) return text("unauthorized", 401);
  const key = keyFrom(url.pathname, "/o/");
  if (!key) return text("bad key", 400);
  switch (req.method) {
    case "HEAD": {
      const head = await env.BUCKET.head(key);
      return new Response(null, { status: head ? 200 : 404, headers: head ? { "content-length": String(head.size) } : {} });
    }
    case "GET": {
      const obj = await env.BUCKET.get(key);
      if (!obj) return text("not found", 404);
      const headers = new Headers();
      obj.writeHttpMetadata(headers);
      headers.set("content-length", String(obj.size));
      headers.set("cache-control", "no-store");
      return new Response(obj.body, { headers });
    }
    case "PUT": {
      if (!req.body) return text("empty body", 400);
      const put = await env.BUCKET.put(key, req.body, { httpMetadata: { contentType: req.headers.get("content-type") ?? "application/octet-stream" } });
      return Response.json({ ok: true, key, size: put?.size ?? null });
    }
    case "DELETE": {
      await env.BUCKET.delete(key);
      return Response.json({ ok: true });
    }
    default:
      return text("method not allowed", 405);
  }
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    try {
      if (url.pathname === "/health") return Response.json({ ok: true, service: "stillgravity-files" });
      if (url.pathname.startsWith("/d/") && (req.method === "GET" || req.method === "HEAD")) return await download(req, env, url);
      if (url.pathname.startsWith("/o/")) return await objects(req, env, url);
      return text("Not found.", 404);
    } catch (e) {
      console.error("[stillgravity-files]", e instanceof Error ? e.stack : String(e));
      return text("Something went wrong.", 500);
    }
  },
};
