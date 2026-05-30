import { createSlice } from "@reduxjs/toolkit";

import type {
  ProductImage,
  ProductListing,
  ProductListingSummary,
  ProductPagination,
  ProductSpecification,
} from "@/types/product";

import {
  activateProductListingThunk,
  createProductListingThunk,
  fetchProductListingThunk,
  listMyProductListingsThunk,
  listProductListingsThunk,
  updateProductListingThunk,
  uploadProductImageAndActivateThunk,
  uploadProductImageThunk,
  uploadProductSpecificationThunk,
} from "./productThunks";

export type ProductOperation =
  | "createListing"
  | "updateListing"
  | "activateListing"
  | "fetchListing"
  | "listListings"
  | "listMyListings"
  | "uploadImage"
  | "uploadImageAndActivate"
  | "uploadSpecification";

export type ProductOperationStatus =
  | "idle"
  | "loading"
  | "succeeded"
  | "failed";

export interface ProductState {
  currentListing: ProductListing | null;
  listings: ProductListingSummary[];
  myListings: ProductListingSummary[];
  listingsPagination: ProductPagination | null;
  myListingsPagination: ProductPagination | null;
  status: Record<ProductOperation, ProductOperationStatus>;
  errors: Record<ProductOperation, string | null>;
}

const initialStatus: Record<ProductOperation, ProductOperationStatus> = {
  createListing: "idle",
  updateListing: "idle",
  activateListing: "idle",
  fetchListing: "idle",
  listListings: "idle",
  listMyListings: "idle",
  uploadImage: "idle",
  uploadImageAndActivate: "idle",
  uploadSpecification: "idle",
};

const initialErrors: Record<ProductOperation, string | null> = {
  createListing: null,
  updateListing: null,
  activateListing: null,
  fetchListing: null,
  listListings: null,
  listMyListings: null,
  uploadImage: null,
  uploadImageAndActivate: null,
  uploadSpecification: null,
};

const initialState: ProductState = {
  currentListing: null,
  listings: [],
  myListings: [],
  listingsPagination: null,
  myListingsPagination: null,
  status: initialStatus,
  errors: initialErrors,
};

function rejectedMessage(message?: string): string {
  return message ?? "Something went wrong.";
}

function listingToSummary(listing: ProductListing): ProductListingSummary {
  const primaryImage =
    listing.images.find((image) => image.is_primary) ?? listing.images[0];

  return {
    id: listing.id,
    listing_type: listing.listing_type,
    status: listing.status,
    material_type: listing.material_type,
    material_name: listing.material_name,
    number_of_loads: listing.number_of_loads,
    average_weight_per_load_mt: listing.average_weight_per_load_mt,
    quantity_available_mt: listing.quantity_available_mt,
    remaining_loads: listing.remaining_loads,
    material_location_country: listing.material_location_country,
    availability_status: listing.availability_status,
    primary_image_url: primaryImage?.image_url ?? null,
    images_count: listing.images.length,
    seller_verified_snapshot: listing.seller_verified_snapshot,
    listed_at: listing.listed_at,
  };
}

function upsertListingSummary(
  listings: ProductListingSummary[],
  listing: ProductListing | ProductListingSummary,
): ProductListingSummary[] {
  const summary = "images" in listing ? listingToSummary(listing) : listing;
  const existingIndex = listings.findIndex((item) => item.id === summary.id);

  if (existingIndex === -1) {
    return [summary, ...listings];
  }

  return listings.map((item) => (item.id === summary.id ? summary : item));
}

function upsertImage(
  images: ProductImage[],
  image: ProductImage,
): ProductImage[] {
  const existingIndex = images.findIndex((item) => item.id === image.id);

  if (existingIndex === -1) {
    return [...images, image];
  }

  return images.map((item) => (item.id === image.id ? image : item));
}

function upsertSpecification(
  specifications: ProductSpecification[],
  specification: ProductSpecification,
): ProductSpecification[] {
  const existingIndex = specifications.findIndex(
    (item) => item.id === specification.id,
  );

  if (existingIndex === -1) {
    return [...specifications, specification];
  }

  return specifications.map((item) =>
    item.id === specification.id ? specification : item,
  );
}

function syncSummaryLists(state: ProductState, listing: ProductListing) {
  state.listings = upsertListingSummary(state.listings, listing);
  state.myListings = upsertListingSummary(state.myListings, listing);
}

