"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { LogoutButton } from "@/components/auth/LogoutButton";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";
import { useAppSelector } from "@/store/hooks";
import {
  selectAccessToken,
  selectHasAuthSession,
  selectIsAdmin,
  selectUser,
} from "@/store/auth/authSelectors";
import { ameefarLogoSrc } from "@/app/product/_components/product-options";

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hasAuthSession = useAppSelector(selectHasAuthSession);
  const token = useAppSelector(selectAccessToken);
  const isAdmin = useAppSelector(selectIsAdmin);
  const user = useAppSelector(selectUser);

  const [menuOpen, setMenuOpen] = useState(false);

  const isAuthenticated = hasAuthSession && !!token;

  const isAdminArea = pathname.startsWith("/blog/admin");

  const avatarFallback = user?.full_name
    ? user.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  const getLinkClass = (href: string, mobile = false) => {
    const isActive = pathname === href || (href !== "/blog" && pathname.startsWith(href));
    if (mobile) {
      return isActive
        ? "block px-4 py-3 text-[15px] font-semibold text-primary bg-surface-container rounded-lg"
        : "block px-4 py-3 text-[15px] font-medium text-on-surface-variant hover:text-primary hover:bg-surface-gray rounded-lg transition-colors";
    }
    return isActive
      ? "text-primary text-sm font-semibold border-b-2 border-primary pb-1 transition-colors duration-150"
      : "text-on-surface-variant text-sm font-medium hover:text-primary transition-colors duration-150";
  };

  const navLinks = (
    <>
      <Link href="/blog" className={getLinkClass("/blog", true)} onClick={() => setMenuOpen(false)}>
        Blog Home
      </Link>

      {isAuthenticated && isAdmin && (
        <>
          <Link href="/blog/admin" className={getLinkClass("/blog/admin", true)} onClick={() => setMenuOpen(false)}>
            Dashboard
          </Link>
          <Link href="/blog/admin/posts/create" className={getLinkClass("/blog/admin/posts/create", true)} onClick={() => setMenuOpen(false)}>
            Create Post
          </Link>
          <Link href="/blog/admin/subscribers" className={getLinkClass("/blog/admin/subscribers", true)} onClick={() => setMenuOpen(false)}>
            Subscribers
          </Link>
          <Link href="/blog/admin/campaigns" className={getLinkClass("/blog/admin/campaigns", true)} onClick={() => setMenuOpen(false)}>
            Campaigns
          </Link>
          <Link href="/blog/admin/campaigns/create" className={getLinkClass("/blog/admin/campaigns/create", true)} onClick={() => setMenuOpen(false)}>
            Create Newsletter
          </Link>
        </>
      )}
    </>
  );

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b border-border-subtle shadow-sm">
        <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between px-4 md:px-10">

          <Link href="/blog" className="flex items-center gap-2.5 shrink-0">
            <Image
              alt="Ameefar logo"
              className="rounded-lg object-cover"
              height={34}
              width={34}
              src={ameefarLogoSrc}
            />
            <div className="flex flex-col leading-none">
              <span className="text-[15px] font-bold text-primary tracking-tight">Ameefar</span>
              <span className="text-[9px] font-semibold tracking-[0.14em] text-[#006d40] uppercase mt-0.5">
                Circular Economy Hub
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/blog" className={getLinkClass("/blog")}>
              Blog Home
            </Link>

            {isAuthenticated && isAdmin && (
              <>
                <Link href="/blog/admin" className={getLinkClass("/blog/admin")}>
                  Dashboard
                </Link>
                <Link href="/blog/admin/posts/create" className={getLinkClass("/blog/admin/posts/create")}>
                  Create Post
                </Link>
                <Link href="/blog/admin/subscribers" className={getLinkClass("/blog/admin/subscribers")}>
                  Subscribers
                </Link>
                <Link href="/blog/admin/campaigns" className={getLinkClass("/blog/admin/campaigns")}>
                  Campaigns
                </Link>
                <Link href="/blog/admin/campaigns/create" className={getLinkClass("/blog/admin/campaigns/create")}>
                  Create Newsletter
                </Link>
              </>
            )}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <NotificationDropdown />
                <LogoutButton
                  className="inline-flex items-center gap-1 sm:gap-1.5 rounded-lg border border-red-200 bg-red-50 px-2 py-1.5 sm:px-3 sm:py-2 text-[11px] sm:text-sm font-semibold text-red-600 transition hover:bg-red-100 hover:border-red-300 disabled:cursor-not-allowed disabled:opacity-60"
                  showIcon
                />
                <div className="relative h-8 w-8 shrink-0">
                  {user?.avatar_url ? (
                    <img
                      alt={user.full_name ?? "User avatar"}
                      src={user.avatar_url}
                      className="h-full w-full rounded-full object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-surface-container border border-slate-200 text-xs font-bold text-primary">
                      {avatarFallback}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="rounded-lg border border-border-subtle px-4 py-2 text-sm font-semibold text-on-surface-variant transition hover:border-primary hover:text-primary"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold !text-white transition hover:bg-ameefar-navy"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          <div className="flex md:hidden items-center gap-2">
            {isAuthenticated && (
              <>
                <NotificationDropdown />
                <div className="relative h-8 w-8 shrink-0">
                  {user?.avatar_url ? (
                    <img
                      alt={user.full_name ?? "User avatar"}
                      src={user.avatar_url}
                      className="h-full w-full rounded-full object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-surface-container border border-slate-200 text-xs font-bold text-primary">
                      {avatarFallback}
                    </div>
                  )}
                </div>
              </>
            )}

            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle menu"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-subtle text-on-surface-variant transition hover:bg-surface-gray"
            >
              {menuOpen ? (
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />

          <div
            className="absolute top-16 left-0 right-0 bg-white border-b border-border-subtle shadow-lg px-4 py-4"
            onClick={(e) => e.stopPropagation()}
          >
            {isAuthenticated && user && (
              <div className="mb-3 flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-container border border-border-subtle">
                <div className="h-9 w-9 shrink-0">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.full_name ?? "avatar"}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-surface-container border border-slate-200 text-xs font-bold text-primary">
                      {avatarFallback}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-primary truncate">{user.full_name ?? user.first_name}</p>
                  <p className="text-[11px] text-on-surface-variant truncate">{user.email}</p>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1">
              {navLinks}
            </div>

            <div className="mt-4 border-t border-border-subtle pt-4 flex flex-col gap-2">
              {isAuthenticated ? (
                <LogoutButton
                  className="w-full flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[14px] font-semibold text-red-600 transition hover:bg-red-100 hover:border-red-300 disabled:opacity-60"
                  showIcon
                />
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    onClick={() => setMenuOpen(false)}
                    className="w-full flex items-center justify-center rounded-lg border border-border-subtle px-4 py-3 text-[14px] font-semibold text-on-surface-variant transition hover:border-primary hover:text-primary"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/register"
                    onClick={() => setMenuOpen(false)}
                    className="w-full flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold !text-white transition hover:bg-ameefar-navy"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <main className="pt-16 min-h-screen bg-surface-gray">{children}</main>
    </>
  );
}
