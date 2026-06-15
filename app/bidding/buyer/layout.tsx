"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { selectIsAuthenticated, selectIsBuyer, selectIsBoth } from "@/store/auth/authSelectors";

export default function BuyerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isBuyer = useAppSelector(selectIsBuyer);
  const isBoth = useAppSelector(selectIsBoth);

  const canAccessBuyer = isBuyer || isBoth;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    if (!canAccessBuyer) {
      // Redirect sellers to their dashboard, otherwise fall back to generic bidding page
      router.push("/bidding/seller/dashboard");
    }
  }, [isAuthenticated, canAccessBuyer, router]);

  if (!isAuthenticated || !canAccessBuyer) {
    return null; // Or a loading spinner
  }

  return <>{children}</>;
}
