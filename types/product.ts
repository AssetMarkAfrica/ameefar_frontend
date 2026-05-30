export type ProductListingType = "sell" | "buy";

export type ProductListingStatus = "draft" | "active";

export type ProductAvailabilityStatus = "available_now" | "ongoing";

export interface ProductImage {
  id: string;
  image_url: string;
  caption: string;
  is_primary: boolean;
  sort_order: number;
  created_at?: string;
}

export interface ProductSpecification {
  id: string;
  title: string;
  document_url: string;
  description: string;
  uploaded_by: string;
  created_at: string;
}

export interface ProductListing {
  id: string;
  owner: string;
  listing_type: ProductListingType;
  status: ProductListingStatus;
  material_type: string;
  material_name: string;
  number_of_loads: number;
  average_weight_per_load_mt: string;
  quantity_available_mt: string;
  remaining_loads: number;
  material_location_country: string;
  availability_status: ProductAvailabilityStatus;
  description: string;
  seller_notes: string;
  mfi_value: string | null;
  seller_verified_snapshot: boolean;
  images: ProductImage[];
  specifications: ProductSpecification[];
  listed_at: string;
  updated_at: string;
}

export interface ProductListingSummary {
  id: string;
  listing_type: ProductListingType;
  status: ProductListingStatus;
  material_type: string;
  material_name: string;
  number_of_loads: number;
  average_weight_per_load_mt: string;
  quantity_available_mt: string;
  remaining_loads: number;
  material_location_country: string;
  availability_status: ProductAvailabilityStatus;
  primary_image_url: string | null;
  images_count: number;
  seller_verified_snapshot: boolean;
  listed_at: string;
}

export interface ProductPagination {
  count: number;
  total_pages: number;
  current_page: number;
  next: string | null;
  previous: string | null;
}

export interface CreateProductListingPayload {
  listing_type: ProductListingType;
  status: "draft";
  material_type: string;
  material_name: string;
  average_weight_per_load_mt: string;
  quantity_available_mt: string;
  material_location_country: string;
  availability_status: ProductAvailabilityStatus;
  description: string;
  seller_notes?: string;
  mfi_value?: string;
}

export type UpdateProductListingPayload = Partial<
  Omit<
    CreateProductListingPayload,
    "status" | "listing_type"
  > & {
    listing_type: ProductListingType;
    status: ProductListingStatus;
  }
>;

export interface UploadProductImagePayload {
  image: File;
  caption?: string;
  is_primary?: boolean;
  sort_order?: number;
}

export interface UploadProductSpecificationPayload {
  title: string;
  document: File;
  description?: string;
}

export interface ListProductListingsParams {
  mine?: boolean;
  page?: number;
  page_size?: number;
  listing_type?: ProductListingType;
  status?: ProductListingStatus;
  material_type?: ProductMaterialType | string;
  availability_status?: ProductAvailabilityStatus;
  country?: string;
  q?: string;
}

export type ProductMaterialType =
  | "pvc"
  | "pp"
  | "pc"
  | "pet"
  | "hdpe"
  | "ldpe"
  | "eps"
  | "acrylic"
  | "abs"
  | "ps"
  | "tyres";

export interface ProductEnvelope<TData> {
  success: true;
  message: string;
  data: TData;
}

export type ProductListingResponse = ProductEnvelope<ProductListing>;

export type ProductImageResponse = ProductEnvelope<ProductImage>;

export type ProductSpecificationResponse =
  ProductEnvelope<ProductSpecification>;

export interface ProductListResponse {
  success?: true;
  message?: string;
  pagination: ProductPagination;
  results: ProductListingSummary[];
}

export interface UploadProductImageAndActivateResponse {
  image: ProductImageResponse;
  listing: ProductListingResponse;
}
