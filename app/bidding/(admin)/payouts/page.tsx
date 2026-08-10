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

      <main className="flex-1 flex flex-col w-full min-w-0 min-h-screen">
        {/* Page Header */}
        <div className="bg-white border-b border-border-subtle sticky top-0 z-10 px-4 sm:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-primary leading-tight">
              Pending Payouts
            </h1>
            <p className="text-body-sm text-on-surface-variant mt-0.5">
              Review and approve seller payouts for completed trades.
            </p>
          </div>
        </div>

        <div className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">
          {error && (
            <div className="bg-error-container text-error p-4 rounded-xl mb-6 border border-error/20 flex items-start gap-3">
              <span className="material-symbols-outlined shrink-0">error</span>
              <p className="text-body-md">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {status.listPendingPayouts === "loading" ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <span className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-body-md text-on-surface-variant animate-pulse">
                Loading pending payouts...
              </p>
            </div>
          ) : pendingPayouts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-border-subtle shadow-sm p-12 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-surface-gray flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-3xl text-on-surface-variant">
                  payments
                </span>
              </div>
              <h3 className="font-headline-sm text-primary mb-2">No Pending Payouts</h3>
              <p className="text-body-md text-on-surface-variant max-w-md">
                You're all caught up! There are currently no seller payouts waiting for approval.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop View: Table */}
              <div className="hidden md:block bg-white rounded-2xl border border-border-subtle shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
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
                      {pendingPayouts.map((payout) => (
                        <tr key={payout.id} className="hover:bg-slate-50 transition-colors group">
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1.5 font-label-md text-primary font-bold bg-primary/5 px-2 py-1 rounded-md">
                              <span className="material-symbols-outlined text-[16px] text-primary">tag</span>
                              {payout.trade_reference}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-bold text-primary">{payout.seller_name}</p>
                            <p className="text-body-sm text-on-surface-variant">{payout.seller_email}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-headline-sm text-primary font-bold">
                              {payout.currency} {payout.amount_major}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-body-sm text-on-surface-variant">
                            {new Date(payout.created_at).toLocaleString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {payout.status === "pending" ? (
                              <button
                                onClick={() => handleApproveClick(payout.id)}
                                disabled={status.approvePayout === "loading"}
                                className="px-5 py-2.5 bg-secondary text-on-secondary font-bold rounded-xl hover:bg-secondary/90 hover:shadow-md transition-all active:scale-[0.98] text-sm disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                              >
                                {status.approvePayout === "loading" && selectedPayoutId === payout.id ? (
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
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile View: Cards */}
              <div className="md:hidden space-y-4">
                {pendingPayouts.map((payout) => (
                  <div key={payout.id} className="bg-white rounded-2xl border border-border-subtle shadow-sm p-4 flex flex-col gap-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex flex-col gap-1 min-w-0">
                        <span className="inline-flex items-center self-start gap-1 font-label-sm text-primary font-bold bg-primary/5 px-2 py-1 rounded-md mb-1">
                          <span className="material-symbols-outlined text-[14px] text-primary">tag</span>
                          {payout.trade_reference}
                        </span>
                        <p className="font-bold text-primary truncate">{payout.seller_name}</p>
                        <p className="text-body-sm text-on-surface-variant truncate">{payout.seller_email}</p>
                      </div>
                      <div className="text-right shrink-0 flex flex-col items-end">
                        <span className="font-headline-sm text-primary font-bold block">
                          {payout.currency} {payout.amount_major}
                        </span>
                        <span className="text-[11px] text-on-surface-variant uppercase tracking-wider mt-1 block">
                          {new Date(payout.created_at).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border-subtle">
                      {payout.status === "pending" ? (
                        <button
                          onClick={() => handleApproveClick(payout.id)}
                          disabled={status.approvePayout === "loading"}
                          className="w-full py-3 bg-secondary text-on-secondary font-bold rounded-xl hover:bg-secondary/90 active:scale-[0.98] transition-all text-sm disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                        >
                          {status.approvePayout === "loading" && selectedPayoutId === payout.id ? (
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <span className="material-symbols-outlined text-[18px]">check_circle</span>
                          )}
                          Approve Payout
                        </button>
                      ) : (
                        <span className="w-full py-2 bg-trust-green-subtle text-secondary font-label-md text-xs rounded-xl uppercase tracking-wider text-center block">
                          {payout.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Confirmation Modal */}
          {selectedPayoutId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 sm:p-8">
                  <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-5 border border-amber-100">
                    <span className="material-symbols-outlined text-3xl">info</span>
                  </div>
                  <h3 className="font-headline-md text-headline-md text-primary mb-3">
                    Approve Payout?
                  </h3>
                  <p className="text-body-md text-on-surface-variant leading-relaxed">
                    This action will initiate the transfer of funds to the seller's account. Please verify the trade details before proceeding, as this action cannot be undone.
                  </p>
                </div>
                <div className="px-6 py-5 bg-surface-gray border-t border-border-subtle flex flex-col-reverse sm:flex-row justify-end gap-3">
                  <button
                    onClick={closeApproveModal}
                    disabled={status.approvePayout === "loading"}
                    className="w-full sm:w-auto px-5 py-2.5 bg-white border border-border-subtle text-primary font-bold rounded-xl hover:bg-slate-50 active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmApprove}
                    disabled={status.approvePayout === "loading"}
                    className="w-full sm:w-auto px-6 py-2.5 bg-secondary text-on-secondary font-bold rounded-xl hover:bg-secondary/90 active:scale-[0.98] shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
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
        </div>
      </main>
    </div>
  );
}
