import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { inboxMessages } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

function verdictTag(v: string | null) {
  if (!v) return "tag";
  return v === "pass" ? "tag tag-ok" : "tag tag-bad";
}

export default async function InboxPage() {
  await requireAdmin();
  const rows = await db.select().from(inboxMessages).orderBy(desc(inboxMessages.receivedAt)).limit(100);
  return (
    <div>
      <h1 className="headline text-[1.6rem] text-ink">Test inbox</h1>
      <p className="mt-1 text-[0.88rem] text-ink-4">
        Mail to test@stillgravity.com (and any unrouted address) via Cloudflare Email Routing → Email Worker. Verdicts come from the
        receiving server’s Authentication-Results.
      </p>
      <ul className="mt-5 space-y-3">
        {rows.length === 0 ? <li className="slab p-6 text-ink-3">Empty.</li> : null}
        {rows.map((m) => (
          <li key={m.id} className="slab p-5">
            <p className="flex flex-wrap items-center gap-2 text-[0.82rem] text-ink-3">
              <span className={verdictTag(m.spf)}>SPF {m.spf ?? "?"}</span>
              <span className={verdictTag(m.dkim)}>DKIM {m.dkim ?? "?"}</span>
              <span className={verdictTag(m.dmarc)}>DMARC {m.dmarc ?? "?"}</span>
              {new Date(m.receivedAt).toLocaleString()}
            </p>
            <p className="mt-2 font-semibold text-ink">{m.subject ?? "(no subject)"}</p>
            <p className="text-[0.85rem] text-ink-3">
              {m.fromAddr} → {m.toAddr}
            </p>
            {m.textBody ? (
              <details className="mt-2">
                <summary className="cursor-pointer text-[0.82rem] text-ink-3">Body</summary>
                <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded-xl bg-slab-2 p-3 text-[0.78rem] text-ink-3">{m.textBody}</pre>
              </details>
            ) : null}
            {m.authResults ? <p className="mt-2 break-all text-[0.72rem] text-ink-4">{m.authResults}</p> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
