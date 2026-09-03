import { createAsyncThunk } from "@reduxjs/toolkit";

import { ProductService } from "@/services/product/ProductService";
import type {
  CreateProductListingPayload,
  CreateQualityParameterPayload,
  EnhanceDescriptionPayload,
  EnhanceDescriptionResponse,
  ListProductListingsParams,
  ProductImageResponse,
  ProductListResponse,
  ProductListingResponse,
  ProductSpecificationResponse,
  QualityParameter,
  QualityParameterListResponse,
  QualityParameterResponse,
  UpdateProductListingPayload,
  UpdateQualityParameterPayload,
  UploadProductImageAndActivateResponse,
  UploadProductImagePayload,
  UploadProductSpecificationPayload,
} from "@/types/product";

type TokenArg = {
  token: string;
};

type ListingIdArg = {
  listingId: string;
};

export const createProductListingThunk = createAsyncThunk<
  ProductListingResponse,
  TokenArg & CreateProductListingPayload
>("product/createListing", ({ token, ...payload }) =>
  ProductService.createListing(token, payload),
);

export const updateProductListingThunk = createAsyncThunk<
  ProductListingResponse,
  TokenArg & ListingIdArg & UpdateProductListingPayload
>("product/updateListing", ({ token, listingId, ...payload }) =>
  ProductService.updateListing(token, listingId, payload),
);

export const activateProductListingThunk = createAsyncThunk<
  ProductListingResponse,
  TokenArg & ListingIdArg
>("product/activateListing", ({ token, listingId }) =>
  ProductService.activateListing(token, listingId),
);

export const fetchProductListingThunk = createAsyncThunk<
  ProductListingResponse,
  TokenArg & ListingIdArg
>("product/fetchListing", ({ token, listingId }) =>
  ProductService.getListing(token, listingId),
);

export const listProductListingsThunk = createAsyncThunk<
  ProductListResponse,
  TokenArg & { params?: ListProductListingsParams }
>("product/listListings", ({ token, params }) =>
  ProductService.listListings(token, params),
);

export const listMyProductListingsThunk = createAsyncThunk<
  ProductListResponse,
  TokenArg & { params?: Omit<ListProductListingsParams, "mine"> }
>("product/listMyListings", ({ token, params }) =>
  ProductService.listMyListings(token, params),
);

export const uploadProductImageThunk = createAsyncThunk<
  ProductImageResponse,
  TokenArg & ListingIdArg & UploadProductImagePayload
>("product/uploadImage", ({ token, listingId, ...payload }) =>
  ProductService.uploadImage(token, listingId, payload),
);

export const uploadProductImageAndActivateThunk = createAsyncThunk<
  UploadProductImageAndActivateResponse,
  TokenArg & ListingIdArg & UploadProductImagePayload
>("product/uploadImageAndActivate", ({ token, listingId, ...payload }) =>
  ProductService.uploadImageAndActivate(token, listingId, {
    is_primary: true,
    sort_order: 0,
    ...payload,
  }),
);

export const uploadProductSpecificationThunk = createAsyncThunk<
  ProductSpecificationResponse,
  TokenArg & ListingIdArg & UploadProductSpecificationPayload
>("product/uploadSpecification", ({ token, listingId, ...payload }) =>
  ProductService.uploadSpecification(token, listingId, payload),
);

export const enhanceProductDescriptionThunk = createAsyncThunk<
  EnhanceDescriptionResponse,
  TokenArg & EnhanceDescriptionPayload
>("product/enhanceDescription", ({ token, ...payload }) =>
  ProductService.enhanceDescription(token, payload),
);

export const addQualityParameterThunk = createAsyncThunk<
  QualityParameterResponse,
  TokenArg & ListingIdArg & CreateQualityParameterPayload
>("product/addQualityParameter", ({ token, listingId, ...payload }) =>
  ProductService.addQualityParameter(token, listingId, payload),
);

export const updateQualityParameterThunk = createAsyncThunk<
  QualityParameterResponse,
  TokenArg & ListingIdArg & { parameterId: string } & UpdateQualityParameterPayload
>("product/updateQualityParameter", ({ token, listingId, parameterId, ...payload }) =>
  ProductService.updateQualityParameter(token, listingId, parameterId, payload),
);

export const deleteQualityParameterThunk = createAsyncThunk<
  void,
  TokenArg & ListingIdArg & { parameterId: string }
>("product/deleteQualityParameter", ({ token, listingId, parameterId }) =>
  ProductService.deleteQualityParameter(token, listingId, parameterId),
);

export const listQualityParametersThunk = createAsyncThunk<
  QualityParameterListResponse,
  TokenArg & ListingIdArg
>("product/listQualityParameters", ({ token, listingId }) =>
  ProductService.listQualityParameters(token, listingId),
);

export const getQualityParameterThunk = createAsyncThunk<
  QualityParameter,
  TokenArg & ListingIdArg & { parameterId: string }
>("product/getQualityParameter", ({ token, listingId, parameterId }) =>
  ProductService.getQualityParameter(token, listingId, parameterId),
);
