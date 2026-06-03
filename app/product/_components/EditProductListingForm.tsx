"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { selectAccessToken, selectUser } from "@/store/auth/authSelectors";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectCurrentProductListing,
  selectProductError,
  selectProductOpStatus,
} from "@/store/product/productSelectors";
import {
  activateProductListingThunk,
  fetchProductListingThunk,
  updateProductListingThunk,
} from "@/store/product/productThunks";
import type {
  ProductAvailabilityStatus,
  ProductListingStatus,
  ProductMaterialType,
} from "@/types/product";

import {
  availabilityOptions,
  countryOptions,
  materialOptions,
} from "./product-options";

// ─── Types ─────────────────────────────────────────────────────────────────────

type EditFormState = {
  material_name: string;
  material_type: string;
  average_weight_per_load_mt: string;
  quantity_available_mt: string;
  material_location_country: string;
  availability_status: ProductAvailabilityStatus;
  description: string;
  seller_notes: string;
  mfi_value: string;
  status: ProductListingStatus;
};

// ─── Shared classes ─────────────────────────────────────────────────────────────

const inputClassName =
  "min-h-12 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-[#0b1c30] outline-none transition focus:border-[#002627] focus:ring-2 focus:ring-[#002627]/20";

const textareaClassName =
  "w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-[#0b1c30] outline-none transition focus:border-[#002627] focus:ring-2 focus:ring-[#002627]/20 resize-none";

// ─── Component ─────────────────────────────────────────────────────────────────

