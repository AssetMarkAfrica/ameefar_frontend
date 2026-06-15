import type {
  CreateProductListingPayload,
  ListProductListingsParams,
  ProductImageResponse,
  ProductListResponse,
  ProductListingResponse,
  ProductSpecificationResponse,
  UpdateProductListingPayload,
  UploadProductImageAndActivateResponse,
  UploadProductImagePayload,
  UploadProductSpecificationPayload,
} from "@/types/product";

type ErrorBody = {
  message?: string;
  detail?: string;
  error?: string;
  errors?: Record<string, unknown>;
  [key: string]: unknown;
};

const configuredProductUrl =
  process.env.NEXT_PUBLIC_PRODUCT_URL ??
  process.env.NEXT_PUBLIC_PRODUCTS_API ??
  process.env.NEXT_PUBLIC_PRODUCT_API ??
  process.env.NEXT_PUBLIC_PRODUCTS_URL;

const PRODUCT_API =
  configuredProductUrl ??
  (process.env.NEXT_PUBLIC_API_URL
    ? `${process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "")}/products`
    : "http://localhost:82/api/products");

function getProductUrl(endpoint: string): string {
  return `${PRODUCT_API.replace(/\/$/, "")}${endpoint}`;
}

function getAuthHeaders(token: string): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

async function requestJson<TResponse, TPayload = undefined>({
  endpoint,
  method,
  payload,
  token,
}: {
  endpoint: string;
  method: "GET" | "POST" | "PATCH";
  payload?: TPayload;
  token: string;
}): Promise<TResponse> {
  const response = await fetch(getProductUrl(endpoint), {
    method,
    headers: {
      ...getAuthHeaders(token),
      "Content-Type": "application/json",
    },
    body: payload === undefined ? undefined : JSON.stringify(payload),
  });

  const body = (await response.json().catch(() => null)) as ErrorBody | null;

  if (!response.ok) {
    throw new Error(formatErrorBody(body, response.statusText));
  }

  return body as TResponse;
}

async function requestFormData<TResponse>({
  endpoint,
  formData,
  token,
}: {
  endpoint: string;
  formData: FormData;
  token: string;
}): Promise<TResponse> {
  const response = await fetch(getProductUrl(endpoint), {
    method: "POST",
    headers: getAuthHeaders(token),
    body: formData,
  });

  const body = (await response.json().catch(() => null)) as ErrorBody | null;

  if (!response.ok) {
    throw new Error(formatErrorBody(body, response.statusText));
  }

  return body as TResponse;
}

function buildQueryString(params?: ListProductListingsParams): string {
  if (!params) {
    return "";
  }

  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();

  return query ? `?${query}` : "";
}

function buildImageFormData(payload: UploadProductImagePayload): FormData {
  const formData = new FormData();
  formData.append("image", payload.image);

  if (payload.caption !== undefined) {
    formData.append("caption", payload.caption);
  }

  if (payload.is_primary !== undefined) {
    formData.append("is_primary", String(payload.is_primary));
  }

  if (payload.sort_order !== undefined) {
    formData.append("sort_order", String(payload.sort_order));
  }

  return formData;
}

function buildSpecificationFormData(
  payload: UploadProductSpecificationPayload,
): FormData {
  const formData = new FormData();
  formData.append("title", payload.title);
  formData.append("document", payload.document);

  if (payload.description !== undefined) {
    formData.append("description", payload.description);
  }

  return formData;
}

function formatErrorBody(body: ErrorBody | null, fallback: string): string {
  if (!body) {
    return fallback;
  }

  if (body.message) {
    return body.message;
  }

  if (body.detail) {
    return body.detail;
  }

  if (body.error) {
    return body.error;
  }

  const fieldErrors = body.errors ?? body;
  const formattedErrors = Object.entries(fieldErrors)
    .filter(([key]) => !["message", "detail", "error"].includes(key))
    .map(([key, value]) => `${key}: ${formatErrorValue(value)}`)
    .join(" ");

  return formattedErrors || fallback;
}

function formatErrorValue(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map(formatErrorValue).join(", ");
  }

  if (value && typeof value === "object") {
    return Object.entries(value)
      .map(([key, nestedValue]) => `${key}: ${formatErrorValue(nestedValue)}`)
      .join(", ");
  }

  return String(value);
}

export const ProductService = {
  createListing(
    token: string,
    payload: CreateProductListingPayload,
  ): Promise<ProductListingResponse> {
    return requestJson<ProductListingResponse, CreateProductListingPayload>({
      endpoint: "/",
      method: "POST",
      payload,
      token,
    });
  },

  updateListing(
    token: string,
    listingId: string,
    payload: UpdateProductListingPayload,
  ): Promise<ProductListingResponse> {
    return requestJson<ProductListingResponse, UpdateProductListingPayload>({
      endpoint: `/${listingId}/`,
      method: "PATCH",
      payload,
      token,
    });
  },

  activateListing(
    token: string,
    listingId: string,
  ): Promise<ProductListingResponse> {
    return this.updateListing(token, listingId, { status: "active" });
  },

  getListing(
    token: string,
    listingId: string,
  ): Promise<ProductListingResponse> {
    return requestJson<ProductListingResponse>({
      endpoint: `/${listingId}/`,
      method: "GET",
      token,
    });
  },

  listListings(
    token: string,
    params?: ListProductListingsParams,
  ): Promise<ProductListResponse> {
    return requestJson<ProductListResponse>({
      endpoint: `/${buildQueryString(params)}`,
      method: "GET",
      token,
    });
  },

  listMyListings(
    token: string,
    params?: Omit<ListProductListingsParams, "mine">,
  ): Promise<ProductListResponse> {
    return this.listListings(token, { ...params, mine: true });
  },

  uploadImage(
    token: string,
    listingId: string,
    payload: UploadProductImagePayload,
  ): Promise<ProductImageResponse> {
    return requestFormData<ProductImageResponse>({
      endpoint: `/${listingId}/images/`,
      formData: buildImageFormData(payload),
      token,
    });
  },

  async uploadImageAndActivate(
    token: string,
    listingId: string,
    payload: UploadProductImagePayload,
  ): Promise<UploadProductImageAndActivateResponse> {
    const image = await this.uploadImage(token, listingId, payload);
    const listing = await this.activateListing(token, listingId);

    return { image, listing };
  },

  uploadSpecification(
    token: string,
    listingId: string,
    payload: UploadProductSpecificationPayload,
  ): Promise<ProductSpecificationResponse> {
    return requestFormData<ProductSpecificationResponse>({
      endpoint: `/${listingId}/specifications/`,
      formData: buildSpecificationFormData(payload),
      token,
    });
  },
};
