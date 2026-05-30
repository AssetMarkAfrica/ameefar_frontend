"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAppSelector } from "@/store/hooks";
import {
  selectAccessToken,
  selectHasAuthSession,
  selectUser,
} from "@/store/auth/authSelectors";

import { getAllowedListingTypes } from "./product-options";

type ProductShellProps = {
  active: "marketplace" | "create";
  children: React.ReactNode;
};

export function ProductShell({ active, children }: ProductShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const hasAuthSession = useAppSelector(selectHasAuthSession);
  const token = useAppSelector(selectAccessToken);
  const user = useAppSelector(selectUser);
  const canCreate = getAllowedListingTypes(user).length > 0;

  useEffect(() => {
    if (!hasAuthSession || !token) {
      router.replace("/auth/login");
    }
  }, [hasAuthSession, router, token]);

  if (!hasAuthSession || !token) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f8f9ff] font-[var(--font-inter)] text-[#0b1c30] md:flex">
      <aside
        className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r border-slate-200 bg-white px-4 py-6 md:flex"
        aria-label="Product navigation"
      >
        <Link className="flex items-center gap-3" href="/product">
          <span className="grid size-10 place-items-center rounded-lg bg-[#002627] font-[var(--font-jetbrains)] text-sm font-bold text-white">
            AE
          </span>
          <span>
            <strong className="block font-[var(--font-hanken)] text-xl leading-6 text-[#002627]">
              Ameefar Pro
            </strong>
            <small className="block text-xs text-[#404848]">
              Enterprise marketplace
            </small>
          </span>
        </Link>
        {canCreate ? (
          <Link
            className="mt-8 inline-flex min-h-11 items-center justify-center rounded-lg bg-[#002627] px-4 font-semibold text-white shadow-sm transition hover:bg-slate-900"
            href="/product/create"
          >
            Create listing
          </Link>
        ) : (
          <span className="mt-8 inline-flex min-h-11 items-center justify-center rounded-lg bg-slate-100 px-4 text-sm font-semibold text-slate-500">
            Profile role required
          </span>
        )}
        <nav className="mt-6 grid gap-2 text-sm font-semibold">
          <Link
            className={
              active === "marketplace"
                ? "rounded-lg bg-[#eff4ff] px-4 py-3 text-[#002627]"
                : "rounded-lg px-4 py-3 text-[#404848] transition hover:bg-slate-50 hover:text-[#002627]"
            }
            href="/product"
          >
            <span>Market</span>
          </Link>
          <Link
            className={
              active === "create"
                ? "rounded-lg bg-[#eff4ff] px-4 py-3 text-[#002627]"
                : "rounded-lg px-4 py-3 text-[#404848] transition hover:bg-slate-50 hover:text-[#002627]"
            }
            href="/product/create"
          >
            <span>New listing</span>
          </Link>
          <Link
            className={
              pathname.includes("mine=true")
                ? "rounded-lg bg-[#eff4ff] px-4 py-3 text-[#002627]"
                : "rounded-lg px-4 py-3 text-[#404848] transition hover:bg-slate-50 hover:text-[#002627]"
            }
            href="/product"
          >
            <span>Inventory</span>
          </Link>
          <Link
            className="rounded-lg px-4 py-3 text-[#404848] transition hover:bg-slate-50 hover:text-[#002627]"
            href="/profile"
          >
            <span>Profile</span>
          </Link>
        </nav>
        <div className="mt-auto border-t border-slate-200 pt-4">
          <span className="rounded-full bg-[#ecfdf5] px-3 py-1 font-[var(--font-jetbrains)] text-xs font-bold uppercase text-[#006d40]">
            {user?.role ?? "member"}
          </span>
          <p className="mt-3 text-sm text-[#404848]">
            {user?.company_name || user?.email}
          </p>
        </div>
      </aside>
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 md:hidden">
        <Link className="flex items-center gap-3" href="/product">
          <span className="grid size-9 place-items-center rounded-lg bg-[#002627] font-[var(--font-jetbrains)] text-xs font-bold text-white">
            AE
          </span>
          <strong className="font-[var(--font-hanken)] text-xl text-[#002627]">
            Ameefar
          </strong>
        </Link>
        {canCreate ? (
          <Link
            className="rounded-lg bg-[#002627] px-4 py-2 text-sm font-semibold text-white"
            href="/product/create"
          >
            New
          </Link>
        ) : null}
      </header>
      <main className="w-full p-4 pb-24 md:ml-64 md:p-10">{children}</main>
    </div>
  );
}
