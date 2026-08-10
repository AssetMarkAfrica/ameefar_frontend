"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { listEnquiriesThunk, listTradesThunk } from "@/store/bidding/biddingThunks";
import { selectAccessToken } from "@/store/auth/authSelectors";

export default function SellerDashboardPage() {
  const dispatch = useAppDispatch();
  const { enquiries, trades, status } = useAppSelector((state) => state.bidding);
  const token = useAppSelector(selectAccessToken);

  useEffect(() => {
    if (!token) return;
    dispatch(listEnquiriesThunk({ token, params: { role: "seller" } }));
    dispatch(listTradesThunk({ token, params: { role: "seller" } }));
  }, [dispatch, token]);

  const activeTrades = trades.filter((t) => !["completed", "cancelled", "disputed"].includes(t.status));
  const activeEnquiries = enquiries.filter((e) => ["pending", "countered"].includes(e.status));

  return (
    <div className="flex w-full min-h-screen bg-surface-gray font-body-md text-on-surface">
      <main className="pt-16 min-h-screen flex flex-col w-full">
        <div className="flex-1 p-8 max-w-container-max mx-auto w-full">
          <h1 className="font-headline-lg text-headline-lg text-primary mb-8">Seller Dashboard</h1>

          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-headline-md text-headline-md text-ameefar-navy">Incoming Negotiations</h2>
              <Link href="/bidding/seller/negotiations" className="text-primary font-bold text-body-sm hover:underline">
                View All
              </Link>
            </div>

            {status.listEnquiries === "loading" ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="block bg-white p-6 rounded-xl border border-border-subtle shadow-sm animate-pulse">
                    <div className="flex justify-between items-center">
                      <div className="space-y-3 w-1/2">
                        <div className="h-5 bg-surface-gray rounded w-3/4"></div>
                        <div className="h-4 bg-surface-gray rounded w-1/2"></div>
                      </div>
                      <div className="space-y-3 flex flex-col items-end w-1/4">
                        <div className="h-6 bg-surface-gray rounded-full w-20"></div>
                        <div className="h-5 bg-surface-gray rounded w-full"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : activeEnquiries.length === 0 ? (
              <div className="text-center p-12 bg-white rounded-xl border border-border-subtle shadow-sm flex flex-col items-center justify-center">
                <span className="material-symbols-outlined text-[48px] text-outline mb-4">forum</span>
                <h3 className="font-headline-md text-headline-md text-ameefar-navy mb-2">No active negotiations</h3>
                <p className="text-body-md text-on-surface-variant max-w-sm">You don't have any incoming negotiations at the moment.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeEnquiries.map((enquiry) => (
                  <Link
                    key={enquiry.id}
                    href={`/bidding/seller/negotiation/${enquiry.id}`}
                    className="block bg-white p-6 rounded-xl border border-border-subtle hover:border-primary transition-colors group shadow-sm"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-ameefar-navy group-hover:text-primary transition-colors">
                          {enquiry.listing_name}
                        </h3>

                      </div>
                      <div className="text-right">
                        <span className="px-3 py-1 bg-surface-container-high text-primary rounded-full text-[12px] font-bold uppercase">
                          {enquiry.status}
                        </span>
                        <p className="font-bold text-ameefar-navy mt-2">{enquiry.total_value} {enquiry.currency}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-headline-md text-headline-md text-ameefar-navy">Active Trades</h2>
            </div>

            {status.listTrades === "loading" ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="block bg-white p-6 rounded-xl border border-border-subtle shadow-sm animate-pulse">
                    <div className="flex justify-between items-center">
                      <div className="space-y-3 w-1/2">
                        <div className="h-5 bg-surface-gray rounded w-3/4"></div>
                        <div className="h-4 bg-surface-gray rounded w-1/2"></div>
                      </div>
                      <div className="space-y-3 flex flex-col items-end w-1/4">
                        <div className="h-6 bg-surface-gray rounded-full w-20"></div>
                        <div className="h-5 bg-surface-gray rounded w-full"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : activeTrades.length === 0 ? (
              <div className="text-center p-12 bg-white rounded-xl border border-border-subtle shadow-sm flex flex-col items-center justify-center">
                <span className="material-symbols-outlined text-[48px] text-outline mb-4">inventory_2</span>
                <h3 className="font-headline-md text-headline-md text-ameefar-navy mb-2">No active trades</h3>
                <p className="text-body-md text-on-surface-variant max-w-sm">You don't have any ongoing trades at the moment.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeTrades.map((trade) => (
                  <Link
                    key={trade.id}
                    href={`/bidding/seller/trade/${trade.id}`}
                    className="block bg-white p-6 rounded-xl border border-border-subtle hover:border-primary transition-colors group shadow-sm"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-ameefar-navy group-hover:text-primary transition-colors">
                          {trade.listing_name}
                        </h3>
                        <p className="text-body-sm text-on-surface-variant">
                          Ref: {trade.reference} • Buyer: Confidential
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="px-3 py-1 bg-trust-green-subtle text-secondary rounded-full text-[12px] font-bold uppercase">
                          {trade.status.replace("_", " ")}
                        </span>
                        <p className="font-bold text-ameefar-navy mt-2">{trade.total_value} {trade.currency}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
