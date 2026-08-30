"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { listTradesThunk } from "@/store/bidding/biddingThunks";
import { selectAccessToken } from "@/store/auth/authSelectors";

const STATUS_STYLES: Record<string, string> = {
  negotiating: "bg-amber-100 text-amber-800",
  agreed: "bg-blue-100 text-blue-800",
  in_progress: "bg-secondary/10 text-secondary",
  completed: "bg-trust-green-subtle text-secondary",
  cancelled: "bg-surface-gray text-outline",
  disputed: "bg-error-container text-error",
};

export default function AdminTradesPage() {
  const dispatch = useAppDispatch();
  const token = useAppSelector(selectAccessToken);
  const { trades, status } = useAppSelector((state) => state.bidding);

  useEffect(() => {
    if (!token) return;
    dispatch(listTradesThunk({ token, params: {} }));
  }, [dispatch, token]);

  return (
    <div className="flex-1 w-full min-h-screen bg-surface-gray">
      {/* Page Header */}
      <div className="bg-white border-b border-border-subtle sticky top-0 z-10 px-4 sm:px-8 py-4">
        <h1 className="font-headline-lg text-headline-lg text-primary leading-tight">
          All Trades
        </h1>
        <p className="text-body-sm text-on-surface-variant mt-0.5">
          View and manage all platform trades
        </p>
      </div>

      <div className="p-4 sm:p-8 max-w-5xl mx-auto w-full">
        {status.listTrades === "loading" && trades.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <span className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-body-md text-on-surface-variant animate-pulse">Loading trades…</p>
          </div>
        ) : trades.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <span className="material-symbols-outlined text-[48px] text-slate-300">swap_horiz</span>
            <p className="font-bold text-primary">No trades yet</p>
            <p className="text-body-sm text-on-surface-variant">Trades will appear here once buyers and sellers agree on terms.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {trades.map((trade) => (
              <Link
                key={trade.id}
                href={`/bidding/trade/${trade.id}`}
                className="group bg-white rounded-2xl border border-border-subtle shadow-sm p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-primary hover:shadow-md transition-all duration-200 active:scale-[0.99]"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-xl">swap_horiz</span>
                  </div>
                  <div>
                    <p className="font-bold text-primary text-body-lg leading-snug">
                      Trade #{trade.reference}
                    </p>
                    <p className="text-body-sm text-on-surface-variant mt-0.5">
                      {trade.buyer_name || "Buyer"} → {trade.seller_name || "Seller"}
                    </p>
                    <p className="text-body-sm text-outline mt-0.5">
                      {trade.quantity} {trade.unit} · {trade.currency} {trade.total_value}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${STATUS_STYLES[trade.status] ?? "bg-surface-gray text-outline"}`}>
                    {trade.status.replace(/_/g, " ")}
                  </span>
                  <span className="material-symbols-outlined text-outline text-lg group-hover:translate-x-1 transition-transform">
                    chevron_right
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
