"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { listTradesThunk } from "@/store/bidding/biddingThunks";
import { selectAccessToken } from "@/store/auth/authSelectors";
import type { TradeSummary, TradeStatus } from "@/types/bidding";

// ── Status helpers ─────────────────────────────────────────────────────────────

function statusConfig(status: TradeStatus) {
  switch (status) {
    case "negotiating":
      return { label: "Negotiating", icon: "gavel", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-500 animate-pulse" };
    case "agreed":
      return { label: "Agreed", icon: "handshake", bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", dot: "bg-blue-500" };
    case "in_progress":
      return { label: "In Progress", icon: "local_shipping", bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200", dot: "bg-teal-500 animate-pulse" };
    case "completed":
      return { label: "Completed", icon: "verified", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" };
    case "disputed":
      return { label: "Disputed", icon: "report", bg: "bg-red-50", text: "text-red-700", border: "border-red-200", dot: "bg-red-500" };
    case "cancelled":
      return { label: "Cancelled", icon: "cancel", bg: "bg-slate-50", text: "text-slate-500", border: "border-slate-200", dot: "bg-slate-400" };
    default:
      return { label: status, icon: "radio_button_unchecked", bg: "bg-slate-50", text: "text-slate-500", border: "border-slate-200", dot: "bg-slate-400" };
  }
}

// ── Trade Card ─────────────────────────────────────────────────────────────────

function TradeCard({ trade, href }: { trade: TradeSummary; href: string }) {
  const s = statusConfig(trade.status);
  const date = new Date(trade.created_at).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });

  return (
    <Link
      href={href}
      className="group relative flex flex-col sm:flex-row sm:items-center gap-4 bg-white rounded-2xl border border-border-subtle px-6 py-5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200"
    >
      {/* Status accent bar */}
      <div className={`absolute left-0 top-4 bottom-4 w-1 rounded-full ${s.dot.replace(" animate-pulse", "")}`} />

      {/* Main info */}
      <div className="flex-1 min-w-0 pl-3">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <h3 className="font-bold text-ameefar-navy text-body-lg group-hover:text-primary transition-colors truncate">
            {trade.listing_name}
          </h3>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-bold uppercase tracking-wide ${s.bg} ${s.text} ${s.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
            {s.label}
          </span>
        </div>
        <p className="text-body-sm text-on-surface-variant">
          Ref: <span className="font-mono text-ameefar-navy">{trade.reference}</span>
          &nbsp;·&nbsp;{date}
        </p>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-5 pl-3 sm:pl-0">
        <div className="text-right min-w-[90px]">
          <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-0.5">Qty</p>
          <p className="font-bold text-ameefar-navy text-body-md">{trade.quantity} <span className="text-on-surface-variant font-normal">{trade.unit.toUpperCase()}</span></p>
        </div>
        <div className="text-right min-w-[110px]">
          <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-0.5">Total Value</p>
          <p className="font-black text-ameefar-navy text-body-lg">{Number(trade.total_value).toLocaleString("en-US", { minimumFractionDigits: 2 })} <span className="text-on-surface-variant font-normal text-body-sm">{trade.currency}</span></p>
        </div>
        <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">chevron_right</span>
      </div>
    </Link>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function BuyerTradesPage() {
  const dispatch = useAppDispatch();
  const token = useAppSelector(selectAccessToken);
  const { trades, status } = useAppSelector((state) => state.bidding);

  useEffect(() => {
    if (!token) return;
    dispatch(listTradesThunk({ token, params: { role: "buyer" } }));
  }, [dispatch, token]);

  const active = trades.filter((t) => !["completed", "cancelled"].includes(t.status));
  const past = trades.filter((t) => ["completed", "cancelled"].includes(t.status));

  return (
    <div className="flex w-full min-h-screen bg-surface-gray font-body-md text-on-surface">
      <main className="pt-16 min-h-screen flex flex-col w-full">
        <div className="flex-1 p-6 md:p-10 max-w-container-max mx-auto w-full">

          {/* Header */}
          <div className="mb-8">
            <h1 className="font-headline-lg text-headline-lg text-ameefar-navy">My Trades</h1>
            <p className="text-body-md text-on-surface-variant mt-1">Track and manage all your active and past trade executions.</p>
          </div>

          {status.listTrades === "loading" ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <span className="w-10 h-10 border-4 border-ameefar-navy border-t-transparent rounded-full animate-spin" />
              <p className="text-on-surface-variant">Loading trades...</p>
            </div>
          ) : trades.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white rounded-2xl border border-border-subtle">
              <span className="material-symbols-outlined text-[64px] text-outline/40">inventory_2</span>
              <h2 className="font-bold text-ameefar-navy text-body-lg">No trades yet</h2>
              <p className="text-on-surface-variant text-body-sm">Accepted negotiations will appear here as trades.</p>
            </div>
          ) : (
            <div className="space-y-10">
              {active.length > 0 && (
                <section>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="material-symbols-outlined text-primary text-[20px]">bolt</span>
                    <h2 className="font-bold text-ameefar-navy uppercase tracking-widest text-[11px]">Active Trades</h2>
                    <span className="text-[11px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">{active.length}</span>
                  </div>
                  <div className="flex flex-col gap-3">
                    {active.map((t) => (
                      <TradeCard key={t.id} trade={t} href={`/bidding/buyer/trade/${t.id}`} />
                    ))}
                  </div>
                </section>
              )}

              {past.length > 0 && (
                <section>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="material-symbols-outlined text-outline text-[20px]">history</span>
                    <h2 className="font-bold text-on-surface-variant uppercase tracking-widest text-[11px]">Past Trades</h2>
                    <span className="text-[11px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-full">{past.length}</span>
                  </div>
                  <div className="flex flex-col gap-3 opacity-80">
                    {past.map((t) => (
                      <TradeCard key={t.id} trade={t} href={`/bidding/buyer/trade/${t.id}`} />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
