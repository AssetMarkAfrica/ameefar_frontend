import Link from "next/link";

// This page has been disabled — the platform now operates on the Buy model only.
// Negotiations / bidding flows are no longer active.
export default function SellerNegotiationsDisabledPage() {
  return (
    <div className="flex w-full min-h-screen bg-surface-gray font-body-md text-on-surface items-center justify-center">
      <div className="max-w-md w-full mx-auto p-8 bg-white rounded-2xl border border-border-subtle shadow-sm text-center">
        <span className="material-symbols-outlined text-[56px] text-outline mb-4 block">block</span>
        <h1 className="font-headline-lg text-headline-lg text-ameefar-navy mb-3">
          Page Unavailable
        </h1>
        <p className="text-body-md text-on-surface-variant mb-6">
          Negotiations are no longer available. Ameefar now operates exclusively on the
          <strong className="text-ameefar-navy"> Buy model</strong>. Please return to your dashboard to manage active trades.
        </p>
        <Link
          href="/bidding/seller/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 bg-ameefar-navy text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
