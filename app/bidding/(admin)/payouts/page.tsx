"use client";
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { listPendingPayoutsThunk, approvePayoutThunk } from "@/store/payment/paymentThunks";
import { selectAccessToken } from "@/store/auth/authSelectors";
import BiddingSidebar from "@/components/bidding/BiddingSidebar";

export default function AdminPayoutsPage() {
  const dispatch = useAppDispatch();
  const { pendingPayouts, status, error } = useAppSelector((state) => state.payment);
  const token = useAppSelector(selectAccessToken);

  // State for the confirmation modal
  const [selectedPayoutId, setSelectedPayoutId] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      dispatch(listPendingPayoutsThunk());
    }
  }, [dispatch, token]);

  const handleApproveClick = (payoutId: string) => {
    setSelectedPayoutId(payoutId);
  };

  const confirmApprove = async () => {
    if (!token || !selectedPayoutId) return;
    
    await dispatch(approvePayoutThunk(selectedPayoutId));
    // Re-fetch after approve to reflect updated list
    dispatch(listPendingPayoutsThunk());
    setSelectedPayoutId(null);
  };

  const closeApproveModal = () => {
    if (status.approvePayout === "loading") return;
    setSelectedPayoutId(null);
  };

  return (
    <div className="flex w-full min-h-screen bg-surface-gray font-body-md text-on-surface">
      <BiddingSidebar role="admin" />
      <main className="pt-16 min-h-screen flex flex-col w-full">
        <div className="flex-1 p-8 max-w-container-max mx-auto w-full">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="font-headline-lg text-headline-lg text-primary">Pending Payouts</h1>
              <p className="text-body-md text-on-surface-variant mt-1">Review and approve seller payouts for completed trades.</p>
            </div>
          </div>

          {error && (
            <div className="bg-error-container text-error p-4 rounded-lg mb-6 border border-error/20">
              {error}
            </div>
          )}

          {/* Confirmation Modal */}
          {selectedPayoutId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <div className="bg-white rounded-xl shadow-xl border border-border-subtle max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6">
                  <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-2xl">warning</span>
                  </div>
                  <h3 className="font-headline-md text-headline-md text-primary mb-2">Approve Payout</h3>
                  <p className="text-body-md text-on-surface-variant">
                    Are you sure you want to approve this payout? This will initiate the transfer of funds to the seller's account. This action cannot be undone.
                  </p>
                </div>
                <div className="px-6 py-4 bg-surface-gray border-t border-border-subtle flex justify-end gap-3">
                  <button
                    onClick={closeApproveModal}
                    disabled={status.approvePayout === "loading"}
                    className="px-4 py-2 bg-white border border-border-subtle text-primary font-bold rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmApprove}
                    disabled={status.approvePayout === "loading"}
                    className="px-6 py-2 bg-secondary text-on-secondary font-bold rounded-lg hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {status.approvePayout === "loading" ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    )}
                    Confirm Approval
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-border-subtle shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-surface-gray border-b border-border-subtle text-outline uppercase tracking-wider text-label-sm">
                    <th className="px-6 py-4 font-bold">Trade Ref</th>
                    <th className="px-6 py-4 font-bold">Seller</th>
                    <th className="px-6 py-4 font-bold">Amount</th>
                    <th className="px-6 py-4 font-bold">Date Initiated</th>
                    <th className="px-6 py-4 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {status.listPendingPayouts === "loading" ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-on-surface-variant animate-pulse">
                        Loading pending payouts...
                      </td>
                    </tr>
                  ) : pendingPayouts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-on-surface-variant">
                        No pending payouts found.
                      </td>
                    </tr>
                  ) : (
                    pendingPayouts.map((payout) => (
                      <tr key={payout.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-label-md text-primary font-bold">{payout.trade_reference}</span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-primary">{payout.seller_name}</p>
                          <p className="text-body-sm text-on-surface-variant">{payout.seller_email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-label-md text-primary font-bold">{payout.currency} {payout.amount_major}</span>
                        </td>
                        <td className="px-6 py-4 text-body-sm text-on-surface-variant">
                          {new Date(payout.created_at).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {payout.status === "pending" ? (
                            <button
                              onClick={() => handleApproveClick(payout.id)}
                              disabled={status.approvePayout === "loading"}
                              className="px-4 py-2 bg-secondary text-on-secondary font-bold rounded-lg hover:opacity-90 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                            >
                              {status.approvePayout === "loading" ? (
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                              )}
                              Approve
                            </button>
                          ) : (
                            <span className="px-3 py-1 bg-trust-green-subtle text-secondary font-label-md text-[10px] rounded-full uppercase tracking-wider">
                              {payout.status}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
