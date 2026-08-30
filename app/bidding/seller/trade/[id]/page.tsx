"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectAccessToken } from "@/store/auth/authSelectors";
import {
  fetchTradeThunk,
  agreeTradeTermsThunk,
  listTradeMessagesThunk,
  sendTradeMessageThunk,
  listTradeDocumentsThunk,
  uploadTradeDocumentThunk,
  markInProgressThunk
} from "@/store/bidding/biddingThunks";
import { getTradePaymentSummaryThunk } from "@/store/payment/paymentThunks";
import ChatPanel from "@/components/bidding/ChatPanel";

import TradeStepper from "@/components/bidding/TradeStepper";
import DocumentList from "@/components/bidding/DocumentList";
import InspectionModule from "@/components/bidding/InspectionModule";
import type { TradeDocumentType } from "@/types/bidding";

export default function SellerTradePage() {
  const { id } = useParams() as { id: string };
  const dispatch = useAppDispatch();
  const token = useAppSelector(selectAccessToken);
  const { currentTrade, tradeMessages, tradeDocuments, status, errors } = useAppSelector((state) => state.bidding);
  const { tradeSummary } = useAppSelector((state) => state.payment);

  const messages = tradeMessages[id] || [];
  const documents = tradeDocuments[id] || [];
  const [eta, setEta] = useState("");
  const [trackingInfo, setTrackingInfo] = useState("");
  const [carrierName, setCarrierName] = useState("");
  const [portOfLoading, setPortOfLoading] = useState("");
  const [portOfDischarge, setPortOfDischarge] = useState("");
  const [dispatchDate, setDispatchDate] = useState("");

  useEffect(() => {
    if (token && id) {
      dispatch(fetchTradeThunk({ token, tradeId: id }));
      dispatch(listTradeMessagesThunk({ token, tradeId: id }));
      dispatch(listTradeDocumentsThunk({ token, tradeId: id }));
    }
  }, [dispatch, token, id]);

  useEffect(() => {
    if (token && id && currentTrade?.status && ["agreed", "in_progress", "completed"].includes(currentTrade.status)) {
      dispatch(getTradePaymentSummaryThunk(id));
    }
  }, [dispatch, token, id, currentTrade?.status]);

  const handleSendMessage = async (body: string, attachment?: File) => {
    if (!token) return;
    await dispatch(sendTradeMessageThunk({ token, tradeId: id, body, attachment }));
  };

  const handleAgreeTerms = async () => {
    if (!token) return;
    await dispatch(agreeTradeTermsThunk({ token, tradeId: id }));
  };

  const handleUploadDocument = async (file: File, docType: TradeDocumentType) => {
    if (!token) return;
    await dispatch(uploadTradeDocumentThunk({ token, tradeId: id, file, doc_type: docType, title: file.name }));
  };

  const handleMarkInProgress = async () => {
    if (!token) return;
    await dispatch(markInProgressThunk({ 
      token, 
      tradeId: id, 
      estimated_arrival: eta, 
      tracking_reference: trackingInfo,
      carrier_name: carrierName,
      port_of_loading: portOfLoading,
      port_of_discharge: portOfDischarge,
      dispatch_date: dispatchDate
    }));
  };

  if (status.fetchTrade === "loading" || !currentTrade) {
    return <div className="p-8 text-center">Loading trade details...</div>;
  }

  const isTradePaymentPaid = tradeSummary?.trade_payment_paid;
  
  const sellerResponsibleIncoterms = ["CFR", "CIF", "CPT", "CIP", "DAP", "DPU", "DDP", "FOB", "FAS"];
  const isTrackingRequired = ["CFR", "CIF", "CPT", "CIP", "DAP", "DPU", "DDP"].includes(currentTrade.delivery_terms);
  const isExWorks = currentTrade.delivery_terms === "EXW" || currentTrade.delivery_terms === "FCA";
  
  const canMarkInProgress = isExWorks || (eta && (!isTrackingRequired || (trackingInfo && carrierName)));

  return (
    <div className="flex w-full min-h-screen bg-surface-gray font-body-md text-on-surface">

      <main className="pt-16 min-h-screen flex flex-col w-full">

        {/* Progress Stepper Header */}
        <section className="bg-white border-b border-border-subtle px-margin-desktop py-8 w-full">
          <div className="w-full max-w-screen-2xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <h1 className="font-headline-md text-headline-md text-primary">Trade #{currentTrade.reference} Execution</h1>
              <span className="px-3 py-1 bg-trust-green-subtle text-secondary font-label-md text-[10px] rounded-full uppercase tracking-wider">Active Room</span>
            </div>
            <TradeStepper status={currentTrade.status} />
          </div>
        </section>

        {/* Execution Workspace */}
        <div className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-12 gap-gutter w-full max-w-screen-2xl mx-auto">

          {/* Left Panel: Trade Details & Action */}
          <div className="lg:col-span-8 space-y-6">

            {/* Trade Details Card */}
            <div className="bg-white rounded-xl border border-border-subtle shadow-sm overflow-hidden">
              <div className="p-6 border-b border-border-subtle bg-surface-gray flex justify-between items-center">
                <h2 className="font-headline-md text-headline-md text-primary text-lg">Trade Specifications</h2>
                <span className="text-label-md font-label-md text-outline">Ref: {currentTrade.reference}</span>
              </div>
              <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-8">
                <div>
                  <p className="text-body-sm text-outline-variant uppercase tracking-wide font-bold mb-1">Total Value</p>
                  <p className="font-label-md text-headline-md text-primary">{currentTrade.total_value}</p>
                  <p className="text-body-sm text-outline mt-1">{currentTrade.currency}</p>
                </div>
                <div>
                  <p className="text-body-sm text-outline-variant uppercase tracking-wide font-bold mb-1">Buyer</p>
                  <p className="font-label-md text-body-lg text-primary">Confidential</p>
                </div>
              </div>
            </div>

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
                  <div className="flex justify-between items-center pt-2">
                    <span className="font-bold text-ameefar-navy text-lg">Your Settlement</span>
                    <span className="text-2xl font-black text-ameefar-navy">{currentTrade.currency} {tradeSummary.trade_total_amount}</span>
                  </div>
                </div>
              </div>
            )}

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

            {currentTrade.status === "agreed" && (
              <>
                {!isTradePaymentPaid ? (
                  <div className="bg-white rounded-xl border border-border-subtle shadow-sm overflow-hidden p-8 text-center">
                    <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="material-symbols-outlined text-amber-600 text-3xl">hourglass_empty</span>
                    </div>
                    <h3 className="font-headline-md text-headline-md text-primary mb-2">Awaiting Settlement</h3>
                    <p className="text-body-md text-on-surface-variant max-w-md mx-auto">
                      {currentTrade.inspection_status === "skipped" || currentTrade.inspection_status === "buyer_approved"
                        ? "The inspection phase has concluded. The buyer has approved the report and is yet to make payment. You will be notified once Ameefar secures the funds in escrow, after which you can begin shipment."
                        : (currentTrade.inspection_status === "passed" || currentTrade.inspection_status === "failed")
                        ? "The inspection report has been issued. The buyer is currently reviewing the report."
                        : "The buyer is currently completing the inspection phase."}
                    </p>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-border-subtle shadow-sm overflow-hidden p-6">
                    <div className="flex items-center gap-3 mb-6 bg-trust-green-subtle text-secondary p-4 rounded-lg">
                      <span className="material-symbols-outlined">check_circle</span>
                      <p className="font-bold">Trade payment has been secured! You may now begin shipment.</p>
                    </div>

                    <h3 className="font-headline-md text-headline-md text-primary mb-4">
                      {isExWorks ? "Collection Details" : "Shipment Details"}
                    </h3>
                    <div className="space-y-4">
                      {!isExWorks && (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-bold text-on-surface-variant mb-1">Carrier Name {isTrackingRequired && "*"}</label>
                              <input
                                type="text"
                                className="w-full bg-surface-gray border border-border-subtle rounded-lg px-4 py-2 focus:ring-primary focus:border-transparent outline-none"
                                value={carrierName}
                                onChange={(e) => setCarrierName(e.target.value)}
                                placeholder="e.g. Maersk"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-bold text-on-surface-variant mb-1">Tracking Info / Ref {isTrackingRequired && "*"}</label>
                              <input
                                type="text"
                                className="w-full bg-surface-gray border border-border-subtle rounded-lg px-4 py-2 focus:ring-primary focus:border-transparent outline-none"
                                value={trackingInfo}
                                onChange={(e) => setTrackingInfo(e.target.value)}
                                placeholder="e.g. TRK123456789"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-bold text-on-surface-variant mb-1">Port of Loading</label>
                              <input
                                type="text"
                                className="w-full bg-surface-gray border border-border-subtle rounded-lg px-4 py-2 focus:ring-primary focus:border-transparent outline-none"
                                value={portOfLoading}
                                onChange={(e) => setPortOfLoading(e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-bold text-on-surface-variant mb-1">Port of Discharge</label>
                              <input
                                type="text"
                                className="w-full bg-surface-gray border border-border-subtle rounded-lg px-4 py-2 focus:ring-primary focus:border-transparent outline-none"
                                value={portOfDischarge}
                                onChange={(e) => setPortOfDischarge(e.target.value)}
                              />
                            </div>
                          </div>
                        </>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-on-surface-variant mb-1">
                            {isExWorks ? "Ready for Collection Date" : "Dispatch Date"}
                          </label>
                          <input
                            type="date"
                            className="w-full bg-surface-gray border border-border-subtle rounded-lg px-4 py-2 focus:ring-primary focus:border-transparent outline-none"
                            value={dispatchDate}
                            onChange={(e) => setDispatchDate(e.target.value)}
                          />
                        </div>
                        {!isExWorks && (
                          <div>
                            <label className="block text-sm font-bold text-on-surface-variant mb-1">Estimated Arrival (ETA) *</label>
                            <input
                              type="date"
                              className="w-full bg-surface-gray border border-border-subtle rounded-lg px-4 py-2 focus:ring-primary focus:border-transparent outline-none"
                              value={eta}
                              onChange={(e) => setEta(e.target.value)}
                            />
                          </div>
                        )}
                      </div>

                      <button
                        onClick={handleMarkInProgress}
                        disabled={status.markInProgress === "loading" || !canMarkInProgress}
                        className="w-full bg-secondary text-white font-bold py-3 rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50"
                      >
                        {status.markInProgress === "loading" ? "Updating..." : "Mark as In Progress"}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            <DocumentList
              documents={documents}
              onUpload={handleUploadDocument}
              canUpload={true}
            />

            {currentTrade.inspection_status !== "not_requested" && currentTrade.inspection_status !== "skipped" && (
              <InspectionModule
                status={currentTrade.inspection_status}
                report={currentTrade.inspection_report}
                paymentSummary={tradeSummary}
                role="seller"
              />
            )}
          </div>

          {/* Right Panel: Chat & Logs */}
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
          </div>
        </div>
      </main>
    </div>
  );
}
