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
  minPrice?: string;
  defaultCurrency?: string;
}

const inputClassName =
  "min-h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-[#0b1c30] outline-none transition focus:border-[#002627] focus:ring-2 focus:ring-[#002627]/20";

// Fixed conversion rate used to convert the proposed price (and the listing's
// minimum price) between GHS and USD.
const GHS_PER_USD = 11.37;

function roundUpToCents(amount: number): number {
  return Math.ceil(amount * 100) / 100;
}

// Converts an amount between GHS and USD. Returns null for any other
// currency pair — no live rate is defined for NGN/KES yet.
function convertCurrency(amount: number, from: string, to: string): number | null {
  const f = from?.toUpperCase();
  const t = to?.toUpperCase();
  if (f === t) return amount;
  if (f === "GHS" && t === "USD") return roundUpToCents(amount / GHS_PER_USD);
  if (f === "USD" && t === "GHS") return roundUpToCents(amount * GHS_PER_USD);
  return null;
}

export function CreateEnquiryModal({
  isOpen,
  onClose,
  listingId,
  listingType,
  defaultQuantity = "",
  minPrice,
  defaultCurrency = "GHS",
}: CreateEnquiryModalProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const token = useAppSelector(selectAccessToken);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [quantity, setQuantity] = useState(defaultQuantity);
  const [unit, setUnit] = useState<EnquiryUnit>("mt");
  const [price, setPrice] = useState(minPrice || "");
  const [currency, setCurrency] = useState(defaultCurrency);
  const [deliveryTerms, setDeliveryTerms] = useState("EXW");
  const [namedPlace, setNamedPlace] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [targetDeliveryDate, setTargetDeliveryDate] = useState("");
  const [message, setMessage] = useState("");

  if (!isOpen) return null;

  const numericPrice = Number(price);
  const hasNumericPrice = price !== "" && !isNaN(numericPrice);

  // Live equivalent of whatever's typed, shown in the other currency.
  const otherCurrency = currency === "USD" ? "GHS" : currency === "GHS" ? "USD" : null;
  const priceEquivalent =
    hasNumericPrice && otherCurrency ? convertCurrency(numericPrice, currency, otherCurrency) : null;

  // The listing's minimum price, converted into whichever currency is
  // currently selected (rounded up so the floor is never accidentally lower
  // than the true minimum).
  const numericMinPrice =
    minPrice !== undefined && minPrice !== "" && !isNaN(Number(minPrice)) ? Number(minPrice) : undefined;
  const effectiveMinPrice =
    numericMinPrice === undefined
      ? undefined
      : currency === defaultCurrency
        ? numericMinPrice
        : convertCurrency(numericMinPrice, defaultCurrency, currency) ?? undefined;

  const handleCurrencyChange = (newCurrency: string) => {
    if (hasNumericPrice) {
      const converted = convertCurrency(numericPrice, currency, newCurrency);
      if (converted !== null) {
        setPrice(converted.toFixed(2));
      }
    }
    setCurrency(newCurrency);
  };

  const totalValue =
    quantity && price && !isNaN(Number(quantity)) && !isNaN(Number(price))
      ? (Number(quantity) * Number(price)).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
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
          proposed_price_per_unit: price,
          currency: currency,
          message: message.trim(),
          delivery_terms: deliveryTerms || undefined,
          named_place: namedPlace || undefined,
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
      const errorMessage = typeof err === 'string' ? err : err?.message || "Failed to create enquiry.";
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl flex flex-col my-8 z-10 overflow-hidden max-h-[90vh]">
        <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 bg-white shrink-0">
          <h2 className="font-[var(--font-hanken)] text-3xl font-extrabold text-[#002627]">
            {listingType === "sell" ? "Request Supply" : "Respond to Request"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-[#002627] hover:bg-slate-100 rounded-lg transition"
            type="button"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
          <div className="grid gap-8 overflow-y-auto p-8 md:grid-cols-5">
            {/* Left column — deal terms */}
            <div className="grid gap-5 md:col-span-3">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm font-semibold rounded-lg">
                  {error}
                </div>
              )}

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
                    className={`${inputClassName} flex-1 min-w-0`}
                    placeholder="e.g. 50"
                  />
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as EnquiryUnit)}
                    className="min-h-11 w-24 shrink-0 rounded-lg border border-slate-200 bg-slate-50 px-2 text-[#0b1c30] outline-none transition focus:border-[#002627] focus:ring-2 focus:ring-[#002627]/20"
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
                  Proposed Price per Unit *
                </span>
                <div className="flex gap-2">
                  <input
                    type="number"
                    required
                    min={effectiveMinPrice !== undefined ? effectiveMinPrice : "0.01"}
                    step="any"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    onBlur={() => {
                      if (effectiveMinPrice !== undefined && Number(price) < effectiveMinPrice) {
                        setPrice(effectiveMinPrice.toFixed(2));
                      }
                    }}
                    className={`${inputClassName} flex-1 min-w-0`}
                    placeholder={`e.g. ${minPrice || "1500"}`}
                  />
                  <select
                    value={currency}
                    onChange={(e) => handleCurrencyChange(e.target.value)}
                    className="min-h-11 w-24 shrink-0 rounded-lg border border-slate-200 bg-slate-50 px-2 text-[#0b1c30] outline-none transition focus:border-[#002627] focus:ring-2 focus:ring-[#002627]/20"
                  >
                    <option value="GHS">GHS</option>
                    <option value="USD">USD</option>

                  </select>
                </div>
                <div className="grid gap-0.5">
                  {priceEquivalent !== null && (
                    <span className="text-xs font-medium text-[#404848]">
                      ≈ {otherCurrency} {priceEquivalent.toFixed(2)}
                    </span>
                  )}
                  {effectiveMinPrice !== undefined && (
                    <span className="text-xs font-medium text-[#404848]">
                      Minimum accepted: {currency} {effectiveMinPrice.toFixed(2)}
                      {currency !== defaultCurrency && numericMinPrice !== undefined && (
                        <> (≈ {defaultCurrency} {numericMinPrice.toFixed(2)})</>
                      )}
                    </span>
                  )}
                </div>
              </label>

              <div className="grid sm:grid-cols-2 gap-5">
                <label className="grid gap-2">
                  <span className="font-[var(--font-jetbrains)] text-xs font-bold uppercase tracking-wide text-[#404848]">
                    Delivery Terms (Incoterms)
                  </span>
                  <select
                    value={deliveryTerms}
                    onChange={(e) => setDeliveryTerms(e.target.value)}
                    className={inputClassName}
                  >
                    <option value="EXW">EXW (Ex Works)</option>
                    <option value="FCA">FCA (Free Carrier)</option>
                    <option value="CPT">CPT (Carriage Paid To)</option>
                    <option value="CIP">CIP (Carriage and Insurance Paid To)</option>
                    <option value="DAP">DAP (Delivered at Place)</option>
                    <option value="DPU">DPU (Delivered at Place Unloaded)</option>
                    <option value="DDP">DDP (Delivered Duty Paid)</option>
                    <option value="FAS">FAS (Free Alongside Ship)</option>
                    <option value="FOB">FOB (Free On Board)</option>
                    <option value="CFR">CFR (Cost and Freight)</option>
                    <option value="CIF">CIF (Cost, Insurance and Freight)</option>
                    <option value="OTHER">OTHER (Custom terms)</option>
                  </select>
                </label>

                <label className="grid gap-2">
                  <span className="font-[var(--font-jetbrains)] text-xs font-bold uppercase tracking-wide text-[#404848]">
                    Named Place {deliveryTerms !== "OTHER" && "*"}
                  </span>
                  <input
                    type="text"
                    required={deliveryTerms !== "OTHER"}
                    value={namedPlace}
                    onChange={(e) => setNamedPlace(e.target.value)}
                    className={inputClassName}
                    placeholder="e.g. Tema Port"
                  />
                </label>
              </div>

              <label className="grid gap-2">
                <span className="font-[var(--font-jetbrains)] text-xs font-bold uppercase tracking-wide text-[#404848]">
                  Target Delivery Date
                </span>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={targetDeliveryDate}
                  onChange={(e) => setTargetDeliveryDate(e.target.value)}
                  className={inputClassName}
                />
              </label>

              <label className="grid gap-2">
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

            {/* Right column — value summary & message */}
            <div className="grid gap-5 md:col-span-2">
              <div className="grid gap-2 rounded-xl border border-[#d3e4fe] bg-[#eff4ff] p-5">
                <span className="font-[var(--font-jetbrains)] text-xs font-bold uppercase tracking-wide text-[#002627]">
                  Total Estimated Value
                </span>
                <span className="font-[var(--font-hanken)] text-3xl font-black text-[#002627]">
                  {currency} {totalValue}
                </span>
                <span className="text-xs font-medium text-[#404848]">
                  {quantity || "0"} {unit.toUpperCase()} × {currency} {price || "0"} per unit
                </span>
              </div>

              <label className="grid gap-2">
                <span className="font-[var(--font-jetbrains)] text-xs font-bold uppercase tracking-wide text-[#404848]">
                  Initial Message *
                </span>
                <textarea
                  required
                  rows={7}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className={`${inputClassName} py-3 resize-none flex-1`}
                  placeholder="Introduce yourself and state any specific requirements or conditions..."
                ></textarea>
              </label>
            </div>
          </div>

          {/* Pinned footer */}
          <div className="flex shrink-0 gap-4 border-t border-slate-100 bg-white px-8 py-5">
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