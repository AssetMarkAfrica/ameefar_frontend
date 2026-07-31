"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { selectIsAdmin, selectIsAuthenticated } from "@/store/auth/authSelectors";

const NAV_ITEMS = [
  { href: "/blog/admin", icon: "edit_note", label: "Blog Admin" },
  { href: "/blog/admin/posts/create", icon: "post_add", label: "Create Post" },
  { href: "/blog/admin/subscribers", icon: "groups", label: "Subscribers" },
  { href: "/blog/admin/campaigns", icon: "campaign", label: "Campaigns" },
  { href: "/blog/admin/campaigns/create", icon: "mail", label: "Create Newsletter" },
];

const FOOTER_NAV = [
  { href: "#", icon: "settings", label: "Settings" },
  { href: "#", icon: "help", label: "Support" },
];

export default function BlogAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
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
      <div className="min-h-screen bg-surface-gray flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3 text-on-surface-variant">
          <svg className="h-8 w-8 animate-spin text-secondary" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="font-medium font-body-sm">Verifying access...</p>
        </div>
      </div>
    );
  }

  function isActive(href: string) {
    if (href === "/blog/admin") return pathname === "/blog/admin";
    return pathname.startsWith(href);
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex">
      <nav className="bg-surface-gray h-full w-64 fixed left-0 top-0 border-r border-border-subtle flex flex-col p-4 gap-2 z-40 md:flex hidden">
        <div className="mb-6 px-2 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-surface-container overflow-hidden shrink-0 flex items-center justify-center text-primary font-label-md">
            <span className="material-symbols-outlined">admin_panel_settings</span>
          </div>
          <div>
            <h2 className="font-headline-md text-headline-md font-bold text-primary truncate leading-tight">Management</h2>
            <p className="font-label-md text-label-md text-on-surface-variant truncate">Circular Economy Hub</p>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all active:scale-95 duration-150 ${
                isActive(item.href)
                  ? "bg-surface-container text-primary font-semibold"
                  : "text-on-surface-variant hover:bg-surface-container-low"
              }`}
            >
              <span
                className="material-symbols-outlined text-[20px]"
                {...(isActive(item.href) ? { style: { fontVariationSettings: "'FILL' 1" } } : {})}
              >
                {item.icon}
              </span>
              <span className="font-label-md text-label-md">{item.label}</span>
            </Link>
          ))}
        </div>

        <div className="mt-auto flex flex-col gap-1 pt-4 border-t border-border-subtle">
          {FOOTER_NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-all active:scale-95 duration-150"
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              <span className="font-label-md text-label-md">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      <main className="flex-1 md:ml-64 p-margin-mobile md:p-margin-desktop max-w-container-max mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
