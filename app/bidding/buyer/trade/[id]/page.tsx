"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectAccessToken } from "@/store/auth/authSelectors";
import {
  fetchTradeThunk,
  agreeTradeTermsThunk,
  listTradeMessagesThunk,
  sendTradeMessageThunk,
  listTradeDocumentsThunk,
  uploadTradeDocumentThunk,
  completeTradeThunk,
  requestInspectionThunk,
  approveInspectionThunk,
  rejectInspectionThunk,
  skipInspectionThunk,
  confirmReceiptThunk,
} from "@/store/bidding/biddingThunks";
import {
  initiateTradePaymentThunk,
  initiateInspectionFeePaymentThunk,
  getTradePaymentSummaryThunk,
  verifyReferenceThunk,
} from "@/store/payment/paymentThunks";
import { clearPaymentState } from "@/store/payment/paymentSlice";
import ChatPanel from "@/components/bidding/ChatPanel";
import TradeStepper from "@/components/bidding/TradeStepper";
import DocumentList from "@/components/bidding/DocumentList";
import InspectionModule from "@/components/bidding/InspectionModule";
import PaymentModal from "@/components/bidding/PaymentModal";
import type { TradeDocumentType } from "@/types/bidding";
import type { InspectionFeePayment } from "@/types/payment";

type ActiveModal = "trade_payment" | "inspection_payment" | null;

