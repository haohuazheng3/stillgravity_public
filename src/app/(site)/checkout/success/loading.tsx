export default function SuccessLoading() {
  return (
    <div className="mx-auto max-w-[1120px] px-3 pt-10 sm:px-5 sm:pt-16" aria-busy="true" aria-label="Unlocking your book">
      <div className="mx-auto max-w-3xl">
        <div className="slab p-6 sm:p-10">
          <div className="grid items-center gap-8 md:grid-cols-[200px_1fr] md:gap-12">
            <div className="skeleton mx-auto aspect-[2/3] w-[48%] max-w-[200px] md:w-full" />
            <div>
              <div className="skeleton h-6 w-44" />
              <div className="skeleton mt-4 h-11 w-56" />
              <div className="skeleton mt-4 h-4 w-full" />
              <div className="skeleton mt-2 h-4 w-4/5" />
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <div className="skeleton h-14 w-full rounded-full sm:w-56" />
                <div className="skeleton h-14 w-full rounded-full sm:w-48" />
              </div>
            </div>
          </div>
        </div>
        <p className="mt-4 text-center text-[0.9rem] text-ink-3">Confirming your payment with Stripe and unlocking your book…</p>
      </div>
    </div>
  );
}