export function EditProductListingForm({ listingId }: { listingId: string }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const token = useAppSelector(selectAccessToken);
  const user = useAppSelector(selectUser);
  const listing = useAppSelector(selectCurrentProductListing);

  const fetchStatus = useAppSelector((state) =>
    selectProductOpStatus(state, "fetchListing"),
  );
  const updateStatus = useAppSelector((state) =>
    selectProductOpStatus(state, "updateListing"),
  );
  const activateStatus = useAppSelector((state) =>
    selectProductOpStatus(state, "activateListing"),
  );
  const updateError = useAppSelector((state) =>
    selectProductError(state, "updateListing"),
  );
  const activateError = useAppSelector((state) =>
    selectProductError(state, "activateListing"),
  );

  const [form, setForm] = useState<EditFormState | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch listing on mount / when listingId changes
  useEffect(() => {
    if (!token) return;
    void dispatch(fetchProductListingThunk({ token, listingId }));
  }, [dispatch, listingId, token]);

  // Populate form once listing loads
  useEffect(() => {
    if (!listing || listing.id !== listingId) return;
    setForm({
      material_name: listing.material_name,
      material_type: listing.material_type,
      average_weight_per_load_mt: listing.average_weight_per_load_mt,
      quantity_available_mt: listing.quantity_available_mt,
      material_location_country: listing.material_location_country,
      availability_status: listing.availability_status,
      description: listing.description,
      seller_notes: listing.seller_notes ?? "",
      mfi_value: listing.mfi_value ?? "",
      status: listing.status,
    });
  }, [listing, listingId]);

  // Ownership guard — redirect non-owners once we know the listing owner
  const isOwner = useMemo(
    () => Boolean(listing && user?.id === listing.owner),
    [listing, user],
  );

  useEffect(() => {
    if (listing && listing.id === listingId && !isOwner) {
      router.replace(`/product/${listingId}`);
    }
  }, [isOwner, listing, listingId, router]);

  // ─── Handlers ────────────────────────────────────────────────────────────────

  function updateField<TKey extends keyof EditFormState>(
    key: TKey,
    value: EditFormState[TKey],
  ) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccessMessage(null);
    if (!token || !form || !listing) return;

    await dispatch(
      updateProductListingThunk({
        token,
        listingId,
        material_name: form.material_name.trim(),
        material_type: form.material_type,
        average_weight_per_load_mt: formatDecimal(form.average_weight_per_load_mt),
        quantity_available_mt: formatDecimal(form.quantity_available_mt),
        material_location_country: form.material_location_country,
        availability_status: form.availability_status,
        description: form.description.trim(),
        seller_notes: form.seller_notes.trim() || undefined,
        mfi_value: form.mfi_value ? formatDecimal(form.mfi_value, 3) : undefined,
        status: form.status,
      }),
    ).unwrap();

    setSuccessMessage("Listing updated successfully.");
    router.push(`/product/${listingId}`);
  }

  async function handleActivate() {
    if (!token) return;
    await dispatch(activateProductListingThunk({ token, listingId })).unwrap();
    setSuccessMessage("Listing activated.");
    router.push(`/product/${listingId}`);
  }

  // ─── Loading / error states ──────────────────────────────────────────────────

  const wrongListing = !listing || listing.id !== listingId;
  const isLoading =
    fetchStatus === "loading" || (wrongListing && fetchStatus !== "failed");

  if (isLoading && wrongListing) {
    return (
      <div className="mx-auto grid max-w-5xl gap-6">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200" />
        <div className="min-h-[300px] animate-pulse rounded-xl bg-slate-200" />
        <div className="min-h-[200px] animate-pulse rounded-xl bg-slate-200" />
      </div>
    );
  }

  if (fetchStatus === "failed" && wrongListing) {
    return (
      <section className="mx-auto grid max-w-2xl gap-4 rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="font-[var(--font-jetbrains)] text-xs font-bold uppercase text-[#006d40]">
          Error
        </p>
        <h1 className="font-[var(--font-hanken)] text-3xl font-semibold text-[#002627]">
          Could not load listing
        </h1>
        <p className="text-[#404848]">Please retry or return to the marketplace.</p>
        <button
          className="inline-flex min-h-11 w-max items-center rounded-lg bg-[#002627] px-5 font-semibold text-white transition hover:bg-slate-900"
          onClick={() => {
            if (token) void dispatch(fetchProductListingThunk({ token, listingId }));
          }}
          type="button"
        >
          Retry
        </button>
      </section>
    );
  }

  if (!listing || listing.id !== listingId || !form) return null;

  const isSaving = updateStatus === "loading";
  const isActivating = activateStatus === "loading";

  return (
    <div className="mx-auto grid max-w-5xl gap-8">
      {/* Page header */}
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-[var(--font-jetbrains)] text-xs font-bold uppercase tracking-wide text-[#006d40]">
            Inventory / Edit listing
          </p>
          <h1 className="mt-2 font-[var(--font-hanken)] text-4xl font-semibold text-[#002627]">
            {listing.material_name}
          </h1>
          <p className="mt-2 max-w-2xl text-[#404848]">
            Update the details below and save. Changes take effect immediately.
          </p>
        </div>
        <Link
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 font-semibold text-[#002627] shadow-sm transition hover:bg-slate-50"
          href={`/product/${listingId}`}
        >
          ← Back to listing
        </Link>
      </section>

      {/* Status banner */}
      {(updateError || activateError || successMessage) && (
        <div
          className={
            successMessage
              ? "grid gap-1 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800"
              : "grid gap-1 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800"
          }
        >
          <strong className="text-sm font-semibold">
            {successMessage ? "Saved" : "Could not save listing"}
          </strong>
          <span className="text-sm">{successMessage ?? updateError ?? activateError}</span>
        </div>
      )}

      <form className="grid gap-6" onSubmit={handleSubmit}>
        {/* Listing status */}
        <FormSection title="Listing status" badge={listing.status === "draft" ? "Draft" : "Active"}>
          <div className="grid gap-3 sm:grid-cols-2">
            {(["draft", "active"] as ProductListingStatus[]).map((s) => (
              <label
                className={
                  form.status === s
                    ? "grid cursor-pointer gap-1.5 rounded-xl border-2 border-[#002627] bg-[#eff4ff] p-4 text-[#002627]"
                    : "grid cursor-pointer gap-1.5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-[#404848] transition hover:border-[#002627]/30 hover:bg-[#eff4ff]"
                }
                key={s}
              >
                <input
                  checked={form.status === s}
                  className="sr-only"
                  name="status"
                  onChange={() => updateField("status", s)}
                  type="radio"
                  value={s}
                />
                <span className="font-[var(--font-jetbrains)] text-xs font-bold uppercase tracking-wide">
                  {s}
                </span>
                <strong className="font-[var(--font-hanken)] text-xl capitalize">
                  {s === "draft" ? "Save as Draft" : "Keep Active"}
                </strong>
              </label>
            ))}
          </div>
          {listing.status === "draft" && listing.images.length > 0 && (
            <div className="mt-4 flex items-center justify-between gap-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm font-medium text-emerald-800">
                This draft has images. You can activate it immediately.
              </p>
              <button
                className="shrink-0 rounded-lg bg-[#006d40] px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isActivating}
                onClick={handleActivate}
                type="button"
              >
                {isActivating ? "Activating…" : "Activate now"}
              </button>
            </div>
          )}
        </FormSection>

        {/* Material info */}
        <FormSection title="Material information">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Material name" className="md:col-span-2">
              <input
                className={inputClassName}
                onChange={(e) => updateField("material_name", e.target.value)}
                placeholder="HDPE natural regrind drums"
                required
                type="text"
                value={form.material_name}
              />
            </Field>
            <Field label="Material type">
              <select
                className={inputClassName}
                onChange={(e) =>
                  updateField("material_type", e.target.value as ProductMaterialType)
                }
                required
                value={form.material_type}
              >
                <option value="">Select type</option>
                {materialOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="MFI value">
              <input
                className={inputClassName}
                min="0"
                onChange={(e) => updateField("mfi_value", e.target.value)}
                placeholder="8.500"
                step="0.001"
                type="number"
                value={form.mfi_value}
              />
            </Field>
          </div>
        </FormSection>

        {/* Quantity & availability */}
        <FormSection title="Quantity and availability">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Total quantity, MT">
              <input
                className={inputClassName}
                min="0"
                onChange={(e) => updateField("quantity_available_mt", e.target.value)}
                placeholder="98.00"
                required
                step="0.01"
                type="number"
                value={form.quantity_available_mt}
              />
            </Field>
            <Field label="Average load, MT">
              <input
                className={inputClassName}
                min="0"
                onChange={(e) => updateField("average_weight_per_load_mt", e.target.value)}
                placeholder="4.50"
                required
                step="0.01"
                type="number"
                value={form.average_weight_per_load_mt}
              />
            </Field>
            <Field label="Availability">
              <select
                className={inputClassName}
                onChange={(e) =>
                  updateField("availability_status", e.target.value as ProductAvailabilityStatus)
                }
                required
                value={form.availability_status}
              >
                {availabilityOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Country">
              <select
                className={inputClassName}
                onChange={(e) => updateField("material_location_country", e.target.value)}
                required
                value={form.material_location_country}
              >
                <option value="">Select country</option>
                {countryOptions.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </FormSection>

        {/* Details */}
        <FormSection title="Details">
          <div className="grid gap-5">
            <Field label="Description">
              <textarea
                className={textareaClassName}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="Describe quality, contamination level, packaging, and inspection notes."
                required
                rows={5}
                value={form.description}
              />
            </Field>
            <Field label="Seller / buyer notes">
              <textarea
                className={textareaClassName}
                onChange={(e) => updateField("seller_notes", e.target.value)}
                placeholder="Preferred shipment sizes, inspection availability, or supply requirements."
                rows={3}
                value={form.seller_notes}
              />
            </Field>
          </div>
        </FormSection>

        {/* Sticky footer */}
        <div className="sticky bottom-0 z-20 -mx-4 flex justify-end gap-3 border-t border-slate-200 bg-white/95 p-4 backdrop-blur md:-mx-10 md:px-10">
          <Link
            className="inline-flex min-h-11 items-center rounded-xl border border-slate-200 bg-white px-5 font-semibold text-[#404848] transition hover:bg-slate-50"
            href={`/product/${listingId}`}
          >
            Cancel
          </Link>
          <button
            className="min-h-11 rounded-xl bg-[#002627] px-5 font-semibold text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isSaving}
            type="submit"
          >
            {isSaving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────────

function FormSection({
  badge,
  children,
  title,
}: {
  badge?: string;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 bg-slate-50 px-5 py-4">
        <h2 className="font-[var(--font-hanken)] text-xl font-semibold text-[#002627]">
          {title}
        </h2>
        {badge && (
          <span className="rounded-full bg-[#eff4ff] px-3 py-1 font-[var(--font-jetbrains)] text-[10px] font-bold uppercase tracking-wide text-[#002627]">
            {badge}
          </span>
        )}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function Field({
  children,
  className = "",
  label,
}: {
  children: React.ReactNode;
  className?: string;
  label: string;
}) {
  return (
    <label className={`grid gap-2 ${className}`}>
      <span className="font-[var(--font-jetbrains)] text-xs font-bold uppercase tracking-wide text-[#404848]">
        {label}
      </span>
      {children}
    </label>
  );
}

function formatDecimal(value: string, precision = 2): string {
  const n = Number(value);
  if (Number.isNaN(n)) return value;
  return n.toFixed(precision);
}
