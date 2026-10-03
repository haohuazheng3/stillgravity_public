import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders, stripeEvents } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/admin";
import { orderRef } from "@/lib/ids";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  await requireAdmin();
  const [rows, events] = await Promise.all([
    db.select().from(orders).orderBy(desc(orders.createdAt)).limit(200),
    db.select().from(stripeEvents).orderBy(desc(stripeEvents.receivedAt)).limit(30),
  ]);
  return (
    <div className="space-y-8">
      <section>
        <h1 className="headline text-[1.6rem] text-ink">Orders</h1>
        <div className="slab mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-[0.88rem]">
            <thead className="text-ink-3">
              <tr className="border-b border-line">
                {["Ref", "Email", "Amount", "Status", "Source", "Promo", "Created"].map((h) => (
                  <th key={h} className="px-4 py-3 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((o) => (
                <tr key={o.id} className="border-b border-line text-ink-2">
                  <td className="px-4 py-3 font-semibold">{orderRef(o.id)}</td>
                  <td className="px-4 py-3">{o.email ?? o.userId}</td>
                  <td className="px-4 py-3">
                    {(o.amountTotal / 100).toFixed(2)} {o.currency.toUpperCase()}
                  </td>
                  <td className="px-4 py-3">{o.status}</td>
                  <td className="px-4 py-3">{o.source}</td>
                  <td className="px-4 py-3">{o.promoCode ?? "—"}</td>
                  <td className="px-4 py-3">{new Date(o.createdAt).toLocaleString()}</td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-ink-4">
                    No orders yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
      <section>
        <h2 className="eyebrow">Recent Stripe events (ours and ignored)</h2>
        <ul className="slab mt-3 divide-y divide-[var(--line)] px-2 text-[0.85rem]">
          {events.map((e) => (
            <li key={e.id} className="flex flex-wrap justify-between gap-2 px-3 py-2.5 text-ink-3">
              <span className="text-ink-2">{e.type}</span>
              <span>
                {e.status} · {new Date(e.receivedAt).toLocaleString()}
              </span>
            </li>
          ))}
          {events.length === 0 ? <li className="px-3 py-4 text-ink-4">No events received yet.</li> : null}
        </ul>
      </section>
    </div>
  );
}
