"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { useAppSelector } from "@/store/hooks";
import { selectIsBoth, selectIsSeller, selectIsAdmin } from "@/store/auth/authSelectors";

export default function BiddingHeader() {
  const pathname = usePathname();
  const isBoth = useAppSelector(selectIsBoth);
  const isSeller = useAppSelector(selectIsSeller);
  const isAdmin = useAppSelector(selectIsAdmin);

  const getLinkClass = (pathCheck: string) => {
    const isActive = pathname.startsWith(pathCheck);
    return isActive
      ? "text-primary font-bold border-b-2 border-primary pb-1"
      : "text-on-surface-variant font-body-md text-body-md hover:text-primary transition-colors duration-200";
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-surface-container-lowest border-b border-border-subtle h-16 flex justify-between items-center px-margin-desktop max-w-container-max mx-auto left-0 right-0">
      <div className="flex items-center gap-8">
        <Link
          href="/product"
          className="text-headline-md font-headline-md font-bold text-primary transition-colors hover:text-[#003a3b]"
        >
          Ameefar
        </Link>
        <nav className="hidden md:flex gap-6 items-center">
          <Link
            href="/product"
            className={getLinkClass("/product")}
          >
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
                className={getLinkClass("/bidding/buyer/dashboard")}
              >
                Buyer Trades
              </Link>
              <Link
                href="/bidding/seller/dashboard"
                className={getLinkClass("/bidding/seller/dashboard")}
              >
                Seller Trades
              </Link>
            </>
          ) : (
            <Link
              href={`/bidding/${isSeller ? 'seller' : 'buyer'}/dashboard`}
              className={getLinkClass(`/bidding/${isSeller ? 'seller' : 'buyer'}/dashboard`)}
            >
              My Trades
            </Link>
          )}

        </nav>
      </div>
      <div className="flex items-center gap-4">
        <button className="material-symbols-outlined text-outline hover:text-primary transition-all">
          notifications
        </button>
        <button className="material-symbols-outlined text-outline hover:text-primary transition-all">
          settings
        </button>
        <LogoutButton
          className="inline-flex items-center gap-1 rounded-lg border border-border-subtle px-3 py-2 text-sm font-semibold text-on-surface-variant transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
          showIcon
        />
        <div className="h-8 w-8 rounded-full overflow-hidden border border-border-subtle">
          <img
            alt="User avatar"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCfWrLjdZEXGQn9qeNs0hyjwwqfQFUrPUj_cHxYbfNmpafPM77_T3O1T-4EkGWIx9tHLlmYfPwQ5o6YXG9RFbIFKmtHRd8OKq9irGTk-35BWx6Ua0_YeSRRNTglHYDj9KxRspjCK_TpH_B2f7lHwhQmjD3CLnilDGin1uKG56Zq7kkzTjokxMYEqXm4s5DJlmxfQDepGaZ_8KS87h0s6WGMwrvHH3jfogi8CD8sXxW_8k03_AYcPDKXtgIow0_B3oDXaDtA1XsgmlpQ"
          />
        </div>
      </div>
    </header>
  );
}
