"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { selectIsAuthenticated } from "@/store/auth/authSelectors";

export default function GuestGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && isAuthenticated) {
      router.replace("/product");
    }
  }, [mounted, isAuthenticated, router]);

  if (!mounted) {
    return null;
  }

  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