export const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    clearProductErrors(state) {
      state.errors = { ...initialErrors };
    },
    clearCurrentProductListing(state) {
      state.currentListing = null;
    },
    resetProductState() {
      return {
        ...initialState,
        status: { ...initialStatus },
        errors: { ...initialErrors },
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createProductListingThunk.pending, (state) => {
        state.status.createListing = "loading";
        state.errors.createListing = null;
      })
      .addCase(createProductListingThunk.fulfilled, (state, action) => {
        state.status.createListing = "succeeded";
        state.currentListing = action.payload.data;
        state.myListings = upsertListingSummary(
          state.myListings,
          action.payload.data,
        );
      })
      .addCase(createProductListingThunk.rejected, (state, action) => {
        state.status.createListing = "failed";
        state.errors.createListing = rejectedMessage(action.error.message);
      })
      .addCase(updateProductListingThunk.pending, (state) => {
        state.status.updateListing = "loading";
        state.errors.updateListing = null;
      })
      .addCase(updateProductListingThunk.fulfilled, (state, action) => {
        state.status.updateListing = "succeeded";
        state.currentListing = action.payload.data;
        syncSummaryLists(state, action.payload.data);
      })
      .addCase(updateProductListingThunk.rejected, (state, action) => {
        state.status.updateListing = "failed";
        state.errors.updateListing = rejectedMessage(action.error.message);
      })
      .addCase(activateProductListingThunk.pending, (state) => {
        state.status.activateListing = "loading";
        state.errors.activateListing = null;
      })
      .addCase(activateProductListingThunk.fulfilled, (state, action) => {
        state.status.activateListing = "succeeded";
        state.currentListing = action.payload.data;
        syncSummaryLists(state, action.payload.data);
      })
      .addCase(activateProductListingThunk.rejected, (state, action) => {
        state.status.activateListing = "failed";
        state.errors.activateListing = rejectedMessage(action.error.message);
      })
      .addCase(fetchProductListingThunk.pending, (state) => {
        state.status.fetchListing = "loading";
        state.errors.fetchListing = null;
      })
      .addCase(fetchProductListingThunk.fulfilled, (state, action) => {
        state.status.fetchListing = "succeeded";
        state.currentListing = action.payload.data;
        syncSummaryLists(state, action.payload.data);
      })
      .addCase(fetchProductListingThunk.rejected, (state, action) => {
        state.status.fetchListing = "failed";
        state.errors.fetchListing = rejectedMessage(action.error.message);
      })
      .addCase(listProductListingsThunk.pending, (state) => {
        state.status.listListings = "loading";
        state.errors.listListings = null;
      })
      .addCase(listProductListingsThunk.fulfilled, (state, action) => {
        state.status.listListings = "succeeded";
        state.listings = action.payload.results;
        state.listingsPagination = action.payload.pagination;
      })
      .addCase(listProductListingsThunk.rejected, (state, action) => {
        state.status.listListings = "failed";
        state.errors.listListings = rejectedMessage(action.error.message);
      })
      .addCase(listMyProductListingsThunk.pending, (state) => {
        state.status.listMyListings = "loading";
        state.errors.listMyListings = null;
      })
      .addCase(listMyProductListingsThunk.fulfilled, (state, action) => {
        state.status.listMyListings = "succeeded";
        state.myListings = action.payload.results;
        state.myListingsPagination = action.payload.pagination;
      })
      .addCase(listMyProductListingsThunk.rejected, (state, action) => {
        state.status.listMyListings = "failed";
        state.errors.listMyListings = rejectedMessage(action.error.message);
      })
      .addCase(uploadProductImageThunk.pending, (state) => {
        state.status.uploadImage = "loading";
        state.errors.uploadImage = null;
      })
      .addCase(uploadProductImageThunk.fulfilled, (state, action) => {
        state.status.uploadImage = "succeeded";

        if (state.currentListing?.id === action.meta.arg.listingId) {
          state.currentListing.images = upsertImage(
            state.currentListing.images,
            action.payload.data,
          );
          syncSummaryLists(state, state.currentListing);
        }
      })
      .addCase(uploadProductImageThunk.rejected, (state, action) => {
        state.status.uploadImage = "failed";
        state.errors.uploadImage = rejectedMessage(action.error.message);
      })
      .addCase(uploadProductImageAndActivateThunk.pending, (state) => {
        state.status.uploadImageAndActivate = "loading";
        state.errors.uploadImageAndActivate = null;
      })
      .addCase(uploadProductImageAndActivateThunk.fulfilled, (state, action) => {
        state.status.uploadImageAndActivate = "succeeded";
        state.currentListing = action.payload.listing.data;
        syncSummaryLists(state, action.payload.listing.data);
      })
      .addCase(uploadProductImageAndActivateThunk.rejected, (state, action) => {
        state.status.uploadImageAndActivate = "failed";
        state.errors.uploadImageAndActivate = rejectedMessage(
          action.error.message,
        );
      })
      .addCase(uploadProductSpecificationThunk.pending, (state) => {
        state.status.uploadSpecification = "loading";
        state.errors.uploadSpecification = null;
      })
      .addCase(uploadProductSpecificationThunk.fulfilled, (state, action) => {
        state.status.uploadSpecification = "succeeded";

        if (state.currentListing?.id === action.meta.arg.listingId) {
          state.currentListing.specifications = upsertSpecification(
            state.currentListing.specifications,
            action.payload.data,
          );
        }
      })
      .addCase(uploadProductSpecificationThunk.rejected, (state, action) => {
        state.status.uploadSpecification = "failed";
        state.errors.uploadSpecification = rejectedMessage(
          action.error.message,
        );
      });
  },
});

export const {
  clearCurrentProductListing,
  clearProductErrors,
  resetProductState,
} = productSlice.actions;

export default productSlice.reducer;
