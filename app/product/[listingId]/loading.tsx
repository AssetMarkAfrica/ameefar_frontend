export default function ProductListingLoading() {
  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30]">
      <main className="mx-auto w-full max-w-[1440px] p-4 md:p-10">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-h-[520px] animate-pulse rounded-lg bg-slate-200" />
          <div className="min-h-80 animate-pulse rounded-lg bg-slate-200" />
        </div>
      </main>
    </div>
  );
}
