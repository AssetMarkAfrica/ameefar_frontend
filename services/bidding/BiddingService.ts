import type {
  BiddingAck,
  BiddingAdminOverviewResponse,
  CancelTradePayload,
  CompleteInspectionPayload,
  CompleteTradePayload,
  CounterEnquiryPayload,
  CreateEnquiryPayload,
  DeclineEnquiryPayload,
  EnquiryDetailResponse,
  EnquiryListResponse,
  EnquiryMessageListResponse,
  EnquiryMessageResponse,
  ListEnquiriesParams,
  ListTradesParams,
  MarkInProgressPayload,
  RaiseDisputePayload,
  RejectInspectionPayload,
  RequestInspectionParams,
  RequestInspectionResponse,
  ResolveDisputePayload,
  ScheduleInspectionPayload,
  SendEnquiryMessagePayload,
  SendTradeMessagePayload,
  TradeDetailResponse,
  TradeDocumentListResponse,
  TradeDocumentResponse,
  TradeListResponse,
  TradeMessageListResponse,
  TradeMessageResponse,
  UpdateAdminNotesPayload,
  UploadTradeDocumentPayload,
} from "@/types/bidding";

// ─── Base URL Resolution ──────────────────────────────────────────────────────

const BIDDING_API =
  process.env.NEXT_PUBLIC_BIDDING_URL ??
  (process.env.NEXT_PUBLIC_API_URL
    ? `${process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "")}/bidding`
    : "http://localhost:82/api/bidding");

// ─── Internal Helpers ─────────────────────────────────────────────────────────

type ErrorBody = {
  message?: string;
  detail?: string;
  error?: string | { message?: string };
  errors?: Record<string, unknown>;
  [key: string]: unknown;
};

function getBiddingUrl(endpoint: string): string {
  return `${BIDDING_API.replace(/\/$/, "")}${endpoint}`;
}

function getAuthHeaders(token: string): HeadersInit {
  return {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };
}

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
  const response = await fetch(getBiddingUrl(endpoint), {
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
  method = "POST",
}: {
  endpoint: string;
  formData: FormData;
  token: string;
  method?: "POST" | "PATCH";
}): Promise<TResponse> {
  const response = await fetch(getBiddingUrl(endpoint), {
    method,
    headers: getAuthHeaders(token),
    body: formData,
  });

  const body = (await response.json().catch(() => null)) as ErrorBody | null;

  if (!response.ok) {
    throw new Error(formatErrorBody(body, response.statusText));
  }

  return body as TResponse;
}

