import type { RootState } from "@/store";
import type {
  ProductListingStatus,
  ProductListingSummary,
  ProductListingType,
} from "@/types/product";

import type { ProductState } from "./productSlice";

export const selectCurrentProductListing = (
  state: RootState,
): ProductState["currentListing"] => state.product.currentListing;

export const selectProductListings = (
  state: RootState,
): ProductState["listings"] => state.product.listings;

export const selectMyProductListings = (
  state: RootState,
): ProductState["myListings"] => state.product.myListings;

export const selectProductListingsPagination = (
  state: RootState,
): ProductState["listingsPagination"] => state.product.listingsPagination;

export const selectMyProductListingsPagination = (
  state: RootState,
): ProductState["myListingsPagination"] =>
  state.product.myListingsPagination;

export const selectProductListingById = (
  state: RootState,
  listingId: string,
): ProductListingSummary | undefined =>
  state.product.listings.find((listing) => listing.id === listingId) ??
  state.product.myListings.find((listing) => listing.id === listingId);

export const selectProductListingsByType = (
  state: RootState,
  listingType: ProductListingType,
): ProductListingSummary[] =>
  state.product.listings.filter(
    (listing) => listing.listing_type === listingType,
  );

export const selectMyProductListingsByStatus = (
  state: RootState,
  status: ProductListingStatus,
): ProductListingSummary[] =>
  state.product.myListings.filter((listing) => listing.status === status);

export const selectCurrentProductImages = (
  state: RootState,
): NonNullable<ProductState["currentListing"]>["images"] =>
  state.product.currentListing?.images ?? [];

export const selectCurrentProductSpecifications = (
  state: RootState,
): NonNullable<ProductState["currentListing"]>["specifications"] =>
  state.product.currentListing?.specifications ?? [];

export const selectProductOpStatus = <
  TOperation extends keyof ProductState["status"],
>(
  state: RootState,
  operation: TOperation,
): ProductState["status"][TOperation] => state.product.status[operation];

export const selectProductError = <
  TOperation extends keyof ProductState["errors"],
>(
  state: RootState,
  operation: TOperation,
): ProductState["errors"][TOperation] => state.product.errors[operation];
