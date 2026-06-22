"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { listTradesThunk } from "@/store/bidding/biddingThunks";
import { selectAccessToken } from "@/store/auth/authSelectors";
import BiddingSidebar from "@/components/bidding/BiddingSidebar";

export default function AdminInspectionsPage() {
  const dispatch = useAppDispatch();
  const { trades, status } = useAppSelector((state) => state.bidding);
  const token = useAppSelector(selectAccessToken);

  useEffect(() => {
    if (!token) return;
    dispatch(listTradesThunk({ token, params: {} }));
  }, [dispatch, token]);

  const activeInspections = trades.filter((t) =>
    ["requested", "scheduled", "in_progress"].includes(t.inspection_status ?? "")
  );

  return (
    <div className="flex w-full min-h-screen bg-surface-gray font-body-md text-on-surface">
      <BiddingSidebar role="admin" />
      <main className="pt-16 min-h-screen flex flex-col w-full">
        <div className="flex-1 p-8 max-w-container-max mx-auto w-full">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-headline-lg text-headline-lg text-primary">Inspection Management</h1>
              <p className="text-on-surface-variant mt-1">Manage trades requiring physical inspection.</p>
            </div>
          </div>

          {status.listTrades === "loading" ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-surface-gray rounded-xl border border-border-subtle"></div>
              ))}
            </div>
          ) : activeInspections.length === 0 ? (
            <div className="bg-white rounded-xl border border-border-subtle p-12 text-center shadow-sm">
              <span className="material-symbols-outlined text-4xl text-outline mb-4">fact_check</span>
              <h2 className="font-headline-md text-ameefar-navy mb-2">No Active Inspections</h2>
              <p className="text-on-surface-variant max-w-md mx-auto">
                There are currently no trades awaiting inspection.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeInspections.map((trade) => {
                let statusBadgeClass = "bg-surface-container-high text-primary";
                if (trade.inspection_status === "requested") statusBadgeClass = "bg-amber-100 text-amber-800";
                if (trade.inspection_status === "scheduled") statusBadgeClass = "bg-blue-100 text-blue-800";
                if (trade.inspection_status === "in_progress") statusBadgeClass = "bg-trust-green-subtle text-secondary";

                return (
                  <Link
                    key={trade.id}
                    href={`/bidding/trade/${trade.id}`}
                    className="block bg-white p-6 rounded-xl border border-border-subtle hover:border-primary transition-colors group shadow-sm"
                  >
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                      <div>
                        <h3 className="font-bold text-ameefar-navy group-hover:text-primary transition-colors text-lg">
                          Trade #{trade.reference}
                        </h3>
                        <p className="text-body-sm text-on-surface-variant mt-1">
                          Buyer: {trade.buyer_name} • Seller: {trade.seller_name}
                        </p>
                      </div>
                      <div className="text-left md:text-right">
                        <span className={`px-3 py-1 rounded-full text-[12px] font-bold uppercase tracking-wider ${statusBadgeClass}`}>
                          {trade.inspection_status ? trade.inspection_status.replace("_", " ") : trade.status.replace("_", " ")}
                        </span>
                        <p className="font-bold text-ameefar-navy mt-2">{trade.total_value} {trade.currency}</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
