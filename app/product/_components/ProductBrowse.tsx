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
};

const initialFilters: BrowseFilters = {
  q: "",
  listing_type: "",
  material_type: "",
  availability_status: "",
  country: "",
  mine: false,
};

export function ProductBrowse() {
  const dispatch = useAppDispatch();
  const token = useAppSelector(selectAccessToken);
  const listings = useAppSelector(selectProductListings);
  const pagination = useAppSelector(selectProductListingsPagination);
  const listStatus = useAppSelector((state) =>
    selectProductOpStatus(state, "listListings"),
  );
  const listError = useAppSelector((state) =>
    selectProductError(state, "listListings"),
  );
  const [filters, setFilters] = useState<BrowseFilters>(initialFilters);
  const [page, setPage] = useState(1);
  const params = useMemo(() => buildListParams(filters, page), [filters, page]);

  useEffect(() => {
    if (token) {
      void dispatch(listProductListingsThunk({ token, params }));
    }
  }, [dispatch, params, token]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
  }

  function clearFilters() {
    setFilters(initialFilters);
    setPage(1);
  }

  const isLoading = listStatus === "loading";

  return (
    <div className="mx-auto grid max-w-[1440px] gap-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-[var(--font-jetbrains)] text-xs font-bold uppercase text-[#006d40]">
            Marketplace
          </p>
          <h1 className="mt-2 font-[var(--font-hanken)] text-4xl font-semibold text-[#002627]">
            Browse product listings
          </h1>
          <p className="mt-2 max-w-2xl text-[#404848]">
            Filter active sell offers and buy requests by material,
            availability, country, and material name.
          </p>
        </div>
        <Link
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#002627] px-5 font-semibold text-white shadow-sm transition hover:bg-slate-900"
          href="/product/create"
        >
          Create listing
        </Link>
      </section>

      <div className="grid gap-6 lg:grid-cols-[288px_minmax(0,1fr)]">
        <aside className="h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-6">
          <form className="grid gap-5" onSubmit={handleSubmit}>
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-[var(--font-hanken)] text-2xl font-semibold text-[#002627]">
                Filters
              </h2>
              <button
                className="text-sm font-semibold text-[#404848] underline-offset-4 hover:text-[#002627] hover:underline"
                onClick={clearFilters}
                type="button"
              >
                Clear
              </button>
            </div>

            <label className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-[#0b1c30]">
              <span>My listings</span>
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

            <button
              className="min-h-11 rounded-lg bg-[#002627] px-4 font-semibold text-white transition hover:bg-slate-900"
              type="submit"
            >
              Apply filters
            </button>
          </form>
        </aside>

        <section className="grid gap-5">
          <form
            className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:flex-row"
            onSubmit={handleSubmit}
          >
            <label className="grid flex-1 gap-1">
              <span className="font-[var(--font-jetbrains)] text-xs font-bold uppercase text-[#404848]">
                Search material name
              </span>
              <input
                className="min-h-12 rounded-lg border border-slate-200 bg-slate-50 px-4 text-[#0b1c30] outline-none transition focus:border-[#002627] focus:ring-2 focus:ring-[#002627]/20"
                placeholder="Search PP, regrind, flakes..."
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
              className="min-h-12 rounded-lg bg-[#002627] px-5 font-semibold text-white transition hover:bg-slate-900 sm:self-end"
              type="submit"
            >
              Search
            </button>
          </form>

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
              All materials
            </FilterPill>
            {materialOptions.slice(0, 7).map((option) => (
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

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-[#404848]">
            <span>
              {pagination
                ? `${pagination.count} listing${
                    pagination.count === 1 ? "" : "s"
                  }`
                : "Listings"}
            </span>
            {filters.mine ? (
              <strong className="rounded-full bg-[#ecfdf5] px-3 py-1 text-[#006d40]">
                Showing your inventory
              </strong>
            ) : null}
          </div>

          {listError ? (
            <div className="grid gap-1 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
              <strong>Could not load listings.</strong>
              <span>{listError}</span>
            </div>
          ) : null}

          {isLoading && listings.length === 0 ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              <div className="min-h-80 animate-pulse rounded-lg bg-slate-200" />
              <div className="min-h-80 animate-pulse rounded-lg bg-slate-200" />
              <div className="min-h-80 animate-pulse rounded-lg bg-slate-200" />
            </div>
          ) : listings.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {listings.map((listing) => (
                <ProductListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="grid justify-items-center gap-3 rounded-lg border border-slate-200 bg-white p-10 text-center shadow-sm">
              <div className="grid aspect-square w-40 place-items-center rounded-lg border border-dashed border-slate-300 bg-slate-50 font-[var(--font-jetbrains)] text-xs font-bold uppercase text-slate-400">
                Listings
              </div>
              <h2 className="font-[var(--font-hanken)] text-2xl font-semibold text-[#002627]">
                No listings match these filters.
              </h2>
              <p className="text-[#404848]">
                Clear filters or create a new listing for your inventory.
              </p>
              <Link
                className="inline-flex min-h-11 items-center rounded-lg bg-[#002627] px-5 font-semibold text-white"
                href="/product/create"
              >
                Create listing
              </Link>
            </div>
          )}

          {pagination && pagination.total_pages > 1 ? (
            <div className="flex items-center justify-center gap-3">
              <button
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 font-semibold text-[#404848] disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!pagination.previous || page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                type="button"
              >
                Previous
              </button>
              <span className="text-sm text-[#404848]">
                Page {pagination.current_page} of {pagination.total_pages}
              </span>
              <button
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 font-semibold text-[#404848] disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!pagination.next}
                onClick={() => setPage((current) => current + 1)}
                type="button"
              >
                Next
              </button>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}

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
      <span className="font-[var(--font-jetbrains)] text-xs font-bold uppercase text-[#404848]">
        {label}
      </span>
      <select
        className="min-h-11 rounded-lg border border-slate-200 bg-slate-50 px-3 text-[#0b1c30] outline-none transition focus:border-[#002627] focus:ring-2 focus:ring-[#002627]/20"
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
          ? "shrink-0 rounded-full bg-[#002627] px-5 py-2 text-sm font-semibold text-white"
          : "shrink-0 rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-[#404848] transition hover:border-[#002627]/30 hover:bg-[#eff4ff] hover:text-[#002627]"
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
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl">
      <Link
        href={`/product/${listing.id}`}
        className="relative block h-48 overflow-hidden bg-[#d3e4fe]"
      >
        {listing.primary_image_url ? (
          <span
            aria-label={listing.material_name}
            className="block size-full bg-cover bg-center transition duration-500 hover:scale-105"
            role="img"
            style={{ backgroundImage: `url(${listing.primary_image_url})` }}
          />
        ) : (
          <span className="grid size-full place-items-center bg-[#eff4ff] font-[var(--font-jetbrains)] text-sm font-bold uppercase text-[#002627]">
            {formatMaterialType(listing.material_type)}
          </span>
        )}
        {listing.seller_verified_snapshot ? (
          <span className="absolute left-3 top-3 rounded-md bg-[#006d40] px-2.5 py-1 text-xs font-bold text-white shadow-sm">
            Verified
          </span>
        ) : null}
      </Link>
      <div className="grid gap-4 p-5">
        <div className="grid gap-2">
          <div className="flex items-start justify-between gap-3">
            <h2 className="line-clamp-2 font-[var(--font-hanken)] text-xl font-semibold leading-6 text-[#0b1c30]">
              {listing.material_name}
            </h2>
            <span
              className={
                listing.listing_type === "sell"
                  ? "shrink-0 rounded bg-[#beebeb] px-2 py-1 text-xs font-bold text-[#002627]"
                  : "shrink-0 rounded bg-[#ecfdf5] px-2 py-1 text-xs font-bold text-[#006d40]"
              }
            >
              {formatListingType(listing.listing_type)}
            </span>
          </div>
        </div>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <Fact label="Material" value={formatMaterialType(listing.material_type)} />
          <Fact label="Quantity" value={`${listing.quantity_available_mt} MT`} />
          <Fact label="Origin" value={listing.material_location_country} />
          <Fact
            label="Availability"
            value={formatAvailability(listing.availability_status)}
          />
        </dl>
        <Link
          className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-4 font-semibold text-[#002627] transition hover:bg-[#eff4ff]"
          href={`/product/${listing.id}`}
        >
          View details
        </Link>
      </div>
    </article>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-[var(--font-jetbrains)] text-[11px] font-bold uppercase text-slate-500">
        {label}
      </dt>
      <dd className="mt-1 font-semibold text-[#0b1c30]">{value}</dd>
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
  }

  if (filters.listing_type) {
    params.listing_type = filters.listing_type;
  }

  if (filters.material_type) {
    params.material_type = filters.material_type;
  }

  if (filters.availability_status) {
    params.availability_status = filters.availability_status;
  }

  if (filters.country) {
    params.country = filters.country;
  }

  if (filters.mine) {
    params.mine = true;
  }

  return params;
}
