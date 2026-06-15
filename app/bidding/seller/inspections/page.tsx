"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { listTradesThunk } from "@/store/bidding/biddingThunks";
import { selectAccessToken } from "@/store/auth/authSelectors";

export default function SellerInspectionsPage() {
  const dispatch = useAppDispatch();
  const { trades, status } = useAppSelector((state) => state.bidding);
  const token = useAppSelector(selectAccessToken);

  useEffect(() => {
    if (!token) return;
    dispatch(listTradesThunk({ token, params: { role: "seller" } }));
  }, [dispatch, token]);

  const inspectionTrades = trades.filter(
    (t) => t.status === "agreed" || t.status === "in_progress"
  );

  return (
    <div className="flex-1 p-8 max-w-container-max mx-auto w-full">
      <h1 className="font-headline-lg text-headline-lg text-primary mb-8">
        Inspections
      </h1>

      <div className="bg-white rounded-xl border border-border-subtle shadow-sm overflow-hidden">
        {status.listTrades === "loading" ? (
          <div className="p-8 text-center animate-pulse text-on-surface-variant">
            Loading inspections...
          </div>
        ) : inspectionTrades.length === 0 ? (
          <div className="p-12 text-center text-on-surface-variant italic">
            There are no active inspections for your trades.
          </div>
        ) : (
          <div className="divide-y divide-border-subtle">
            {inspectionTrades.map((trade) => (
              <div
                key={trade.id}
                className="p-6 hover:bg-surface-gray transition-colors group flex items-center justify-between"
              >
                <div>
                  <h3 className="font-bold text-ameefar-navy group-hover:text-primary transition-colors mb-1">
                    {trade.listing_name}
                  </h3>
                  <div className="flex items-center gap-4 text-body-sm text-on-surface-variant">
                    <span>Ref: {trade.reference}</span>
                    <span>•</span>
                    <span>Buyer: {trade.buyer_name}</span>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <Link
                    href={`/bidding/seller/trade/${trade.id}`}
                    className="px-4 py-2 border border-primary text-primary hover:bg-primary hover:text-white rounded-lg font-bold transition-colors text-sm"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}