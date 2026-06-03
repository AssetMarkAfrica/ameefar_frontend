"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { selectAccessToken, selectUser } from "@/store/auth/authSelectors";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectProductError,
  selectProductOpStatus,
} from "@/store/product/productSelectors";
import {
  createProductListingThunk,
  uploadProductImageAndActivateThunk,
  uploadProductImageThunk,
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
  average_weight_per_load_mt: string;
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
  average_weight_per_load_mt: "",
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
  const uploadAndActivateStatus = useAppSelector((state) =>
    selectProductOpStatus(state, "uploadImageAndActivate"),
  );
  const createError = useAppSelector((state) =>
    selectProductError(state, "createListing"),
  );
  const uploadError = useAppSelector((state) =>
    selectProductError(state, "uploadImageAndActivate"),
  );
  const allowedListingTypes = useMemo(() => getAllowedListingTypes(user), [user]);
  const [form, setForm] = useState<ListingFormState>(initialFormState);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

  function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    setImageFiles(Array.from(event.target.files ?? []));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccessMessage(null);

    if (!token || !selectedListingType || !form.material_type) return;

    const created = await dispatch(
      createProductListingThunk({
        token,
        listing_type: selectedListingType,
        status: "draft",
        material_type: form.material_type,
        material_name: form.material_name.trim(),
        average_weight_per_load_mt: formatDecimal(form.average_weight_per_load_mt),
        quantity_available_mt: formatDecimal(form.quantity_available_mt),
        material_location_country: form.material_location_country,
        availability_status: form.availability_status,
        description: form.description.trim(),
        seller_notes: form.seller_notes.trim() || undefined,
        mfi_value: form.mfi_value ? formatDecimal(form.mfi_value, 3) : undefined,
      }),
    ).unwrap();

    if (imageFiles.length > 0) {
      const [primaryImage, ...otherImages] = imageFiles;

      await dispatch(
        uploadProductImageAndActivateThunk({
          token,
          listingId: created.data.id,
          image: primaryImage,
          caption: "Primary material photo",
          is_primary: true,
          sort_order: 0,
        }),
      ).unwrap();

      await Promise.all(
        otherImages.map((image, index) =>
          dispatch(
            uploadProductImageThunk({
              token,
              listingId: created.data.id,
              image,
              caption: `Material photo ${index + 2}`,
              sort_order: index + 1,
            }),
          ).unwrap(),
        ),
      );

      setSuccessMessage("Listing created and activated.");
    } else {
      setSuccessMessage("Draft listing created. Upload an image to activate it.");
    }

    router.push(`/product/${created.data.id}`);
  }

  const isSubmitting =
    createStatus === "loading" || uploadAndActivateStatus === "loading";

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
          className="inline-flex min-h-11 w-max items-center rounded-xl bg-[#002627] px-5 font-semibold text-white transition hover:bg-slate-900"
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
            Inventory / New listing
          </p>
          <h1 className="mt-2 font-[var(--font-hanken)] text-4xl font-semibold text-[#002627]">
            Create new listing
          </h1>
          <p className="mt-2 max-w-2xl text-[#404848]">
            Listings start as drafts. When the first image uploads successfully,
            Ameefar activates the listing automatically.
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
        {(createError || uploadError || successMessage) && (
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
            <span className="text-sm">{successMessage ?? createError ?? uploadError}</span>
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
                min="0"
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
            <Field label="Average load, MT">
              <input
                className={inputClassName}
                min="0"
                onChange={(event) =>
                  updateForm("average_weight_per_load_mt", event.target.value)
                }
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
            <Field label="Country">
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
            <Field label="Description">
              <textarea
                className={textareaClassName}
                onChange={(event) => updateForm("description", event.target.value)}
                placeholder="Describe quality, contamination level, packaging, and inspection notes."
                required
                rows={5}
                value={form.description}
              />
            </Field>
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

        {/* Photos */}
        <FormSection title="Material photos" badge="Activates on first upload">
          <label className="relative grid min-h-40 cursor-pointer place-items-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center transition hover:border-[#002627] hover:bg-[#eff4ff]">
            <input
              accept="image/*"
              className="absolute inset-0 cursor-pointer opacity-0"
              multiple
              onChange={handleFiles}
              type="file"
            />
            {imageFiles.length > 0 ? (
              <div className="grid gap-2">
                {/* Preview thumbnails */}
                <div className="flex flex-wrap justify-center gap-2">
                  {imageFiles.map((file, i) => (
                    <img
                      alt={file.name}
                      className="h-16 w-16 rounded-lg object-cover"
                      key={i}
                      src={URL.createObjectURL(file)}
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold text-[#002627]">
                  {imageFiles.length} file{imageFiles.length === 1 ? "" : "s"} selected
                </span>
              </div>
            ) : (
              <div className="grid gap-2">
                <svg
                  className="mx-auto text-slate-300"
                  fill="none"
                  height="40"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                  width="40"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" x2="12" y1="3" y2="15" />
                </svg>
                <strong className="font-[var(--font-hanken)] text-lg text-[#002627]">
                  Upload material images
                </strong>
                <span className="text-sm text-[#404848]">PNG, JPG, GIF, or WebP</span>
              </div>
            )}
          </label>
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
            {isSubmitting ? "Saving…" : "Save listing"}
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