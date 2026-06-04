"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  role: "buyer" | "seller" | "admin";
}

export default function BiddingSidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: `/bidding/${role}/dashboard`, icon: "dashboard" },
    { name: "Marketplace", href: "/marketplace", icon: "storefront" },
    { name: "Negotiations", href: `/bidding/${role}/negotiations`, icon: "handshake", activePath: "negotiation" },
    { name: "Inspections", href: `/bidding/${role}/inspections`, icon: "fact_check" },
  ];

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-surface-gray border-r border-border-subtle pt-20 px-4 hidden md:flex flex-col z-40">
      <div className="flex items-center gap-3 px-4 py-6 mb-4">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
          <span className="material-symbols-outlined text-on-primary">
            storefront
          </span>
        </div>
        <div>
          <p className="font-headline-md text-headline-md text-primary leading-tight text-sm">
            Ameefar Pro
          </p>
          <p className="font-label-md text-label-md text-outline capitalize">
            {role} Portal
          </p>
        </div>
      </div>
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.includes(item.activePath || item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-surface-container-high text-primary font-bold"
                  : "text-on-surface-variant hover:bg-surface-container-low"
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "" }}
              >
                {item.icon}
              </span>
              <span className="font-label-md text-label-md">{item.name}</span>
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border-subtle py-4 space-y-1">
        <Link
          href="/support"
          className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-low transition-colors rounded-lg"
        >
          <span className="material-symbols-outlined">help</span>
          <span className="font-label-md text-label-md">Support</span>
        </Link>
        <Link
          href="/settings"
          className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-low transition-colors rounded-lg"
        >
          <span className="material-symbols-outlined">settings</span>
          <span className="font-label-md text-label-md">Settings</span>
        </Link>
      </div>
    </aside>
  );
}
