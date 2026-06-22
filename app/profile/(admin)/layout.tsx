"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { selectIsAdmin, selectIsAuthenticated } from "@/store/auth/authSelectors";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isAdmin = useAppSelector(selectIsAdmin);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      if (!isAuthenticated) {
        router.replace("/login");
      } else if (!isAdmin) {
        router.replace("/");
      }
    }
  }, [mounted, isAuthenticated, isAdmin, router]);

  if (!mounted || !isAuthenticated || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3 text-[#404848]">
          <svg className="h-8 w-8 animate-spin text-[#006d40]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="font-medium">Verifying access...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
