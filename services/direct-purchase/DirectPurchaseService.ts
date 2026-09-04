import type {
  DirectPurchasePayload,
  DirectPurchaseResponse,
} from "@/types/direct-purchase";

type ErrorBody = {
  message?: string;
  detail?: string;
  error?: string;
  errors?: Record<string, unknown>;
  [key: string]: unknown;
};

const DIRECT_PURCHASE_API = process.env.NEXT_PUBLIC_DIRECT_PURCHASE_URL || "http://localhost:82/api/direct-purchases";

function getUrl(endpoint: string): string {
  return `${DIRECT_PURCHASE_API.replace(/\/$/, "")}${endpoint}`;
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

function formatErrorBody(body: ErrorBody | null, fallback: string): string {
  if (!body) return fallback;
  if (body.message) return body.message;
  if (body.detail) return body.detail;
  if (body.error) return body.error;

  const fieldErrors = body.errors ?? body;
  const formattedErrors = Object.entries(fieldErrors)
    .filter(([key]) => !["message", "detail", "error"].includes(key))
    .map(([key, value]) => `${key}: ${formatErrorValue(value)}`)
    .join(" ");

  return formattedErrors || fallback;
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
  const response = await fetch(getUrl(endpoint), {
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

export const DirectPurchaseService = {
  createDirectPurchase(
    token: string,
    payload: DirectPurchasePayload,
  ): Promise<DirectPurchaseResponse> {
    return requestJson<DirectPurchaseResponse, DirectPurchasePayload>({
      endpoint: "/",
      method: "POST",
      payload,
      token,
    });
  },
};
