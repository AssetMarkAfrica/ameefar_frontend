"use client";
import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectAccessToken } from "@/store/auth/authSelectors";
import {
  fetchTradeThunk,
  listTradeMessagesThunk,
  sendTradeMessageThunk,
  scheduleInspectionThunk,
  startInspectionThunk,
  completeInspectionThunk
} from "@/store/bidding/biddingThunks";
import ChatPanel from "@/components/bidding/ChatPanel";
import BiddingSidebar from "@/components/bidding/BiddingSidebar";
import type { InspectionVerdict, InspectionRecommendation } from "@/types/bidding";

export default function AdminTradePage() {
  const { id } = useParams() as { id: string };
  const dispatch = useAppDispatch();
  const token = useAppSelector(selectAccessToken);
  const { currentTrade, tradeMessages, status } = useAppSelector((state) => state.bidding);

  const messages = tradeMessages[id] || [];

  // Schedule State
  const [scheduleDate, setScheduleDate] = useState("");
  const [inspectorId, setInspectorId] = useState("");

  // Complete State
  const [verdict, setVerdict] = useState<InspectionVerdict>("passed");
  const [summary, setSummary] = useState("");
  const [findings, setFindings] = useState("");
  const [recommendation, setRecommendation] = useState<InspectionRecommendation>("proceed");
  const [reportFile, setReportFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (token && id) {
      dispatch(fetchTradeThunk({ token, tradeId: id }));
      dispatch(listTradeMessagesThunk({ token, tradeId: id }));
    }
  }, [dispatch, token, id]);

  const handleSendMessage = async (body: string, attachment?: File) => {
    if (!token) return;
    // For admin, we can optionally add UI for `is_internal`, but keeping it simple for now.
    await dispatch(sendTradeMessageThunk({ token, tradeId: id, body, attachment }));
  };

  const handleSchedule = async () => {
    if (!token || !scheduleDate) return;
    await dispatch(scheduleInspectionThunk({ 
      token, 
      tradeId: id, 
      scheduled_for: new Date(scheduleDate).toISOString(),
      inspector_id: inspectorId || undefined
    }));
  };

  const handleStart = async () => {
    if (!token) return;
    await dispatch(startInspectionThunk({ token, tradeId: id }));
  };

  const handleComplete = async () => {
    if (!token || !summary) return;
    await dispatch(completeInspectionThunk({
      token,
      tradeId: id,
      verdict,
      summary,
      findings,
      recommendation,
      report_document: reportFile || undefined
    }));
  };

  if (status.fetchTrade === "loading" || !currentTrade) {
    return <div className="p-8 text-center bg-surface-gray min-h-screen">Loading trade details...</div>;
  }

  return (
    <div className="flex w-full min-h-screen bg-surface-gray font-body-md text-on-surface">
      <BiddingSidebar role="admin" />
      <main className="md:ml-64 pt-16 min-h-screen flex flex-col w-full">
        
        {/* Header */}
        <section className="bg-white border-b border-border-subtle px-margin-desktop py-8">
          <div className="max-w-container-max mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="font-headline-md text-headline-md text-primary">Trade #{currentTrade.reference}</h1>
                <p className="text-on-surface-variant mt-1">Admin Management & Oversight</p>
              </div>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-surface-container-high text-primary font-bold text-[12px] rounded-full uppercase tracking-wider">
                  Trade: {currentTrade.status.replace("_", " ")}
                </span>
                <span className={`px-3 py-1 font-bold text-[12px] rounded-full uppercase tracking-wider ${
                  currentTrade.inspection_status === "in_progress" || currentTrade.inspection_status === "passed" ? "bg-trust-green-subtle text-secondary" : 
                  currentTrade.inspection_status === "failed" ? "bg-error-container text-error" : 
                  "bg-amber-100 text-amber-800"
                }`}>
                  Inspection: {currentTrade.inspection_status?.replace("_", " ") || "N/A"}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Workspace */}
        <div className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-12 gap-gutter max-w-container-max mx-auto w-full">
          
          {/* Left Panel: Details & Inspection Actions */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Trade Details Summary */}
            <div className="bg-white rounded-xl border border-border-subtle shadow-sm overflow-hidden">
              <div className="p-6 border-b border-border-subtle bg-surface-gray">
                <h2 className="font-headline-md text-headline-md text-primary text-lg">Trade Specifications</h2>
              </div>
              <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-body-sm text-outline-variant uppercase tracking-wide font-bold mb-1">Value</p>
                  <p className="font-bold text-ameefar-navy">{currentTrade.total_value} {currentTrade.currency}</p>
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
              </div>
            </div>

            {/* Inspection Management UI */}
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
                  Scheduled For: {currentTrade.inspection_scheduled_for ? new Date(currentTrade.inspection_scheduled_for).toLocaleString() : "N/A"}<br/>
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
                <h3 className="font-headline-md text-headline-md text-ameefar-navy mb-4">Complete Inspection</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-on-surface-variant mb-1">Verdict *</label>
                      <select 
                        className="w-full bg-surface-gray border border-border-subtle rounded-lg px-4 py-2 focus:ring-primary focus:border-transparent outline-none font-bold"
                        value={verdict}
                        onChange={(e) => setVerdict(e.target.value as InspectionVerdict)}
                      >
                        <option value="passed">Passed</option>
                        <option value="failed">Failed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-on-surface-variant mb-1">Recommendation</label>
                      <select 
                        className="w-full bg-surface-gray border border-border-subtle rounded-lg px-4 py-2 focus:ring-primary focus:border-transparent outline-none"
                        value={recommendation}
                        onChange={(e) => setRecommendation(e.target.value as InspectionRecommendation)}
                      >
                        <option value="proceed">Proceed</option>
                        <option value="renegotiate">Renegotiate</option>
                        <option value="cancel">Cancel</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-on-surface-variant mb-1">Executive Summary *</label>
                    <textarea 
                      className="w-full bg-surface-gray border border-border-subtle rounded-lg px-4 py-2 focus:ring-primary focus:border-transparent outline-none"
                      rows={2}
                      placeholder="High-level summary of the inspection result"
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-on-surface-variant mb-1">Detailed Findings</label>
                    <textarea 
                      className="w-full bg-surface-gray border border-border-subtle rounded-lg px-4 py-2 focus:ring-primary focus:border-transparent outline-none"
                      rows={4}
                      placeholder="Detailed notes on quality, weight, packaging..."
                      value={findings}
                      onChange={(e) => setFindings(e.target.value)}
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-on-surface-variant mb-1">Report Document (Optional)</label>
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      className="w-full bg-surface-gray border border-border-subtle rounded-lg px-4 py-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                      onChange={(e) => setReportFile(e.target.files?.[0] || null)}
                    />
                  </div>

                  <button 
                    onClick={handleComplete}
                    disabled={!summary || status.completeInspection === "loading"}
                    className="w-full mt-4 py-3 bg-secondary text-white font-bold rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                  >
                    {status.completeInspection === "loading" ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span className="material-symbols-outlined text-[18px]">task_alt</span>
                    )}
                    {status.completeInspection === "loading" ? "Submitting..." : "Submit Inspection Report"}
                  </button>
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
          </div>

          {/* Right Panel: Admin Chat & Logs */}
          <div className="lg:col-span-5 flex flex-col gap-6">
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
      </main>
    </div>
  );
}
