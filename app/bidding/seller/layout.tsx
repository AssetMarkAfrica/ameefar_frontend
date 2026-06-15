"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { selectIsAuthenticated, selectIsSeller, selectIsBoth } from "@/store/auth/authSelectors";

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isSeller = useAppSelector(selectIsSeller);
  const isBoth = useAppSelector(selectIsBoth);

  const canAccessSeller = isSeller || isBoth;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    if (!canAccessSeller) {
      router.push("/bidding");
    }
  }, [isAuthenticated, canAccessSeller, router]);

  if (!isAuthenticated || !canAccessSeller) {
    return null; // Or a loading spinner
  }

  return <>{children}</>;
}
