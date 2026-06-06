"use client";
import React from "react";
import type { TradePaymentSummary } from "@/types/payment";

interface PaymentModalProps {
  type: "trade" | "inspection";
  summary?: TradePaymentSummary | null;
  authorizationUrl: string | null;
  paystackReference: string | null;
  isInitiating: boolean;
  isVerifying: boolean;
  onInitiate: () => void;
  onVerify: () => void;
  onClose: () => void;
}

export default function PaymentModal({
  type,
  summary,
  authorizationUrl,
  paystackReference,
  isInitiating,
  isVerifying,
  onInitiate,
  onVerify,
  onClose,
}: PaymentModalProps) {
  const isInspection = type === "inspection";

  const title = isInspection ? "Inspection Fee Payment" : "Trade Payment";
  const description = isInspection
    ? "A one-time inspection fee is required to schedule the inspector."
    : "Complete the trade payment to unlock contract signing. The fee covers the product cost plus the platform service fee.";

  const amount = isInspection
    ? summary?.inspection_fee_amount ?? "25.00"
    : summary?.trade_payment_amount;

  const isPaid = isInspection
    ? summary?.inspection_fee_paid
    : summary?.trade_payment_paid;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className={`px-6 py-5 ${isInspection ? "bg-trust-green-subtle border-b border-secondary/20" : "bg-ameefar-navy"}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className={`material-symbols-outlined text-[28px] ${isInspection ? "text-secondary" : "text-on-primary"}`}>
                {isInspection ? "fact_check" : "payments"}
              </span>
              <h2 className={`font-headline-md text-headline-md ${isInspection ? "text-secondary" : "text-on-primary"}`}>
                {title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className={`w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/10 transition-colors ${isInspection ? "text-secondary" : "text-on-primary"}`}
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <p className="text-body-md text-on-surface-variant">{description}</p>

          {/* Payment Breakdown */}
          {summary && !isInspection && (
            <div className="bg-surface-gray rounded-xl p-4 space-y-3">
              <h3 className="font-label-md text-label-md text-outline uppercase tracking-wide">Payment Breakdown</h3>
              <div className="flex justify-between text-body-md">
                <span className="text-on-surface-variant">Product Total</span>
                <span className="font-bold text-primary">{summary.trade_total_amount}</span>
              </div>
              <div className="flex justify-between text-body-md">
                <span className="text-on-surface-variant">Platform Fee ({summary.platform_fee_percent}%)</span>
                <span className="font-bold text-primary">{summary.platform_fee_amount}</span>
              </div>
              <div className="border-t border-border-subtle pt-3 flex justify-between text-body-lg font-bold">
                <span className="text-primary">Total to Pay</span>
                <span className="text-ameefar-navy">{summary.trade_payment_amount}</span>
              </div>
            </div>
          )}

          {/* Inspection fee simple display */}
          {isInspection && amount && (
            <div className="bg-surface-gray rounded-xl p-4 flex justify-between items-center">
              <span className="text-on-surface-variant font-body-md">Inspection Fee</span>
              <span className="font-bold text-ameefar-navy text-body-lg">GHS {amount}</span>
            </div>
          )}

          {isPaid ? (
            <div className="flex items-center gap-3 bg-trust-green-subtle border border-secondary/20 rounded-xl p-4">
              <span className="material-symbols-outlined text-secondary text-[24px]">check_circle</span>
              <p className="text-body-md font-bold text-secondary">Payment Confirmed</p>
            </div>
          ) : authorizationUrl ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
                <span className="material-symbols-outlined text-amber-600 text-[18px]">info</span>
                <p className="text-body-sm text-amber-700">
                  Payment window opened. After completing payment, click Verify below.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => window.open(authorizationUrl, "_blank")}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-ameefar-navy text-on-primary font-bold rounded-xl hover:opacity-90 transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                  Re-open Payment
                </button>
                <button
                  onClick={onVerify}
                  disabled={isVerifying || !paystackReference}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-secondary text-on-secondary font-bold rounded-xl hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isVerifying ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                  )}
                  {isVerifying ? "Verifying..." : "Verify Payment"}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={onInitiate}
              disabled={isInitiating}
              className="w-full flex items-center justify-center gap-2 py-4 bg-ameefar-navy text-on-primary font-bold rounded-xl hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 text-body-lg"
            >
              {isInitiating ? (
                <>
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Initializing...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">credit_card</span>
                  Pay Now via Paystack
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
