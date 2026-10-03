export default function AccountLoading() {
  return (
    <div className="mx-auto max-w-[1120px] px-3 pt-10 sm:px-5 sm:pt-14" aria-busy="true" aria-label="Loading your library">
      <div className="skeleton h-4 w-28" />
      <div className="skeleton mt-4 h-12 w-72 max-w-full" />
      <div className="skeleton mt-3 h-4 w-64 max-w-full" />
      <div className="slab mt-8 p-6 sm:p-10">
        <div className="grid items-center gap-8 md:grid-cols-[220px_1fr] md:gap-12">
          <div className="skeleton mx-auto aspect-[2/3] w-[52%] max-w-[220px] md:w-full" />
          <div>
            <div className="skeleton h-6 w-40" />
            <div className="skeleton mt-4 h-9 w-80 max-w-full" />
            <div className="skeleton mt-3 h-5 w-96 max-w-full" />
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <div className="skeleton h-14 w-full rounded-full sm:w-56" />
              <div className="skeleton h-14 w-full rounded-full sm:w-48" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