export default function BuyerTradePage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const dispatch = useAppDispatch();
  const token = useAppSelector(selectAccessToken);
  const { currentTrade, tradeMessages, tradeDocuments, status, errors } =
    useAppSelector((state) => state.bidding);
  const {
    tradeSummary,
    lastInitiatedPayment,
    loading: paymentLoading,
    error: paymentError,
  } = useAppSelector((state) => state.payment);

  const messages = tradeMessages[id] || [];
  const documents = tradeDocuments[id] || [];
  const tradeStatus = currentTrade?.status;
  const inspectionStatus = currentTrade?.inspection_status;

  const [completeReason, setCompleteReason] = useState("");
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [inspectionFeePayment, setInspectionFeePayment] = useState<InspectionFeePayment | null>(null);
  const [tradePaymentVerified, setTradePaymentVerified] = useState(false);

  const searchParams = useSearchParams();

  // If Paystack redirected back to this page with callback params (shouldn't happen
  // with the corrected callback_url, but handles legacy/browser-back edge cases),
  // immediately forward the user to the dedicated payment-callback route.
  useEffect(() => {
    const reference = searchParams.get("reference") || searchParams.get("trxref");
    const isCallback = searchParams.get("payment_callback") === "true";
    if (isCallback && reference) {
      router.replace(`/bidding/buyer/trade/${id}/payment-callback?reference=${reference}`);
    }
  }, [searchParams, id, router]);

  useEffect(() => {
    if (token && id) {
      dispatch(fetchTradeThunk({ token, tradeId: id }));
      dispatch(listTradeMessagesThunk({ token, tradeId: id }));
      dispatch(listTradeDocumentsThunk({ token, tradeId: id }));
    }
    return () => {
      dispatch(clearPaymentState());
    };
  }, [dispatch, token, id]);

  useEffect(() => {
    if (
      token &&
      id &&
      tradeStatus &&
      ["agreed", "in_progress", "completed"].includes(tradeStatus)
    ) {
      dispatch(getTradePaymentSummaryThunk(id));
    }
  }, [dispatch, token, id, tradeStatus]);

  const handleSendMessage = async (body: string, attachment?: File) => {
    if (!token) return;
    await dispatch(sendTradeMessageThunk({ token, tradeId: id, body, attachment }));
  };

  const handleUploadDocument = async (file: File, docType: TradeDocumentType) => {
    if (!token) return;
    await dispatch(
      uploadTradeDocumentThunk({
        token,
        tradeId: id,
        file,
        doc_type: docType,
        title: file.name,
      }),
    );
  };

  const handleAgreeTerms = async () => {
    if (!token) return;
    await dispatch(agreeTradeTermsThunk({ token, tradeId: id }));
  };

  const handleInitiateTradePayment = useCallback(async () => {
    if (!token) return;
    const result = await dispatch(
      initiateTradePaymentThunk({
        tradeId: id,
        payload: {
          // Must match the backend's _default_callback_url path so Paystack
          // returns to the dedicated callback page (not the main trade page).
          callback_url: `${window.location.origin}/bidding/buyer/trade/${id}/payment-callback`,
        },
      }),
    );
    if (initiateTradePaymentThunk.fulfilled.match(result)) {
      const url = result.payload.data.paystack_authorization_url;
      // Redirect in the SAME tab so the browser history back-button works
      // and there is no orphan tab landing on this page with callback params.
      window.location.href = url;
    }
  }, [dispatch, token, id]);

  const handleVerifyTradePayment = useCallback(async () => {
    if (!token || !lastInitiatedPayment?.paystack_reference) return;
    setIsVerifying(true);
    try {
      const result = await dispatch(
        verifyReferenceThunk({ reference: lastInitiatedPayment.paystack_reference }),
      );
      if (verifyReferenceThunk.fulfilled.match(result)) {
        setTradePaymentVerified(true);
        dispatch(getTradePaymentSummaryThunk(id));
        setActiveModal(null);
      }
    } finally {
      setIsVerifying(false);
    }
  }, [dispatch, token, lastInitiatedPayment, id]);

  const handleCompleteTrade = async () => {
    if (!token) return;
    await dispatch(completeTradeThunk({ token, tradeId: id, notes: completeReason }));
  };

  const handleConfirmReceipt = async () => {
    if (!token) return;
    await dispatch(confirmReceiptThunk({ token, tradeId: id }));
  };

  const handleRequestInspection = async () => {
    if (!token) return;
    const result = await dispatch(requestInspectionThunk({ token, tradeId: id }));
    if (requestInspectionThunk.fulfilled.match(result)) {
      // Inspection requested — go straight to payment
      setActiveModal("inspection_payment");
    }
  };

  const handleInitiateInspectionFeePayment = useCallback(async () => {
    if (!token) return;
    const result = await dispatch(
      initiateInspectionFeePaymentThunk({
        tradeId: id,
        payload: {
          callback_url: `${window.location.origin}/bidding/buyer/trade/${id}/payment-callback`,
        },
      }),
    );
    if (initiateInspectionFeePaymentThunk.fulfilled.match(result)) {
      const url = result.payload.data.paystack_authorization_url;
      window.location.href = url;
    }
  }, [dispatch, token, id]);

  const handleVerifyInspectionPayment = useCallback(async () => {
    const reference = lastInitiatedPayment?.paystack_reference ?? inspectionFeePayment?.paystack_reference;
    if (!token || !reference) return;
    setIsVerifying(true);
    try {
      const result = await dispatch(
        verifyReferenceThunk({ reference }),
      );
      if (verifyReferenceThunk.fulfilled.match(result)) {
        dispatch(getTradePaymentSummaryThunk(id));
        setActiveModal(null);
      }
    } finally {
      setIsVerifying(false);
    }
  }, [dispatch, token, lastInitiatedPayment, inspectionFeePayment, id]);

  const [localInspectionSettled, setLocalInspectionSettled] = useState(false);

  const handleApproveInspection = async () => {
    if (!token) return;
    const result = await dispatch(approveInspectionThunk({ token, tradeId: id }));
    if (approveInspectionThunk.fulfilled.match(result)) {
      // Optimistically mark inspection as settled locally
      setLocalInspectionSettled(true);
      // Also try to refresh from server
      dispatch(fetchTradeThunk({ token, tradeId: id }));
      dispatch(getTradePaymentSummaryThunk(id));
    }
  };

  const handleRejectInspection = async (reason: string) => {
    if (!token) return;
    await dispatch(rejectInspectionThunk({ token, tradeId: id, reason }));
    dispatch(fetchTradeThunk({ token, tradeId: id }));
  };

  // ── Derived state ──────────────────────────────────────────────────────────

  const isTradePaymentPaid = tradeSummary?.trade_payment_paid || tradePaymentVerified;

  // Inspection is fully settled from the buyer's perspective
  const inspectionSettled =
    localInspectionSettled ||
    inspectionStatus === "skipped" ||
    inspectionStatus === "buyer_approved" ||
    inspectionStatus === "buyer_rejected";

  // Show inspection module if an inspection status exists
  // (InspectionModule handles its own internal rendering logic for skipped/settled states)
  const showInspectionModule =
    tradeStatus === "agreed" && !!inspectionStatus && inspectionStatus !== "skipped";

  // Show trade payment card once inspection is settled
  const showTradePaymentCard = tradeStatus === "agreed" && inspectionSettled;

  const isExWorks = currentTrade?.delivery_terms === "EXW" || currentTrade?.delivery_terms === "FCA";

  if (status.fetchTrade === "loading" || !currentTrade) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface-gray">
        <div className="flex flex-col items-center gap-4">
          <span className="w-10 h-10 border-4 border-ameefar-navy border-t-transparent rounded-full animate-spin" />
          <p className="text-on-surface-variant font-body-md">Loading trade details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full min-h-screen bg-surface-gray font-body-md text-on-surface">
      <main className="pt-16 min-h-screen flex flex-col w-full">

        {/* Progress Stepper Header */}
        <section className="bg-white border-b border-border-subtle px-margin-desktop py-8 w-full">
          <div className="w-full max-w-screen-2xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <h1 className="font-headline-md text-headline-md text-primary">
                Trade #{currentTrade.reference} Execution
              </h1>
              <span className="px-3 py-1 bg-trust-green-subtle text-secondary font-label-md text-[10px] rounded-full uppercase tracking-wider">
                Active Room
              </span>
            </div>
            <TradeStepper status={currentTrade.status} />
          </div>
        </section>

        {/* Execution Workspace */}
        <div className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-12 gap-gutter w-full max-w-screen-2xl mx-auto">

          {/* ── Left Panel ── */}
          <div className="lg:col-span-8 space-y-6">

            {/* Trade Specifications */}
            <div className="bg-white rounded-xl border border-border-subtle shadow-sm overflow-hidden">
              <div className="p-6 border-b border-border-subtle bg-surface-gray flex justify-between items-center">
                <h2 className="font-headline-md text-headline-md text-primary text-lg">
                  Trade Specifications
                </h2>
                <span className="text-label-md font-label-md text-outline">
                  Ref: {currentTrade.reference}
                </span>
              </div>
              <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-8">
                <div>
                  <p className="text-body-sm text-outline-variant uppercase tracking-wide font-bold mb-1">Total Value</p>
                  <p className="font-label-md text-headline-md text-primary">{currentTrade.total_value}</p>
                  <p className="text-body-sm text-outline mt-1">{currentTrade.currency}</p>
                </div>
                <div>
                  <p className="text-body-sm text-outline-variant uppercase tracking-wide font-bold mb-1">Seller</p>
                  <p className="font-label-md text-body-lg text-primary">Confidential</p>
                </div>
                <div>
                  <p className="text-body-sm text-outline-variant uppercase tracking-wide font-bold mb-1">Quantity</p>
                  <p className="font-label-md text-body-lg text-primary">
                    {currentTrade.quantity} {currentTrade.unit}
                  </p>
                </div>
              </div>
            </div>

            {/* Trade Settlement — shown above Financial Summary when inspection is settled */}
            {showTradePaymentCard && (
              <div className="bg-white rounded-xl border border-border-subtle shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden p-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
                  <div>
                    <h3 className="font-headline-md text-headline-md text-primary mb-2 text-2xl font-black">Trade Settlement</h3>
                    <p className="text-body-md text-on-surface-variant">
                      {isTradePaymentPaid
                        ? "Your trade payment has been successfully secured."
                        : "Your inspection is settled. Please complete the payment to proceed."}
                    </p>
                  </div>

                  {inspectionStatus === "buyer_approved" && (
                    <div className="flex items-center gap-3 px-4 py-2 bg-trust-green-subtle border border-secondary/20 rounded-lg whitespace-nowrap">
                      <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                      <span className="font-bold text-secondary text-sm">Inspection Approved</span>
                    </div>
                  )}

                  {inspectionStatus === "skipped" && (
                    <div className="flex items-center gap-3 px-4 py-2 bg-surface-gray border border-border-subtle rounded-lg whitespace-nowrap">
                      <span className="material-symbols-outlined text-outline">skip_next</span>
                      <span className="font-bold text-ameefar-navy text-sm">Inspection Skipped</span>
                    </div>
                  )}
                </div>

                <div
                  className={`rounded-2xl border-2 p-8 transition-all ${isTradePaymentPaid ? "border-secondary/30 bg-trust-green-subtle" : "border-ameefar-navy bg-ameefar-navy/5 shadow-inner"}`}
                >
                  <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-outline-variant mb-2">Total Amount Due</p>
                      {tradeSummary && (
                        <>
                          <p className="text-4xl md:text-5xl font-black text-ameefar-navy mb-2">
                            {currentTrade.currency} {tradeSummary.trade_payment_amount}
                          </p>
                          <p className="text-sm text-outline">
                            Includes {tradeSummary.platform_fee_percent}% platform fee
                          </p>
                        </>
                      )}
                    </div>

                    <div className="w-full md:w-auto shrink-0">
                      {isTradePaymentPaid ? (
                        <div className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-secondary text-white rounded-xl font-bold text-lg w-full">
                          <span className="material-symbols-outlined text-[24px]">verified</span>
                          Payment Secured
                        </div>
                      ) : (
                        <button
                          onClick={() => setActiveModal("trade_payment")}
                          className="w-full md:w-auto px-10 py-5 bg-ameefar-navy text-white font-black rounded-xl text-lg hover:bg-ameefar-navy/90 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                        >
                          <span className="material-symbols-outlined text-[24px]">lock</span>
                          PAY NOW SECURELY
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {isTradePaymentPaid && (
                  <div className="mt-6 p-4 bg-surface-gray rounded-xl border border-border-subtle text-center flex items-center justify-center gap-4">
                    <span className="material-symbols-outlined text-ameefar-navy text-[24px]">local_shipping</span>
                    <div className="text-left">
                      <p className="text-base font-bold text-ameefar-navy">Payment Confirmed</p>
                      <p className="text-sm text-on-surface-variant">
                        Awaiting the seller to mark the shipment as "In Progress".
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Financial Summary */}
            {tradeSummary && (
              <div className="bg-white rounded-xl border border-border-subtle shadow-sm overflow-hidden">
                <div className="p-6 border-b border-border-subtle bg-surface-gray flex justify-between items-center">
                  <h2 className="font-headline-md text-headline-md text-primary text-lg">Financial Summary</h2>
                  {tradeSummary.trade_payment_paid ? (
                    <span className="px-3 py-1 bg-trust-green-subtle text-secondary font-label-md text-[10px] rounded-full uppercase tracking-wider flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">lock</span> Secured
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-amber-50 text-amber-700 font-label-md text-[10px] rounded-full uppercase tracking-wider flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">hourglass_empty</span> Pending
                    </span>
                  )}
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-border-subtle/50">
                    <span className="text-body-md text-on-surface-variant">Trade Total Amount</span>
                    <span className="font-bold text-primary">{currentTrade.currency} {tradeSummary.trade_total_amount}</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-border-subtle/50">
                    <span className="text-body-md text-on-surface-variant">Platform Fee ({tradeSummary.platform_fee_percent}%)</span>
                    <span className="font-bold text-primary">{currentTrade.currency} {tradeSummary.platform_fee_amount}</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-border-subtle/50">
                    <span className="text-body-md text-on-surface-variant">Inspection Fee</span>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-primary">GHS {tradeSummary.inspection_fee_amount}</span>
                      {tradeSummary.inspection_fee_paid ? (
                        <span className="px-2.5 py-0.5 bg-trust-green-subtle text-secondary text-[10px] rounded uppercase font-bold tracking-wider">Paid</span>
                      ) : (
                        <span className="px-2.5 py-0.5 bg-surface-gray text-outline text-[10px] rounded uppercase font-bold tracking-wider">Unpaid</span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="font-bold text-ameefar-navy text-lg">Total Settlement</span>
                    <span className="text-2xl font-black text-ameefar-navy">{currentTrade.currency} {tradeSummary.trade_payment_amount}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Agree Terms */}
            {currentTrade.status === "negotiating" && (
              <div className="bg-white rounded-xl border border-border-subtle shadow-sm overflow-hidden p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h3 className="font-headline-md text-headline-md text-primary mb-1">Agree Trade Terms</h3>
                    <p className="text-body-sm text-on-surface-variant">
                      Confirm the negotiated quantity, pricing, delivery terms, and target delivery date.
                    </p>
                    {errors.agreeTerms && (
                      <p className="text-body-sm text-error mt-2">{errors.agreeTerms}</p>
                    )}
                  </div>
                  <button
                    onClick={handleAgreeTerms}
                    disabled={status.agreeTerms === "loading"}
                    className="px-6 py-3 bg-secondary text-on-secondary font-bold rounded-lg hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {status.agreeTerms === "loading" ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span className="material-symbols-outlined text-[18px]">handshake</span>
                    )}
                    {status.agreeTerms === "loading" ? "Agreeing..." : "Agree Terms"}
                  </button>
                </div>
              </div>
            )}

            {/* Agreed state blocks */}
            {currentTrade.status === "agreed" && (
              <>

                {/* Inspection Module — shown as long as it isn't skipped */}
                {showInspectionModule && (
                  <InspectionModule
                    status={currentTrade.inspection_status}
                    role="buyer"
                    report={currentTrade.inspection_report}
                    paymentSummary={tradeSummary}
                    onRequest={handleRequestInspection}
                    onPayInspectionFee={() => setActiveModal("inspection_payment")}
                    onSkip={() =>
                      dispatch(skipInspectionThunk({ token: token!, tradeId: id }))
                    }
                    onApprove={handleApproveInspection}
                    onReject={handleRejectInspection}
                    isActionLoading={
                      status.requestInspection === "loading" ||
                      status.skipInspection === "loading" ||
                      status.approveInspection === "loading" ||
                      status.rejectInspection === "loading" ||
                      paymentLoading
                    }
                  />
                )}

                {/* No inspection required yet — buyer hasn't requested */}
                {!inspectionStatus && (
                  <InspectionModule
                    status={null}
                    role="buyer"
                    report={null}
                    paymentSummary={tradeSummary}
                    onRequest={handleRequestInspection}
                    onSkip={() =>
                      dispatch(skipInspectionThunk({ token: token!, tradeId: id }))
                    }
                    onApprove={handleApproveInspection}
                    onReject={handleRejectInspection}
                    isActionLoading={
                      status.requestInspection === "loading" ||
                      status.skipInspection === "loading"
                    }
                  />
                )}
              </>
            )}

            {/* In Progress */}
            {currentTrade.status === "in_progress" && (
              <div className="bg-white rounded-xl border border-border-subtle shadow-sm overflow-hidden p-6">
                <h3 className="font-headline-md text-headline-md text-primary mb-4">
                  Logistics & Completion
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
                  {isExWorks ? (
                    <div className="bg-surface-gray p-4 rounded-lg border border-border-subtle">
                      <span className="text-label-md text-outline uppercase text-xs font-bold">Ready for Collection</span>
                      <p className="font-bold text-ameefar-navy mt-1">
                        {currentTrade.dispatch_date
                          ? new Date(currentTrade.dispatch_date).toLocaleDateString()
                          : "Pending"}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="bg-surface-gray p-4 rounded-lg border border-border-subtle">
                        <span className="text-label-md text-outline uppercase text-xs font-bold">ETA</span>
                        <p className="font-bold text-ameefar-navy mt-1">
                          {currentTrade.estimated_arrival
                            ? new Date(currentTrade.estimated_arrival).toLocaleDateString()
                            : "Pending"}
                        </p>
                      </div>
                      <div className="bg-surface-gray p-4 rounded-lg border border-border-subtle">
                        <span className="text-label-md text-outline uppercase text-xs font-bold">Tracking Ref</span>
                        <p className="font-bold text-ameefar-navy mt-1">
                          {currentTrade.tracking_reference || "—"}
                        </p>
                      </div>
                      <div className="bg-surface-gray p-4 rounded-lg border border-border-subtle">
                        <span className="text-label-md text-outline uppercase text-xs font-bold">Carrier</span>
                        <p className="font-bold text-ameefar-navy mt-1">
                          {currentTrade.carrier_name || "—"}
                        </p>
                      </div>
                      <div className="bg-surface-gray p-4 rounded-lg border border-border-subtle">
                        <span className="text-label-md text-outline uppercase text-xs font-bold">Port of Loading</span>
                        <p className="font-bold text-ameefar-navy mt-1">
                          {currentTrade.port_of_loading || "—"}
                        </p>
                      </div>
                      <div className="bg-surface-gray p-4 rounded-lg border border-border-subtle">
                        <span className="text-label-md text-outline uppercase text-xs font-bold">Port of Discharge</span>
                        <p className="font-bold text-ameefar-navy mt-1">
                          {currentTrade.port_of_discharge || "—"}
                        </p>
                      </div>
                      <div className="bg-surface-gray p-4 rounded-lg border border-border-subtle">
                        <span className="text-label-md text-outline uppercase text-xs font-bold">Dispatch Date</span>
                        <p className="font-bold text-ameefar-navy mt-1">
                          {currentTrade.dispatch_date
                            ? new Date(currentTrade.dispatch_date).toLocaleDateString()
                            : "—"}
                        </p>
                      </div>
                    </>
                  )}
                </div>
                <div className="border-t border-border-subtle pt-6">
                  {!currentTrade.buyer_confirmed_receipt ? (
                    <div className="bg-amber-50 rounded-lg p-4 mb-4 border border-amber-200">
                      <p className="text-body-sm text-amber-800 font-bold mb-2">Have you received the goods?</p>
                      <p className="text-body-sm text-amber-700 mb-4">Confirm receipt to notify the seller and administration. You will then be able to finalize the trade.</p>
                      <button
                        onClick={handleConfirmReceipt}
                        disabled={status.confirmReceipt === "loading"}
                        className="w-full bg-amber-600 text-white font-bold py-3 rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50"
                      >
                        {status.confirmReceipt === "loading" ? "Confirming..." : "Confirm Receipt"}
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="bg-trust-green-subtle rounded-lg p-4 mb-4 border border-secondary/20 flex items-center gap-3">
                        <span className="material-symbols-outlined text-secondary">check_circle</span>
                        <p className="text-body-sm font-bold text-secondary">Receipt confirmed on {currentTrade.buyer_confirmed_at ? new Date(currentTrade.buyer_confirmed_at).toLocaleDateString() : "Pending"}</p>
                      </div>
                      <p className="text-body-sm text-on-surface-variant mb-4">
                        Please review the goods against the contract and confirm final completion.
                      </p>
                      <textarea
                        placeholder="Add completion notes or feedback..."
                        className="w-full bg-surface-gray border border-border-subtle rounded-lg px-4 py-3 mb-4 focus:ring-primary focus:border-transparent outline-none"
                        value={completeReason}
                        onChange={(e) => setCompleteReason(e.target.value)}
                      />
                      <button
                        onClick={handleCompleteTrade}
                        disabled={status.completeTrade === "loading"}
                        className="w-full bg-trust-green-subtle text-secondary font-bold py-3 rounded-lg hover:bg-secondary hover:text-white border border-secondary/20 transition-colors disabled:opacity-50"
                      >
                        {status.completeTrade === "loading" ? "Completing..." : "Complete Trade"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            <DocumentList
              documents={documents}
              onUpload={handleUploadDocument}
              canUpload={true}
            />
          </div>

          {/* ── Right Panel ── */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="h-[500px]">
              <ChatPanel
                title="Trade Communications"
                subtitle="Admin Oversight"
                messages={messages}
                onSendMessage={handleSendMessage}
                isSending={status.sendTradeMessage === "loading"}
                readOnly={true}
              />
            </div>

            {/* Inspection fee payment prompt */}
            {inspectionFeePayment &&
              currentTrade.inspection_status === "requested" &&
              !tradeSummary?.inspection_fee_paid && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-amber-600">payments</span>
                    <p className="font-bold text-amber-800">Inspection Fee Pending</p>
                  </div>
                  <p className="text-body-sm text-amber-700 mb-3">
                    Please complete the inspection fee payment to confirm your request.
                  </p>
                  <button
                    onClick={() => setActiveModal("inspection_payment")}
                    className="w-full py-2 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-700 transition-colors text-body-sm"
                  >
                    View Payment Details
                  </button>
                </div>
              )}
          </div>
        </div>
      </main>

      {/* ── Payment Modals ── */}
      {activeModal === "trade_payment" && (
        <PaymentModal
          type="trade"
          summary={tradeSummary}
          authorizationUrl={lastInitiatedPayment?.paystack_authorization_url ?? null}
          paystackReference={lastInitiatedPayment?.paystack_reference ?? null}
          isInitiating={paymentLoading}
          isVerifying={isVerifying}
          error={paymentError}
          onInitiate={handleInitiateTradePayment}
          onVerify={handleVerifyTradePayment}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === "inspection_payment" && (
        <PaymentModal
          type="inspection"
          summary={tradeSummary}
          authorizationUrl={lastInitiatedPayment?.paystack_authorization_url ?? inspectionFeePayment?.paystack_authorization_url ?? null}
          paystackReference={lastInitiatedPayment?.paystack_reference ?? inspectionFeePayment?.paystack_reference ?? null}
          isInitiating={paymentLoading}
          isVerifying={isVerifying}
          error={paymentError}
          onInitiate={handleInitiateInspectionFeePayment}
          onVerify={handleVerifyInspectionPayment}
          onClose={() => setActiveModal(null)}
        />
      )}
    </div>
  );
}