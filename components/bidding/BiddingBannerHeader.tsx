"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { useAppSelector } from "@/store/hooks";
import {
  selectIsBoth,
  selectIsSeller,
  selectIsAdmin,
  selectUser,
} from "@/store/auth/authSelectors";
import { ameefarLogoSrc } from "@/app/product/_components/product-options";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";

export default function BiddingBannerHeader() {
  const pathname = usePathname();
  const isBoth = useAppSelector(selectIsBoth);
  const isSeller = useAppSelector(selectIsSeller);
  const isAdmin = useAppSelector(selectIsAdmin);
  const user = useAppSelector(selectUser);

  const [menuOpen, setMenuOpen] = useState(false);

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
      ? "text-[#002627] font-semibold border-b-2 border-[#002627] pb-1 transition-colors duration-150"
      : "text-[#404848] text-sm font-medium hover:text-[#002627] transition-colors duration-150";
  };

  const navLinks = (
    <>
      <Link href="/product" className={getLinkClass("/product", true)} onClick={() => setMenuOpen(false)}>
        Marketplace
      </Link>

      {isAdmin ? (
        <Link href="/bidding" className={getLinkClass("/bidding", true)} onClick={() => setMenuOpen(false)}>
          Admin Panel
        </Link>
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
  );

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 h-20 bg-white border-b border-slate-200">
        <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between px-6 md:px-10">
          {/* Logo + Nav */}
          <div className="flex items-center gap-8">
            <Link href="/product" className="flex items-center gap-3 shrink-0">
              <Image
                alt="Ameefar logo"
                className="rounded-lg object-cover"
                height={40}
                width={40}
                src={ameefarLogoSrc}
              />
              <div className="flex flex-col leading-tight">
                <span className="font-[var(--font-hanken)] text-[17px] font-bold text-[#002627]">
                  Ameefar
                </span>
                <span className="text-[10px] font-semibold tracking-widest text-[#006d40] uppercase">
                  Commodity Trading
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link href="/product" className={getLinkClass("/product")}>
                Marketplace
              </Link>

              {isAdmin ? (
                <Link
                  href="/bidding"
                  className={getLinkClass("/bidding")}
                >
                  Admin Panel
                </Link>
              ) : isBoth ? (
                <>
                  <Link
                    href="/bidding/buyer/dashboard"
                    className={getLinkClass("/bidding/buyer")}
                  >
                    Buyer Trades
                  </Link>
                  <Link
                    href="/bidding/seller/dashboard"
                    className={getLinkClass("/bidding/seller")}
                  >
                    Seller Trades
                  </Link>
                </>
              ) : (
                <Link
                  href={`/bidding/${isSeller ? "seller" : "buyer"}/dashboard`}
                  className={getLinkClass(
                    `/bidding/${isSeller ? "seller" : "buyer"}`
                  )}
                >
                  My Trades
                </Link>
              )}
            </nav>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <NotificationDropdown />

            <LogoutButton
              className="inline-flex items-center gap-1 sm:gap-1.5 rounded-lg border border-red-200 bg-red-50 px-2 py-1.5 sm:px-3 sm:py-2 text-[11px] sm:text-sm font-semibold text-red-600 transition hover:bg-red-100 hover:border-red-300 disabled:cursor-not-allowed disabled:opacity-60"
              showIcon
            />

            {/* Avatar */}
            <div className="relative h-9 w-9 shrink-0">
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
          </div>

          {/* Mobile right: notifications + avatar + hamburger */}
          <div className="flex md:hidden items-center gap-2">
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
            {/* Hamburger */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle menu"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50"
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

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
          <div
            className="absolute top-20 left-0 right-0 bg-white border-b border-slate-100 shadow-lg px-4 py-4"
            onClick={(e) => e.stopPropagation()}
          >
            {user && (
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
            <div className="flex flex-col gap-1">
              {navLinks}
            </div>
            <div className="mt-4 border-t border-slate-100 pt-4 flex flex-col gap-2">
              <LogoutButton
                className="w-full flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[14px] font-semibold text-red-600 transition hover:bg-red-100 hover:border-red-300 disabled:opacity-60"
                showIcon
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}