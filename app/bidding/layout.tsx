"use client";
import React from "react";
import BiddingHeader from "@/components/bidding/BiddingHeader";

export default function BiddingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface-gray font-body-md text-on-background min-h-screen flex flex-col">
      <BiddingHeader />
      <div className="flex-1 mt-16 flex flex-col w-full h-full">
        {children}
      </div>
    </div>
  );
}
