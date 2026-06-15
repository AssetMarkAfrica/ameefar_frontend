"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { selectIsAuthenticated, selectIsAdmin } from "@/store/auth/authSelectors";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isAdmin = useAppSelector(selectIsAdmin);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    if (!isAdmin) {
      router.push("/product"); // Generic fallback to let root handler route them
    }
  }, [isAuthenticated, isAdmin, router]);

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return <>{children}</>;
}
