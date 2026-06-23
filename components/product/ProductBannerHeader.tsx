"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

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

  const getLinkClass = (pathCheck: string) => {
    const isActive = pathname.startsWith(pathCheck);
    return isActive
      ? "text-[#002627] font-semibold border-b-2 border-[#002627] pb-1 transition-colors duration-150"
      : "text-[#404848] text-sm font-medium hover:text-[#002627] transition-colors duration-150";
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-20 bg-white border-b border-slate-200">
      <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between px-6 md:px-10">

        {/* ── Logo + Nav ── */}
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

          {/* Desktop nav links */}
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
        </div>

        {/* ── Actions ── */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <NotificationDropdown />

              <LogoutButton
                className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-[#002627] hover:text-[#002627] disabled:cursor-not-allowed disabled:opacity-60"
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
      </div>
    </header>
  );
}
