"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { selectAccessToken } from "@/store/auth/authSelectors";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectProductError,
  selectProductListings,
  selectProductListingsPagination,
  selectProductOpStatus,
} from "@/store/product/productSelectors";
import { listProductListingsThunk } from "@/store/product/productThunks";
import { selectIsAdmin } from "@/store/auth/authSelectors";
import type {
  ListProductListingsParams,
  ProductAvailabilityStatus,
  ProductListingSummary,
  ProductListingType,
  ProductMaterialType,
} from "@/types/product";

import {
  availabilityOptions,
  countryOptions,
  formatAvailability,
  formatListingType,
  formatMaterialType,
  materialOptions,
} from "./product-options";

type BrowseFilters = {
  q: string;
  listing_type: "" | ProductListingType;
  material_type: "" | ProductMaterialType;
  availability_status: "" | ProductAvailabilityStatus;
  country: string;
  mine: boolean;
  ordering: string;
};

const initialFilters: BrowseFilters = {
  q: "",
  listing_type: "",
  material_type: "",
  availability_status: "",
  country: "",
  mine: false,
  ordering: "-listed_at",
};

export function ProductBrowse() {
  const dispatch = useAppDispatch();
  const token = useAppSelector(selectAccessToken);
  const listings = useAppSelector(selectProductListings);
  const pagination = useAppSelector(selectProductListingsPagination);
  const listStatus = useAppSelector((state) =>
    selectProductOpStatus(state, "listListings"),
  );
  const isAdmin = useAppSelector(selectIsAdmin);
  const listError = useAppSelector((state) =>
    selectProductError(state, "listListings"),
  );
  const [filters, setFilters] = useState<BrowseFilters>(initialFilters);
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const params = useMemo(() => buildListParams(filters, page), [filters, page]);

  useEffect(() => {
    void dispatch(listProductListingsThunk({ token: token || "", params }));
  }, [dispatch, params, token]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
  }

  function clearFilters() {
    setFilters(initialFilters);
    setPage(1);
  }

  // Count active filters for the mobile badge
  const activeFilterCount = [
    filters.listing_type,
    filters.material_type,
    filters.availability_status,
    filters.country,
    filters.mine ? "mine" : "",
  ].filter(Boolean).length;

  const isLoading = listStatus === "loading";

  return (
    <div className="mx-auto grid max-w-[1440px] gap-6">
      {/* Page header */}
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>

          <h1 className="mt-2 font-[var(--font-hanken)] text-4xl font-semibold text-[#002627]">
            Browse listings
          </h1>
          <p className="mt-2 max-w-2xl text-[#404848]">
            Filter active sell offers and buy requests by material, availability,
            country, and name.
          </p>
        </div>
        {!isAdmin && (
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#beebeb] px-5 font-semibold text-[#002627] shadow-sm transition hover:bg-[#a3cfcf]"
            href="/product/create"
          >
            Create listing
          </Link>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-[272px_minmax(0,1fr)]">
        {/* Filter sidebar – desktop: always visible; mobile: collapsible drawer */}
        <aside
          className={[
            "h-fit rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-6",
            // On mobile, collapse/expand via max-height trick
            "overflow-hidden transition-all duration-300 ease-in-out",
            filtersOpen
              ? "max-h-[2000px] opacity-100"
              : "max-h-0 border-0 p-0 opacity-0 shadow-none lg:max-h-[2000px] lg:border lg:p-5 lg:opacity-100 lg:shadow-sm",
          ].join(" ")}
        >
          <form className="grid gap-5" onSubmit={handleSubmit}>
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-[var(--font-hanken)] text-xl font-semibold text-[#002627]">
                Filters
              </h2>
              <button
                className="text-xs font-bold uppercase tracking-wide text-[#404848] underline-offset-4 hover:text-[#002627] hover:underline"
                onClick={clearFilters}
                type="button"
              >
                Clear all
              </button>
            </div>

            {token && (
              <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50 p-3 transition hover:border-[#002627]/20 hover:bg-[#eff4ff]">
                <span className="text-sm font-semibold text-[#0b1c30]">
                  My listings only
                </span>
                <input
                  className="size-5 accent-[#002627]"
                  checked={filters.mine}
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      mine: event.target.checked,
                    }))
                  }
                  type="checkbox"
                />
              </label>
            )}

            <SelectField
              label="Listing type"
              value={filters.listing_type}
              onChange={(value) =>
                setFilters((current) => ({
                  ...current,
                  listing_type: value as BrowseFilters["listing_type"],
                }))
              }
            >
              <option value="">All types</option>
              <option value="sell">Sell offers</option>
              <option value="buy">Buy requests</option>
            </SelectField>

            <SelectField
              label="Material"
              value={filters.material_type}
              onChange={(value) =>
                setFilters((current) => ({
                  ...current,
                  material_type: value as BrowseFilters["material_type"],
                }))
              }
            >
              <option value="">All materials</option>
              {materialOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </SelectField>

            <SelectField
              label="Availability"
              value={filters.availability_status}
              onChange={(value) =>
                setFilters((current) => ({
                  ...current,
                  availability_status:
                    value as BrowseFilters["availability_status"],
                }))
              }
            >
              <option value="">Any availability</option>
              {availabilityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </SelectField>

            <SelectField
              label="Country"
              value={filters.country}
              onChange={(value) =>
                setFilters((current) => ({ ...current, country: value }))
              }
            >
              <option value="">All countries</option>
              {countryOptions.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </SelectField>

            <label className={`grid gap-2 ${filters.q.trim() ? "opacity-50" : ""}`}>
              <span className="font-[var(--font-jetbrains)] text-xs font-bold uppercase tracking-wide text-[#404848]">
                Sort by {filters.q.trim() && "(Disabled by search)"}
              </span>
              <select
                disabled={!!filters.q.trim()}
                className="min-h-11 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-[#0b1c30] outline-none transition focus:border-[#002627] focus:ring-2 focus:ring-[#002627]/20 disabled:cursor-not-allowed"
                onChange={(event) => setFilters((current) => ({ ...current, ordering: event.target.value }))}
                value={filters.ordering}
              >
                <option value="-listed_at">Newest first</option>
                <option value="quantity_available_mt">Quantity (Low to High)</option>
                <option value="-quantity_available_mt">Quantity (High to Low)</option>
              </select>
            </label>

            <button
              className="min-h-11 rounded-xl bg-[#002627] px-4 font-semibold text-white transition hover:bg-slate-900"
              type="submit"
            >
              Apply filters
            </button>
          </form>
        </aside>

        {/* Main content */}
        <section className="grid gap-5">
          {/* Mobile filter toggle – only visible below lg */}
          <button
            className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 font-semibold text-[#002627] shadow-sm transition hover:bg-slate-50 lg:hidden"
            onClick={() => setFiltersOpen((prev) => !prev)}
            type="button"
            aria-expanded={filtersOpen}
          >
            <span className="flex items-center gap-2">
              <svg fill="none" height="16" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="16">
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="8" x2="16" y1="12" y2="12" />
                <line x1="12" x2="12" y1="18" y2="18" />
              </svg>
              Filters
              {activeFilterCount > 0 && (
                <span className="inline-flex size-5 items-center justify-center rounded-full bg-[#002627] text-[10px] font-bold text-white">
                  {activeFilterCount}
                </span>
              )}
            </span>
            <svg
              className={`transition-transform duration-200 ${filtersOpen ? "rotate-180" : ""}`}
              fill="none" height="16" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="16"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {/* Search bar */}
          <form
            className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row"
            onSubmit={handleSubmit}
          >
            <label className="grid flex-1 gap-1.5">
              <span className="font-[var(--font-jetbrains)] text-xs font-bold uppercase tracking-wide text-[#404848]">
                Search material name
              </span>
              <input
                className="min-h-11 rounded-lg border border-slate-200 bg-slate-50 px-4 text-[#0b1c30] outline-none transition focus:border-[#002627] focus:ring-2 focus:ring-[#002627]/20"
                placeholder="PP, regrind, HDPE flakes…"
                value={filters.q}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    q: event.target.value,
                  }))
                }
                type="search"
              />
            </label>
            <button
              className="min-h-11 rounded-xl bg-[#002627] px-5 font-semibold text-white transition hover:bg-slate-900 sm:self-end"
              type="submit"
            >
              Search
            </button>
          </form>

          {/* Quick material pills */}
          <div
            className="flex gap-2 overflow-x-auto pb-1"
            aria-label="Quick material filters"
          >
            <FilterPill
              active={!filters.material_type}
              onClick={() =>
                setFilters((current) => ({ ...current, material_type: "" }))
              }
            >
              All
            </FilterPill>
            {materialOptions.slice(0, 8).map((option) => (
              <FilterPill
                active={filters.material_type === option.value}
                key={option.value}
                onClick={() =>
                  setFilters((current) => ({
                    ...current,
                    material_type: option.value,
                  }))
                }
              >
                {option.label}
              </FilterPill>
            ))}
          </div>

          {/* Result count */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm text-[#404848]">
              {pagination
                ? `${pagination.count} listing${pagination.count === 1 ? "" : "s"}`
                : isLoading
                  ? "Loading…"
                  : "Listings"}
            </span>
            {filters.mine && (
              <span className="rounded-full bg-[#ecfdf5] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#006d40]">
                Your inventory
              </span>
            )}
          </div>

          {/* Error */}
          {listError && (
            <div className="grid gap-1 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
              <strong className="text-sm font-semibold">
                Could not load listings
              </strong>
              <span className="text-sm">{listError}</span>
            </div>
          )}

          {/* Listings grid */}
          {isLoading && listings.length === 0 ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="min-h-80 animate-pulse rounded-xl bg-slate-200"
                />
              ))}
            </div>
          ) : listings.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {listings.map((listing) => (
                <ProductListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="grid justify-items-center gap-4 rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <div className="grid aspect-square w-24 place-items-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50">
                <svg
                  className="text-slate-300"
                  fill="none"
                  height="32"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                  width="32"
                >
                  <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z" />
                  <path d="M16 3H8L6 7h12Z" />
                </svg>
              </div>
              <div className="grid gap-1">
                <h2 className="font-[var(--font-hanken)] text-2xl font-semibold text-[#002627]">
                  No listings match these filters
                </h2>
                <p className="text-sm text-[#404848]">
                  Try clearing filters or create a new listing.
                </p>
              </div>
              {!isAdmin && (
                <Link
                  className="inline-flex min-h-11 items-center rounded-xl bg-[#beebeb] px-5 font-semibold text-[#002627] transition hover:bg-[#a3cfcf]"
                  href="/product/create"
                >
                  Create listing
                </Link>
              )}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.total_pages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <button
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-[#404848] transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={!pagination.previous || page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                type="button"
              >
                ← Previous
              </button>
              <span className="text-sm font-medium text-[#404848]">
                {pagination.current_page} / {pagination.total_pages}
              </span>
              <button
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-[#404848] transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={!pagination.next}
                onClick={() => setPage((current) => current + 1)}
                type="button"
              >
                Next →
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function SelectField({
  children,
  label,
  onChange,
  value,
}: {
  children: React.ReactNode;
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="font-[var(--font-jetbrains)] text-xs font-bold uppercase tracking-wide text-[#404848]">
        {label}
      </span>
      <select
        className="min-h-11 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-[#0b1c30] outline-none transition focus:border-[#002627] focus:ring-2 focus:ring-[#002627]/20"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {children}
      </select>
    </label>
  );
}

function FilterPill({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      className={
        active
          ? "shrink-0 rounded-full bg-[#002627] px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-white"
          : "shrink-0 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-[#404848] transition hover:border-[#002627]/30 hover:bg-[#eff4ff] hover:text-[#002627]"
      }
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function ProductListingCard({ listing }: { listing: ProductListingSummary }) {
  return (
    <Link
      href={`/product/${listing.id}`}
      className="block overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <article>
        <div className="relative h-48 overflow-hidden bg-[#eff4ff]">
          {listing.primary_image_url ? (
            /* Fix: use <img> instead of background-image <span> for reliable rendering */
            <img
              alt={listing.material_name}
              className="size-full object-cover transition duration-500 hover:scale-105"
              src={listing.primary_image_url}
            />
          ) : (
            <div className="grid size-full place-items-center">
              <span className="font-[var(--font-jetbrains)] text-sm font-bold uppercase tracking-widest text-[#002627]/30">
                {formatMaterialType(listing.material_type)}
              </span>
            </div>
          )}
          {listing.seller_verified_snapshot && (
            <span className="absolute left-3 top-3 rounded-md bg-[#006d40] px-2 py-1 text-xs font-bold text-white shadow-sm">
              Verified
            </span>
          )}
          {/* Listing type badge top-right */}
          <span
            className={
              listing.listing_type === "sell"
                ? "absolute right-3 top-3 rounded-md bg-[#beebeb] px-2 py-1 text-xs font-bold text-[#002627]"
                : "absolute right-3 top-3 rounded-md bg-[#ecfdf5] px-2 py-1 text-xs font-bold text-[#006d40]"
            }
          >
            {listing.listing_type === "sell" ? "For Sale" : "Buy Request"}
          </span>
        </div>

        <div className="grid gap-4 p-5">
          <div>
            <h2 className="line-clamp-2 font-[var(--font-hanken)] text-xl font-semibold leading-snug text-[#002627]">
              {listing.material_name}
            </h2>
          </div>

          <dl className="grid grid-cols-2 gap-x-3 gap-y-3 text-sm">
            <Fact label="Material" value={formatMaterialType(listing.material_type)} />
            <Fact label="Quantity" value={`${listing.quantity_available_mt} MT`} />
            <Fact label="Origin" value={listing.material_location_country} />
            <Fact
              label="Availability"
              value={formatAvailability(listing.availability_status)}
            />
          </dl>

        </div>
      </article>
    </Link>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-[var(--font-jetbrains)] text-[10px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm font-semibold text-[#0b1c30]">{value}</dd>
    </div>
  );
}

function buildListParams(
  filters: BrowseFilters,
  page: number,
): ListProductListingsParams {
  const params: ListProductListingsParams = { page };
  if (filters.q.trim()) {
    params.q = filters.q.trim();
  } else if (filters.ordering) {
    params.ordering = filters.ordering;
  }
  if (filters.listing_type) params.listing_type = filters.listing_type;
  if (filters.material_type) params.material_type = filters.material_type;
  if (filters.availability_status) params.availability_status = filters.availability_status;
  if (filters.country) params.country = filters.country;
  if (filters.mine) params.mine = true;
  return params;
}