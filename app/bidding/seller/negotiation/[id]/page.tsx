"use client";
import React, { useEffect, useState } from "react";
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
// import ChatPanel from "@/components/bidding/ChatPanel";
import BiddingSidebar from "@/components/bidding/BiddingSidebar";

// ─── Helpers ───────────────────────────────────────────────────────────────────

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-start gap-4 py-3 border-b border-border-subtle last:border-0">
      <span className="text-body-sm text-on-surface-variant shrink-0">{label}</span>
      <span className="font-label-md text-ameefar-navy text-right">{value ?? "—"}</span>
    </div>
  );
}

function SectionCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-border-subtle overflow-hidden">
      <div className="px-5 py-3.5 bg-surface-gray border-b border-border-subtle flex items-center gap-2">
        <span className="material-symbols-outlined text-primary text-[18px]">{icon}</span>
        <h3 className="font-label-md text-label-md text-ameefar-navy uppercase tracking-wider">{title}</h3>
      </div>
      <div className="px-5 divide-y divide-border-subtle">
        {children}
      </div>
    </div>
  );
}

// ─── Counter Offer Modal ───────────────────────────────────────────────────────

interface CounterOfferModalProps {
  onConfirm: (data: {
    counter_price_per_unit: string;
    counter_quantity: string;
    counter_message: string;
  }) => void;
  onClose: () => void;
  isSubmitting?: boolean;
}

