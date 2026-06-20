import type {
  InitiateTradePaymentPayload,
  InitiateTradePaymentResponse,
  PaymentSummaryResponse,
  VerifyPaymentPayload,
  VerifyPaymentResponse,
  SubaccountResponse,
  PayoutListResponse,
  PayoutDetailResponse,
} from "@/types/payment";

const PAYMENT_API =
  process.env.NEXT_PUBLIC_PAYMENT_URL ??
  (process.env.NEXT_PUBLIC_API_URL
    ? `${process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "")}/payments`
    : "http://localhost:82/api/payments");

function getPaymentUrl(endpoint: string): string {
  return `${PAYMENT_API.replace(/\/$/, "")}${endpoint}`;
}

function getAuthHeaders(token: string): HeadersInit {
  return {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };
}

type ErrorBody = {
  message?: string;
  detail?: string;
  error?: string | { message?: string };
  errors?: Record<string, unknown>;
  [key: string]: unknown;
};

function formatErrorValue(value: unknown): string {
  if (Array.isArray(value)) return value.map(formatErrorValue).join(", ");
  if (value && typeof value === "object")
    return Object.entries(value as Record<string, unknown>)
      .map(([k, v]) => `${k}: ${formatErrorValue(v)}`)
      .join(", ");
  return String(value);
}

function formatErrorBody(body: ErrorBody | null, fallback: string): string {
  if (!body) return fallback;

  if (typeof body.error === "object" && body.error?.message) {
    return body.error.message;
  }

  if (body.message) return body.message;
  if (body.detail) return body.detail;
  if (typeof body.error === "string") return body.error;

  const fieldErrors = body.errors ?? body;
  const formatted = Object.entries(fieldErrors)
    .filter(([key]) => !["success", "message", "detail", "error"].includes(key))
    .map(([key, value]) => `${key}: ${formatErrorValue(value)}`)
    .join(" ");

  return formatted || fallback;
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
  const response = await fetch(getPaymentUrl(endpoint), {
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

export const PaymentService = {
  verifyReference(
    token: string,
    payload: VerifyPaymentPayload,
  ): Promise<VerifyPaymentResponse> {
    return requestJson<VerifyPaymentResponse, undefined>({
      endpoint: `/verify-reference/?reference=${payload.reference}`,
      method: "POST",
      token,
    });
  },

  getSubaccountMe(token: string): Promise<SubaccountResponse> {
    return requestJson<SubaccountResponse>({
      endpoint: `/subaccount/me/`,
      method: "GET",
      token,
    });
  },

  initiateTradePayment(
    token: string,
    tradeId: string,
    payload: InitiateTradePaymentPayload,
  ): Promise<InitiateTradePaymentResponse> {
    return requestJson<InitiateTradePaymentResponse, InitiateTradePaymentPayload>({
      endpoint: `/trades/${tradeId}/initiate-trade-payment/`,
      method: "POST",
      payload,
      token,
    });
  },

  getTradePaymentSummary(
    token: string,
    tradeId: string,
  ): Promise<PaymentSummaryResponse> {
    return requestJson<PaymentSummaryResponse>({
      endpoint: `/trades/${tradeId}/summary/`,
      method: "GET",
      token,
    });
  },

  listPendingPayouts(token: string): Promise<PayoutListResponse> {
    return requestJson<PayoutListResponse>({
      endpoint: `/admin/payouts/?status=pending`,
      method: "GET",
      token,
    });
  },

  approvePayout(token: string, payoutId: string): Promise<PayoutDetailResponse> {
    return requestJson<PayoutDetailResponse>({
      endpoint: `/admin/payouts/${payoutId}/approve/`,
      method: "POST",
      token,
    });
  },
};
