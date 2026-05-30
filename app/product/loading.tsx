export default function ProductLoading() {
  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30]">
      <main className="mx-auto w-full max-w-[1440px] p-4 md:p-10">
        <div className="min-h-64 animate-pulse rounded-lg bg-slate-200" />
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <div className="min-h-40 animate-pulse rounded-lg bg-slate-200" />
          <div className="min-h-40 animate-pulse rounded-lg bg-slate-200" />
          <div className="min-h-40 animate-pulse rounded-lg bg-slate-200" />
        </div>
      </main>
    </div>
  );
}
