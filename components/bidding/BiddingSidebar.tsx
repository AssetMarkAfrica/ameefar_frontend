"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { ameefarLogoSrc } from "@/app/product/_components/product-options";

interface SidebarProps {
  role: "buyer" | "seller" | "admin";
}

function AmeefarWordmark() {
  return (
    <span>
      <strong className="block font-[var(--font-hanken)] text-xl leading-5 text-[#002627]">
        Ameefar
      </strong>
      <small className="block text-[11px] font-medium tracking-wide text-[#404848]">
        Enterprise marketplace
      </small>
    </span>
  );
}

export default function BiddingSidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: `/bidding/${role}/dashboard`, icon: "dashboard" },
    { name: "Market", href: "/product", icon: "storefront" },
    { name: "Negotiations", href: `/bidding/${role}/negotiations`, icon: "handshake", activePath: "negotiation" },
    { name: "Inspections", href: `/bidding/${role}/inspections`, icon: "fact_check" },
    { name: "Profile", href: "/profile", icon: "person" },
  ];

  return (
    <aside
      aria-label="Bidding navigation"
      className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r border-slate-200 bg-white px-4 py-6 md:flex"
    >
      {/* Logo — identical to ProductShell */}
      <Link className="flex items-center gap-3" href="/product">
        <Image
          alt="Ameefar Energy Logo"
          className="shrink-0 rounded-lg object-cover"
          height={40}
          src={ameefarLogoSrc}
          width={40}
        />
        <AmeefarWordmark />
      </Link>

      {/* Nav links */}
      <nav className="mt-8 grid gap-1 text-sm font-semibold">
        {navItems.map((item) => {
          const isActive = item.activePath
            ? pathname.includes(item.activePath)
            : pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.name}
              href={item.href}
              className={
                isActive
                  ? "flex items-center gap-3 rounded-lg bg-[#eff4ff] px-4 py-3 text-[#002627]"
                  : "flex items-center gap-3 rounded-lg px-4 py-3 text-[#404848] transition hover:bg-slate-50 hover:text-[#002627]"
              }
            >
              <span
                className="material-symbols-outlined text-[20px]"
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "" }}
              >
                {item.icon}
              </span>
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer links */}
      <div className="mt-auto grid gap-1 border-t border-slate-100 pt-4 text-sm font-semibold">
        {[
          { name: "Support", href: "/support", icon: "help" },
          { name: "Settings", href: "/settings", icon: "settings" },
        ].map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={
                isActive
                  ? "flex items-center gap-3 rounded-lg bg-[#eff4ff] px-4 py-3 text-[#002627]"
                  : "flex items-center gap-3 rounded-lg px-4 py-3 text-[#404848] transition hover:bg-slate-50 hover:text-[#002627]"
              }
            >
              <span
                className="material-symbols-outlined text-[20px]"
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "" }}
              >
                {item.icon}
              </span>
              {item.name}
            </Link>
          );
        })}

        <LogoutButton
          className="flex items-center gap-3 rounded-lg px-4 py-3 text-left text-[#404848] transition hover:bg-slate-50 hover:text-[#002627] disabled:cursor-not-allowed disabled:opacity-60"
          iconClassName="material-symbols-outlined text-[20px]"
          showIcon
        />

        {/* Role badge */}
        <div className="mt-3 px-1">
          <span className="inline-block rounded-full bg-[#ecfdf5] px-3 py-1 font-[var(--font-jetbrains)] text-xs font-bold uppercase tracking-wide text-[#006d40]">
            {role}
          </span>
        </div>
      </div>
    </aside>
  );
}
