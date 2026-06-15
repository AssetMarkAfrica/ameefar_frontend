"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { listEnquiriesThunk } from "@/store/bidding/biddingThunks";
import { selectAccessToken } from "@/store/auth/authSelectors";

export default function SellerNegotiationsPage() {
  const dispatch = useAppDispatch();
  const { enquiries, status } = useAppSelector((state) => state.bidding);
  const token = useAppSelector(selectAccessToken);

  useEffect(() => {
    if (!token) return;
    dispatch(listEnquiriesThunk({ token, params: { role: "seller" } }));
  }, [dispatch, token]);

  return (
    <div className="flex w-full min-h-screen bg-surface-gray font-body-md text-on-surface">
      <main className="pt-16 min-h-screen flex flex-col w-full">
        <div className="flex-1 p-8 max-w-container-max mx-auto w-full">
          <h1 className="font-headline-lg text-headline-lg text-primary mb-8">Incoming Negotiations</h1>

          <div className="bg-white rounded-xl border border-border-subtle shadow-sm overflow-hidden">
            {status.listEnquiries === "loading" ? (
              <div className="p-8 text-center animate-pulse text-on-surface-variant">Loading negotiations...</div>
            ) : enquiries.length === 0 ? (
              <div className="p-12 text-center text-on-surface-variant italic">
                You have no incoming negotiations yet.
              </div>
            ) : (
              <div className="divide-y divide-border-subtle">
                {enquiries.map((enquiry) => (
                  <div key={enquiry.id} className="p-6 hover:bg-surface-gray transition-colors group flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-ameefar-navy group-hover:text-primary transition-colors mb-1">
                        {enquiry.listing_name}
                      </h3>
                      <div className="flex items-center gap-4 text-body-sm text-on-surface-variant">
                        <span>Ref: {enquiry.reference}</span>
                        <span>•</span>
                        <span>Buyer: {enquiry.initiator_name}</span>
                        <span>•</span>
                        <span>{new Date(enquiry.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-[12px] font-bold uppercase ${enquiry.status === 'accepted' ? 'bg-trust-green-subtle text-secondary' :
                            enquiry.status === 'declined' || enquiry.status === 'withdrawn' ? 'bg-error-container text-error' :
                              'bg-surface-container-high text-primary'
                          }`}>
                          {enquiry.status}
                        </span>
                        <p className="font-bold text-ameefar-navy mt-2">{enquiry.total_value} {enquiry.currency}</p>
                      </div>
                      <Link
                        href={`/bidding/seller/negotiation/${enquiry.id}`}
                        className="p-2 text-outline hover:text-primary hover:bg-surface-container-low rounded-lg transition-colors"
                      >
                        <span className="material-symbols-outlined">chevron_right</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