function buildQueryString(
  params?: Record<string, string | boolean | undefined>,
): string {
  if (!params) return "";
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.set(key, String(value));
    }
  });
  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const BiddingService = {
  // ── Enquiries ──────────────────────────────────────────────────────────────

  listEnquiries(
    token: string,
    params?: ListEnquiriesParams,
  ): Promise<EnquiryListResponse> {
    return requestJson<EnquiryListResponse>({
      endpoint: `/enquiries/${buildQueryString(params as Record<string, string | boolean | undefined>)}`,
      method: "GET",
      token,
    });
  },

  createEnquiry(
    token: string,
    payload: CreateEnquiryPayload,
  ): Promise<EnquiryDetailResponse> {
    return requestJson<EnquiryDetailResponse, CreateEnquiryPayload>({
      endpoint: "/enquiries/",
      method: "POST",
      payload,
      token,
    });
  },

  getEnquiry(
    token: string,
    enquiryId: string,
  ): Promise<EnquiryDetailResponse> {
    return requestJson<EnquiryDetailResponse>({
      endpoint: `/enquiries/${enquiryId}/`,
      method: "GET",
      token,
    });
  },

  /**
   * Listing owner only. Accepts the enquiry and creates a trade.
   * Returns a full trade detail object.
   */
  acceptEnquiry(
    token: string,
    enquiryId: string,
  ): Promise<TradeDetailResponse> {
    return requestJson<TradeDetailResponse, Record<string, never>>({
      endpoint: `/enquiries/${enquiryId}/accept/`,
      method: "POST",
      payload: {},
      token,
    });
  },

  declineEnquiry(
    token: string,
    enquiryId: string,
    payload: DeclineEnquiryPayload,
  ): Promise<BiddingAck> {
    return requestJson<BiddingAck, DeclineEnquiryPayload>({
      endpoint: `/enquiries/${enquiryId}/decline/`,
      method: "POST",
      payload,
      token,
    });
  },

  /**
   * At least one of `counter_price_per_unit` or `counter_message` is required.
   * Returns a full enquiry detail object.
   */
  counterEnquiry(
    token: string,
    enquiryId: string,
    payload: CounterEnquiryPayload,
  ): Promise<EnquiryDetailResponse> {
    return requestJson<EnquiryDetailResponse, CounterEnquiryPayload>({
      endpoint: `/enquiries/${enquiryId}/counter/`,
      method: "POST",
      payload,
      token,
    });
  },

  /** Initiator only. */
  withdrawEnquiry(
    token: string,
    enquiryId: string,
  ): Promise<BiddingAck> {
    return requestJson<BiddingAck, Record<string, never>>({
      endpoint: `/enquiries/${enquiryId}/withdraw/`,
      method: "POST",
      payload: {},
      token,
    });
  },

  /**
   * Initiator only. Accepts the counter offer and creates a trade.
   * Returns a full trade detail object.
   */
  acceptCounter(
    token: string,
    enquiryId: string,
  ): Promise<TradeDetailResponse> {
    return requestJson<TradeDetailResponse, Record<string, never>>({
      endpoint: `/enquiries/${enquiryId}/accept-counter/`,
      method: "POST",
      payload: {},
      token,
    });
  },

  // ── Enquiry Messages ───────────────────────────────────────────────────────

  /** Also marks unread messages as read for the requesting participant. */
  listEnquiryMessages(
    token: string,
    enquiryId: string,
  ): Promise<EnquiryMessageListResponse> {
    return requestJson<EnquiryMessageListResponse>({
      endpoint: `/enquiries/${enquiryId}/messages/`,
      method: "GET",
      token,
    });
  },

  sendEnquiryMessage(
    token: string,
    enquiryId: string,
    payload: SendEnquiryMessagePayload,
  ): Promise<EnquiryMessageResponse> {
    const formData = new FormData();
    formData.append("body", payload.body);
    if (payload.attachment) formData.append("attachment", payload.attachment);

    return requestFormData<EnquiryMessageResponse>({
      endpoint: `/enquiries/${enquiryId}/messages/`,
      formData,
      token,
    });
  },

  // ── Trades ─────────────────────────────────────────────────────────────────

  listTrades(
    token: string,
    params?: ListTradesParams,
  ): Promise<TradeListResponse> {
    return requestJson<TradeListResponse>({
      endpoint: `/trades/${buildQueryString(params as Record<string, string | boolean | undefined>)}`,
      method: "GET",
      token,
    });
  },

  getTrade(token: string, tradeId: string): Promise<TradeDetailResponse> {
    return requestJson<TradeDetailResponse>({
      endpoint: `/trades/${tradeId}/`,
      method: "GET",
      token,
    });
  },

  /** Returns a full trade detail object. */
  agreeTerms(token: string, tradeId: string): Promise<TradeDetailResponse> {
    return requestJson<TradeDetailResponse, Record<string, never>>({
      endpoint: `/trades/${tradeId}/agree/`,
      method: "POST",
      payload: {},
      token,
    });
  },


  markInProgress(
    token: string,
    tradeId: string,
    payload: MarkInProgressPayload,
  ): Promise<BiddingAck> {
    return requestJson<BiddingAck, MarkInProgressPayload>({
      endpoint: `/trades/${tradeId}/mark-in-progress/`,
      method: "POST",
      payload,
      token,
    });
  },

  completeTrade(
    token: string,
    tradeId: string,
    payload: CompleteTradePayload,
  ): Promise<BiddingAck> {
    return requestJson<BiddingAck, CompleteTradePayload>({
      endpoint: `/trades/${tradeId}/complete/`,
      method: "POST",
      payload,
      token,
    });
  },

  cancelTrade(
    token: string,
    tradeId: string,
    payload: CancelTradePayload,
  ): Promise<BiddingAck> {
    return requestJson<BiddingAck, CancelTradePayload>({
      endpoint: `/trades/${tradeId}/cancel/`,
      method: "POST",
      payload,
      token,
    });
  },

  raiseDispute(
    token: string,
    tradeId: string,
    payload: RaiseDisputePayload,
  ): Promise<BiddingAck> {
    return requestJson<BiddingAck, RaiseDisputePayload>({
      endpoint: `/trades/${tradeId}/dispute/`,
      method: "POST",
      payload,
      token,
    });
  },

  /** Admin only. */
  resolveDispute(
    token: string,
    tradeId: string,
    payload: ResolveDisputePayload,
  ): Promise<BiddingAck> {
    return requestJson<BiddingAck, ResolveDisputePayload>({
      endpoint: `/trades/${tradeId}/resolve-dispute/`,
      method: "POST",
      payload,
      token,
    });
  },

  /**
   * Buyer only. Initiates the inspection fee payment.
   * Pass `{ required: false }` to skip inspection through this endpoint.
   */
  requestInspection(
    token: string,
    tradeId: string,
    params?: RequestInspectionParams,
  ): Promise<RequestInspectionResponse> {
    const query = params?.required === false ? "?required=false" : "";
    return requestJson<RequestInspectionResponse, Record<string, never>>({
      endpoint: `/trades/${tradeId}/request-inspection/${query}`,
      method: "POST",
      payload: {},
      token,
    });
  },

  /** Returns a full trade detail object. */
  skipInspection(
    token: string,
    tradeId: string,
  ): Promise<TradeDetailResponse> {
    return requestJson<TradeDetailResponse, Record<string, never>>({
      endpoint: `/trades/${tradeId}/skip-inspection/`,
      method: "POST",
      payload: {},
      token,
    });
  },

  /** Admin only. Returns a full trade detail object. */
  scheduleInspection(
    token: string,
    tradeId: string,
    payload: ScheduleInspectionPayload,
  ): Promise<TradeDetailResponse> {
    return requestJson<TradeDetailResponse, ScheduleInspectionPayload>({
      endpoint: `/trades/${tradeId}/schedule-inspection/`,
      method: "POST",
      payload,
      token,
    });
  },

  /** Admin only. Returns a full trade detail object. */
  startInspection(
    token: string,
    tradeId: string,
  ): Promise<TradeDetailResponse> {
    return requestJson<TradeDetailResponse, Record<string, never>>({
      endpoint: `/trades/${tradeId}/start-inspection/`,
      method: "POST",
      payload: {},
      token,
    });
  },

  /** Admin only. Returns a full trade detail object. */
  completeInspection(
    token: string,
    tradeId: string,
    payload: CompleteInspectionPayload,
  ): Promise<TradeDetailResponse> {
    const formData = new FormData();
    formData.append("verdict", payload.verdict);
    formData.append("summary", payload.summary);
    if (payload.findings) formData.append("findings", payload.findings);
    if (payload.recommendation)
      formData.append("recommendation", payload.recommendation);
    if (payload.report_document)
      formData.append("report_document", payload.report_document);

    return requestFormData<TradeDetailResponse>({
      endpoint: `/trades/${tradeId}/complete-inspection/`,
      formData,
      token,
    });
  },

  /** Buyer only. Can only approve after a passed inspection. */
  approveInspection(token: string, tradeId: string): Promise<BiddingAck> {
    return requestJson<BiddingAck, Record<string, never>>({
      endpoint: `/trades/${tradeId}/approve-inspection/`,
      method: "POST",
      payload: {},
      token,
    });
  },

  /** Buyer only. Returns a full trade detail object. */
  rejectInspection(
    token: string,
    tradeId: string,
    payload: RejectInspectionPayload,
  ): Promise<TradeDetailResponse> {
    return requestJson<TradeDetailResponse, RejectInspectionPayload>({
      endpoint: `/trades/${tradeId}/reject-inspection/`,
      method: "POST",
      payload,
      token,
    });
  },

  /** Admin only. */
  updateAdminNotes(
    token: string,
    tradeId: string,
    payload: UpdateAdminNotesPayload,
  ): Promise<BiddingAck> {
    return requestJson<BiddingAck, UpdateAdminNotesPayload>({
      endpoint: `/trades/${tradeId}/admin-notes/`,
      method: "PATCH",
      payload,
      token,
    });
  },

  // ── Trade Messages ─────────────────────────────────────────────────────────

  /**
   * Also marks unread messages as read for the requesting participant.
   * Non-admin users do not receive internal admin messages.
   */
  listTradeMessages(
    token: string,
    tradeId: string,
  ): Promise<TradeMessageListResponse> {
    return requestJson<TradeMessageListResponse>({
      endpoint: `/trades/${tradeId}/messages/`,
      method: "GET",
      token,
    });
  },

  sendTradeMessage(
    token: string,
    tradeId: string,
    payload: SendTradeMessagePayload,
  ): Promise<TradeMessageResponse> {
    const formData = new FormData();
    formData.append("body", payload.body);
    if (payload.attachment) formData.append("attachment", payload.attachment);
    if (payload.is_internal !== undefined)
      formData.append("is_internal", String(payload.is_internal));

    return requestFormData<TradeMessageResponse>({
      endpoint: `/trades/${tradeId}/messages/`,
      formData,
      token,
    });
  },

  // ── Trade Documents ────────────────────────────────────────────────────────

  listTradeDocuments(
    token: string,
    tradeId: string,
  ): Promise<TradeDocumentListResponse> {
    return requestJson<TradeDocumentListResponse>({
      endpoint: `/trades/${tradeId}/documents/`,
      method: "GET",
      token,
    });
  },

  /** Cannot upload to a completed or cancelled trade. Max file size 25 MB. */
  uploadTradeDocument(
    token: string,
    tradeId: string,
    payload: UploadTradeDocumentPayload,
  ): Promise<TradeDocumentResponse> {
    const formData = new FormData();
    formData.append("file", payload.file);
    if (payload.doc_type) formData.append("doc_type", payload.doc_type);
    if (payload.title) formData.append("title", payload.title);
    if (payload.notes) formData.append("notes", payload.notes);

    return requestFormData<TradeDocumentResponse>({
      endpoint: `/trades/${tradeId}/documents/`,
      formData,
      token,
    });
  },

  // ── Admin ──────────────────────────────────────────────────────────────────

  /** Admin only. */
  getAdminOverview(token: string): Promise<BiddingAdminOverviewResponse> {
    return requestJson<BiddingAdminOverviewResponse>({
      endpoint: "/admin/overview/",
      method: "GET",
      token,
    });
  },
};
