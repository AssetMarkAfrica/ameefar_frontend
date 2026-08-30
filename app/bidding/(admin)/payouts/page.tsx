"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { listPayoutsThunk, approvePayoutThunk } from "@/store/payment/paymentThunks";
import { selectAccessToken } from "@/store/auth/authSelectors";
import BiddingSidebar from "@/components/bidding/BiddingSidebar";

const STATUS_STYLES = {
  pending: {
    badge: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
    dot: "bg-amber-500",
  },
  success: {
    badge: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
    dot: "bg-emerald-500",
  },
  failed: {
    badge: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200",
    dot: "bg-red-500",
  },
  default: {
    badge: "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200",
    dot: "bg-slate-400",
  },
} as const;

function classifyStatus(rawStatus: string): keyof typeof STATUS_STYLES {
  const normalized = rawStatus?.toLowerCase();
  if (normalized === "pending") return "pending";
  if (["success", "successful", "completed", "paid", "approved"].includes(normalized)) return "success";
  if (["failed", "declined", "rejected", "error"].includes(normalized)) return "failed";
  return "default";
}

function StatusBadge({ status }: { status: string }) {
  const key = classifyStatus(status);
  const s = STATUS_STYLES[key];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider ${s.badge}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status || "Unknown"}
    </span>
  );
}

export default function AdminPayoutsPage() {
  const dispatch = useAppDispatch();
  const { payouts, status, error } = useAppSelector((state) => state.payment);
  const token = useAppSelector(selectAccessToken);

  const [selectedPayoutId, setSelectedPayoutId] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      dispatch(listPayoutsThunk());
    }
  }, [dispatch, token]);

  const summary = useMemo(() => {
    const counts = { pending: 0, success: 0, failed: 0 };
    for (const p of payouts) {
      const key = classifyStatus(p.status);
      if (key === "pending") counts.pending += 1;
      else if (key === "success") counts.success += 1;
      else if (key === "failed") counts.failed += 1;
    }
    return counts;
  }, [payouts]);

  const handleApproveClick = (payoutId: string) => {
    setSelectedPayoutId(payoutId);
  };

  const confirmApprove = async () => {
    if (!token || !selectedPayoutId) return;

    await dispatch(approvePayoutThunk(selectedPayoutId));
    dispatch(listPayoutsThunk());
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
              All Payouts
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
          {status.listPayouts === "loading" ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <span className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-body-md text-on-surface-variant animate-pulse">
                Loading payouts...
              </p>
            </div>
          ) : payouts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-border-subtle shadow-sm p-12 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-surface-gray flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-3xl text-on-surface-variant">
                  payments
                </span>
              </div>
              <h3 className="font-headline-sm text-primary mb-2">No Payouts</h3>
              <p className="text-body-md text-on-surface-variant max-w-md">
                There are currently no seller payouts available.
              </p>
            </div>
          ) : (
            <>
              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
                <div className="bg-white rounded-2xl border border-border-subtle shadow-sm p-4 sm:p-5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 ring-1 ring-inset ring-amber-200 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px] text-amber-600">schedule</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-2xl font-extrabold text-primary leading-none">{summary.pending}</p>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mt-1">Pending</p>
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-border-subtle shadow-sm p-4 sm:p-5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 ring-1 ring-inset ring-emerald-200 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px] text-emerald-600">check_circle</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-2xl font-extrabold text-primary leading-none">{summary.success}</p>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mt-1">Success</p>
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-border-subtle shadow-sm p-4 sm:p-5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-50 ring-1 ring-inset ring-red-200 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px] text-red-600">cancel</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-2xl font-extrabold text-primary leading-none">{summary.failed}</p>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mt-1">Failed</p>
                  </div>
                </div>
              </div>

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
                        <th className="px-6 py-4 font-bold">Status</th>
                        <th className="px-6 py-4 font-bold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle">
                      {payouts.map((payout) => {
                        const isPending = classifyStatus(payout.status) === "pending";
                        return (
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
                            <td className="px-6 py-4">
                              <StatusBadge status={payout.status} />
                            </td>
                            <td className="px-6 py-4 text-right">
                              {isPending ? (
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
                                <span className="text-body-sm text-on-surface-variant">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile View: Cards */}
              <div className="md:hidden space-y-4">
                {payouts.map((payout) => {
                  const isPending = classifyStatus(payout.status) === "pending";
                  return (
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

                      <div className="pt-4 border-t border-border-subtle flex items-center justify-between gap-3">
                        <StatusBadge status={payout.status} />
                        {isPending && (
                          <button
                            onClick={() => handleApproveClick(payout.id)}
                            disabled={status.approvePayout === "loading"}
                            className="flex-1 py-3 bg-secondary text-on-secondary font-bold rounded-xl hover:bg-secondary/90 active:scale-[0.98] transition-all text-sm disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                          >
                            {status.approvePayout === "loading" && selectedPayoutId === payout.id ? (
                              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <span className="material-symbols-outlined text-[18px]">check_circle</span>
                            )}
                            Approve
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
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
                    This will mark the payout as successful. Please verify the trade details before proceeding, as this action cannot be undone.
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