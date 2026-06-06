"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectAccessToken } from "@/store/auth/authSelectors";
import { createEnquiryThunk } from "@/store/bidding/biddingThunks";
import type { EnquiryUnit } from "@/types/bidding";

interface CreateEnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  listingId: string;
  listingType: "sell" | "buy";
  defaultQuantity?: string;
}

const inputClassName =
  "min-h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-[#0b1c30] outline-none transition focus:border-[#002627] focus:ring-2 focus:ring-[#002627]/20";

export function CreateEnquiryModal({
  isOpen,
  onClose,
  listingId,
  listingType,
  defaultQuantity = "",
}: CreateEnquiryModalProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const token = useAppSelector(selectAccessToken);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [quantity, setQuantity] = useState(defaultQuantity);
  const [unit, setUnit] = useState<EnquiryUnit>("mt");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("GHS");
  const [deliveryTerms, setDeliveryTerms] = useState("EXW");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [targetDeliveryDate, setTargetDeliveryDate] = useState("");
  const [message, setMessage] = useState("");

  if (!isOpen) return null;

  const totalValue =
    quantity && price && !isNaN(Number(quantity)) && !isNaN(Number(price))
      ? (Number(quantity) * Number(price)).toLocaleString()
      : "0.00";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      router.push("/auth/login");
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const result = await dispatch(
        createEnquiryThunk({
          token,
          listing_id: listingId,
          quantity,
          unit,
          proposed_price_per_unit: price || undefined,
          currency: price ? currency : undefined,
          message: message.trim(),
          delivery_terms: deliveryTerms || undefined,
          delivery_address: deliveryAddress || undefined,
          target_delivery_date: targetDeliveryDate || undefined,
        })
      ).unwrap();

      // Redirect based on the listing type.
      // If we are responding to a "sell" listing, we are buying.
      if (listingType === "sell") {
        router.push(`/bidding/buyer/negotiation/${result.data.id}`);
      } else {
        router.push(`/bidding/seller/negotiation/${result.data.id}`);
      }
    } catch (err: any) {
      setError(err || "Failed to create enquiry.");
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-xl flex flex-col">
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white rounded-t-xl">
          <h2 className="font-[var(--font-hanken)] text-2xl font-bold text-[#002627]">
            {listingType === "sell" ? "Request Supply" : "Respond to Request"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-[#002627] hover:bg-slate-100 rounded-lg transition"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 text-red-700 text-sm font-semibold rounded-lg">
              {error}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <label className="grid gap-2">
              <span className="font-[var(--font-jetbrains)] text-xs font-bold uppercase tracking-wide text-[#404848]">
                Quantity *
              </span>
              <div className="flex gap-2">
                <input
                  type="number"
                  required
                  min="0"
                  step="any"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className={inputClassName}
                  placeholder="e.g. 50"
                />
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as EnquiryUnit)}
                  className={`${inputClassName} w-24`}
                >
                  <option value="mt">MT</option>
                  <option value="kg">KG</option>
                  <option value="lt">LT</option>
                  <option value="load">Load</option>
                  <option value="unit">Unit</option>
                </select>
              </div>
            </label>

            <label className="grid gap-2">
              <span className="font-[var(--font-jetbrains)] text-xs font-bold uppercase tracking-wide text-[#404848]">
                Proposed Price per Unit (Optional)
              </span>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className={inputClassName}
                  placeholder="e.g. 1500"
                />
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className={`${inputClassName} w-24`}
                >
                  <option value="GHS">GHS</option>

                  <option value="USD">USD</option>
                  <option value="NGN">NGN</option>
                  <option value="KES">KES</option>
                </select>
              </div>
            </label>
          </div>

          <div className="p-4 bg-[#eff4ff] border border-[#d3e4fe] rounded-lg flex items-center justify-between">
            <span className="font-[var(--font-jetbrains)] text-sm font-bold uppercase tracking-wide text-[#002627]">
              Total Estimated Value
            </span>
            <span className="font-[var(--font-hanken)] text-2xl font-bold text-[#002627]">
              {currency} {totalValue}
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
            <label className="grid gap-2">
              <span className="font-[var(--font-jetbrains)] text-xs font-bold uppercase tracking-wide text-[#404848]">
                Delivery Terms
              </span>
              <select
                value={deliveryTerms}
                onChange={(e) => setDeliveryTerms(e.target.value)}
                className={inputClassName}
              >
                <option value="EXW">EXW (Ex Works)</option>
                <option value="FOB">FOB (Free On Board)</option>
                <option value="CIF">CIF (Cost, Insurance, Freight)</option>
                <option value="DDP">DDP (Delivered Duty Paid)</option>
              </select>
            </label>

            <label className="grid gap-2">
              <span className="font-[var(--font-jetbrains)] text-xs font-bold uppercase tracking-wide text-[#404848]">
                Target Delivery Date
              </span>
              <input
                type="date"
                value={targetDeliveryDate}
                onChange={(e) => setTargetDeliveryDate(e.target.value)}
                className={inputClassName}
              />
            </label>

            <label className="grid gap-2 md:col-span-2">
              <span className="font-[var(--font-jetbrains)] text-xs font-bold uppercase tracking-wide text-[#404848]">
                Delivery Address
              </span>
              <input
                type="text"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className={inputClassName}
                placeholder="Enter full delivery address"
              />
            </label>
          </div>

          <label className="grid gap-2 pt-4 border-t border-slate-100">
            <span className="font-[var(--font-jetbrains)] text-xs font-bold uppercase tracking-wide text-[#404848]">
              Initial Message *
            </span>
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={`${inputClassName} py-3 resize-none`}
              placeholder="Introduce yourself and state any specific requirements or conditions..."
            ></textarea>
          </label>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 min-h-12 rounded-lg border border-slate-200 font-semibold text-[#002627] hover:bg-slate-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 min-h-12 rounded-lg bg-[#002627] font-semibold text-white hover:bg-slate-900 transition flex items-center justify-center disabled:opacity-50"
            >
              {isLoading ? "Submitting..." : "Send Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
