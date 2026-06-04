"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectAccessToken } from "@/store/auth/authSelectors";
import {
  fetchTradeThunk,
  listTradeMessagesThunk,
  sendTradeMessageThunk,
  listTradeDocumentsThunk,
  uploadTradeDocumentThunk,
  signContractThunk,
  completeTradeThunk,
  requestInspectionThunk,
  approveInspectionThunk,
  rejectInspectionThunk,
  skipInspectionThunk
} from "@/store/bidding/biddingThunks";
import ChatPanel from "@/components/bidding/ChatPanel";
import BiddingSidebar from "@/components/bidding/BiddingSidebar";
import TradeStepper from "@/components/bidding/TradeStepper";
import DocumentList from "@/components/bidding/DocumentList";
import InspectionModule from "@/components/bidding/InspectionModule";
import type { TradeDocumentType } from "@/types/bidding";

export default function BuyerTradePage() {
  const { id } = useParams() as { id: string };
  const dispatch = useAppDispatch();
  const router = useRouter();
  const token = useAppSelector(selectAccessToken);
  const { currentTrade, messages, documents, status } = useAppSelector((state) => state.bidding);
  const [completeReason, setCompleteReason] = useState("");

  useEffect(() => {
    if (token && id) {
      dispatch(fetchTradeThunk({ token, tradeId: id }));
      dispatch(listTradeMessagesThunk({ token, tradeId: id }));
      dispatch(listTradeDocumentsThunk({ token, tradeId: id }));
    }
  }, [dispatch, token, id]);

  const handleSendMessage = async (body: string, attachment?: File) => {
    if (!token) return;
    await dispatch(sendTradeMessageThunk({ token, tradeId: id, body, attachment }));
  };

  const handleUploadDocument = async (file: File, docType: TradeDocumentType) => {
    if (!token) return;
    await dispatch(uploadTradeDocumentThunk({ token, tradeId: id, file, doc_type: docType, title: file.name }));
  };

  const handleSignContract = async () => {
    if (!token) return;
    await dispatch(signContractThunk({ token, tradeId: id }));
  };

  const handleCompleteTrade = async () => {
    if (!token) return;
    await dispatch(completeTradeThunk({ token, tradeId: id, comments: completeReason }));
  };

  if (status.fetchTrade === "loading" || !currentTrade) {
    return <div className="p-8 text-center">Loading trade details...</div>;
  }

  return (
    <div className="flex w-full min-h-screen bg-surface-gray font-body-md text-on-surface">
      <BiddingSidebar role="buyer" />
      <main className="md:ml-64 pt-16 min-h-screen flex flex-col">
        
        {/* Progress Stepper Header */}
        <section className="bg-white border-b border-border-subtle px-margin-desktop py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <h1 className="font-headline-md text-headline-md text-primary">Trade #{currentTrade.reference} Execution</h1>
              <span className="px-3 py-1 bg-trust-green-subtle text-secondary font-label-md text-[10px] rounded-full uppercase tracking-wider">Active Room</span>
            </div>
            <TradeStepper status={currentTrade.status} />
          </div>
        </section>

        {/* Execution Workspace */}
        <div className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-12 gap-gutter max-w-container-max mx-auto w-full">
          
          {/* Left Panel: Trade Details & Action */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Trade Details Card (Placeholder for now) */}
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
                  <p className="text-body-sm text-outline-variant uppercase tracking-wide font-bold mb-1">Seller</p>
                  <p className="font-label-md text-body-lg text-primary">{currentTrade.seller_name}</p>
                </div>
              </div>
            </div>

            {currentTrade.status === "contract_sent" && (
              <div className="bg-white rounded-xl border-2 border-dashed border-border-subtle p-8 text-center transition-all hover:border-primary-container group">
                <div className="w-16 h-16 bg-surface-container-low rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-container transition-colors">
                  <span className="material-symbols-outlined text-primary-container text-3xl group-hover:text-on-primary-container">draw</span>
                </div>
                <h3 className="font-headline-md text-headline-md text-primary mb-2">Contract Pending Signature</h3>
                <p className="text-body-md text-on-surface-variant max-w-sm mx-auto mb-6">The seller has uploaded the contract. Please review it in the Documents section below and sign to proceed.</p>
                <div className="flex gap-3 justify-center">
                  <button 
                    onClick={handleSignContract}
                    disabled={status.signContract === "loading"}
                    className="px-8 py-3 bg-ameefar-navy text-on-primary rounded-lg font-bold hover:opacity-90 transition-all flex items-center gap-2"
                  >
                    {status.signContract === "loading" ? "Signing..." : "Sign Contract"}
                  </button>
                </div>
              </div>
            )}

            {currentTrade.status === "in_progress" && (
              <div className="bg-white rounded-xl border border-border-subtle shadow-sm overflow-hidden p-6">
                <h3 className="font-headline-md text-headline-md text-primary mb-4">Logistics & Completion</h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-surface-gray p-4 rounded-lg border border-border-subtle">
                    <span className="text-label-md text-outline uppercase">ETA</span>
                    <p className="font-bold text-ameefar-navy text-body-lg mt-1">{currentTrade.eta ? new Date(currentTrade.eta).toLocaleDateString() : 'Pending'}</p>
                  </div>
                  <div className="bg-surface-gray p-4 rounded-lg border border-border-subtle">
                    <span className="text-label-md text-outline uppercase">Tracking Info</span>
                    <p className="font-bold text-ameefar-navy text-body-lg mt-1">{currentTrade.tracking_info || 'Not provided'}</p>
                  </div>
                </div>
                
                <div className="border-t border-border-subtle pt-6">
                  <p className="text-body-sm text-on-surface-variant mb-4">Once you receive the goods and inspect them, complete the trade.</p>
                  <textarea 
                    placeholder="Add completion notes or feedback..."
                    className="w-full bg-surface-gray border border-border-subtle rounded-lg px-4 py-3 mb-4 focus:ring-primary focus:border-transparent outline-none"
                    value={completeReason}
                    onChange={(e) => setCompleteReason(e.target.value)}
                  ></textarea>
                  <button 
                    onClick={handleCompleteTrade}
                    disabled={status.completeTrade === "loading"}
                    className="w-full bg-trust-green-subtle text-secondary font-bold py-3 rounded-lg hover:bg-secondary hover:text-white border border-secondary/20 transition-colors"
                  >
                    Complete Trade
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
          
          {/* Right Panel: Chat & Logs */}
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

            {currentTrade.status === "contract_signed" && (
              <InspectionModule 
                status={currentTrade.inspection_status}
                role="buyer"
                onRequest={() => dispatch(requestInspectionThunk({ token: token!, tradeId: id }))}
                onSkip={() => dispatch(skipInspectionThunk({ token: token!, tradeId: id }))}
                onApprove={() => dispatch(approveInspectionThunk({ token: token!, tradeId: id }))}
                onReject={(reason) => dispatch(rejectInspectionThunk({ token: token!, tradeId: id, reason }))}
                isActionLoading={
                  status.requestInspection === "loading" || 
                  status.skipInspection === "loading" || 
                  status.approveInspection === "loading" || 
                  status.rejectInspection === "loading"
                }
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
