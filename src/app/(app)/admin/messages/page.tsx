import { revalidatePath } from "next/cache";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { contactMessages } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

async function setStatus(formData: FormData) {
  "use server";
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !["new", "replied", "archived"].includes(status)) return;
  await db.update(contactMessages).set({ status }).where(eq(contactMessages.id, id));
  revalidatePath("/admin/messages");
}

export default async function MessagesPage() {
  await requireAdmin();
  const rows = await db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt)).limit(200);
  return (
    <div>
      <h1 className="headline text-[1.6rem] text-ink">Messages</h1>
      <ul className="mt-5 space-y-3">
        {rows.length === 0 ? <li className="slab p-6 text-ink-3">No messages yet.</li> : null}
        {rows.map((m) => (
          <li key={m.id} className="slab p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2 text-[0.85rem] text-ink-3">
                  <span className={`tag ${m.status === "new" ? "tag-accent" : ""}`}>{m.status}</span>
                  <span className="tag">{m.topic}</span>
                  {new Date(m.createdAt).toLocaleString()} · {m.notified ? "emailed" : "not emailed"}
                </p>
                <p className="mt-2 font-semibold text-ink">
                  {m.name ? `${m.name} · ` : ""}
                  <a className="text-accent-text underline" href={`mailto:${m.email}?subject=Re:%20your%20message%20to%20Still%20Gravity`}>
                    {m.email}
                  </a>
                </p>
                <p className="mt-2 whitespace-pre-wrap break-words text-[0.95rem] text-ink-2">{m.message}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                {(["replied", "archived"] as const).map((s) => (
                  <form key={s} action={setStatus}>
                    <input type="hidden" name="id" value={m.id} />
                    <input type="hidden" name="status" value={s} />
                    <button className="btn btn-ghost btn-sm" type="submit" disabled={m.status === s}>
                      {s === "replied" ? "Mark replied" : "Archive"}
                    </button>
                  </form>
                ))}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
