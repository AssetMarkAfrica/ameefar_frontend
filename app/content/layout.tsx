"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import SiteFooter from "@/components/SiteFooter";
import { useAppSelector } from "@/store/hooks";
import { selectIsAuthenticated, selectUser } from "@/store/auth/authSelectors";
import { LogoutButton } from "@/components/auth/LogoutButton";

const hanken = Hanken_Grotesk({ subsets: ["latin"], weight: ["400", "600", "700", "800"] });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"] });

export default function ContentLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);
  const [menuOpen, setMenuOpen] = useState(false);

  const getLinkClass = (href: string) => {
    const isActive = pathname === href || pathname.startsWith(href + "/");
    return `${jetbrains.className} text-[11px] tracking-wide transition-colors ${
      isActive ? "text-[#00bfa5]" : "text-white/50 hover:text-white/90"
    }`;
  };

  return (
    <div className="min-h-screen bg-[#001a1a] text-slate-100 antialiased">
      {/* ── Dark Navbar ── */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-white/[0.07] bg-[#001a1a]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between px-6 md:px-12">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <Image
              src="/ameefarLogo.png"
              alt="Ameefar"
              width={34}
              height={34}
              className="rounded-lg ring-1 ring-white/20 group-hover:scale-105 transition-transform duration-200"
            />
            <div className="flex flex-col leading-none">
              <span className={`${hanken.className} text-[16px] font-bold text-white group-hover:text-[#beebeb] transition-colors`}>
                Ameefar
              </span>
              <span className={`${jetbrains.className} text-[9px] tracking-[0.14em] text-[#00bfa5] uppercase mt-0.5`}>
                News Hub
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-7">
            <Link href="/content" className={getLinkClass("/content")}>
              All News
            </Link>
            <Link href="/product" className={getLinkClass("/product")}>
              Marketplace
            </Link>
            <Link href="/" className={getLinkClass("/")}>
              Home
            </Link>
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated && user ? (
              <>
                <span className={`${jetbrains.className} text-[11px] text-[#00bfa5]`}>{user.first_name}</span>
                <LogoutButton
                  className={`rounded-lg border border-white/20 bg-white/[0.08] px-4 py-1.5 text-[12px] font-medium text-white/80 hover:bg-white/[0.15] transition`}
                />
              </>
            ) : (
              <Link
                href="/auth/register"
                className={`${hanken.className} rounded-xl bg-[#beebeb] px-5 py-2 text-[13px] font-bold text-[#002627] hover:bg-white transition-all duration-300 hover:-translate-y-0.5`}
              >
                Get Started
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            className="flex md:hidden h-9 w-9 items-center justify-center rounded-lg border border-white/15 text-white/60 hover:bg-white/[0.08] transition"
          >
            {menuOpen ? (
              <svg fill="none" height="16" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" width="16">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg fill="none" height="16" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" width="16">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="absolute top-14 inset-x-0 bg-[#001a1a] border-b border-white/[0.07] px-6 py-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-3">
              <Link href="/content" className={getLinkClass("/content")} onClick={() => setMenuOpen(false)}>All News</Link>
              <Link href="/product" className={getLinkClass("/product")} onClick={() => setMenuOpen(false)}>Marketplace</Link>
              <Link href="/" className={getLinkClass("/")} onClick={() => setMenuOpen(false)}>Home</Link>
            </div>
            <div className="mt-5 border-t border-white/[0.07] pt-5">
              {isAuthenticated ? (
                <LogoutButton className="w-full rounded-xl border border-white/20 bg-white/[0.06] px-4 py-2.5 text-[13px] font-medium text-white/70 hover:bg-white/[0.12] transition" />
              ) : (
                <Link
                  href="/auth/register"
                  onClick={() => setMenuOpen(false)}
                  className={`${hanken.className} block w-full rounded-xl bg-[#beebeb] px-5 py-3 text-center text-[13px] font-bold text-[#002627] hover:bg-white transition`}
                >
                  Get Started
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Page content */}
      <main className="pt-14">{children}</main>

      <SiteFooter />
    </div>
  );
}

