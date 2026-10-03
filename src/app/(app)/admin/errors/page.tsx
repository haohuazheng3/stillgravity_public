import { revalidatePath } from "next/cache";
import { asc, desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { errorGroups } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

async function setResolved(formData: FormData) {
  "use server";
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const resolve = formData.get("resolve") === "1";
  if (!id) return;
  await db.update(errorGroups).set({ resolvedAt: resolve ? sql`now()` : null }).where(eq(errorGroups.id, id));
  revalidatePath("/admin/errors");
}

async function resolveAll() {
  "use server";
  await requireAdmin();
  await db.update(errorGroups).set({ resolvedAt: sql`now()` }).where(sql`${errorGroups.resolvedAt} IS NULL`);
  revalidatePath("/admin/errors");
}

export default async function ErrorsPage() {
  await requireAdmin();
  const rows = await db
    .select()
    .from(errorGroups)
    .orderBy(sql`${errorGroups.resolvedAt} IS NOT NULL`, asc(sql`${errorGroups.severity} = 'warn'`), desc(errorGroups.lastSeen))
    .limit(200);

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h1 className="headline text-[1.6rem] text-ink">Error inbox</h1>
        <form action={resolveAll}>
          <button className="btn btn-ghost btn-sm" type="submit">
            Resolve all open
          </button>
        </form>
      </div>
      <p className="mt-1 text-[0.88rem] text-ink-4">Grouped by error name + first stack frame + route. A resolved error that recurs reopens automatically.</p>
      <ul className="mt-5 space-y-3">
        {rows.length === 0 ? <li className="slab p-6 text-ink-3">No errors recorded. 🎯</li> : null}
        {rows.map((e) => (
          <li key={e.id} className={`slab p-5 ${e.resolvedAt ? "opacity-60" : ""}`}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2">
                  <span className={`tag ${e.severity === "error" ? "tag-bad" : ""}`}>{e.severity}</span>
                  <span className="tag">{e.source}</span>
                  {e.resolvedAt ? <span className="tag tag-ok">resolved</span> : null}
                  <span className="text-[0.82rem] text-ink-4">×{e.count} · last {new Date(e.lastSeen).toLocaleString()}</span>
                </p>
                <p className="mt-2 break-words font-semibold text-ink">
                  {e.name}: {e.message}
                </p>
                <p className="mt-1 break-all text-[0.82rem] text-ink-3">
                  {e.route ?? "—"} · {e.firstFrame ?? "no frame"}
                </p>
                {e.stack ? (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-[0.82rem] text-ink-3">Stack</summary>
                    <pre className="mt-2 max-h-64 overflow-auto rounded-xl bg-slab-2 p-3 text-[0.75rem] text-ink-3">{e.stack}</pre>
                  </details>
                ) : null}
              </div>
              <form action={setResolved} className="shrink-0">
                <input type="hidden" name="id" value={e.id} />
                <input type="hidden" name="resolve" value={e.resolvedAt ? "0" : "1"} />
                <button className={`btn btn-sm ${e.resolvedAt ? "btn-quiet" : "btn-primary"}`} type="submit">
                  {e.resolvedAt ? "Reopen" : "Mark resolved"}
                </button>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
