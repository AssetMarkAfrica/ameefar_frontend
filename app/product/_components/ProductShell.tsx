"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import {
  selectAccessToken,
  selectHasAuthSession,
} from "@/store/auth/authSelectors";
import ProductBannerHeader from "@/components/product/ProductBannerHeader";
import SiteFooter from "@/components/SiteFooter";

type ProductShellProps = {
  active: "marketplace" | "create";
  children: React.ReactNode;
};

export function ProductShell({ children }: ProductShellProps) {
  const router = useRouter();
  const hasAuthSession = useAppSelector(selectHasAuthSession);
  const token = useAppSelector(selectAccessToken);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(t);
  }, []);

  // Redirect unauthenticated users away from "create" (handled at page level if needed)
  useEffect(() => {
    if (!mounted) return;
  }, [mounted, hasAuthSession, router, token]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#f8f9ff] font-[var(--font-inter)] text-[#0b1c30]">
      <ProductBannerHeader />
      {/* pt-20 offsets the fixed 80px header */}
      <main className="pt-20 px-4 pb-16 md:px-10">{children}</main>
      {!token && <SiteFooter />}
    </div>
  );
}
