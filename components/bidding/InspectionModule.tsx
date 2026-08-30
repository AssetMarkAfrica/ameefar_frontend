"use client";
import { usePathname } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { selectIsAdmin, selectIsSeller, selectIsBoth } from "@/store/auth/authSelectors";
import InspectionReportCard from "@/components/bidding/InspectionReportCard";
import type { InspectionStatus, InspectionReport } from "@/types/bidding";
import type { TradePaymentSummary } from "@/types/payment";

interface InspectionModuleProps {
  status: InspectionStatus | null;
  role?: "buyer" | "seller" | "admin";
  report?: InspectionReport | null;
  paymentSummary?: TradePaymentSummary | null;
  onRequest?: () => void;
  onSkip?: () => void;
  onApprove?: () => void;
  onReject?: (reason: string) => void;
  onContinue?: () => void;
  onPayInspectionFee?: () => void;
  isActionLoading?: boolean;
}

export default function InspectionModule({
  status,
  report,
  paymentSummary,
  onRequest,
  onSkip,
  onApprove,
  onReject,
  onContinue,
  onPayInspectionFee,
  isActionLoading,
  role: propRole,
}: InspectionModuleProps) {
  const pathname = usePathname();
  const isAdmin = useAppSelector(selectIsAdmin);
  const isGlobalSeller = useAppSelector(selectIsSeller);
  const isBoth = useAppSelector(selectIsBoth);

  let role = propRole || "buyer";
  if (!propRole) {
    if (isAdmin) role = "admin";
    else if (isBoth) role = pathname?.includes("/seller") ? "seller" : "buyer";
    else if (isGlobalSeller) role = "seller";
  }

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
            {status?.replace(/_/g, " ") ?? "Not Requested"}
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
          <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-secondary/30 bg-secondary/10 px-5 py-3.5">
            <span className="text-[11px] font-bold uppercase tracking-widest text-secondary">Inspection Fee</span>
            <span className="text-[20px] font-black text-secondary leading-none">
              {paymentSummary?.inspection_fee_amount ? `GHS ${paymentSummary.inspection_fee_amount}` : "TBD by Admin"}
            </span>
          </div>
        </div>
      )}

      {role === "buyer" && status === "requested" && paymentSummary?.inspection_fee_paid === false && (
        <div className="space-y-3">
          <div className="p-3 bg-secondary/10 rounded-lg text-secondary text-sm mb-4">
            You requested an inspection. Please pay the inspection fee to proceed.
          </div>
          <button
            onClick={onPayInspectionFee}
            disabled={isActionLoading}
            className="w-full bg-secondary text-on-secondary font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
          >
            <span className="material-symbols-outlined">payments</span>
            Pay Inspection Fee
          </button>
        </div>
      )}

      {role === "buyer" && status === "requested" && paymentSummary?.inspection_fee_paid === true && (
        <div className="space-y-3">
          <div className="p-3 bg-secondary/10 rounded-lg text-secondary text-sm mb-4">
            Inspection fee paid. Awaiting admin scheduling.
          </div>
        </div>
      )}

      {role === "buyer" && status === "awaiting_requirements" && (
        <div className="space-y-4">
          <div className="p-3 bg-secondary/10 rounded-lg text-secondary text-sm">
            Your inspection request has been received. Please complete the requirements form so the admin can schedule an inspector.
          </div>
          <button
            onClick={onContinue}
            className="w-full flex items-center justify-between gap-4 bg-ameefar-navy text-white rounded-xl px-6 py-4 shadow-md hover:bg-ameefar-navy/90 active:scale-[0.99] transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">assignment</span>
              </div>
              <div className="text-left">
                <p className="font-black text-white text-body-md leading-tight">Inspection Setup Pending</p>
                <p className="text-white/60 text-[12px] mt-0.5">Tap to complete the requirements form</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-secondary text-[28px] shrink-0">arrow_forward</span>
          </button>
        </div>
      )}

      {role === "buyer" && (status === "scheduled" || status === "in_progress") && (
        <div className="p-3 bg-secondary/10 rounded-lg text-secondary text-sm">
          {status === "scheduled"
            ? "Inspection has been scheduled by the admin. Please stand by."
            : "Inspection is currently in progress. Results will be available shortly."}
        </div>
      )}

      {role === "buyer" && status === "passed" && (
        <div className="p-3 bg-secondary/10 rounded-lg text-secondary text-sm mb-4">
          Inspection has passed! Please review the report below and approve to proceed.
        </div>
      )}

      {role === "buyer" && status === "failed" && (
        <div className="p-3 bg-error-container/50 rounded-lg text-error text-sm mb-4">
          Inspection has failed. Review the report and reject to raise a dispute or cancel the trade.
        </div>
      )}

      {role === "seller" && ["requested", "awaiting_requirements", "scheduled", "in_progress"].includes(status || "") && (
        <p className="text-sm text-on-secondary-fixed-variant bg-white/50 p-3 rounded-lg">
          The buyer has requested an inspection. The platform admin will assign an inspector to verify the shipment.
        </p>
      )}

      {role === "admin" && status === "not_requested" && (
        <p className="text-sm text-on-secondary-fixed-variant bg-white/50 p-3 rounded-lg">
          Awaiting buyer to request or skip inspection.
        </p>
      )}

      {role === "admin" && status === "requested" && (
        <p className="text-sm text-on-secondary-fixed-variant bg-white/50 p-3 rounded-lg">
          {paymentSummary?.inspection_fee_paid
            ? "Inspection fee paid. Awaiting admin scheduling."
            : "Buyer requested inspection. Awaiting fee payment."}
        </p>
      )}

      {role === "admin" && status === "scheduled" && (
        <p className="text-sm text-on-secondary-fixed-variant bg-white/50 p-3 rounded-lg">
          Inspection scheduled. Awaiting inspection completion and results.
        </p>
      )}

      {/* Universal Report Display - visible to all parties when a report exists in these final states */}
      {["passed", "failed", "buyer_approved", "buyer_rejected"].includes(status || "") && report && (
        <InspectionReportCard
          report={report}
          showActions={role === "buyer" && (status === "passed" || status === "failed")}
          onApprove={onApprove}
          onReject={onReject}
          isActionLoading={isActionLoading}
        />
      )}
    </div>
  );
}
