"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { selectAccessToken, selectUser } from "@/store/auth/authSelectors";
import { selectProfileStatus } from "@/store/profile/profileSelectors";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectProductError,
  selectProductOpStatus,
} from "@/store/product/productSelectors";
import {
  createProductListingThunk,
  enhanceProductDescriptionThunk,
} from "@/store/product/productThunks";
import type {
  ProductAvailabilityStatus,
  ProductListingType,
  ProductMaterialType,
} from "@/types/product";

import {
  availabilityOptions,
  countryOptions,
  formatListingType,
  getAllowedListingTypes,
  materialOptions,
} from "./product-options";

type ListingFormState = {
  listing_type: ProductListingType | "";
  material_type: ProductMaterialType | "";
  material_name: string;
  quantity_available_mt: string;
  material_location_country: string;
  availability_status: ProductAvailabilityStatus;
  description: string;
  seller_notes: string;
  mfi_value: string;
};

const initialFormState: ListingFormState = {
  listing_type: "",
  material_type: "",
  material_name: "",
  quantity_available_mt: "",
  material_location_country: "",
  availability_status: "available_now",
  description: "",
  seller_notes: "",
  mfi_value: "",
};

export function CreateProductListingForm() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const token = useAppSelector(selectAccessToken);
  const user = useAppSelector(selectUser);
  const createStatus = useAppSelector((state) =>
    selectProductOpStatus(state, "createListing"),
  );
  const createError = useAppSelector((state) =>
    selectProductError(state, "createListing"),
  );
  const profileStatus = useAppSelector(selectProfileStatus);
  const allowedListingTypes = useMemo(() => getAllowedListingTypes(user), [user]);
  const [form, setForm] = useState<ListingFormState>(initialFormState);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [hasEnhancedDescription, setHasEnhancedDescription] = useState(false);

  const selectedListingType =
    form.listing_type && allowedListingTypes.includes(form.listing_type)
      ? form.listing_type
      : allowedListingTypes[0] ?? "";

  function updateForm<TName extends keyof ListingFormState>(
    name: TName,
    value: ListingFormState[TName],
  ) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleEnhanceDescription() {
    if (!token || !form.description.trim() || hasEnhancedDescription || isEnhancing) return;

    setIsEnhancing(true);
    try {
      const response = await dispatch(
        enhanceProductDescriptionThunk({
          token,
          description: form.description.trim(),
        }),
      ).unwrap();

      updateForm("description", response.data.enhanced_description);
      setHasEnhancedDescription(true);
    } catch (err) {
      console.error("Failed to enhance description:", err);
    } finally {
      setIsEnhancing(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccessMessage(null);

    if (!token || !selectedListingType || !form.material_type) return;

    try {
      const created = await dispatch(
        createProductListingThunk({
          token,
          listing_type: selectedListingType,
          status: "draft",
          material_type: form.material_type,
          material_name: form.material_name.trim(),
          quantity_available_mt: formatDecimal(form.quantity_available_mt),
          material_location_country: form.material_location_country,
          availability_status: form.availability_status,
          description: form.description.trim(),
          seller_notes: form.seller_notes.trim() || undefined,
          mfi_value: form.mfi_value ? formatDecimal(form.mfi_value, 3) : undefined,
        }),
      ).unwrap();

      // Redirect the seller to step 2: add inspection requirements + upload images
      router.push(`/product/${created.data.id}/quality-parameters`);
    } catch {
      // Redux already stores the error in createError — the banner above renders it.
    }
  }

  const isSubmitting = createStatus === "loading";

  if (profileStatus === "pending") {
    return (
      <section className="mx-auto grid max-w-2xl gap-5 rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 ring-1 ring-amber-200">
          <svg
            className="h-6 w-6 text-amber-500"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        </div>
        <p className="font-[var(--font-jetbrains)] text-xs font-bold uppercase tracking-wide text-amber-600">
          Verification in progress
        </p>
        <h1 className="font-[var(--font-hanken)] text-3xl font-semibold text-[#002627]">
          The Ameefar team is verifying your account.
        </h1>
        <p className="text-[#404848]">
          Our team is currently reviewing your profile and documents. You will
          be able to create listings as soon as your account has been verified.
          This typically takes 1–2 business days — we&apos;ll notify you once
          it&apos;s done.
        </p>
        <Link
          className="inline-flex min-h-11 w-max items-center rounded-xl bg-[#002627] px-5 font-semibold !text-white transition hover:bg-slate-900"
          href="/profile"
        >
          View profile status
        </Link>
      </section>
    );
  }

  if (allowedListingTypes.length === 0) {
    return (
      <section className="mx-auto grid max-w-2xl gap-5 rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="font-[var(--font-jetbrains)] text-xs font-bold uppercase tracking-wide text-[#006d40]">
          Role required
        </p>
        <h1 className="font-[var(--font-hanken)] text-3xl font-semibold text-[#002627]">
          Your account cannot create listings yet.
        </h1>
        <p className="text-[#404848]">
          Listing creation is available to seller, buyer, and both-role accounts.
          Update your profile role before posting material.
        </p>
        <Link
          className="inline-flex min-h-11 w-max items-center rounded-xl bg-[#002627] px-5 font-semibold !text-white transition hover:bg-slate-900"
          href="/profile"
        >
          Go to profile
        </Link>
      </section>
    );
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-8">
      {/* Page header */}
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-[var(--font-jetbrains)] text-xs font-bold uppercase tracking-wide text-[#006d40]">
            Inventory / New listing · Step 1 of 2
          </p>
          <h1 className="mt-2 font-[var(--font-hanken)] text-4xl font-semibold text-[#002627]">
            Create new listing
          </h1>
          <p className="mt-2 max-w-2xl text-[#404848]">
            Fill in the listing details. After saving, you&apos;ll define the{" "}
            <strong className="text-[#002627]">inspection requirements</strong> and upload images
            to activate the listing.
          </p>
        </div>
        <Link
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 font-semibold text-[#002627] shadow-sm transition hover:bg-slate-50"
          href="/product"
        >
          Back to market
        </Link>
      </section>

      <form className="grid gap-6" onSubmit={handleSubmit}>
        {/* Status banner */}
        {(createError || successMessage) && (
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
            <span className="text-sm">{successMessage ?? createError}</span>
          </div>
        )}

        {/* Listing type */}
        <FormSection title="Listing context" badge="Draft mode">
          <div className="grid gap-3 sm:grid-cols-2">
            {allowedListingTypes.map((type) => (
              <label
                className={
                  selectedListingType === type
                    ? "grid cursor-pointer gap-1.5 rounded-xl border-2 border-[#002627] bg-[#eff4ff] p-4 text-[#002627]"
                    : "grid cursor-pointer gap-1.5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-[#404848] transition hover:border-[#002627]/30 hover:bg-[#eff4ff]"
                }
                key={type}
              >
                <input
                  checked={selectedListingType === type}
                  className="sr-only"
                  disabled={allowedListingTypes.length === 1}
                  name="listing_type"
                  onChange={() => updateForm("listing_type", type)}
                  type="radio"
                  value={type}
                />
                <span className="font-[var(--font-jetbrains)] text-xs font-bold uppercase tracking-wide">
                  {type === "sell" ? "Sell" : "Buy"}
                </span>
                <strong className="font-[var(--font-hanken)] text-xl">
                  {formatListingType(type)}
                </strong>
              </label>
            ))}
          </div>
        </FormSection>

        {/* Material info */}
        <FormSection title="Material information">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Material name" className="md:col-span-2">
              <input
                className={inputClassName}
                onChange={(event) => updateForm("material_name", event.target.value)}
                placeholder="HDPE natural regrind drums"
                required
                type="text"
                value={form.material_name}
              />
            </Field>
            <Field label="Material type">
              <select
                className={inputClassName}
                onChange={(event) =>
                  updateForm(
                    "material_type",
                    event.target.value as ListingFormState["material_type"],
                  )
                }
                required
                value={form.material_type}
              >
                <option value="">Select type</option>
                {materialOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="MFI value">
              <input
                className={inputClassName}
                min="0"
                onChange={(event) => updateForm("mfi_value", event.target.value)}
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
                min="0.01"
                onChange={(event) =>
                  updateForm("quantity_available_mt", event.target.value)
                }
                placeholder="98.00"
                required
                step="0.01"
                type="number"
                value={form.quantity_available_mt}
              />
            </Field>
            <Field label="Availability">
              <select
                className={inputClassName}
                onChange={(event) =>
                  updateForm(
                    "availability_status",
                    event.target.value as ProductAvailabilityStatus,
                  )
                }
                required
                value={form.availability_status}
              >
                {availabilityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Country" className="md:col-span-2">
              <select
                className={inputClassName}
                onChange={(event) =>
                  updateForm("material_location_country", event.target.value)
                }
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
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <span className="font-[var(--font-jetbrains)] text-xs font-bold uppercase tracking-wide text-[#404848]">
                  Description
                </span>
                <button
                  type="button"
                  disabled={isEnhancing || hasEnhancedDescription || !form.description.trim()}
                  onClick={handleEnhanceDescription}
                  className="flex items-center gap-1.5 text-xs font-semibold text-[#006d40] transition hover:text-[#004d2d] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M5 3l1 2.5L8.5 6.5 6 7.5 5 10l-1-2.5L1.5 6.5 4 5.5z M19 3l1 2.5L22.5 6.5 20 7.5 19 10l-1-2.5L15.5 6.5 18 5.5z M12 7l1.5 4.5L18 13l-4.5 1.5L12 19l-1.5-4.5L6 13l4.5-1.5z" />
                  </svg>
                  {isEnhancing ? "Enhancing..." : hasEnhancedDescription ? "Enhanced ✨" : "AI Enhance"}
                </button>
              </div>
              <textarea
                className={textareaClassName}
                onChange={(event) => updateForm("description", event.target.value)}
                placeholder="Describe quality, contamination level, packaging, and inspection notes."
                required
                rows={5}
                value={form.description}
              />
            </div>
            <Field label="Seller / buyer notes">
              <textarea
                className={textareaClassName}
                onChange={(event) => updateForm("seller_notes", event.target.value)}
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
            href="/product"
          >
            Cancel
          </Link>
          <button
            className="min-h-11 rounded-xl bg-[#002627] px-5 font-semibold text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Saving…" : "Next: Quality Parameters →"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Shared classes ────────────────────────────────────────────────────────────

const inputClassName =
  "min-h-12 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-[#0b1c30] outline-none transition focus:border-[#002627] focus:ring-2 focus:ring-[#002627]/20";

const textareaClassName =
  "w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-[#0b1c30] outline-none transition focus:border-[#002627] focus:ring-2 focus:ring-[#002627]/20 resize-none";

// ─── Sub-components ────────────────────────────────────────────────────────────

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
  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) return value;
  return numericValue.toFixed(precision);
}