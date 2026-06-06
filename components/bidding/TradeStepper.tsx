"use client";
import React from "react";
import type { TradeStatus } from "@/types/bidding";

interface TradeStepperProps {
  status: TradeStatus;
}

export default function TradeStepper({ status }: TradeStepperProps) {
  // Ordered linear progress path
  const stages: TradeStatus[] = [
    "negotiating",
    "agreed",
    "in_progress",
    "completed",
  ];

  const currentIdx = stages.indexOf(status);
  
  // If status is cancelled or disputed, we handle them as terminal states.
  const isTerminal = status === "cancelled" || status === "disputed";
  // The progress line width
  const effectiveIdx = isTerminal ? stages.length - 1 : currentIdx;
  const progressWidth = effectiveIdx > 0 ? `${(effectiveIdx / (stages.length - 1)) * 100}%` : "0%";

  const renderStep = (stepStatus: TradeStatus, index: number) => {
    const isPast = !isTerminal && index < currentIdx;
    const isCurrent = !isTerminal && index === currentIdx;
    const isFuture = index > currentIdx || isTerminal;

    let icon = "circle";
    if (stepStatus === "negotiating") icon = "handshake";
    if (stepStatus === "agreed") icon = "check";
    if (stepStatus === "in_progress") icon = "local_shipping";
    if (stepStatus === "completed") icon = "verified";

    return (
      <div key={stepStatus} className={`flex flex-col items-center group ${isFuture ? "opacity-40" : ""}`}>
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center z-10 transition-transform ${
            isPast
              ? "bg-secondary text-white shadow-lg shadow-secondary/20"
              : isCurrent
              ? "bg-white border-2 border-secondary text-secondary shadow-sm step-pulse"
              : "bg-white border-2 border-outline-variant text-outline-variant"
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">{icon}</span>
        </div>
        <span
          className={`mt-3 font-label-md text-label-md ${
            isPast ? "text-primary font-bold" : isCurrent ? "text-secondary font-medium" : ""
          }`}
        >
          {stepStatus.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
        </span>
      </div>
    );
  };

  return (
    <div className="relative mt-8 max-w-4xl mx-auto px-4">
      <div className="absolute top-5 left-4 right-4 h-0.5 bg-outline-variant"></div>
      <div
        className="absolute top-5 left-4 h-0.5 bg-secondary transition-all duration-700"
        style={{ width: `calc(${progressWidth} - 2rem)` }}
      ></div>
      <div className="relative flex justify-between">
        {stages.map((step, idx) => renderStep(step, idx))}
      </div>
      {isTerminal && (
        <div className="mt-8 text-center">
          <span className={`px-4 py-2 font-bold rounded-lg ${status === 'cancelled' ? 'bg-error-container text-error' : 'bg-orange-100 text-orange-700'}`}>
            Trade {status === 'cancelled' ? 'Cancelled' : 'Disputed'}
          </span>
        </div>
      )}
    </div>
  );
}
