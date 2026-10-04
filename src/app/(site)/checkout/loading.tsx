export default function CheckoutLoading() {
  return (
    <div className="mx-auto max-w-[1120px] px-3 pt-10 sm:px-5 sm:pt-16" aria-busy="true" aria-label="Preparing checkout">
      <div className="mx-auto max-w-2xl">
        <div className="slab p-6 sm:p-9">
          <div className="skeleton h-3 w-24" />
          <div className="mt-5 flex gap-5">
            <div className="skeleton aspect-[2/3] w-20 shrink-0 sm:w-24" />
            <div className="flex-1 space-y-3">
              <div className="skeleton h-5 w-56 max-w-full" />
              <div className="skeleton h-4 w-44" />
              <div className="skeleton h-8 w-24" />
            </div>
          </div>
          <hr className="hairline my-6" />
          <div className="skeleton h-5 w-72 max-w-full" />
          <div className="skeleton mt-4 h-3 w-full" />
          <div className="skeleton mt-2 h-3 w-4/5" />
        </div>
      </div>
    </div>
  );
}
