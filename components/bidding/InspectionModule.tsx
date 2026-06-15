"use client";
import React from "react";
import type { InspectionStatus, InspectionReport } from "@/types/bidding";
import type { TradePaymentSummary } from "@/types/payment";

interface InspectionModuleProps {
  status: InspectionStatus;
  role: "buyer" | "seller" | "admin";
  report?: InspectionReport | null;
  paymentSummary?: TradePaymentSummary | null;
  onRequest?: () => void;
  onSkip?: () => void;
  onApprove?: () => void;
  onReject?: (reason: string) => void;
  isActionLoading?: boolean;
}

export default function InspectionModule({
  status,
  role,
  report,
  paymentSummary,
  onRequest,
  onSkip,
  onApprove,
  onReject,
  isActionLoading,
}: InspectionModuleProps) {
  return (
    <div className="bg-trust-green-subtle rounded-xl border border-secondary/20 p-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="material-symbols-outlined text-secondary text-[28px]">
          verified_user
        </span>
        <h2 className="font-headline-md text-headline-md text-secondary">
          Inspection Module
        </h2>
      </div>

      <div className="mb-6">
        <p className="font-body-sm text-body-sm text-on-secondary-fixed-variant mb-2">
          Ensure material quality matches specifications upon arrival.
        </p>
        <div className="flex items-center gap-2">
          <span className="font-label-md text-label-md uppercase text-secondary">Status:</span>
          <span className="font-bold text-ameefar-navy capitalize">
            {status.replace("_", " ")}
          </span>
        </div>
      </div>

      {role === "buyer" && status === "not_requested" && (
        <div className="space-y-3">
          <button
            onClick={onRequest}
            disabled={isActionLoading}
            className="w-full bg-secondary text-on-secondary font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
          >
            <span className="material-symbols-outlined">assignment_turned_in</span>
            Request Inspection
          </button>
          <button
            onClick={onSkip}
            disabled={isActionLoading}
            className="w-full bg-white border border-border-subtle text-on-surface-variant font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-surface-gray transition-all active:scale-95 disabled:opacity-50"
          >
            Skip Inspection
          </button>
          <p className="mt-4 text-center font-label-md text-label-md text-on-secondary-fixed-variant/60">
            Estimated cost: {paymentSummary?.inspection_fee_amount ? `$${paymentSummary.inspection_fee_amount}` : "Determined by Admin"}
          </p>
        </div>
      )}

      {role === "buyer" && status === "requested" && paymentSummary?.inspection_fee_paid === false && (
        <div className="space-y-3">
          <div className="p-3 bg-secondary/10 rounded-lg text-secondary text-sm mb-4">
            You requested an inspection. Please pay the inspection fee to proceed.
          </div>
        </div>
      )}

      {role === "buyer" && status === "requested" && paymentSummary?.inspection_fee_paid === true && (
        <div className="space-y-3">
          <div className="p-3 bg-secondary/10 rounded-lg text-secondary text-sm mb-4">
            Inspection fee paid. Awaiting admin scheduling.
          </div>
        </div>
      )}

      {role === "buyer" && status === "buyer_approved" && (
        <div className="space-y-3">
          <div className="p-3 bg-secondary/10 rounded-lg text-secondary text-sm mb-4">
            Inspection has passed! Please review the report and approve to proceed with settlement.
          </div>
          {report && (
            <div className="bg-white p-4 rounded-lg border border-border-subtle mb-4">
              <h4 className="font-bold text-ameefar-navy mb-2">Inspection Report</h4>
              <p className="text-sm text-on-surface-variant mb-2"><span className="font-semibold">Verdict:</span> {report.verdict}</p>
              <p className="text-sm text-on-surface-variant mb-2"><span className="font-semibold">Summary:</span> {report.summary}</p>
              <p className="text-sm text-on-surface-variant mb-2"><span className="font-semibold">Findings:</span> {report.findings}</p>
            </div>
          )}
          <button
            onClick={onApprove}
            disabled={isActionLoading}
            className="w-full bg-secondary text-on-secondary font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
          >
            <span className="material-symbols-outlined">thumb_up</span>
            Approve Inspection
          </button>
        </div>
      )}

      {role === "buyer" && status === "failed" && (
        <div className="space-y-3">
          <div className="p-3 bg-error-container/50 rounded-lg text-error text-sm mb-4">
            Inspection has failed. You can reject the inspection and raise a dispute or cancel the trade.
          </div>
          {report && (
            <div className="bg-white p-4 rounded-lg border border-border-subtle mb-4">
              <h4 className="font-bold text-ameefar-navy mb-2">Inspection Report</h4>
              <p className="text-sm text-on-surface-variant mb-2"><span className="font-semibold">Verdict:</span> {report.verdict}</p>
              <p className="text-sm text-on-surface-variant mb-2"><span className="font-semibold">Summary:</span> {report.summary}</p>
              <p className="text-sm text-on-surface-variant mb-2"><span className="font-semibold">Findings:</span> {report.findings}</p>
            </div>
          )}
          <button
            onClick={() => onReject?.("Failed quality standards")} // In a real app, open a modal for reason
            disabled={isActionLoading}
            className="w-full bg-error text-on-error font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
          >
            <span className="material-symbols-outlined">thumb_down</span>
            Reject Inspection
          </button>
        </div>
      )}

      {role === "seller" && status !== "not_requested" && status !== "skipped" && (
        <p className="text-sm text-on-secondary-fixed-variant bg-white/50 p-3 rounded-lg">
          The buyer has requested an inspection. The platform admin will assign an inspector to verify the shipment.
        </p>
      )}
    </div>
  );
}
