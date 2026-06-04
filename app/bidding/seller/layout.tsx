"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { selectUser, selectIsAuthenticated } from "@/store/auth/authSelectors";

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    if (user && user.role !== "seller" && user.role !== "both") {
      router.push("/bidding/buyer");
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || !user || (user.role !== "seller" && user.role !== "both")) {
    return null; // Or a loading spinner
  }

  return <>{children}</>;
}
