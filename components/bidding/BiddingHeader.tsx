"use client";
import React from "react";
import Link from "next/link";
import { useAppSelector } from "@/store/hooks";
import { selectUser } from "@/store/auth/authSelectors";

export default function BiddingHeader() {
  const user = useAppSelector(selectUser);

  return (
    <header className="fixed top-0 w-full z-50 bg-surface-container-lowest border-b border-border-subtle h-16 flex justify-between items-center px-margin-desktop max-w-container-max mx-auto left-0 right-0">
      <div className="flex items-center gap-8">
        <span className="text-headline-md font-headline-md font-bold text-primary">
          Ameefar
        </span>
        <nav className="hidden md:flex gap-6">
          <Link
            href="/product"
            className="text-on-surface-variant font-body-md text-body-md hover:text-primary transition-colors duration-200"
          >
            Marketplace
          </Link>
          <Link
            href={`/bidding/${user?.role === 'seller' ? 'seller' : 'buyer'}`}
            className="text-primary font-bold border-b-2 border-primary pb-1"
          >
            My Trades
          </Link>
          <Link
            href="#"
            className="text-on-surface-variant font-body-md text-body-md hover:text-primary transition-colors duration-200"
          >
            Reports
          </Link>
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <button className="material-symbols-outlined text-outline hover:text-primary transition-all">
          notifications
        </button>
        <button className="material-symbols-outlined text-outline hover:text-primary transition-all">
          settings
        </button>
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
