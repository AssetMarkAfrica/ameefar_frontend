"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { useAppSelector } from "@/store/hooks";
import { selectUser, selectIsAuthenticated } from "@/store/auth/authSelectors";

const hanken = Hanken_Grotesk({ subsets: ["latin"], weight: ["400", "600", "700", "800"] });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"] });

interface SiteHeaderProps {
  isFooterVisible?: boolean;
  /** Set to true on pages with a white/light background so the nav is always solid. */
  solid?: boolean;
}

export default function SiteHeader({ isFooterVisible = false, solid = false }: SiteHeaderProps) {
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    // On mount, check immediately in case the page is already scrolled
    handler();
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // When solid=true, behave as if always scrolled past the hero
  const isScrolled = solid || scrolled;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        isFooterVisible ? "-translate-y-full" : "translate-y-0"
      } ${
        isScrolled
          ? "border-b border-slate-100 bg-white/98 backdrop-blur-xl shadow-sm"
          : "border-b border-white/10 bg-transparent backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto flex h-[68px] w-full max-w-[1440px] items-center justify-between px-6 md:px-12">
        {/* Logo */}
        <Link href="/company" className="flex items-center gap-3.5 shrink-0 group">
          <div className="relative">
            <div
              className={`absolute inset-0 rounded-xl bg-emerald-500/20 blur-md transition-all duration-300 ${
                isScrolled ? "opacity-0" : "opacity-100 group-hover:opacity-100 group-hover:bg-emerald-500/30 group-hover:blur-lg"
              }`}
            />
            <Image
              alt="Ameefar logo"
              className="relative rounded-xl object-cover ring-1 ring-white/20 transition-transform duration-300 group-hover:scale-105"
              height={44}
              width={44}
              src="/ameefarLogo.png"
            />
          </div>
          <div className="flex flex-col leading-none">
            <span
              className={`${hanken.className} text-[18px] font-bold tracking-tight transition-colors duration-300 ${
                isScrolled ? "text-[#002627]" : "text-white drop-shadow-sm"
              }`}
            >
              AMEEFAR
            </span>
            <span
              className={`${jetbrains.className} text-[9px] font-medium tracking-[0.16em] uppercase mt-0.5 transition-colors duration-300 ${
                isScrolled ? "text-[#006d40]" : "text-emerald-300"
              }`}
            >
              Energy Africa
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav
          className={`hidden gap-7 md:flex text-[13.5px] font-medium transition-colors duration-300 ${
            isScrolled ? "text-slate-500" : "text-white/80"
          }`}
        >
          {[
            { id: "about", label: "About Us", href: "/company#about" },
            { id: "protocol", label: "Protocol", href: "/company#protocol" },
            { id: "materials", label: "Materials", href: "/company#materials" },
            { id: "blog", label: "Blog", href: "/blog" },
          ].map(({ id, label, href }) => (
            <Link
              key={id}
              href={href}
              className={`transition-colors ${
                isScrolled ? "hover:text-emerald-600" : "hover:text-white"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-4 text-sm">
          {mounted && isAuthenticated && user ? (
            <>
              <span
                className={`${jetbrains.className} text-xs font-medium transition-colors duration-300 ${
                  isScrolled ? "text-[#006d40]" : "text-emerald-300"
                }`}
              >
                {user.first_name}
              </span>
              <LogoutButton
                className={`rounded-lg border px-4 py-1.5 text-[13px] font-medium transition hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-60 ${
                  isScrolled
                    ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    : "border-white/25 bg-white/10 text-white hover:bg-white/20"
                }`}
              />
            </>
          ) : (
            <Link
              href="/marketplace"
              className={`${hanken.className} rounded-xl px-6 py-2.5 text-[13px] font-bold transition-all duration-300 hover:-translate-y-0.5 ${
                isScrolled
                  ? "bg-[#002627] !text-white hover:bg-[#003a3c] shadow-sm"
                  : "bg-[#beebeb] text-[#002627] hover:bg-white shadow-[0_0_24px_rgba(190,235,235,0.35)]"
              }`}
            >
              Visit Marketplace
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
