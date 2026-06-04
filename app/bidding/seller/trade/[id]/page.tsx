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
  sendContractThunk,
  markInProgressThunk
} from "@/store/bidding/biddingThunks";
import ChatPanel from "@/components/bidding/ChatPanel";
import BiddingSidebar from "@/components/bidding/BiddingSidebar";
import TradeStepper from "@/components/bidding/TradeStepper";
import DocumentList from "@/components/bidding/DocumentList";
import InspectionModule from "@/components/bidding/InspectionModule";
import type { TradeDocumentType } from "@/types/bidding";

export default function SellerTradePage() {
  const { id } = useParams() as { id: string };
  const dispatch = useAppDispatch();
  const router = useRouter();
  const token = useAppSelector(selectAccessToken);
  const { currentTrade, messages, documents, status } = useAppSelector((state) => state.bidding);
  const [eta, setEta] = useState("");
  const [trackingInfo, setTrackingInfo] = useState("");

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
    
    if (docType === "contract" && currentTrade?.status === "agreed") {
      await dispatch(sendContractThunk({ token, tradeId: id, contract: file }));
    } else {
      await dispatch(uploadTradeDocumentThunk({ token, tradeId: id, file, doc_type: docType, title: file.name }));
    }
  };

  const handleMarkInProgress = async () => {
    if (!token) return;
    await dispatch(markInProgressThunk({ token, tradeId: id, eta, tracking_info: trackingInfo }));
  };

  if (status.fetchTrade === "loading" || !currentTrade) {
    return <div className="p-8 text-center">Loading trade details...</div>;
  }

  return (
    <div className="flex w-full min-h-screen bg-surface-gray font-body-md text-on-surface">
      <BiddingSidebar role="seller" />
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
                  <p className="font-label-md text-body-lg text-primary">{currentTrade.buyer_name}</p>
                </div>
              </div>
            </div>

            {currentTrade.status === "agreed" && (
              <div className="bg-white rounded-xl border-2 border-dashed border-border-subtle p-8 text-center transition-all hover:border-primary-container group">
                <div className="w-16 h-16 bg-surface-container-low rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-container transition-colors">
                  <span className="material-symbols-outlined text-primary-container text-3xl group-hover:text-on-primary-container">upload_file</span>
                </div>
                <h3 className="font-headline-md text-headline-md text-primary mb-2">Upload Signed Contract</h3>
                <p className="text-body-md text-on-surface-variant max-w-sm mx-auto mb-6">Please upload the official contract to proceed. The buyer will then review and sign it.</p>
                <div className="flex gap-3 justify-center">
                  <label className="px-8 py-3 bg-ameefar-navy text-on-primary rounded-lg font-bold hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer">
                    <span className="material-symbols-outlined">description</span>
                    Upload Contract
                    <input 
                      type="file" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadDocument(file, "contract");
                      }}
                    />
                  </label>
                </div>
              </div>
            )}

            {currentTrade.status === "contract_signed" && (
              <div className="bg-white rounded-xl border border-border-subtle shadow-sm overflow-hidden p-6">
                <h3 className="font-headline-md text-headline-md text-primary mb-4">Shipment Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-on-surface-variant mb-1">Estimated Arrival Date (ETA)</label>
                    <input 
                      type="date" 
                      className="w-full bg-surface-gray border border-border-subtle rounded-lg px-4 py-2 focus:ring-primary focus:border-transparent outline-none"
                      value={eta}
                      onChange={(e) => setEta(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-on-surface-variant mb-1">Tracking Info / Logistics Details</label>
                    <textarea 
                      className="w-full bg-surface-gray border border-border-subtle rounded-lg px-4 py-2 focus:ring-primary focus:border-transparent outline-none"
                      rows={3}
                      value={trackingInfo}
                      onChange={(e) => setTrackingInfo(e.target.value)}
                    ></textarea>
                  </div>
                  <button 
                    onClick={handleMarkInProgress}
                    disabled={status.markInProgress === "loading" || !eta}
                    className="w-full bg-secondary text-white font-bold py-3 rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50"
                  >
                    {status.markInProgress === "loading" ? "Updating..." : "Mark as In Progress"}
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

            {currentTrade.inspection_status !== "not_requested" && (
              <InspectionModule 
                status={currentTrade.inspection_status}
                role="seller"
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
