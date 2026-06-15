"use client";

import React from "react";
import { useAppSelector } from "@/store/hooks";
import { selectIsSeller, selectIsAdmin } from "@/store/auth/authSelectors";
import BiddingBannerHeader from "@/components/bidding/BiddingBannerHeader";
import BiddingSidebar from "@/components/bidding/BiddingSidebar";

export default function BiddingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isSeller = useAppSelector(selectIsSeller);
  const isAdmin = useAppSelector(selectIsAdmin);

  const role: "buyer" | "seller" | "admin" = isAdmin
    ? "admin"
    : isSeller
      ? "seller"
      : "buyer";

  return (
    <div className="bg-surface-gray font-body-md text-on-background min-h-screen">
      {/* Fixed top banner */}
      <BiddingBannerHeader />

      {/* Sidebar — hidden on mobile, visible md+ */}
      <BiddingSidebar role={role} />

      {/* Main content — offset by header height and sidebar width */}
      <main className="pt-20 md:pl-64 min-h-screen">
        {children}
      </main>
    </div>
  );
}