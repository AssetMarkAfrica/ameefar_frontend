"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
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
} from "@/store/bidding/biddingThunks";
import {
  initiateTradePaymentThunk,
  getTradePaymentSummaryThunk,
  verifyReferenceThunk,
} from "@/store/payment/paymentThunks";
import { clearPaymentState } from "@/store/payment/paymentSlice";
import ChatPanel from "@/components/bidding/ChatPanel";
import BiddingSidebar from "@/components/bidding/BiddingSidebar";
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
          callback_url: `${window.location.origin}/bidding/buyer/trade/${id}?payment_callback=true`,
        },
      }),
    );
    if (initiateTradePaymentThunk.fulfilled.match(result)) {
      const url = result.payload.data.paystack_authorization_url;
      window.open(url, "_blank");
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

  const handleRequestInspection = async () => {
    if (!token) return;
    const result = await dispatch(requestInspectionThunk({ token, tradeId: id }));
    if (requestInspectionThunk.fulfilled.match(result)) {
      router.push(`/bidding/buyer/trade/${id}/inspection-requirements`);
    }
  };

  const handleVerifyInspectionPayment = useCallback(async () => {
    if (!token || !inspectionFeePayment?.paystack_reference) return;
    setIsVerifying(true);
    try {
      const result = await dispatch(
        verifyReferenceThunk({ reference: inspectionFeePayment.paystack_reference }),
      );
      if (verifyReferenceThunk.fulfilled.match(result)) {
        dispatch(getTradePaymentSummaryThunk(id));
        setActiveModal(null);
      }
    } finally {
      setIsVerifying(false);
    }
  }, [dispatch, token, inspectionFeePayment, id]);

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
  // Inspection is fully settled from the buyer's perspective
const inspectionSettled = localInspectionSettled || inspectionStatus === "skipped" || inspectionStatus === "approved";

  // Show inspection module until buyer has approved or skipped
  const showInspectionModule =
    tradeStatus === "agreed" &&
    !!inspectionStatus &&
    !inspectionSettled;

  // Show trade payment card once inspection is settled
  const showTradePaymentCard = tradeStatus === "agreed" && inspectionSettled;

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
      <BiddingSidebar role="buyer" />
      <main className="md:ml-64 pt-16 min-h-screen flex flex-col">

        {/* Progress Stepper Header */}
        <section className="bg-white border-b border-border-subtle px-margin-desktop py-8">
          <div className="max-w-4xl mx-auto">
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
        <div className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-12 gap-gutter max-w-container-max mx-auto w-full">

          {/* ── Left Panel ── */}
          <div className="lg:col-span-7 space-y-6">

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
                  <p className="font-label-md text-body-lg text-primary">{currentTrade.seller_name}</p>
                </div>
                <div>
                  <p className="text-body-sm text-outline-variant uppercase tracking-wide font-bold mb-1">Quantity</p>
                  <p className="font-label-md text-body-lg text-primary">
                    {currentTrade.quantity} {currentTrade.unit}
                  </p>
                </div>
              </div>
            </div>

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
                {/* Inspection Module — shown until buyer approves or skips */}
                {showInspectionModule && (
                  <InspectionModule
                    status={currentTrade.inspection_status}
                    role="buyer"
                    report={currentTrade.inspection_report}
                    paymentSummary={tradeSummary}
                    onRequest={handleRequestInspection}
                    onSkip={() =>
                      dispatch(skipInspectionThunk({ token: token!, tradeId: id }))
                    }
                    onApprove={handleApproveInspection}
                    onReject={handleRejectInspection}
                    isActionLoading={
                      status.requestInspection === "loading" ||
                      status.skipInspection === "loading" ||
                      status.approveInspection === "loading" ||
                      status.rejectInspection === "loading"
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

                {/* Trade Payment — shown after inspection settled */}
                {showTradePaymentCard && (
                  <div className="bg-white rounded-xl border border-border-subtle shadow-sm overflow-hidden p-6">
                    <h3 className="font-headline-md text-headline-md text-primary mb-4">Trade Payment</h3>

                    {/* Inspection approved banner */}
                    {inspectionStatus === "approved" && (
                      <div className="mb-4 flex items-center gap-3 p-4 bg-trust-green-subtle border border-secondary/20 rounded-xl">
                        <span className="material-symbols-outlined text-secondary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                          verified
                        </span>
                        <div>
                          <p className="font-bold text-secondary text-body-sm">Inspection Approved</p>
                          <p className="text-body-sm text-on-surface-variant">
                            You've approved the inspection report. Complete payment to proceed.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Skipped banner */}
                    {inspectionStatus === "skipped" && (
                      <div className="mb-4 flex items-center gap-3 p-4 bg-surface-gray border border-border-subtle rounded-xl">
                        <span className="material-symbols-outlined text-outline text-[20px]">
                          skip_next
                        </span>
                        <div>
                          <p className="font-bold text-ameefar-navy text-body-sm">Inspection Skipped</p>
                          <p className="text-body-sm text-on-surface-variant">
                            Proceed directly to trade payment.
                          </p>
                        </div>
                      </div>
                    )}

                    <div
                      className={`rounded-xl border p-5 transition-all ${isTradePaymentPaid ? "border-secondary/30 bg-trust-green-subtle" : "border-border-subtle bg-surface-gray"}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isTradePaymentPaid ? "bg-secondary text-on-secondary" : "bg-ameefar-navy text-on-primary"}`}
                          >
                            {isTradePaymentPaid ? (
                              <span className="material-symbols-outlined text-[16px]">check</span>
                            ) : (
                              <span className="material-symbols-outlined text-[16px]">payments</span>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-primary">Trade Payment</p>
                            {tradeSummary && (
                              <p className="text-body-sm text-outline">
                                {currentTrade.currency} {tradeSummary.trade_payment_amount} (incl.{" "}
                                {tradeSummary.platform_fee_percent}% platform fee)
                              </p>
                            )}
                          </div>
                        </div>
                        {isTradePaymentPaid ? (
                          <span className="text-secondary font-bold text-body-sm flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">verified</span>
                            Paid
                          </span>
                        ) : (
                          <button
                            onClick={() => setActiveModal("trade_payment")}
                            className="px-5 py-2 bg-ameefar-navy text-on-primary font-bold rounded-lg text-body-sm hover:opacity-90 transition-all active:scale-95 flex items-center gap-2"
                          >
                            <span className="material-symbols-outlined text-[16px]">payments</span>
                            Pay Now
                          </button>
                        )}
                      </div>
                    </div>

                    {isTradePaymentPaid && (
                      <div className="mt-4 p-4 bg-surface-gray rounded-xl border border-border-subtle text-center">
                        <span className="material-symbols-outlined text-ameefar-navy mb-2">local_shipping</span>
                        <p className="text-sm font-bold text-ameefar-navy">Payment Secured.</p>
                        <p className="text-sm text-on-surface-variant">
                          Awaiting the seller to mark the shipment as "In Progress".
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* In Progress */}
            {currentTrade.status === "in_progress" && (
              <div className="bg-white rounded-xl border border-border-subtle shadow-sm overflow-hidden p-6">
                <h3 className="font-headline-md text-headline-md text-primary mb-4">
                  Logistics & Completion
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-surface-gray p-4 rounded-lg border border-border-subtle">
                    <span className="text-label-md text-outline uppercase">ETA</span>
                    <p className="font-bold text-ameefar-navy text-body-lg mt-1">
                      {currentTrade.estimated_arrival
                        ? new Date(currentTrade.estimated_arrival).toLocaleDateString()
                        : "Pending"}
                    </p>
                  </div>
                  <div className="bg-surface-gray p-4 rounded-lg border border-border-subtle">
                    <span className="text-label-md text-outline uppercase">Tracking Ref</span>
                    <p className="font-bold text-ameefar-navy text-body-lg mt-1">
                      {currentTrade.tracking_reference || "Not provided"}
                    </p>
                  </div>
                </div>
                <div className="border-t border-border-subtle pt-6">
                  <p className="text-body-sm text-on-surface-variant mb-4">
                    Once you receive and inspect the goods, confirm completion.
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
              </div>
            )}

            <DocumentList
              documents={documents}
              onUpload={handleUploadDocument}
              canUpload={true}
            />
          </div>

          {/* ── Right Panel ── */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="h-[500px]">
              <ChatPanel
                title="Trade Channel"
                subtitle="2 Participants"
                messages={messages}
                onSendMessage={handleSendMessage}
                isSending={status.sendTradeMessage === "loading"}
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
          onInitiate={handleInitiateTradePayment}
          onVerify={handleVerifyTradePayment}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === "inspection_payment" && (
        <PaymentModal
          type="inspection"
          summary={tradeSummary}
          authorizationUrl={inspectionFeePayment?.paystack_authorization_url ?? null}
          paystackReference={inspectionFeePayment?.paystack_reference ?? null}
          isInitiating={status.requestInspection === "loading"}
          isVerifying={isVerifying}
          onInitiate={handleRequestInspection}
          onVerify={handleVerifyInspectionPayment}
          onClose={() => setActiveModal(null)}
        />
      )}
    </div>
  );
}