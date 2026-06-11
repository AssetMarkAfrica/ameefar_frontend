// components/bidding/CounterOfferModal.tsx
"use client";
import React, { useState } from "react";

interface CounterOfferModalProps {
  onConfirm: (data: {
    counter_price_per_unit: string;
    counter_quantity: string;
    counter_message: string;
  }) => void;
  onClose: () => void;
  isSubmitting?: boolean;
}

export default function CounterOfferModal({ onConfirm, onClose, isSubmitting }: CounterOfferModalProps) {
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [message, setMessage] = useState("");

  const isValid = price && !isNaN(Number(price)) && quantity && !isNaN(Number(quantity)) && message.trim();

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
        
        {/* Header */}
        <div className="px-6 py-4 bg-surface-gray border-b border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">gavel</span>
            <h2 className="font-headline-md text-headline-md text-ameefar-navy">Counter Offer</h2>
          </div>
          <button
            onClick={onClose}
            className="text-outline hover:text-ameefar-navy transition-colors"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-label-md text-outline uppercase tracking-tight">
              Price per Unit
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. 95.00"
              className="w-full px-4 py-2.5 rounded-lg border border-border-subtle bg-surface-gray text-ameefar-navy font-label-md focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-label-md text-outline uppercase tracking-tight">
              Quantity
            </label>
            <input
              type="number"
              min="0"
              step="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="e.g. 50"
              className="w-full px-4 py-2.5 rounded-lg border border-border-subtle bg-surface-gray text-ameefar-navy font-label-md focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-label-md text-outline uppercase tracking-tight">
              Message
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. We can offer a slightly better price at 95 per MT."
              className="w-full px-4 py-2.5 rounded-lg border border-border-subtle bg-surface-gray text-ameefar-navy font-label-md focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-surface-container-low border-t border-border-subtle flex gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-3 px-4 border border-border-subtle bg-white text-ameefar-navy font-bold rounded-lg hover:bg-surface-gray transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isValid || isSubmitting}
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