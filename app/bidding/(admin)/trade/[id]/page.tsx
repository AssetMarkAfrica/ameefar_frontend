"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectAccessToken } from "@/store/auth/authSelectors";
import {
  fetchTradeThunk,
  listTradeMessagesThunk,
  listTradeDocumentsThunk,
  uploadTradeDocumentThunk,
  sendTradeMessageThunk,
  scheduleInspectionThunk,
  startInspectionThunk,
  markInProgressThunk,
} from "@/store/bidding/biddingThunks";
import { getTradePaymentSummaryThunk } from "@/store/payment/paymentThunks";
import ChatPanel from "@/components/bidding/ChatPanel";
import TradeStepper from "@/components/bidding/TradeStepper";
import DocumentList from "@/components/bidding/DocumentList";
import InspectionModule from "@/components/bidding/InspectionModule";
import type { TradeDocumentType } from "@/types/bidding";

export default function AdminTradePage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const dispatch = useAppDispatch();
  const token = useAppSelector(selectAccessToken);
  const { currentTrade, tradeMessages, tradeDocuments, status } = useAppSelector((state) => state.bidding);
  const { tradeSummary } = useAppSelector((state) => state.payment);

  const messages = tradeMessages[id] || [];
  const documents = tradeDocuments[id] || [];

  // Inspection scheduling state
  const [scheduleDate, setScheduleDate] = useState("");
  const [inspectorId, setInspectorId] = useState("");

  // Shipment / mark-in-progress state (admin can do this on behalf of seller)
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

  const handleUploadDocument = async (file: File, docType: TradeDocumentType) => {
    if (!token) return;
    await dispatch(uploadTradeDocumentThunk({ token, tradeId: id, file, doc_type: docType, title: file.name }));
  };

  const handleSchedule = async () => {
    if (!token || !scheduleDate) return;
    await dispatch(scheduleInspectionThunk({
      token,
      tradeId: id,
      scheduled_for: new Date(scheduleDate).toISOString(),
      inspector_id: inspectorId || undefined,
    }));
  };

  const handleStart = async () => {
    if (!token) return;
    await dispatch(startInspectionThunk({ token, tradeId: id }));
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
      dispatch_date: dispatchDate,
    }));
  };

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

  const isTradePaymentPaid = tradeSummary?.trade_payment_paid;
  const sellerResponsibleIncoterms = ["CFR", "CIF", "CPT", "CIP", "DAP", "DPU", "DDP", "FOB", "FAS"];
  const isTrackingRequired = ["CFR", "CIF", "CPT", "CIP", "DAP", "DPU", "DDP"].includes(currentTrade.delivery_terms);
  const isExWorks = currentTrade.delivery_terms === "EXW" || currentTrade.delivery_terms === "FCA";
  const canMarkInProgress = isExWorks || (eta && (!isTrackingRequired || (trackingInfo && carrierName)));

  return (
    <div className="w-full min-h-screen bg-surface-gray">

      {/* Header */}
      <section className="bg-white border-b border-border-subtle px-margin-desktop py-8 w-full">
        <div className="max-w-screen-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="font-headline-md text-headline-md text-primary">
                Trade #{currentTrade.reference}
              </h1>
              <p className="text-on-surface-variant text-sm mt-1">Admin Management & Oversight</p>
            </div>
            <div className="flex gap-2 flex-wrap justify-end">
              <span className={`px-3 py-1 font-bold text-[11px] rounded-full uppercase tracking-wide ${
                currentTrade.status === "completed" ? "bg-trust-green-subtle text-secondary" :
                currentTrade.status === "in_progress" ? "bg-blue-100 text-blue-700" :
                currentTrade.status === "cancelled" ? "bg-surface-gray text-outline" :
                "bg-amber-100 text-amber-800"
              }`}>
                Trade: {currentTrade.status.replace(/_/g, " ")}
              </span>
              {currentTrade.inspection_status && (
                <span className={`px-3 py-1 font-bold text-[11px] rounded-full uppercase tracking-wide ${
                  currentTrade.inspection_status === "passed" || currentTrade.inspection_status === "in_progress" ? "bg-trust-green-subtle text-secondary" :
                  currentTrade.inspection_status === "failed" ? "bg-error-container text-error" :
                  "bg-amber-100 text-amber-800"
                }`}>
                  Inspection: {currentTrade.inspection_status.replace(/_/g, " ")}
                </span>
              )}
            </div>
          </div>
          <TradeStepper status={currentTrade.status} />
        </div>
      </section>

      {/* Workspace */}
      <div className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-12 gap-gutter max-w-screen-2xl mx-auto w-full">

        {/* ── Left Panel ── */}
        <div className="lg:col-span-8 space-y-6">

          {/* Trade Specifications */}
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
                <p className="font-bold text-ameefar-navy">{currentTrade.buyer_name}</p>
              </div>
              <div>
                <p className="text-body-sm text-outline-variant uppercase tracking-wide font-bold mb-1">Seller</p>
                <p className="font-bold text-ameefar-navy">{currentTrade.seller_name}</p>
              </div>
              <div>
                <p className="text-body-sm text-outline-variant uppercase tracking-wide font-bold mb-1">Quantity</p>
                <p className="font-bold text-ameefar-navy">{currentTrade.quantity} {currentTrade.unit}</p>
              </div>
              <div>
                <p className="text-body-sm text-outline-variant uppercase tracking-wide font-bold mb-1">Delivery Terms</p>
                <p className="font-bold text-ameefar-navy">{currentTrade.delivery_terms || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Financial Summary — full breakdown visible to admin */}
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
                  <span className="font-bold text-ameefar-navy text-lg">Total Settlement (Buyer pays)</span>
                  <span className="text-2xl font-black text-ameefar-navy">{currentTrade.currency} {tradeSummary.trade_payment_amount}</span>
                </div>
              </div>
            </div>
          )}

          {/* ── Inspection Management (Admin Actions) ── */}
          {currentTrade.inspection_status === "requested" && (
            <div className="bg-white rounded-xl border border-border-subtle shadow-sm p-6 border-t-4 border-t-amber-500">
              <h3 className="font-headline-md text-headline-md text-ameefar-navy mb-4">Schedule Inspection</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-on-surface-variant mb-1">Scheduled Date & Time *</label>
                  <input
                    type="datetime-local"
                    className="w-full bg-surface-gray border border-border-subtle rounded-lg px-4 py-2 focus:ring-primary focus:border-transparent outline-none"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-on-surface-variant mb-1">Inspector ID / Email (Optional)</label>
                  <input
                    type="text"
                    placeholder="Assignee email or internal ID"
                    className="w-full bg-surface-gray border border-border-subtle rounded-lg px-4 py-2 focus:ring-primary focus:border-transparent outline-none"
                    value={inspectorId}
                    onChange={(e) => setInspectorId(e.target.value)}
                  />
                </div>
                <button
                  onClick={handleSchedule}
                  disabled={!scheduleDate || status.scheduleInspection === "loading"}
                  className="w-full py-3 bg-ameefar-navy text-white font-bold rounded-lg hover:bg-primary transition-colors disabled:opacity-50"
                >
                  {status.scheduleInspection === "loading" ? "Scheduling..." : "Confirm Schedule"}
                </button>
              </div>
            </div>
          )}

          {currentTrade.inspection_status === "scheduled" && (
            <div className="bg-white rounded-xl border border-border-subtle shadow-sm p-6 border-t-4 border-t-blue-500">
              <h3 className="font-headline-md text-headline-md text-ameefar-navy mb-2">Inspection Scheduled</h3>
              <p className="text-on-surface-variant mb-6">
                Scheduled For: {currentTrade.inspection_scheduled_for ? new Date(currentTrade.inspection_scheduled_for).toLocaleString() : "N/A"}<br />
                Assigned To: {currentTrade.inspection_assigned_to_name || "Unassigned"}
              </p>
              <button
                onClick={handleStart}
                disabled={status.startInspection === "loading"}
                className="w-full py-3 bg-secondary text-white font-bold rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50"
              >
                {status.startInspection === "loading" ? "Starting..." : "Start Inspection Now"}
              </button>
            </div>
          )}

          {currentTrade.inspection_status === "in_progress" && (
            <div className="bg-white rounded-xl border border-border-subtle shadow-sm p-6 border-t-4 border-t-secondary">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-trust-green-subtle flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-secondary text-[22px]">fact_check</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-headline-md text-headline-md text-ameefar-navy mb-1">Complete Field Inspection</h3>
                  <p className="text-on-surface-variant text-sm mb-4">
                    The inspection is now in progress. Open the inspection checklist to record measured values and submit the final report.
                  </p>
                  <button
                    onClick={() => router.push(`/bidding/trade/${id}/complete-inspection`)}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-secondary text-white font-bold rounded-lg hover:bg-secondary/90 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">assignment_turned_in</span>
                    Open Inspection Checklist
                  </button>
                </div>
              </div>
            </div>
          )}

          {(currentTrade.inspection_status === "passed" || currentTrade.inspection_status === "failed") && currentTrade.inspection_report && (
            <div className="bg-white rounded-xl border border-border-subtle shadow-sm p-6">
              <h3 className="font-headline-md text-headline-md text-ameefar-navy mb-4">Inspection Report Issued</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="text-body-sm text-outline uppercase font-bold">Verdict</span>
                  <p className={`font-bold text-lg mt-1 ${currentTrade.inspection_report.verdict === "passed" ? "text-secondary" : "text-error"}`}>
                    {currentTrade.inspection_report.verdict.toUpperCase()}
                  </p>
                </div>
                <div>
                  <span className="text-body-sm text-outline uppercase font-bold">Recommendation</span>
                  <p className="font-bold text-ameefar-navy mt-1 capitalize">{currentTrade.inspection_report.recommendation || "N/A"}</p>
                </div>
              </div>
              <div className="bg-surface-gray p-4 rounded-lg mb-4">
                <p className="font-bold mb-1">Summary</p>
                <p className="text-on-surface-variant text-sm">{currentTrade.inspection_report.summary}</p>
              </div>
              {currentTrade.inspection_report.findings && (
                <div className="bg-surface-gray p-4 rounded-lg">
                  <p className="font-bold mb-1">Findings</p>
                  <p className="text-on-surface-variant text-sm whitespace-pre-wrap">{currentTrade.inspection_report.findings}</p>
                </div>
              )}
            </div>
          )}

          {/* ── Shipment / Mark In Progress (Admin can do on behalf of seller) ── */}
          {currentTrade.status === "agreed" && isTradePaymentPaid && (
            <div className="bg-white rounded-xl border border-border-subtle shadow-sm overflow-hidden p-6">
              <div className="flex items-center gap-3 mb-6 bg-trust-green-subtle text-secondary p-4 rounded-lg">
                <span className="material-symbols-outlined">check_circle</span>
                <p className="font-bold">Trade payment secured. Mark as in progress to begin shipment.</p>
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

          {/* In Progress — shipment info */}
          {currentTrade.status === "in_progress" && (
            <div className="bg-white rounded-xl border border-border-subtle shadow-sm overflow-hidden p-6">
              <h3 className="font-headline-md text-headline-md text-primary mb-4">
                {isExWorks ? "Collection Info" : "Shipment Info"}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {!isExWorks && (
                  <div className="bg-surface-gray p-4 rounded-lg border border-border-subtle">
                    <span className="text-label-md text-outline uppercase text-xs font-bold">ETA</span>
                    <p className="font-bold text-ameefar-navy mt-1">
                      {currentTrade.estimated_arrival ? new Date(currentTrade.estimated_arrival).toLocaleDateString() : "Pending"}
                    </p>
                  </div>
                )}
                {!isExWorks && (
                  <div className="bg-surface-gray p-4 rounded-lg border border-border-subtle">
                    <span className="text-label-md text-outline uppercase text-xs font-bold">Tracking Ref</span>
                    <p className="font-bold text-ameefar-navy mt-1">{currentTrade.tracking_reference || "—"}</p>
                  </div>
                )}
                {!isExWorks && (
                  <div className="bg-surface-gray p-4 rounded-lg border border-border-subtle">
                    <span className="text-label-md text-outline uppercase text-xs font-bold">Carrier</span>
                    <p className="font-bold text-ameefar-navy mt-1">{currentTrade.carrier_name || "—"}</p>
                  </div>
                )}
                {!isExWorks && (
                  <div className="bg-surface-gray p-4 rounded-lg border border-border-subtle">
                    <span className="text-label-md text-outline uppercase text-xs font-bold">Port of Loading</span>
                    <p className="font-bold text-ameefar-navy mt-1">{currentTrade.port_of_loading || "—"}</p>
                  </div>
                )}
                {!isExWorks && (
                  <div className="bg-surface-gray p-4 rounded-lg border border-border-subtle">
                    <span className="text-label-md text-outline uppercase text-xs font-bold">Port of Discharge</span>
                    <p className="font-bold text-ameefar-navy mt-1">{currentTrade.port_of_discharge || "—"}</p>
                  </div>
                )}
                <div className="bg-surface-gray p-4 rounded-lg border border-border-subtle">
                  <span className="text-label-md text-outline uppercase text-xs font-bold">Buyer Receipt</span>
                  <p className={`font-bold mt-1 ${currentTrade.buyer_confirmed_receipt ? "text-secondary" : "text-outline"}`}>
                    {currentTrade.buyer_confirmed_receipt ? "Confirmed" : "Pending"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Inspection Module (admin view) */}
          {currentTrade.inspection_status && currentTrade.inspection_status !== "not_requested" && currentTrade.inspection_status !== "skipped" && (
            <InspectionModule
              status={currentTrade.inspection_status}
              report={currentTrade.inspection_report}
              paymentSummary={tradeSummary}
              role="admin"
            />
          )}

          {/* Documents */}
          <DocumentList
            documents={documents}
            onUpload={handleUploadDocument}
            canUpload={true}
          />
        </div>

        {/* ── Right Panel: Chat ── */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="h-[600px]">
            <ChatPanel
              title="Trade Communications"
              subtitle="Admin Oversight"
              messages={messages}
              onSendMessage={handleSendMessage}
              isSending={status.sendTradeMessage === "loading"}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
