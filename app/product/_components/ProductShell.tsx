"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useAppSelector } from "@/store/hooks";
import {
  selectAccessToken,
  selectHasAuthSession,
  selectUser,
} from "@/store/auth/authSelectors";

import { ameefarLogoSrc, getAllowedListingTypes } from "./product-options";

type ProductShellProps = {
  active: "marketplace" | "create";
  children: React.ReactNode;
};

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

export function ProductShell({ active, children }: ProductShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const hasAuthSession = useAppSelector(selectHasAuthSession);
  const token = useAppSelector(selectAccessToken);
  const user = useAppSelector(selectUser);
  const canCreate = getAllowedListingTypes(user).length > 0;

  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!hasAuthSession || !token) router.replace("/auth/login");
  }, [mounted, hasAuthSession, router, token]);

  if (!mounted) return null;
  if (!hasAuthSession || !token) return null;

  // Derive bidding role from user — falls back to "buyer" for safety
  const biddingRole: "buyer" | "seller" | "admin" =
    user?.role === "buyer" || user?.role === "seller" || user?.role === "admin"
      ? user.role
      : "buyer";

  const navItems: Array<{
    label: string;
    href: string;
    icon: string;
    isActive: boolean;
  }> = [
      {
        label: "Market",
        href: "/product",
        icon: "storefront",
        isActive: active === "marketplace" && !pathname.includes("mine=true"),
      },
      {
        label: "New listing",
        href: "/product/create",
        icon: "add_circle",
        isActive: active === "create",
      },
      {
        label: "Inventory",
        href: "/product?mine=true",
        icon: "inventory_2",
        isActive: pathname.includes("mine=true"),
      },
      {
        label: "Dashboard",
        href: `/bidding/${biddingRole}/dashboard`,
        icon: "dashboard",
        isActive: pathname.includes("/bidding") && pathname.includes("dashboard"),
      },
      {
        label: "Negotiations",
        href: `/bidding/${biddingRole}/negotiations`,
        icon: "handshake",
        isActive: pathname.includes("negotiation"),
      },
      {
        label: "Inspections",
        href: `/bidding/${biddingRole}/inspections`,
        icon: "fact_check",
        isActive: pathname.includes("inspection"),
      },
      {
        label: "Profile",
        href: "/profile",
        icon: "person",
        isActive: pathname.startsWith("/profile"),
      },
    ];

  return (
    <div className="min-h-screen bg-[#f8f9ff] font-[var(--font-inter)] text-[#0b1c30] md:flex">
      {/* ── Desktop sidebar ─────────────────────────────────── */}
      <aside
        aria-label="Product navigation"
        className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r border-slate-200 bg-white px-4 py-6 md:flex"
      >
        {/* Logo */}
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

        {/* Create CTA */}
        {canCreate ? (
          <Link
            className="mt-8 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#beebeb] px-4 font-semibold text-[#002627] shadow-sm transition hover:bg-[#a3cfcf]"
            href="/product/create"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Create listing
          </Link>
        ) : (
          <span className="mt-8 inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-100 px-4 text-sm font-semibold text-slate-400">
            Profile role required
          </span>
        )}

        {/* Nav links */}
        <nav className="mt-6 grid gap-1 text-sm font-semibold">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={
                item.isActive
                  ? "flex items-center gap-3 rounded-lg bg-[#eff4ff] px-4 py-3 text-[#002627]"
                  : "flex items-center gap-3 rounded-lg px-4 py-3 text-[#404848] transition hover:bg-slate-50 hover:text-[#002627]"
              }
            >
              <span
                className="material-symbols-outlined text-[20px]"
                style={{ fontVariationSettings: item.isActive ? "'FILL' 1" : "" }}
              >
                {item.icon}
              </span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User identity footer */}
        <div className="mt-auto border-t border-slate-100 pt-4">
          <span className="inline-block rounded-full bg-[#ecfdf5] px-3 py-1 font-[var(--font-jetbrains)] text-xs font-bold uppercase tracking-wide text-[#006d40]">
            {user?.role ?? "member"}
          </span>
          <p className="mt-3 truncate text-sm text-[#404848]">
            {user?.company_name || user?.email}
          </p>
        </div>
      </aside>

      {/* ── Mobile top bar ──────────────────────────────────── */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 md:hidden">
        <Link className="flex items-center gap-2.5" href="/product">
          <Image
            alt="Ameefar Energy Logo"
            className="shrink-0 rounded-lg object-cover"
            height={32}
            src={ameefarLogoSrc}
            width={32}
          />
          <strong className="font-[var(--font-hanken)] text-lg text-[#002627]">
            Ameefar
          </strong>
        </Link>
        {canCreate ? (
          <Link
            className="rounded-xl bg-[#beebeb] px-4 py-2 text-sm font-semibold text-[#002627] transition hover:bg-[#a3cfcf]"
            href="/product/create"
          >
            New
          </Link>
        ) : null}
      </header>

      {/* ── Page content ────────────────────────────────────── */}
      <main className="w-full p-4 pb-24 md:ml-64 md:p-10">{children}</main>
    </div>
  );
}