function CounterOfferModal({ onConfirm, onClose, isSubmitting }: CounterOfferModalProps) {
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [message, setMessage] = useState("");

  const isValid =
    price && !isNaN(Number(price)) &&
    quantity && !isNaN(Number(quantity)) &&
    message.trim();

  const handleConfirm = () => {
    if (!isValid) return;
    onConfirm({
      counter_price_per_unit: price,
      counter_quantity: quantity,
      counter_message: message.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 bg-surface-gray border-b border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">gavel</span>
            <h2 className="font-headline-md text-headline-md text-ameefar-navy">Counter Offer</h2>
          </div>
          <button onClick={onClose} className="text-outline hover:text-ameefar-navy transition-colors">
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>
        <div className="p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-label-md text-outline uppercase tracking-tight">Price per Unit</label>
            <input
              type="number" min="0" step="0.01" value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. 95.00"
              className="w-full px-4 py-2.5 rounded-lg border border-border-subtle bg-surface-gray text-ameefar-navy font-label-md focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-label-md text-outline uppercase tracking-tight">Quantity</label>
            <input
              type="number" min="0" step="1" value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="e.g. 50"
              className="w-full px-4 py-2.5 rounded-lg border border-border-subtle bg-surface-gray text-ameefar-navy font-label-md focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-label-md text-outline uppercase tracking-tight">Message</label>
            <textarea
              rows={3} value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. We can offer a slightly better price at 95 per MT."
              className="w-full px-4 py-2.5 rounded-lg border border-border-subtle bg-surface-gray text-ameefar-navy font-label-md focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition resize-none"
            />
          </div>
        </div>
        <div className="px-6 py-4 bg-surface-container-low border-t border-border-subtle flex gap-3">
          <button
            onClick={onClose} disabled={isSubmitting}
            className="flex-1 py-3 px-4 border border-border-subtle bg-white text-ameefar-navy font-bold rounded-lg hover:bg-surface-gray transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm} disabled={!isValid || isSubmitting}
            className="flex-[2] py-3 px-4 bg-secondary text-white font-bold rounded-lg shadow-sm hover:bg-primary transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                Submitting...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>gavel</span>
                Submit Counter
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function SellerNegotiationPage() {
  const { id } = useParams() as { id: string };
  const dispatch = useAppDispatch();
  const router = useRouter();
  const token = useAppSelector(selectAccessToken);
  const { currentEnquiry, enquiryMessages, status } = useAppSelector((state) => state.bidding);
  const messages = enquiryMessages[id] || [];

  const [showCounterModal, setShowCounterModal] = useState(false);

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

  const handleCounter = async (data: {
    counter_price_per_unit: string;
    counter_quantity: string;
    counter_message: string;
  }) => {
    if (!token) return;
    await dispatch(counterEnquiryThunk({ token, enquiryId: id, ...data }));
    setShowCounterModal(false);
  };

  if (status.fetchEnquiry === "loading" || !currentEnquiry) {
    return <div className="p-8 text-center">Loading negotiation details...</div>;
  }

  const hasCounter = !!currentEnquiry.counter_price_per_unit;

  return (
    <div className="flex w-full min-h-screen bg-surface-gray font-body-md text-on-background">
      <BiddingSidebar role="seller" />
      <main className="flex-1 md:ml-64 flex flex-col w-full max-w-container-max mx-auto px-4 md:px-margin-desktop py-8">

        {/* Header & Breadcrumbs */}
        <section className="mb-8">
          <nav className="flex items-center gap-2 text-body-sm text-outline mb-2">
            <span className="hover:text-primary transition-colors cursor-pointer">Negotiations</span>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-on-surface">{currentEnquiry.reference}</span>
          </nav>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="font-headline-lg text-headline-lg text-ameefar-navy">{currentEnquiry.listing_name}</h1>
              <p className="text-body-md text-on-surface-variant">
                {currentEnquiry.reference} · Buyer: {currentEnquiry.buyer_name}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-4 py-1.5 bg-surface-container-high text-primary font-bold rounded-full text-label-md flex items-center gap-2 border border-primary-container/20 uppercase">
                {currentEnquiry.status === "pending" && (
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                )}
                {currentEnquiry.status}
              </span>
            </div>
          </div>
        </section>

        {/* ── Main Content Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── LEFT COLUMN ── */}
          <div className="flex flex-col gap-6">

            {/* Total Value Hero */}
            <div className="bg-white rounded-xl border border-border-subtle overflow-hidden">
              <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-label-md text-outline uppercase tracking-tight mb-1">Total Value</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-[2.5rem] font-bold leading-none text-ameefar-navy">
                      {Number(currentEnquiry.total_value).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-body-lg text-on-surface-variant font-bold">{currentEnquiry.currency}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1 text-right">
                  <span className="text-label-md text-outline uppercase tracking-tight">Price / Unit</span>
                  <span className="text-body-lg font-bold text-ameefar-navy">
                    {currentEnquiry.proposed_price_per_unit} {currentEnquiry.currency}
                  </span>
                  <span className="text-body-sm text-on-surface-variant">
                    {currentEnquiry.quantity} {currentEnquiry.unit?.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Buyer Info */}
            <SectionCard title="Buyer" icon="person">
              <DetailRow label="Name" value={currentEnquiry.buyer_name} />
              <DetailRow label="Email" value={currentEnquiry.buyer_email} />
            </SectionCard>

            {/* Offer Message */}
            {currentEnquiry.message && (
              <div className="bg-white rounded-xl border border-border-subtle overflow-hidden">
                <div className="px-5 py-3.5 bg-surface-gray border-b border-border-subtle flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">chat</span>
                  <h3 className="font-label-md text-label-md text-ameefar-navy uppercase tracking-wider">Buyer Message</h3>
                </div>
                <div className="p-5">
                  <p className="text-body-md text-on-surface italic">"{currentEnquiry.message}"</p>
                </div>
              </div>
            )}

          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="flex flex-col gap-6">

            {/* Offer Terms */}
            <SectionCard title="Offer Terms" icon="receipt_long">
              <DetailRow label="Quantity" value={`${currentEnquiry.quantity} ${currentEnquiry.unit?.toUpperCase()}`} />
              <DetailRow label="Price per Unit" value={`${currentEnquiry.proposed_price_per_unit} ${currentEnquiry.currency}`} />
              <DetailRow label="Delivery Terms" value={currentEnquiry.delivery_terms} />
              <DetailRow
                label="Target Delivery"
                value={
                  currentEnquiry.target_delivery_date
                    ? new Date(currentEnquiry.target_delivery_date).toLocaleDateString("en-GB", {
                        day: "numeric", month: "short", year: "numeric",
                      })
                    : null
                }
              />
              <DetailRow label="Delivery Address" value={currentEnquiry.delivery_address} />
            </SectionCard>

            {/* Counter Details — only shown if a counter exists */}
            {hasCounter && (
              <div className="bg-white rounded-xl border border-amber-200 overflow-hidden">
                <div className="px-5 py-3.5 bg-amber-50 border-b border-amber-200 flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-600 text-[18px]">gavel</span>
                  <h3 className="font-label-md text-label-md text-amber-800 uppercase tracking-wider">Counter Offer</h3>
                </div>
                <div className="px-5 divide-y divide-border-subtle">
                  <DetailRow label="Counter Price / Unit" value={`${currentEnquiry.counter_price_per_unit} ${currentEnquiry.currency}`} />
                  <DetailRow label="Counter Quantity" value={`${currentEnquiry.counter_quantity} ${currentEnquiry.unit?.toUpperCase()}`} />
                  {currentEnquiry.counter_message && (
                    <DetailRow label="Counter Message" value={currentEnquiry.counter_message} />
                  )}
                  {currentEnquiry.countered_at && (
                    <DetailRow
                      label="Countered At"
                      value={new Date(currentEnquiry.countered_at).toLocaleString("en-GB", {
                        day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
                      })}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Timeline */}
            <SectionCard title="Timeline" icon="schedule">
              <DetailRow
                label="Submitted"
                value={new Date(currentEnquiry.created_at).toLocaleString("en-GB", {
                  day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
                })}
              />
              {currentEnquiry.responded_at && (
                <DetailRow
                  label="Responded"
                  value={new Date(currentEnquiry.responded_at).toLocaleString("en-GB", {
                    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
                  })}
                />
              )}
              {currentEnquiry.expires_at && (
                <DetailRow
                  label="Expires"
                  value={new Date(currentEnquiry.expires_at).toLocaleString("en-GB", {
                    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
                  })}
                />
              )}
              {currentEnquiry.decline_reason && (
                <DetailRow label="Decline Reason" value={currentEnquiry.decline_reason} />
              )}
            </SectionCard>

          </div>
        </div>

        {/* ── Action Bar ── */}
        {currentEnquiry.status === "pending" && (
          <div className="mt-6 bg-white rounded-xl border border-border-subtle p-5 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleDecline}
              className="flex-1 py-3 px-4 border border-border-subtle bg-white text-ameefar-navy font-bold rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
              Decline
            </button>
            <button
              onClick={() => setShowCounterModal(true)}
              className="flex-1 py-3 px-4 border border-primary text-primary font-bold rounded-lg hover:bg-surface-gray transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">gavel</span>
              Counter Offer
            </button>
            <button
              onClick={handleAccept}
              className="flex-[2] py-3 px-4 bg-secondary text-white font-bold rounded-lg shadow-sm hover:bg-primary transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              Accept Offer
            </button>
          </div>
        )}

        {/* ChatPanel hidden — uncomment to restore
        <section className="lg:col-span-7 flex flex-col bg-white rounded-xl border border-border-subtle overflow-hidden h-full min-h-[600px]">
          <ChatPanel
            title={currentEnquiry.initiator_name}
            subtitle="Buyer"
            messages={messages}
            onSendMessage={handleSendMessage}
            isSending={status.sendEnquiryMessage === "loading"}
          />
        </section>
        */}

      </main>

      {/* Counter Offer Modal */}
      {showCounterModal && (
        <CounterOfferModal
          onConfirm={handleCounter}
          onClose={() => setShowCounterModal(false)}
          isSubmitting={status.counterEnquiry === "loading"}
        />
      )}
    </div>
  );
}