"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ProductService } from "@/services/product/ProductService";
import type { ProductListingSummary } from "@/types/product";
import { formatMaterialType, formatAvailability } from "@/app/product/_components/product-options";
import { Hanken_Grotesk, Inter, JetBrains_Mono } from "next/font/google";

const hanken = Hanken_Grotesk({ subsets: ["latin"], weight: ["400", "600", "700", "800"] });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500", "700"] });

export function FeaturedListings() {
  const [listings, setListings] = useState<ProductListingSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const response = await ProductService.listFeaturedListings();
        setListings(response.results || []);
      } catch (error) {
        console.error("Failed to fetch featured listings", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchFeatured();
  }, []);

  if (!isLoading && listings.length === 0) {
    return null; // Don't show the section if there are no featured listings
  }

  return (
    <section className="bg-[#f0faf9] px-6 py-20 md:px-12 border-b border-slate-100">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className={`${jetbrains.className} inline-block rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#006d40]`}>
              Live Market
            </span>
            <h2 className={`${hanken.className} mt-4 text-[32px] font-bold text-[#002627] md:text-[40px]`}>
              Featured Listings
            </h2>
            <p className="mt-2 text-[15px] text-slate-600">
              Recent active offers and requests from verified suppliers and buyers.
            </p>
          </div>
          <Link
            href="/product"
            className={`${hanken.className} inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-[14px] font-bold text-[#002627] shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 hover:shadow`}
          >
            Visit Marketplace
            <svg fill="none" height="16" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" width="16">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-[340px] animate-pulse rounded-2xl bg-white shadow-sm ring-1 ring-slate-100" />
            ))}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {listings.map((listing) => (
              <Link
                key={listing.id}
                href={`/product/${listing.id}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg"
              >
                <div className="relative h-44 overflow-hidden bg-slate-50">
                  {listing.primary_image_url ? (
                    <img
                      src={listing.primary_image_url}
                      alt={listing.material_name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="grid h-full place-items-center">
                      <span className={`${jetbrains.className} text-[12px] font-bold uppercase tracking-widest text-slate-300`}>
                        {formatMaterialType(listing.material_type)}
                      </span>
                    </div>
                  )}
                  {listing.seller_verified_snapshot && (
                    <span className="absolute left-3 top-3 rounded-md bg-[#006d40] px-2 py-1 text-[10px] font-bold text-white shadow-sm">
                      Verified
                    </span>
                  )}
                  <span
                    className={`absolute right-3 top-3 rounded-md px-2 py-1 text-[10px] font-bold ${
                      listing.listing_type === "sell"
                        ? "bg-[#beebeb] text-[#002627]"
                        : "bg-[#ecfdf5] text-[#006d40]"
                    }`}
                  >
                    {listing.listing_type === "sell" ? "For Sale" : "Buy Request"}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <h3 className={`${hanken.className} line-clamp-2 text-[18px] font-bold leading-tight text-[#002627]`}>
                    {listing.material_name}
                  </h3>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div>
                      <div className={`${jetbrains.className} text-[9px] font-bold uppercase tracking-wide text-slate-400`}>
                        Material
                      </div>
                      <div className="mt-0.5 text-[13px] font-semibold text-slate-700">
                        {formatMaterialType(listing.material_type)}
                      </div>
                    </div>
                    <div>
                      <div className={`${jetbrains.className} text-[9px] font-bold uppercase tracking-wide text-slate-400`}>
                        Quantity
                      </div>
                      <div className="mt-0.5 text-[13px] font-semibold text-slate-700">
                        {listing.quantity_available_mt} MT
                      </div>
                    </div>
                    <div>
                      <div className={`${jetbrains.className} text-[9px] font-bold uppercase tracking-wide text-slate-400`}>
                        Origin
                      </div>
                      <div className="mt-0.5 text-[13px] font-semibold text-slate-700">
                        {listing.material_location_country}
                      </div>
                    </div>
                    <div>
                      <div className={`${jetbrains.className} text-[9px] font-bold uppercase tracking-wide text-slate-400`}>
                        Availability
                      </div>
                      <div className="mt-0.5 text-[13px] font-semibold text-slate-700">
                        {formatAvailability(listing.availability_status)}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
