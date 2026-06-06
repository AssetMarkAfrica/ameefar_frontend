"use client";
import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectAccessToken } from "@/store/auth/authSelectors";
import {
  fetchEnquiryThunk,
  listEnquiryMessagesThunk,
  sendEnquiryMessageThunk,
  acceptEnquiryThunk,
  declineEnquiryThunk,
  counterEnquiryThunk,
} from "@/store/bidding/biddingThunks";
import ChatPanel from "@/components/bidding/ChatPanel";
import BiddingSidebar from "@/components/bidding/BiddingSidebar";

export default function SellerNegotiationPage() {
  const { id } = useParams() as { id: string };
  const dispatch = useAppDispatch();
  const router = useRouter();
  const token = useAppSelector(selectAccessToken);
  const { currentEnquiry, enquiryMessages, status } = useAppSelector((state) => state.bidding);
  const messages = enquiryMessages[id] || [];

  useEffect(() => {
    if (token && id) {
      dispatch(fetchEnquiryThunk({ token, enquiryId: id }));
      dispatch(listEnquiryMessagesThunk({ token, enquiryId: id }));
    }
  }, [dispatch, token, id]);

  const handleSendMessage = async (body: string, attachment?: File) => {
    if (!token) return;
    await dispatch(sendEnquiryMessageThunk({ token, enquiryId: id, body, attachment }));
  };

  const handleAccept = async () => {
    if (!token) return;
    const res = await dispatch(acceptEnquiryThunk({ token, enquiryId: id }));
    if (res.payload && (res.payload as any).data?.id) {
      router.push(`/bidding/seller/trade/${(res.payload as any).data.id}`);
    }
  };

  const handleDecline = async () => {
    if (!token) return;
    const reason = prompt("Reason for declining:");
    if (reason) {
      await dispatch(declineEnquiryThunk({ token, enquiryId: id, reason }));
      router.push("/bidding/seller/dashboard");
    }
  };

  const handleCounter = async () => {
    if (!token) return;
    const newPrice = prompt("Enter new price per unit:");
    if (newPrice && !isNaN(Number(newPrice))) {
      await dispatch(counterEnquiryThunk({ 
        token, 
        enquiryId: id, 
        counter_price_per_unit: newPrice,
      }));
    }
  };

  if (status.fetchEnquiry === "loading" || !currentEnquiry) {
    return <div className="p-8 text-center">Loading negotiation details...</div>;
  }

  return (
    <div className="flex w-full min-h-screen bg-surface-gray font-body-md text-on-background">
      <BiddingSidebar role="seller" />
      <main className="flex-1 md:ml-64 flex flex-col w-full max-w-container-max mx-auto px-margin-desktop py-8">
        
        {/* Header & Breadcrumbs */}
        <section className="mb-8">
          <nav className="flex items-center gap-2 text-body-sm text-outline mb-2">
            <span className="hover:text-primary transition-colors cursor-pointer">Negotiations</span>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-on-surface">NEG-{currentEnquiry.id.substring(0, 4)}</span>
          </nav>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="font-headline-lg text-headline-lg text-ameefar-navy">{currentEnquiry.listing_name}</h1>
              <p className="text-body-md text-on-surface-variant flex items-center gap-2">
                Reference: #{currentEnquiry.reference} | Buyer: {currentEnquiry.initiator_name}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-4 py-1.5 bg-surface-container-high text-primary font-bold rounded-full text-label-md flex items-center gap-2 border border-primary-container/20 uppercase">
                {currentEnquiry.status === "pending" && <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>}
                {currentEnquiry.status}
              </span>
            </div>
          </div>
        </section>

        {/* Negotiation Panels */}
        <section className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-gutter items-stretch min-h-[600px]">
          
          {/* Left Panel: Current Terms */}
          <aside className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-white rounded-xl border border-border-subtle overflow-hidden flex-1 flex flex-col">
              <div className="px-6 py-4 bg-surface-gray border-b border-border-subtle flex justify-between items-center">
                <h2 className="font-headline-md text-headline-md text-ameefar-navy">Buyer Offer</h2>
                <span className="text-label-md font-label-md text-outline uppercase tracking-wider">Latest Offer</span>
              </div>
              <div className="p-6 flex-1 space-y-6">
                
                {/* Terms Grid */}
                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                  <div className="space-y-1">
                    <label className="text-label-md text-outline uppercase tracking-tight">Status</label>
                    <p className="text-body-lg font-bold text-ameefar-navy capitalize">{currentEnquiry.status}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-label-md text-outline uppercase tracking-tight">Quantity</label>
                    <p className="text-body-lg font-bold text-ameefar-navy">Standard</p>
                  </div>
                  
                  <div className="col-span-2 p-4 bg-trust-green-subtle border border-on-tertiary-container/20 rounded-lg">
                    <label className="text-label-md text-on-tertiary-container uppercase tracking-tight font-bold">
                      Total Value
                    </label>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-display-lg font-display-lg text-ameefar-navy">{currentEnquiry.total_value}</span>
                      <span className="text-body-md text-on-surface-variant">{currentEnquiry.currency}</span>
                    </div>
                  </div>
                </div>

                {/* Technical Details */}
                <div className="space-y-3 pt-4 border-t border-border-subtle">
                  <h3 className="text-label-md font-bold text-ameefar-navy uppercase">Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center bg-surface-gray p-2 rounded">
                      <span className="text-body-sm text-on-surface-variant">Listing Name</span>
                      <span className="font-label-md text-ameefar-navy truncate max-w-[200px]">{currentEnquiry.listing_name}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              {currentEnquiry.status === "pending" && (
                <div className="p-6 bg-surface-container-low border-t border-border-subtle flex flex-col gap-3">
                  <div className="flex gap-3">
                    <button 
                      onClick={handleDecline}
                      className="flex-1 py-3 px-4 border border-border-subtle bg-white text-ameefar-navy font-bold rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[20px]">close</span>
                      Decline
                    </button>
                    <button 
                      onClick={handleAccept}
                      className="flex-[2] py-3 px-4 bg-secondary text-white font-bold rounded-lg shadow-sm hover:bg-primary transition-all flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      Accept Offer
                    </button>
                  </div>
                  <button 
                    onClick={handleCounter}
                    className="w-full py-3 px-4 border border-primary text-primary font-bold rounded-lg hover:bg-surface-gray transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[20px]">gavel</span>
                    Counter Offer
                  </button>
                </div>
              )}
            </div>
          </aside>

          {/* Right Panel: Real-time Chat */}
          <section className="lg:col-span-7 flex flex-col bg-white rounded-xl border border-border-subtle overflow-hidden h-full min-h-[600px]">
            <ChatPanel 
              title={currentEnquiry.initiator_name}
              subtitle="Buyer"
              messages={messages} 
              onSendMessage={handleSendMessage}
              isSending={status.sendEnquiryMessage === "loading"}
            />
          </section>

        </section>
      </main>
    </div>
  );
}
