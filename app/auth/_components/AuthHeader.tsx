"use client";

import Image from "next/image";
import Link from "next/link";
import { Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { useAppSelector } from "@/store/hooks";
import { selectUser, selectIsAuthenticated } from "@/store/auth/authSelectors";

const hanken = Hanken_Grotesk({ subsets: ["latin"], weight: ["400", "600", "700", "800"] });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"] });

export function AuthHeader() {
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-100 bg-white/98 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between px-6 md:px-12">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <Image
              alt="Ameefar logo"
              className="rounded-lg object-cover"
              height={36}
              width={36}
              src="/ameefarLogo.png"
            />
            <div className="flex flex-col leading-none">
              <span className={`${hanken.className} text-[16px] font-bold tracking-tight text-[#002627]`}>
                Ameefar
              </span>
              <span className={`${jetbrains.className} text-[9px] font-medium tracking-[0.15em] text-[#006d40] uppercase mt-0.5`}>
                Commodity Trading
              </span>
            </div>
          </Link>
          <nav className="hidden gap-7 md:flex text-[13.5px] font-medium text-slate-500">
            <a href="/product" className="hover:text-slate-900 transition-colors">Marketplace</a>
            <a href="#" className="hover:text-slate-900 transition-colors">About</a>
          </nav>
        </div>
        <div className="hidden md:flex items-center gap-4 text-sm">
          {isAuthenticated && user ? (
            <>
              <span className={`${jetbrains.className} text-xs text-[#006d40] font-medium`}>
                {user.first_name}
              </span>
              <LogoutButton className="rounded-lg border border-slate-200 bg-white px-4 py-1.5 text-[13px] font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60" />
            </>
          ) : (
            <Link
              href="/auth/login"
              className="rounded-lg bg-[#002627] px-5 py-2 text-[13px] font-semibold !text-white transition hover:bg-[#003a3c]"
            >
              Log in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
