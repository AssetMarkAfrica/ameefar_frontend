"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";

import { selectAccessToken, selectUser } from "@/store/auth/authSelectors";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectCurrentProductListing,
  selectProductError,
  selectProductOpStatus,
} from "@/store/product/productSelectors";
import {
  fetchProductListingThunk,
  uploadProductImageAndActivateThunk,
  uploadProductImageThunk,
  uploadProductSpecificationThunk,
} from "@/store/product/productThunks";

import { CreateEnquiryModal } from "./CreateEnquiryModal";
import {
  formatAvailability,
  formatListingType,
  formatMaterialType,
} from "./product-options";

const inputClassName =
  "min-h-11 rounded-lg border border-slate-200 bg-slate-50 px-3 text-[#0b1c30] outline-none transition focus:border-[#002627] focus:ring-2 focus:ring-[#002627]/20";

export function ProductListingDetail({ listingId }: { listingId: string }) {
  const dispatch = useAppDispatch();
  const token = useAppSelector(selectAccessToken);
  const user = useAppSelector(selectUser);
  const listing = useAppSelector(selectCurrentProductListing);
  const fetchStatus = useAppSelector((state) =>
    selectProductOpStatus(state, "fetchListing"),
  );
  const uploadImageStatus = useAppSelector((state) =>
    selectProductOpStatus(state, "uploadImage"),
  );
  const uploadAndActivateStatus = useAppSelector((state) =>
    selectProductOpStatus(state, "uploadImageAndActivate"),
  );
  const uploadSpecificationStatus = useAppSelector((state) =>
    selectProductOpStatus(state, "uploadSpecification"),
  );
  const fetchError = useAppSelector((state) =>
    selectProductError(state, "fetchListing"),
  );
  const uploadImageError = useAppSelector((state) =>
    selectProductError(state, "uploadImage"),
  );
  const uploadSpecError = useAppSelector((state) =>
    selectProductError(state, "uploadSpecification"),
  );
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [specTitle, setSpecTitle] = useState("");
  const [specDescription, setSpecDescription] = useState("");
  const [specFile, setSpecFile] = useState<File | null>(null);
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);

  // Always re-fetch when listingId changes. We don't guard on listing?.id here
  // because the effect must fire even if a prior listing is already loaded.
  useEffect(() => {
    if (!token) return;
    void dispatch(fetchProductListingThunk({ token, listingId }));
  }, [dispatch, listingId, token]);

  // Reset selected image when listing changes
  useEffect(() => {
    setSelectedImageUrl(null);
  }, [listingId]);

  const isOwner = Boolean(listing && user?.id === listing.owner);
  const nonOwnerLabel = useMemo(() => {
    if (!listing || !user) return "Contact member";
    if (listing.listing_type === "sell") {
      return user.is_buyer || user.role === "buyer" || user.role === "both"
        ? "Request supply"
        : "View listing";
    }
    return user.is_seller || user.role === "seller" || user.role === "both"
      ? "Respond to request"
      : "View request";
  }, [listing, user]);

  async function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !token || !listing) return;

    if (listing.images.length === 0) {
      await dispatch(
        uploadProductImageAndActivateThunk({
          token,
          listingId: listing.id,
          image: file,
          caption: "Primary material photo",
          is_primary: true,
          sort_order: 0,
        }),
      ).unwrap();
      return;
    }

    await dispatch(
      uploadProductImageThunk({
        token,
        listingId: listing.id,
        image: file,
        caption: `Material photo ${listing.images.length + 1}`,
        sort_order: listing.images.length,
      }),
    ).unwrap();
  }

  async function handleSpecificationUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !listing || !specFile || !specTitle.trim()) return;

    await dispatch(
      uploadProductSpecificationThunk({
        token,
        listingId: listing.id,
        title: specTitle.trim(),
        description: specDescription.trim() || undefined,
        document: specFile,
      }),
    ).unwrap();

    setSpecTitle("");
    setSpecDescription("");
    setSpecFile(null);
    event.currentTarget.reset();
  }

  // Show skeleton whenever we're actively fetching OR we have any status but
  // the loaded listing doesn't match the requested listingId yet (covers the
  // case where fetchStatus is already "succeeded" from a prior listing).
  const wrongListing = !listing || listing.id !== listingId;
  const isLoading = fetchStatus === "loading" || (wrongListing && fetchStatus !== "failed");

  if (isLoading && wrongListing) {
    return (
      <div className="mx-auto grid max-w-[1440px] gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-6">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200" />
          <div className="min-h-[480px] animate-pulse rounded-lg bg-slate-200" />
          <div className="min-h-40 animate-pulse rounded-lg bg-slate-200" />
        </div>
        <div className="min-h-80 animate-pulse rounded-lg bg-slate-200" />
      </div>
    );
  }

  if (fetchStatus === "failed" && wrongListing) {
    return (
      <section className="mx-auto grid max-w-2xl gap-4 rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <p className="font-[var(--font-jetbrains)] text-xs font-bold uppercase text-[#006d40]">
          Listing unavailable
        </p>
        <h1 className="font-[var(--font-hanken)] text-3xl font-semibold text-[#002627]">
          We could not load this product listing.
        </h1>
        <p className="text-[#404848]">
          {fetchError ?? "Please retry or return to the marketplace."}
        </p>
        <button
          className="inline-flex min-h-11 w-max items-center rounded-lg bg-[#002627] px-5 font-semibold text-white transition hover:bg-slate-900"
          onClick={() => {
            if (token) {
              void dispatch(fetchProductListingThunk({ token, listingId }));
            }
          }}
          type="button"
        >
          Retry
        </button>
      </section>
    );
  }

  if (!listing || listing.id !== listingId) {
    return null;
  }

  const primaryImage =
    listing.images.find((image) => image.is_primary) ?? listing.images[0];
  const displayedImageUrl =
    listing.images.some((image) => image.image_url === selectedImageUrl)
      ? selectedImageUrl
      : primaryImage?.image_url ?? null;
  const isUploadingImage =
    uploadImageStatus === "loading" || uploadAndActivateStatus === "loading";
  const isUploadingSpec = uploadSpecificationStatus === "loading";

  return (
    <div className="mx-auto grid max-w-[1440px] gap-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm">
        <Link
          className="font-medium text-[#404848] transition hover:text-[#002627]"
          href="/product"
        >
          Marketplace
        </Link>
        <span className="text-slate-300">/</span>
        <span className="font-semibold text-[#002627]">
          {listing.material_name}
        </span>
      </nav>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* Left column */}
        <div className="grid gap-6">
          {/* Header */}
          <header>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span
                className={
                  listing.listing_type === "sell"
                    ? "rounded-md bg-[#beebeb] px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-[#002627]"
                    : "rounded-md bg-[#ecfdf5] px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-[#006d40]"
                }
              >
                {formatListingType(listing.listing_type)}
              </span>
              <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-[#404848]">
                {formatAvailability(listing.availability_status)}
              </span>
              <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-[#404848]">
                {listing.material_location_country}
              </span>
              {listing.seller_verified_snapshot && (
                <span className="rounded-md bg-[#006d40] px-2.5 py-1 text-xs font-bold text-white">
                  Verified seller
                </span>
              )}
            </div>
            <h1 className="font-[var(--font-hanken)] text-4xl font-semibold leading-tight text-[#002627]">
              {listing.material_name}
            </h1>
            <p className="mt-3 max-w-3xl text-lg leading-7 text-[#404848]">
              {listing.description}
            </p>
          </header>

          {/* Image gallery */}
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            {/* Main image */}
            <div className="relative aspect-video w-full overflow-hidden bg-[#eff4ff]">
              {displayedImageUrl ? (
                /* Fix: use <img> instead of background-image span for reliable rendering */
                <img
                  alt={listing.material_name}
                  className="size-full object-cover"
                  src={displayedImageUrl}
                />
              ) : (
                <div className="grid size-full place-items-center">
                  <div className="grid gap-2 text-center">
                    <span className="font-[var(--font-jetbrains)] text-2xl font-bold uppercase tracking-widest text-[#002627]/30">
                      {formatMaterialType(listing.material_type)}
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-widest text-[#002627]/20">
                      No image uploaded
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Thumbnail strip */}
            {(listing.images.length > 0 || isOwner) && (
              <div className="flex gap-3 overflow-x-auto p-4">
                {listing.images.map((image) => (
                  <button
                    className={
                      displayedImageUrl === image.image_url
                        ? "relative shrink-0 overflow-hidden rounded-lg border-2 border-[#002627] shadow-sm"
                        : "relative shrink-0 overflow-hidden rounded-lg border border-slate-200 opacity-70 transition hover:border-[#002627]/50 hover:opacity-100"
                    }
                    key={image.id}
                    onClick={() => setSelectedImageUrl(image.image_url)}
                    style={{ width: 80, height: 64 }}
                    type="button"
                  >
                    <img
                      alt={image.caption || listing.material_name}
                      className="size-full object-cover"
                      src={image.image_url}
                    />
                  </button>
                ))}
                {isOwner && (
                  <label
                    className="relative grid shrink-0 cursor-pointer place-items-center overflow-hidden rounded-lg border border-dashed border-slate-300 bg-slate-50 transition hover:border-[#002627] hover:bg-[#eff4ff]"
                    style={{ width: 80, height: 64 }}
                  >
                    <input
                      accept="image/*"
                      className="absolute inset-0 cursor-pointer opacity-0 disabled:cursor-not-allowed"
                      disabled={isUploadingImage}
                      onChange={handleImageUpload}
                      type="file"
                    />
                    <span className="text-center text-[10px] font-bold uppercase leading-tight tracking-wide text-[#404848]">
                      {isUploadingImage ? "…" : "+ Add"}
                    </span>
                  </label>
                )}
              </div>
            )}

            {uploadImageError && (
              <p className="mx-4 mb-4 rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">
                {uploadImageError}
              </p>
            )}
          </section>

          {/* Material details */}
          <DetailPanel title="Material details">
            <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <DetailFact
                label="Material type"
                value={formatMaterialType(listing.material_type)}
              />
              <DetailFact
                label="Total quantity"
                value={`${listing.quantity_available_mt} MT`}
              />
              <DetailFact
                label="Average load"
                value={`${listing.average_weight_per_load_mt} MT`}
              />
              <DetailFact
                label="Remaining loads"
                value={String(listing.remaining_loads)}
              />
              <DetailFact
                label="MFI value"
                value={listing.mfi_value || "Not provided"}
              />
              <DetailFact
                label="Verification"
                value={listing.seller_verified_snapshot ? "Verified" : "Unverified"}
              />
            </dl>
          </DetailPanel>

          {/* Specifications */}
          <DetailPanel title="Specifications">
            {listing.specifications.length > 0 ? (
              <div className="grid gap-3">
                {listing.specifications.map((specification) => (
                  <a
                    className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 transition hover:border-[#002627]/30 hover:bg-[#eff4ff]"
                    href={specification.document_url}
                    key={specification.id}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <div className="grid gap-0.5">
                      <strong className="text-sm font-semibold text-[#002627]">
                        {specification.title}
                      </strong>
                      <span className="text-xs text-[#404848]">
                        {specification.description || "Supporting document"}
                      </span>
                    </div>
                    <svg
                      className="shrink-0 text-[#404848]"
                      fill="none"
                      height="16"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      width="16"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" x2="12" y1="15" y2="3" />
                    </svg>
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#404848]">
                No specifications uploaded yet.
              </p>
            )}

            {isOwner && (
              <form
                className="mt-5 grid gap-3 border-t border-slate-200 pt-5"
                onSubmit={handleSpecificationUpload}
              >
                <p className="text-xs font-bold uppercase tracking-wide text-[#404848]">
                  Upload a specification
                </p>
                <Field label="Document title">
                  <input
                    className={inputClassName}
                    onChange={(event) => setSpecTitle(event.target.value)}
                    placeholder="Material Safety Data Sheet"
                    type="text"
                    value={specTitle}
                  />
                </Field>
                <Field label="Description">
                  <input
                    className={inputClassName}
                    onChange={(event) => setSpecDescription(event.target.value)}
                    placeholder="Optional context"
                    type="text"
                    value={specDescription}
                  />
                </Field>
                <label className="relative grid min-h-12 cursor-pointer place-items-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 text-sm font-semibold text-[#404848] transition hover:border-[#002627] hover:bg-[#eff4ff]">
                  <input
                    className="absolute inset-0 cursor-pointer opacity-0"
                    onChange={(event) =>
                      setSpecFile(event.target.files?.[0] ?? null)
                    }
                    type="file"
                  />
                  <span>{specFile?.name ?? "Choose document"}</span>
                </label>
                <button
                  className="min-h-11 rounded-lg bg-[#002627] px-4 font-semibold text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isUploadingSpec || !specFile || !specTitle.trim()}
                  type="submit"
                >
                  {isUploadingSpec ? "Uploading…" : "Upload specification"}
                </button>
                {uploadSpecError && (
                  <p className="rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">
                    {uploadSpecError}
                  </p>
                )}
              </form>
            )}
          </DetailPanel>
        </div>

        {/* Right sidebar */}
        <aside className="h-fit rounded-xl border border-slate-200 bg-white p-6 shadow-sm xl:sticky xl:top-6">
          {/* Status */}
          <div className="border-b border-slate-100 pb-5">
            <p className="font-[var(--font-jetbrains)] text-xs font-bold uppercase tracking-wide text-[#006d40]">
              Listing status
            </p>
            <h2 className="mt-1.5 font-[var(--font-hanken)] text-3xl font-semibold capitalize text-[#002627]">
              {listing.status}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#404848]">
              Listed {new Date(listing.listed_at).toLocaleDateString()} · updated{" "}
              {new Date(listing.updated_at).toLocaleDateString()}
            </p>
          </div>

          {/* Quantity callout */}
          <div className="my-5 rounded-xl border border-[#d3e4fe] bg-[#eff4ff] p-5">
            <span className="font-[var(--font-jetbrains)] text-xs font-bold uppercase tracking-wide text-[#404848]">
              Total quantity
            </span>
            <strong className="mt-1.5 block font-[var(--font-hanken)] text-5xl font-semibold leading-none text-[#002627]">
              {listing.quantity_available_mt}
              <span className="ml-1 text-2xl font-medium text-[#404848]">MT</span>
            </strong>
            <small className="mt-2 block text-sm text-[#404848]">
              {listing.number_of_loads} computed loads ·{" "}
              {listing.average_weight_per_load_mt} MT avg
            </small>
          </div>

          {/* CTA */}
          {isOwner ? (
            <>
              <Link
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#002627] px-4 font-semibold text-white transition hover:bg-slate-900"
                href={`/product/${listingId}/edit`}
              >
                <svg fill="none" height="16" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="16">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Manage Listing
              </Link>
              {listing.status === "draft" && (
                <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-medium text-amber-900">
                  {listing.images.length === 0
                    ? "Upload at least one image to activate this draft automatically."
                    : "This listing is a draft. Activate it from the edit page."}
                </p>
              )}
            </>
          ) : (
            <>
              <button
                className="min-h-12 w-full rounded-xl bg-[#002627] px-4 font-semibold text-white transition hover:bg-slate-900"
                type="button"
                onClick={() => {
                  if (!token) {
                    // Ideally we'd redirect to login or show auth modal
                    alert("Please log in to make a request.");
                    return;
                  }
                  setIsEnquiryModalOpen(true);
                }}
              >
                {nonOwnerLabel}
              </button>
              <button
                className="mt-3 min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 font-semibold text-[#002627] transition hover:bg-slate-50"
                type="button"
              >
                Message owner
              </button>
            </>
          )}

          {/* Seller notes */}
          {listing.seller_notes && (
            <div className="mt-5 rounded-xl border-l-4 border-[#006d40] bg-[#ecfdf5] p-4">
              <strong className="font-[var(--font-jetbrains)] text-xs font-bold uppercase tracking-wide text-[#006d40]">
                Notes
              </strong>
              <p className="mt-1.5 text-sm leading-relaxed text-[#404848]">
                {listing.seller_notes}
              </p>
            </div>
          )}
        </aside>
      </section>

      {/* Enquiry Modal */}
      {listing && (
        <CreateEnquiryModal
          isOpen={isEnquiryModalOpen}
          onClose={() => setIsEnquiryModalOpen(false)}
          listingId={listing.id}
          listingType={listing.listing_type}
          defaultQuantity={listing.quantity_available_mt}
        />
      )}
    </div>
  );
}

function DetailPanel({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-5 font-[var(--font-hanken)] text-2xl font-semibold text-[#002627]">
        {title}
      </h2>
      {children}
    </section>
  );
}

function DetailFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
      <dt className="font-[var(--font-jetbrains)] text-[11px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </dt>
      <dd className="mt-1.5 font-semibold text-[#0b1c30]">{value}</dd>
    </div>
  );
}

function Field({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <label className="grid gap-2">
      <span className="font-[var(--font-jetbrains)] text-xs font-bold uppercase tracking-wide text-[#404848]">
        {label}
      </span>
      {children}
    </label>
  );
}