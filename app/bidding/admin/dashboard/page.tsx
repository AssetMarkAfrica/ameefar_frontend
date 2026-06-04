"use client";
import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchAdminOverviewThunk, listTradesThunk } from "@/store/bidding/biddingThunks";
import BiddingSidebar from "@/components/bidding/BiddingSidebar";

export default function AdminDashboardPage() {
  const dispatch = useAppDispatch();
  const { adminOverview, status } = useAppSelector((state) => state.bidding);

  useEffect(() => {
    dispatch(fetchAdminOverviewThunk({ token: "placeholder" })); // Token handled properly if using an interceptor, assuming thunk uses it
    dispatch(listTradesThunk({}));
  }, [dispatch]);

  return (
    <div className="flex w-full min-h-screen bg-surface-gray font-body-md text-on-surface">
      <BiddingSidebar role="admin" />
      <main className="md:ml-64 pt-16 min-h-screen flex flex-col w-full">
        <div className="flex-1 p-8 max-w-container-max mx-auto w-full">
          <h1 className="font-headline-lg text-headline-lg text-primary mb-8">Admin Dashboard</h1>

          {status.fetchAdminOverview === "loading" || !adminOverview ? (
            <div className="p-8 text-center animate-pulse text-on-surface-variant">Loading overview...</div>
          ) : (
            <div className="space-y-12">
              
              <section>
                <h2 className="font-headline-md text-headline-md text-ameefar-navy mb-6">Overview Statistics</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-xl border border-border-subtle shadow-sm flex flex-col justify-center items-center">
                    <span className="text-display-lg font-bold text-primary mb-2">
                      {Object.values(adminOverview.trades).reduce((a, b) => a + b, 0)}
                    </span>
                    <span className="text-body-sm text-outline uppercase tracking-wider">Total Trades</span>
                  </div>
                  <div className="bg-white p-6 rounded-xl border border-border-subtle shadow-sm flex flex-col justify-center items-center">
                    <span className="text-display-lg font-bold text-ameefar-navy mb-2">
                      {Object.values(adminOverview.enquiries).reduce((a, b) => a + b, 0)}
                    </span>
                    <span className="text-body-sm text-outline uppercase tracking-wider">Total Enquiries</span>
                  </div>
                  <div className="bg-error-container p-6 rounded-xl border border-error/20 flex flex-col justify-center items-center">
                    <span className="text-display-lg font-bold text-error mb-2">
                      {adminOverview.pending_disputes}
                    </span>
                    <span className="text-body-sm text-error uppercase tracking-wider">Pending Disputes</span>
                  </div>
                </div>
              </section>

              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-headline-md text-headline-md text-ameefar-navy">Disputes & Interventions</h2>
                </div>
                <div className="bg-white rounded-xl border border-border-subtle shadow-sm p-8 text-center text-on-surface-variant italic">
                  Dispute management table placeholder. (Uses trades filtered by status="disputed").
                </div>
              </section>

              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-headline-md text-headline-md text-ameefar-navy">Inspections</h2>
                </div>
                <div className="bg-white rounded-xl border border-border-subtle shadow-sm p-8 text-center text-on-surface-variant italic">
                  Inspection management table placeholder.
                </div>
              </section>

            </div>
          )}
        </div>
      </main>
    </div>
  );
}
