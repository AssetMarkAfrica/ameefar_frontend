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

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!hasAuthSession || !token) {
      router.replace("/auth/login");
    }
  }, [mounted, hasAuthSession, router, token]);

  // Render nothing until client-side mount. The entire shell depends on
  // localStorage-backed Redux state (token, user, canCreate) which is always
  // empty on the server, so any SSR output would mismatched the client tree.
  // Returning null here prevents all hydration errors and ensures children
  // (e.g. ProductListingDetail) only mount once a valid token is available.
  if (!mounted) return null;

  // After mount: unauthenticated users are redirected above; render nothing
  // while the router navigates away.
  if (!hasAuthSession || !token) return null;

  const navItems: Array<{
    label: string;
    href: string;
    isActive: boolean;
  }> = [
      {
        label: "Market",
        href: "/product",
        isActive: active === "marketplace" && !pathname.includes("mine=true"),
      },
      {
        label: "New listing",
        href: "/product/create",
        isActive: active === "create",
      },
      {
        label: "Inventory",
        href: "/product?mine=true",
        isActive: pathname.includes("mine=true"),
      },
      {
        label: "Profile",
        href: "/profile",
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
          <Image alt="Ameefar Energy Logo" className="shrink-0 rounded-lg object-cover" height={40} src={ameefarLogoSrc} width={40} />
          <AmeefarWordmark />
        </Link>

        {/* Create CTA */}
        {canCreate ? (
          <Link
            className="mt-8 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#beebeb] px-4 font-semibold text-[#002627] shadow-sm transition hover:bg-[#a3cfcf]"
            href="/product/create"
          >
            + Create listing
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
              className={
                item.isActive
                  ? "rounded-lg bg-[#eff4ff] px-4 py-3 text-[#002627]"
                  : "rounded-lg px-4 py-3 text-[#404848] transition hover:bg-slate-50 hover:text-[#002627]"
              }
              href={item.href}
            >
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
          <Image alt="Ameefar Energy Logo" className="shrink-0 rounded-lg object-cover" height={32} src={ameefarLogoSrc} width={32} />
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