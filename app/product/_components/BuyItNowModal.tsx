"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectAccessToken } from "@/store/auth/authSelectors";
import { createDirectPurchaseThunk } from "@/store/direct-purchase/directPurchaseThunks";

interface BuyItNowModalProps {
  isOpen: boolean;
  onClose: () => void;
  listingId: string;
  defaultQuantity?: string;
  pricePerUnit: string;
  currency: string;
  deliveryTerms: string;
  namedPlace: string;
}

const inputClassName =
  "min-h-12 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-base font-medium text-[#0b1c30] outline-none transition focus:border-[#002627] focus:ring-2 focus:ring-[#002627]/20 disabled:opacity-70 disabled:bg-slate-100 disabled:cursor-not-allowed";

// Fixed conversion rate — everything in this modal is displayed in USD.
const GHS_PER_USD = 11.37;

function toUsd(amount: number, currency: string): number {
  if (currency?.toUpperCase() === "GHS") return amount / GHS_PER_USD;
  // Other currencies aren't wired to a live rate yet; treat as already USD.
  return amount;
}

export function BuyItNowModal({
  isOpen,
  onClose,
  listingId,
  defaultQuantity = "",
  pricePerUnit,
  currency,
  deliveryTerms,
  namedPlace,
}: BuyItNowModalProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const token = useAppSelector(selectAccessToken);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [quantity, setQuantity] = useState(defaultQuantity);
  const [deliveryAddress, setDeliveryAddress] = useState("");

  if (!isOpen) return null;

  const numQuantity = quantity && !isNaN(Number(quantity)) ? Number(quantity) : 0;
  const numPrice = !isNaN(Number(pricePerUnit)) ? Number(pricePerUnit) : 0;
  const priceUsd = toUsd(numPrice, currency);

  const subtotal = numQuantity * priceUsd;
  const platformFee = subtotal * 0.05;

  // Inspection fee is a flat 1,000 USD (= 11,370 GHS at the fixed rate above)
  const inspectionFee = 1000;

  const totalCommitment = subtotal + platformFee + inspectionFee;

  const formattedSubtotal = subtotal.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const formattedPlatformFee = platformFee.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const formattedInspectionFee = inspectionFee.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const formattedTotalCommitment = totalCommitment.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

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
        createDirectPurchaseThunk({
          token,
          payload: {
            listing_id: listingId,
            quantity,
            delivery_address: deliveryAddress.trim(),
          },
        })
      ).unwrap();

      // Redirect to the created trade inspection page
      router.push(`/bidding/buyer/trade/${result.data.trade_id}`);
    } catch (err: any) {
      const errorMessage = typeof err === 'string' ? err : err?.message || "Failed to process purchase.";
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
            Buy It Now
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-[#002627] hover:bg-slate-100 rounded-lg transition"
            type="button"
          >
            <svg fill="none" height="18" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="18">
              <line x1="18" x2="6" y1="6" y2="18" />
              <line x1="6" x2="18" y1="6" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
          <div className="grid gap-8 overflow-y-auto p-8 md:grid-cols-5">
            {/* Left column — inputs */}
            <div className="grid gap-5 md:col-span-3">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm font-semibold rounded-lg">
                  {error}
                </div>
              )}

              {/* Payment Phase Notice — condensed */}
              <div className="flex gap-3 rounded-xl border border-sky-200 bg-sky-50/80 p-4 text-sky-950">
                <svg className="mt-0.5 h-5 w-5 shrink-0 text-sky-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" x2="12" y1="8" y2="12" />
                  <line x1="12" x2="12.01" y1="16" y2="16" />
                </svg>
                <p className="text-sm leading-relaxed text-sky-900">
                  <strong className="font-bold">No payment now.</strong> Next you'll pay a{" "}
                  <strong className="font-bold">1,000 USD inspection fee</strong>{" "}
                  to verify the material, then the balance plus a 5% platform fee after approval.
                </p>
              </div>

              <label className="grid gap-2">
                <span className="font-[var(--font-jetbrains)] text-sm font-bold uppercase tracking-wide text-[#404848]">
                  Quantity (MT) *
                </span>
                <input
                  type="number"
                  required
                  min="0.01"
                  step="any"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className={inputClassName}
                  placeholder="e.g. 50"
                />
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="grid gap-2">
                  <span className="font-[var(--font-jetbrains)] text-sm font-bold uppercase tracking-wide text-[#404848]">
                    Price per MT
                  </span>
                  <input
                    type="text"
                    disabled
                    value={`USD ${priceUsd.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`}
                    className={inputClassName}
                  />
                </label>

                <label className="grid gap-2">
                  <span className="font-[var(--font-jetbrains)] text-sm font-bold uppercase tracking-wide text-[#404848]">
                    Delivery
                  </span>
                  <input
                    type="text"
                    disabled
                    value={`${deliveryTerms} ${namedPlace}`}
                    className={inputClassName}
                  />
                </label>
              </div>

              <label className="grid gap-2">
                <span className="font-[var(--font-jetbrains)] text-sm font-bold uppercase tracking-wide text-[#404848]">
                  Delivery Address *
                </span>
                <input
                  type="text"
                  required
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className={inputClassName}
                  placeholder="Enter full delivery address"
                />
              </label>
            </div>

            {/* Right column — financial breakdown */}
            <div className="md:col-span-2">
              <div className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-5">
                <span className="font-[var(--font-jetbrains)] text-xs font-extrabold uppercase tracking-widest text-slate-500">
                  Estimated Breakdown
                </span>

                <div className="grid gap-3 text-sm">
                  <div className="flex flex-col gap-0.5 text-slate-700">
                    <span className="font-medium">Material Subtotal ({numQuantity} MT)</span>
                    <span className="font-mono text-base font-bold text-slate-900">
                      USD {formattedSubtotal}
                    </span>
                  </div>

                  <div className="flex flex-col gap-0.5 text-slate-700">
                    <span className="flex items-center gap-2 font-medium">
                      Platform Fee
                      <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-extrabold text-[#006d40]">
                        5%
                      </span>
                    </span>
                    <span className="font-mono text-base font-bold text-slate-900">
                      USD {formattedPlatformFee}
                    </span>
                  </div>

                  <div className="flex flex-col gap-0.5 text-slate-700">
                    <span className="font-medium">Inspection Fee (next screen)</span>
                    <span className="font-mono text-base font-bold text-slate-900">
                      USD {formattedInspectionFee}
                    </span>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-4">
                  <span className="block font-[var(--font-hanken)] text-sm font-extrabold text-[#002627]">
                    Total Estimated Commitment
                  </span>
                  <span className="mt-0.5 block text-xs font-medium text-slate-500">
                    Material + 5% platform fee + inspection
                  </span>
                  <span className="mt-2 block font-[var(--font-hanken)] text-3xl font-black text-[#002627]">
                    USD {formattedTotalCommitment}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky footer */}
          <div className="flex shrink-0 gap-4 border-t border-slate-100 bg-white px-8 py-5">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 min-h-12 rounded-xl border border-slate-200 font-bold text-[#002627] hover:bg-slate-50 transition disabled:opacity-50 text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-[2] min-h-12 rounded-xl bg-[#002627] font-bold text-white hover:bg-slate-900 transition flex items-center justify-center disabled:opacity-50 text-base shadow-sm"
            >
              {isLoading ? "Processing..." : "Proceed to Inspection →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}