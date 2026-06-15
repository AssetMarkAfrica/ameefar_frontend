"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { selectIsBoth } from "@/store/auth/authSelectors";
import { LogoutButton } from "@/components/auth/LogoutButton";

interface SidebarProps {
  role: "buyer" | "seller" | "admin";
}

type NavItem = {
  name: string;
  href: string;
  icon: string;
  /** Substring match — use when href alone isn't specific enough */
  activePath?: string;
};

export default function BiddingSidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const isBoth = useAppSelector(selectIsBoth);

  // ── Build nav items ──────────────────────────────────────────────
  const topNavItems: NavItem[] = [
    {
      name: "Marketplace",
      href: "/product",
      icon: "storefront",
    },
  ];

  if (role === "admin") {
    topNavItems.push({
      name: "Admin Panel",
      href: "/bidding/admin",
      icon: "admin_panel_settings",
      activePath: "/bidding/admin",
    });
  } else if (isBoth) {
    topNavItems.push(
      {
        name: "Buyer Dashboard",
        href: "/bidding/buyer/dashboard",
        icon: "shopping_bag",
        activePath: "/bidding/buyer/dashboard",
      },
      {
        name: "Seller Dashboard",
        href: "/bidding/seller/dashboard",
        icon: "inventory_2",
        activePath: "/bidding/seller/dashboard",
      },
      {
        name: "Buyer Negotiations",
        href: "/bidding/buyer/negotiations",
        icon: "handshake",
        activePath: "/bidding/buyer/negot",
      },
      {
        name: "Seller Negotiations",
        href: "/bidding/seller/negotiations",
        icon: "handshake",
        activePath: "/bidding/seller/negot",
      },
      {
        name: "Inspections",
        href: `/bidding/${role}/inspections`,
        icon: "fact_check",
        activePath: "inspection",
      }
    );
  } else {
    topNavItems.push(
      {
        name: "Dashboard",
        href: `/bidding/${role}/dashboard`,
        icon: "dashboard",
        activePath: `/bidding/${role}/dashboard`,
      },
      {
        name: "Negotiations",
        href: `/bidding/${role}/negotiations`,
        icon: "handshake",
        activePath: "negotiation",
      },
      {
        name: "Inspections",
        href: `/bidding/${role}/inspections`,
        icon: "fact_check",
        activePath: "inspection",
      }
    );
  }

  topNavItems.push({
    name: "Profile",
    href: "/profile",
    icon: "person",
  });

  const bottomNavItems: NavItem[] = [
    { name: "Support", href: "/support", icon: "help" },
    { name: "Settings", href: "/settings", icon: "settings" },
  ];

  // ── Active check helper ──────────────────────────────────────────
  const isItemActive = (item: NavItem): boolean => {
    if (item.activePath) return pathname.includes(item.activePath);
    return pathname === item.href || pathname.startsWith(item.href + "/");
  };

  // ── Shared link renderer ─────────────────────────────────────────
  const NavLink = ({ item }: { item: NavItem }) => {
    const active = isItemActive(item);
    return (
      <Link
        href={item.href}
        className={
          active
            ? "flex items-center gap-3 rounded-xl bg-[#eff4ff] px-4 py-3 text-sm font-semibold text-[#002627]"
            : "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-[#404848] transition-colors hover:bg-slate-50 hover:text-[#002627]"
        }
      >
        <span
          className="material-symbols-outlined text-[20px] shrink-0"
          style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
        >
          {item.icon}
        </span>
        <span className="truncate">{item.name}</span>
      </Link>
    );
  };

  // ── Role badge label ─────────────────────────────────────────────
  const roleLabel = isBoth ? "Buyer & Seller" : role;
  const roleBadgeColor =
    role === "admin"
      ? "bg-amber-50 text-amber-700"
      : isBoth
        ? "bg-violet-50 text-violet-700"
        : role === "seller"
          ? "bg-[#ecfdf5] text-[#006d40]"
          : "bg-[#eff4ff] text-[#002d90]";

  return (
    <aside
      aria-label="Bidding navigation"
      className="fixed left-0 top-20 z-30 hidden h-[calc(100vh-5rem)] w-64 flex-col border-r border-slate-200 bg-white md:flex"
    >
      <div className="flex h-full flex-col overflow-y-auto px-3 py-5">
        {/* Top nav */}
        <nav className="grid gap-0.5">
          {topNavItems.map((item) => (
            <NavLink key={item.href + item.name} item={item} />
          ))}
        </nav>

        {/* Footer */}
        <div className="mt-auto border-t border-slate-100 pt-4">
          <nav className="grid gap-0.5">
            {bottomNavItems.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}

            <LogoutButton
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-[#404848] transition-colors hover:bg-slate-50 hover:text-[#002627] disabled:cursor-not-allowed disabled:opacity-60"
              iconClassName="material-symbols-outlined text-[20px] shrink-0"
              showIcon
            />
          </nav>

          {/* Role badge */}
          <div className="mt-4 px-2">
            <span
              className={`inline-flex rounded-full px-3 py-1 font-[var(--font-jetbrains)] text-[11px] font-bold uppercase tracking-widest ${roleBadgeColor}`}
            >
              {roleLabel}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}