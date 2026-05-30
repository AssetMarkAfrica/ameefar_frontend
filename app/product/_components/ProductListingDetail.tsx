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

  useEffect(() => {
    if (token && listing?.id !== listingId) {
      void dispatch(fetchProductListingThunk({ token, listingId }));
    }
  }, [dispatch, listing?.id, listingId, token]);

  const isOwner = Boolean(listing && user?.id === listing.owner);
  const counterpartyLabel = useMemo(() => {
    if (!listing || !user) {
      return "Contact member";
    }

    if (isOwner) {
      return listing.status === "draft" ? "Draft listing" : "Manage listing";
    }

    if (listing.listing_type === "sell") {
      return user.is_buyer || user.role === "buyer" || user.role === "both"
        ? "Request supply"
        : "View listing";
    }

    return user.is_seller || user.role === "seller" || user.role === "both"
      ? "Respond to request"
      : "View request";
  }, [isOwner, listing, user]);

  async function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file || !token || !listing) {
      return;
    }

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

    if (!token || !listing || !specFile || !specTitle.trim()) {
      return;
    }

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

  if (fetchStatus === "loading" && (!listing || listing.id !== listingId)) {
    return (
      <div className="mx-auto grid max-w-[1440px] gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-h-[520px] animate-pulse rounded-lg bg-slate-200" />
        <div className="min-h-80 animate-pulse rounded-lg bg-slate-200" />
      </div>
    );
  }

  if (fetchStatus === "failed" && (!listing || listing.id !== listingId)) {
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
          className="inline-flex min-h-11 w-max items-center rounded-lg bg-[#002627] px-5 font-semibold text-white"
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
      <div className="flex flex-wrap items-center gap-2 text-sm text-[#404848]">
        <Link className="hover:text-[#002627]" href="/product">
          Marketplace
        </Link>
        <span>/</span>
        <span className="font-semibold text-[#0b1c30]">
          {listing.material_name}
        </span>
      </div>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-6">
          <header>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span
                className={
                  listing.listing_type === "sell"
                    ? "rounded bg-[#beebeb] px-2.5 py-1 text-xs font-bold text-[#002627]"
                    : "rounded bg-[#ecfdf5] px-2.5 py-1 text-xs font-bold text-[#006d40]"
                }
              >
                {formatListingType(listing.listing_type)}
              </span>
              <span className="rounded bg-slate-100 px-2.5 py-1 text-xs font-semibold text-[#404848]">
                {formatAvailability(listing.availability_status)}
              </span>
              <span className="rounded bg-slate-100 px-2.5 py-1 text-xs font-semibold text-[#404848]">
                {listing.material_location_country}
              </span>
            </div>
            <h1 className="font-[var(--font-hanken)] text-4xl font-semibold leading-tight text-[#002627]">
              {listing.material_name}
            </h1>
            <p className="mt-3 max-w-3xl text-lg leading-7 text-[#404848]">
              {listing.description}
            </p>
          </header>

          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="aspect-video overflow-hidden rounded-lg bg-[#d3e4fe]">
              {displayedImageUrl ? (
                <span
                  aria-label={listing.material_name}
                  className="block size-full bg-cover bg-center"
                  role="img"
                  style={{ backgroundImage: `url(${displayedImageUrl})` }}
                />
              ) : (
                <span className="grid size-full place-items-center bg-[#eff4ff] font-[var(--font-jetbrains)] text-sm font-bold uppercase text-[#002627]">
                  {formatMaterialType(listing.material_type)}
                </span>
              )}
            </div>
            <div className="mt-4 grid grid-cols-4 gap-3">
              {listing.images.map((image) => (
                <button
                  className={
                    displayedImageUrl === image.image_url
                      ? "aspect-square overflow-hidden rounded-lg border-2 border-[#002627] bg-slate-100"
                      : "aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-100 transition hover:border-[#002627]/40"
                  }
                  key={image.id}
                  onClick={() => setSelectedImageUrl(image.image_url)}
                  type="button"
                >
                  <span
                    aria-label={image.caption || listing.material_name}
                    className="block size-full bg-cover bg-center"
                    role="img"
                    style={{ backgroundImage: `url(${image.image_url})` }}
                  />
                </button>
              ))}
              {isOwner ? (
                <label className="relative grid aspect-square cursor-pointer place-items-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-2 text-center text-sm font-semibold text-[#404848] transition hover:border-[#002627] hover:bg-[#eff4ff]">
                  <input
                    accept="image/*"
                    className="absolute inset-0 cursor-pointer opacity-0 disabled:cursor-not-allowed"
                    disabled={isUploadingImage}
                    onChange={handleImageUpload}
                    type="file"
                  />
                  <span>{isUploadingImage ? "Uploading" : "Add image"}</span>
                </label>
              ) : null}
            </div>
            {uploadImageError ? (
              <p className="mt-3 rounded bg-red-50 p-3 text-sm font-semibold text-red-800">
                {uploadImageError}
              </p>
            ) : null}
          </section>

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
              <DetailFact label="Remaining loads" value={listing.remaining_loads} />
              <DetailFact label="MFI value" value={listing.mfi_value || "Not provided"} />
              <DetailFact
                label="Verification"
                value={listing.seller_verified_snapshot ? "Verified" : "Unverified"}
              />
            </dl>
          </DetailPanel>

          <DetailPanel title="Specifications">
            {listing.specifications.length > 0 ? (
              <div className="grid gap-3">
                {listing.specifications.map((specification) => (
                  <a
                    className="grid gap-1 rounded-lg border border-slate-200 bg-slate-50 p-4 transition hover:border-[#002627]/30 hover:bg-[#eff4ff]"
                    href={specification.document_url}
                    key={specification.id}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <strong className="text-[#002627]">{specification.title}</strong>
                    <span className="text-sm text-[#404848]">
                      {specification.description || "Supporting document"}
                    </span>
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-[#404848]">No specifications uploaded yet.</p>
            )}

            {isOwner ? (
              <form
                className="mt-5 grid gap-3 border-t border-slate-200 pt-5"
                onSubmit={handleSpecificationUpload}
              >
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
                <label className="relative grid min-h-12 cursor-pointer place-items-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 text-sm font-semibold text-[#404848]">
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
                  className="min-h-11 rounded-lg bg-[#002627] px-4 font-semibold text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isUploadingSpec || !specFile || !specTitle.trim()}
                  type="submit"
                >
                  {isUploadingSpec ? "Uploading..." : "Upload specification"}
                </button>
                {uploadSpecError ? (
                  <p className="rounded bg-red-50 p-3 text-sm font-semibold text-red-800">
                    {uploadSpecError}
                  </p>
                ) : null}
              </form>
            ) : null}
          </DetailPanel>
        </div>

        <aside className="h-fit rounded-lg border border-slate-200 bg-white p-6 shadow-sm xl:sticky xl:top-6">
          <div className="border-b border-slate-200 pb-5">
            <p className="font-[var(--font-jetbrains)] text-xs font-bold uppercase text-[#006d40]">
              Listing status
            </p>
            <h2 className="mt-2 font-[var(--font-hanken)] text-3xl font-semibold capitalize text-[#002627]">
              {listing.status}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#404848]">
              Listed {new Date(listing.listed_at).toLocaleDateString()} and last
              updated {new Date(listing.updated_at).toLocaleDateString()}.
            </p>
          </div>
          <div className="my-5 rounded-lg border border-slate-200 bg-[#eff4ff] p-5">
            <span className="text-sm font-semibold text-[#404848]">
              Total quantity
            </span>
            <strong className="mt-1 block font-[var(--font-hanken)] text-4xl text-[#002627]">
              {listing.quantity_available_mt} MT
            </strong>
            <small className="mt-1 block text-[#404848]">
              {listing.number_of_loads} computed loads
            </small>
          </div>
          <button
            className="min-h-12 w-full rounded-lg bg-[#002627] px-4 font-semibold text-white transition hover:bg-slate-900"
            type="button"
          >
            {counterpartyLabel}
          </button>
          {!isOwner ? (
            <button
              className="mt-3 min-h-12 w-full rounded-lg border border-slate-200 bg-white px-4 font-semibold text-[#002627] transition hover:bg-slate-50"
              type="button"
            >
              Message owner
            </button>
          ) : listing.status === "draft" && listing.images.length === 0 ? (
            <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-900">
              Upload at least one image to activate this draft automatically.
            </p>
          ) : null}
          {listing.seller_notes ? (
            <div className="mt-5 rounded-lg border-l-4 border-[#006d40] bg-[#ecfdf5] p-4">
              <strong className="text-[#006d40]">Notes</strong>
              <p className="mt-1 text-sm leading-6 text-[#404848]">
                {listing.seller_notes}
              </p>
            </div>
          ) : null}
        </aside>
      </section>
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
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-5 font-[var(--font-hanken)] text-2xl font-semibold text-[#002627]">
        {title}
      </h2>
      {children}
    </section>
  );
}

function DetailFact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <dt className="font-[var(--font-jetbrains)] text-[11px] font-bold uppercase text-slate-500">
        {label}
      </dt>
      <dd className="mt-1 font-semibold text-[#0b1c30]">{value}</dd>
    </div>
  );
}

function Field({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <label className="grid gap-2">
      <span className="font-[var(--font-jetbrains)] text-xs font-bold uppercase text-[#404848]">
        {label}
      </span>
      {children}
    </label>
  );
}
