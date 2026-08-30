"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchAdminOverviewThunk, listTradesThunk } from "@/store/bidding/biddingThunks";
import { selectAccessToken } from "@/store/auth/authSelectors";

export default function AdminDashboardPage() {
  const dispatch = useAppDispatch();
  const { adminOverview, status } = useAppSelector((state) => state.bidding);
  const token = useAppSelector(selectAccessToken);

  useEffect(() => {
    if (!token) return;
    dispatch(fetchAdminOverviewThunk({ token }));
    dispatch(listTradesThunk({ token, params: {} }));
  }, [dispatch, token]);

  const totalTrades = adminOverview
    ? Object.values(adminOverview.trades).reduce((a, b) => a + b, 0)
    : 0;
  const totalEnquiries = adminOverview
    ? Object.values(adminOverview.enquiries).reduce((a, b) => a + b, 0)
    : 0;

  return (
    <div className="flex-1 w-full min-h-screen bg-surface-gray">
      {/* Page Header */}
      <div className="bg-white border-b border-border-subtle sticky top-0 z-10 px-4 sm:px-8 py-4">
        <h1 className="font-headline-lg text-headline-lg text-primary leading-tight">
          Admin Dashboard
        </h1>
        <p className="text-body-sm text-on-surface-variant mt-0.5">
          Platform overview &amp; management
        </p>
      </div>

      <div className="p-4 sm:p-8 max-w-5xl mx-auto w-full space-y-8">

        {/* Loading State */}
        {status.fetchAdminOverview === "loading" || !adminOverview ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <span className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-body-md text-on-surface-variant animate-pulse">
              Loading overview…
            </p>
          </div>
        ) : (
          <>
            {/* ── Overview Stats ─────────────────────────────── */}
            <section>
              <h2 className="font-headline-sm text-headline-sm text-ameefar-navy mb-4">
                Overview Statistics
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {/* Total Trades */}
                <div className="col-span-2 sm:col-span-1 bg-white rounded-2xl border border-border-subtle shadow-sm p-6 flex flex-col gap-1">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                    <span className="material-symbols-outlined text-primary text-xl">
                      swap_horiz
                    </span>
                  </div>
                  <span className="text-[2.5rem] font-bold text-primary leading-none">
                    {totalTrades}
                  </span>
                  <span className="text-body-sm text-outline uppercase tracking-wider">
                    Total Trades
                  </span>
                </div>

                {/* Total Enquiries */}
                <div className="col-span-2 sm:col-span-1 bg-white rounded-2xl border border-border-subtle shadow-sm p-6 flex flex-col gap-1">
                  <div className="w-10 h-10 rounded-xl bg-ameefar-navy/10 flex items-center justify-center mb-2">
                    <span className="material-symbols-outlined text-ameefar-navy text-xl">
                      mark_email_unread
                    </span>
                  </div>
                  <span className="text-[2.5rem] font-bold text-ameefar-navy leading-none">
                    {totalEnquiries}
                  </span>
                  <span className="text-body-sm text-outline uppercase tracking-wider">
                    Total Enquiries
                  </span>
                </div>
              </div>
            </section>

            {/* ── Quick Actions ──────────────────────────────── */}
            <section>
              <h2 className="font-headline-sm text-headline-sm text-ameefar-navy mb-4">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* All Trades */}
                <Link
                  href="/bidding/trades"
                  className="group bg-white rounded-2xl border border-border-subtle shadow-sm p-6 flex items-start gap-4 hover:border-ameefar-navy hover:shadow-md transition-all duration-200 active:scale-[0.98]"
                >
                  <div className="w-12 h-12 rounded-xl bg-ameefar-navy/10 flex items-center justify-center flex-shrink-0 group-hover:bg-ameefar-navy/20 transition-colors">
                    <span className="material-symbols-outlined text-ameefar-navy text-2xl">
                      swap_horiz
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-primary text-body-lg leading-snug">
                      All Trades
                    </p>
                    <p className="text-body-sm text-on-surface-variant mt-0.5">
                      View and manage all active and past platform trades.
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-outline text-lg flex-shrink-0 self-center group-hover:translate-x-1 transition-transform">
                    chevron_right
                  </span>
                </Link>

                {/* Payouts */}
                <Link
                  href="/bidding/payouts"
                  className="group bg-white rounded-2xl border border-border-subtle shadow-sm p-6 flex items-start gap-4 hover:border-secondary hover:shadow-md transition-all duration-200 active:scale-[0.98]"
                >
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-secondary/20 transition-colors">
                    <span className="material-symbols-outlined text-secondary text-2xl">
                      payments
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-primary text-body-lg leading-snug">
                      Pending Payouts
                    </p>
                    <p className="text-body-sm text-on-surface-variant mt-0.5">
                      Review &amp; approve seller payouts for completed trades.
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-outline text-lg flex-shrink-0 self-center group-hover:translate-x-1 transition-transform">
                    chevron_right
                  </span>
                </Link>

                {/* Inspections */}
                <Link
                  href="/bidding/inspections"
                  className="group bg-white rounded-2xl border border-border-subtle shadow-sm p-6 flex items-start gap-4 hover:border-primary hover:shadow-md transition-all duration-200 active:scale-[0.98]"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                    <span className="material-symbols-outlined text-primary text-2xl">
                      assignment_turned_in
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-primary text-body-lg leading-snug">
                      Inspections
                    </p>
                    <p className="text-body-sm text-on-surface-variant mt-0.5">
                      Manage trades requiring pre-shipment quality inspection.
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-outline text-lg flex-shrink-0 self-center group-hover:translate-x-1 transition-transform">
                    chevron_right
                  </span>
                </Link>

              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
