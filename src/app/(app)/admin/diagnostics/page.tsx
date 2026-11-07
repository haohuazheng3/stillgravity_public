import { requireAdmin } from "@/lib/admin";
import { DiagnosticsButtons } from "./DiagnosticsButtons";

export const dynamic = "force-dynamic";

async function throwServerError() {
  "use server";
  await requireAdmin();
  throw new Error(`Diagnostics: deliberate server error at ${new Date().toISOString()}`);
}

export default async function DiagnosticsPage() {
  await requireAdmin();
  return (
    <div className="slab p-6 sm:p-8">
      <h1 className="headline text-[1.6rem] text-ink">Diagnostics</h1>
      <p className="mt-2 max-w-2xl text-[0.95rem] text-ink-3">
        Fire a deliberate error to prove the pipeline end to end: it should appear in the error inbox and send an alert email,
        and it shows in the daily error digest until you resolve it. Open errors don’t turn /api/health red (that only tracks
        whether the site can serve).
      </p>
      <DiagnosticsButtons serverAction={throwServerError} />
    </div>
  );
}
