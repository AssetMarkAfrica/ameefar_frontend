"use client";
import { usePathname } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { selectIsAdmin, selectIsSeller, selectIsBoth } from "@/store/auth/authSelectors";
import InspectionReportCard from "@/components/bidding/InspectionReportCard";
import type { InspectionStatus, InspectionReport } from "@/types/bidding";
import type { TradePaymentSummary } from "@/types/payment";

interface InspectionModuleProps {
  status: InspectionStatus;
  role?: "buyer" | "seller" | "admin";
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
  report,
  paymentSummary,
  onRequest,
  onSkip,
  onApprove,
  onReject,
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

      {role === "buyer" && status === "awaiting_requirements" && (
        <div className="p-3 bg-secondary/10 rounded-lg text-secondary text-sm">
          Please complete the inspection requirements form to proceed.
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
        <div className="space-y-4">
          <div className="p-3 bg-secondary/10 rounded-lg text-secondary text-sm">
            Inspection has passed! Please review the report below and approve to proceed.
          </div>
          {report && (
            <InspectionReportCard
              report={report}
              showActions={true}
              onApprove={onApprove}
              onReject={onReject}
              isActionLoading={isActionLoading}
            />
          )}
        </div>
      )}

      {role === "buyer" && status === "failed" && (
        <div className="space-y-4">
          <div className="p-3 bg-error-container/50 rounded-lg text-error text-sm">
            Inspection has failed. Review the report and reject to raise a dispute or cancel the trade.
          </div>
          {report && (
            <InspectionReportCard
              report={report}
              showActions={true}
              onApprove={onApprove}
              onReject={onReject}
              isActionLoading={isActionLoading}
            />
          )}
        </div>
      )}

      {role === "seller" && status !== "not_requested" && status !== "skipped" && (
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

      {role === "admin" && (status === "passed" || status === "failed" || status === "buyer_approved" || status === "buyer_rejected") && report && (
        <InspectionReportCard report={report} showActions={false} />
      )}
    </div>
  );
}
