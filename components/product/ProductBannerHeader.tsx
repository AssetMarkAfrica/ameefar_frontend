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
  selectIsBoth,
  selectIsSeller,
  selectIsAdmin,
  selectUser,
} from "@/store/auth/authSelectors";
import { ameefarLogoSrc, getAllowedListingTypes } from "@/app/product/_components/product-options";

export default function ProductBannerHeader() {
  const pathname = usePathname();
  const hasAuthSession = useAppSelector(selectHasAuthSession);
  const token = useAppSelector(selectAccessToken);
  const isBoth = useAppSelector(selectIsBoth);
  const isSeller = useAppSelector(selectIsSeller);
  const isAdmin = useAppSelector(selectIsAdmin);
  const user = useAppSelector(selectUser);

  const [menuOpen, setMenuOpen] = useState(false);

  const isAuthenticated = hasAuthSession && !!token;
  const canCreate = getAllowedListingTypes(user).length > 0;

  const avatarFallback = user?.full_name
    ? user.full_name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
    : "U";

  const getLinkClass = (pathCheck: string, mobile = false) => {
    const isActive = pathname.startsWith(pathCheck);
    if (mobile) {
      return isActive
        ? "block px-4 py-3 text-[15px] font-semibold text-[#002627] bg-[#f0faf9] rounded-lg"
        : "block px-4 py-3 text-[15px] font-medium text-slate-600 hover:text-[#002627] hover:bg-slate-50 rounded-lg transition-colors";
    }
    return isActive
      ? "text-[#002627] text-sm font-semibold border-b-2 border-[#002627] pb-1 transition-colors duration-150"
      : "text-[#404848] text-sm font-medium hover:text-[#002627] transition-colors duration-150";
  };

  // Collect nav links for reuse in mobile menu
  const navLinks = (
    <>
      <Link href="/product" className={getLinkClass("/product", true)} onClick={() => setMenuOpen(false)}>
        Marketplace
      </Link>

      {isAuthenticated && canCreate && (
        <Link href="/product/create" className={getLinkClass("/product/create", true)} onClick={() => setMenuOpen(false)}>
          Create Listing
        </Link>
      )}

      {isAuthenticated && (
        <>
          {isAdmin ? (
            <>
              <Link href="/bidding/dashboard" className={getLinkClass("/bidding", true)} onClick={() => setMenuOpen(false)}>
                Admin Panel
              </Link>
              <Link href="/profile/pending-verifications" className={getLinkClass("/profile", true)} onClick={() => setMenuOpen(false)}>
                Pending Verifications
              </Link>
            </>
          ) : isBoth ? (
            <>
              <Link href="/bidding/buyer/dashboard" className={getLinkClass("/bidding/buyer", true)} onClick={() => setMenuOpen(false)}>
                Buyer Trades
              </Link>
              <Link href="/bidding/seller/dashboard" className={getLinkClass("/bidding/seller", true)} onClick={() => setMenuOpen(false)}>
                Seller Trades
              </Link>
            </>
          ) : (
            <Link
              href={`/bidding/${isSeller ? "seller" : "buyer"}/dashboard`}
              className={getLinkClass(`/bidding/${isSeller ? "seller" : "buyer"}`, true)}
              onClick={() => setMenuOpen(false)}
            >
              My Trades
            </Link>
          )}
        </>
      )}
    </>
  );

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b border-slate-100 shadow-sm">
        <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between px-4 md:px-10">

          {/* ── Logo ── */}
          <Link href="/product" className="flex items-center gap-2.5 shrink-0">
            <Image
              alt="Ameefar logo"
              className="rounded-lg object-cover"
              height={34}
              width={34}
              src={ameefarLogoSrc}
            />
            <div className="flex flex-col leading-none">
              <span className="text-[15px] font-bold text-[#002627] tracking-tight">Ameefar</span>
              <span className="text-[9px] font-semibold tracking-[0.14em] text-[#006d40] uppercase mt-0.5">
                Commodity Trading
              </span>
            </div>
          </Link>

          {/* ── Desktop nav ── */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/product" className={getLinkClass("/product")}>
              Marketplace
            </Link>

            {isAuthenticated && canCreate && (
              <Link href="/product/create" className={getLinkClass("/product/create")}>
                Create Listing
              </Link>
            )}

            {isAuthenticated && (
              <>
                {isAdmin ? (
                  <>
                    <Link href="/bidding/dashboard" className={getLinkClass("/bidding")}>
                      Admin Panel
                    </Link>
                    <Link href="/profile/pending-verifications" className={getLinkClass("/profile")}>
                      Pending Verifications
                    </Link>
                  </>
                ) : isBoth ? (
                  <>
                    <Link href="/bidding/buyer/dashboard" className={getLinkClass("/bidding/buyer")}>
                      Buyer Trades
                    </Link>
                    <Link href="/bidding/seller/dashboard" className={getLinkClass("/bidding/seller")}>
                      Seller Trades
                    </Link>
                  </>
                ) : (
                  <Link
                    href={`/bidding/${isSeller ? "seller" : "buyer"}/dashboard`}
                    className={getLinkClass(`/bidding/${isSeller ? "seller" : "buyer"}`)}
                  >
                    My Trades
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* ── Desktop actions ── */}
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
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-[#eff4ff] border border-slate-200 text-xs font-bold text-[#002627]">
                      {avatarFallback}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-[#404848] transition hover:border-[#002627] hover:text-[#002627]"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="rounded-xl bg-[#002627] px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-900"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* ── Mobile right: notifications + avatar + hamburger ── */}
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
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-[#eff4ff] border border-slate-200 text-xs font-bold text-[#002627]">
                      {avatarFallback}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Hamburger */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle menu"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50"
            >
              {menuOpen ? (
                // X icon
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                // Hamburger icon
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile drawer ── */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMenuOpen(false)}>
          {/* backdrop */}
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />

          {/* panel */}
          <div
            className="absolute top-16 left-0 right-0 bg-white border-b border-slate-100 shadow-lg px-4 py-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* user greeting */}
            {isAuthenticated && user && (
              <div className="mb-3 flex items-center gap-3 px-4 py-3 rounded-xl bg-[#f8fffe] border border-[#beebeb]">
                <div className="h-9 w-9 shrink-0">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.full_name ?? "avatar"}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-[#eff4ff] text-xs font-bold text-[#002627]">
                      {avatarFallback}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-[#002627] truncate">{user.full_name ?? user.first_name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                </div>
              </div>
            )}

            {/* nav links */}
            <div className="flex flex-col gap-1">
              {navLinks}
            </div>

            {/* auth actions */}
            <div className="mt-4 border-t border-slate-100 pt-4 flex flex-col gap-2">
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
                    className="w-full flex items-center justify-center rounded-lg border border-slate-200 px-4 py-3 text-[14px] font-semibold text-[#404848] transition hover:border-[#002627] hover:text-[#002627]"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/register"
                    onClick={() => setMenuOpen(false)}
                    className="w-full flex items-center justify-center rounded-xl bg-[#002627] px-4 py-3 text-[14px] font-semibold text-white transition hover:bg-slate-900"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}