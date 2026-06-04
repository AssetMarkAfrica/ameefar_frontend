// ─── Common Value Types ───────────────────────────────────────────────────────

export type ListingType = "sell" | "buy";

export type EnquiryStatus =
  | "pending"
  | "countered"
  | "accepted"
  | "declined"
  | "withdrawn"
  | "expired";

export type EnquiryUnit = "mt" | "kg" | "lt" | "load" | "unit";

export type TradeStatus =
  | "negotiating"
  | "agreed"
  | "contract_sent"
  | "contract_signed"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "disputed";

export type InspectionStatus =
  | "not_requested"
  | "requested"
  | "scheduled"
  | "in_progress"
  | "passed"
  | "failed";

export type CancellationReason =
  | "buyer_request"
  | "seller_request"
  | "admin_decision"
  | "payment_failed"
  | "logistics_failed"
  | "other";

export type TradeDocumentType =
  | "contract"
  | "quality_cert"
  | "delivery_note"
  | "invoice"
  | "weighbridge"
  | "photo_evidence"
  | "customs_doc"
  | "insurance"
  | "other";

export type InspectionVerdict = "passed" | "failed";

export type InspectionRecommendation = "proceed" | "renegotiate" | "cancel";

// ─── Enquiry ──────────────────────────────────────────────────────────────────

/**
 * Lightweight enquiry shape returned in list responses.
 */
export interface EnquirySummary {
  id: string;
  reference: string;
  listing_id: string;
  listing_name: string;
  listing_type: ListingType;
  initiator_name: string;
  initiator_email: string;
  initiator_role: string;
  listing_owner_name: string;
  listing_owner_email: string;
  listing_owner_role: string;
  buyer_name: string;
  buyer_email: string;
  seller_name: string;
  seller_email: string;
  status: EnquiryStatus;
  quantity: string;
  unit: EnquiryUnit;
  proposed_price_per_unit: string | null;
  currency: string;
  total_value: string;
  created_at: string;
  updated_at: string;
}

/**
 * Full enquiry shape returned on detail, create, and action responses.
 */
export interface EnquiryDetail extends EnquirySummary {
  message: string;
  delivery_terms: string;
  delivery_address: string;
  target_delivery_date: string | null;
  counter_price_per_unit: string | null;
  counter_quantity: string | null;
  counter_message: string;
  countered_at: string | null;
  decline_reason: string;
  responded_at: string | null;
  expires_at: string | null;
  has_trade: boolean;
  trade_id: string | null;
}

export interface EnquiryMessage {
  id: string;
  sender_name: string;
  sender_role: string;
  body: string;
  attachment_url: string | null;
  attachment_name: string;
  is_read_by_buyer: boolean;
  is_read_by_seller: boolean;
  created_at: string;
}

// ─── Trade ────────────────────────────────────────────────────────────────────

/**
 * Lightweight trade shape returned in list responses.
 */
export interface TradeSummary {
  id: string;
  reference: string;
  listing_name: string;
  listing_type: ListingType;
  buyer_name: string;
  seller_name: string;
  status: TradeStatus;
  quantity: string;
  unit: EnquiryUnit;
  price_per_unit: string;
  currency: string;
  total_value: string;
  target_delivery_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface TradeStatusLog {
  status: TradeStatus;
  changed_at: string;
  changed_by?: string;
  note?: string;
}

export interface TradeDocument {
  id: string;
  doc_type: TradeDocumentType;
  title: string;
  file_url: string;
  file_name: string;
  uploaded_by_name: string;
  notes: string;
  created_at: string;
}

/**
 * Full trade shape returned on detail, create, and most action responses.
 */
export interface TradeDetail extends TradeSummary {
  listing_id: string;
  buyer_email: string;
  seller_email: string;
  delivery_terms: string;
  delivery_address: string;
  terms_locked_at: string | null;
  contract_url: string | null;
  contract_sent_at: string | null;
  contract_signed_at: string | null;
  inspection_required: boolean;
  inspection_status: InspectionStatus;
  inspection_requested_at: string | null;
  inspection_scheduled_for: string | null;
  inspection_completed_at: string | null;
  inspection_assigned_to_name: string | null;
  inspection_report: string | null;
  tracking_reference: string;
  estimated_arrival: string | null;
  actual_arrival: string | null;
  completed_at: string | null;
  completion_notes: string;
  cancellation_reason: CancellationReason | "";
  cancellation_notes: string;
  cancelled_at: string | null;
  dispute_reason: string;
  disputed_at: string | null;
  dispute_resolved_at: string | null;
  dispute_resolution: string;
  payment_summary: Record<string, unknown>;
  admin_notes: string;
  status_logs: TradeStatusLog[];
  documents: TradeDocument[];
}

export interface TradeMessage {
  id: string;
  sender_name: string;
  sender_role: string;
  body: string;
  attachment_url: string | null;
  attachment_name: string;
  /** Admin-only internal note; non-admin users never receive this. */
  is_internal: boolean;
  is_read_by_buyer: boolean;
  is_read_by_seller: boolean;
  is_read_by_admin: boolean;
  created_at: string;
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export interface BiddingAdminOverview {
  enquiries: Record<EnquiryStatus, number>;
  trades: Record<TradeStatus, number>;
  pending_disputes: number;
}

// ─── Request Payloads ─────────────────────────────────────────────────────────

export interface CreateEnquiryPayload {
  /** Required. */
  listing_id: string;
  /** Required. */
  quantity: string;
  /** Required. */
  unit: EnquiryUnit;
  proposed_price_per_unit?: string;
  currency?: string;
  message?: string;
  delivery_terms?: string;
  delivery_address?: string;
  target_delivery_date?: string;
}

export interface ListEnquiriesParams {
  role?: "buyer" | "seller";
  participant?: "initiator" | "listing_owner" | "owner";
  status?: EnquiryStatus;
  listing_id?: string;
}

export interface DeclineEnquiryPayload {
  reason: string;
}

/** At least one of `counter_price_per_unit` or `counter_message` is required. */
export interface CounterEnquiryPayload {
  counter_price_per_unit?: string;
  counter_quantity?: string;
  counter_message?: string;
}

export interface SendEnquiryMessagePayload {
  /** Minimum length 1. */
  body: string;
  attachment?: File;
}

export interface ListTradesParams {
  role?: "buyer" | "seller";
  status?: TradeStatus;
}

export interface MarkInProgressPayload {
  tracking_reference?: string;
  estimated_arrival?: string;
}

export interface CompleteTradePayload {
  notes?: string;
}

export interface CancelTradePayload {
  /** Minimum 5 characters. */
  reason: string;
  cancellation_reason?: CancellationReason;
}

export interface RaiseDisputePayload {
  /** Minimum 10 characters. */
  reason: string;
}

export interface ResolveDisputePayload {
  /** Minimum 10 characters. */
  resolution: string;
}

export interface RequestInspectionParams {
  /** Defaults to `true`. Pass `false` to skip inspection via this endpoint. */
  required?: boolean;
}

export interface ScheduleInspectionPayload {
  scheduled_for: string;
  inspector_id?: string;
}

export interface CompleteInspectionPayload {
  verdict: InspectionVerdict;
  /** Minimum 10 characters. */
  summary: string;
  findings?: string;
  recommendation?: InspectionRecommendation;
  report_document?: File;
}

export interface RejectInspectionPayload {
  reason: string;
}

export interface UpdateAdminNotesPayload {
  admin_notes: string;
}

export interface SendTradeMessagePayload {
  /** Minimum length 1. */
  body: string;
  attachment?: File;
  /** Admin-only internal note. Defaults to `false`. */
  is_internal?: boolean;
}

export interface UploadTradeDocumentPayload {
  /** Required. Maximum 25 MB. */
  file: File;
  /** Defaults to `other`. */
  doc_type?: TradeDocumentType;
  title?: string;
  notes?: string;
}

// ─── API Response Envelopes ───────────────────────────────────────────────────

export interface BiddingEnvelope<TData> {
  success: true;
  message: string;
  data: TData;
}

/** Acknowledgement responses that carry no `data` body. */
export interface BiddingAck {
  success: true;
  message: string;
}

export type EnquiryListResponse = BiddingEnvelope<EnquirySummary[]>;
export type EnquiryDetailResponse = BiddingEnvelope<EnquiryDetail>;
export type EnquiryMessageListResponse = BiddingEnvelope<EnquiryMessage[]>;
export type EnquiryMessageResponse = BiddingEnvelope<EnquiryMessage>;

export type TradeListResponse = BiddingEnvelope<TradeSummary[]>;
export type TradeDetailResponse = BiddingEnvelope<TradeDetail>;
export type TradeMessageListResponse = BiddingEnvelope<TradeMessage[]>;
export type TradeMessageResponse = BiddingEnvelope<TradeMessage>;
export type TradeDocumentListResponse = BiddingEnvelope<TradeDocument[]>;
export type TradeDocumentResponse = BiddingEnvelope<TradeDocument>;

export type BiddingAdminOverviewResponse = BiddingEnvelope<BiddingAdminOverview>;

export interface RequestInspectionResponseData {
  trade: TradeDetail;
  inspection_fee_payment: Record<string, unknown>;
}
export type RequestInspectionResponse =
  BiddingEnvelope<RequestInspectionResponseData>;

// ─── WebSocket ────────────────────────────────────────────────────────────────

export type WsEnquiryClientAction =
  | { action: "send_message"; body: string }
  | {
      action: "counter";
      counter_price_per_unit?: string;
      counter_quantity?: string;
      counter_message?: string;
    };

export type WsTradeClientAction =
  | { action: "send_message"; body: string };

export interface WsErrorMessage {
  type: "error";
  code: string;
  message: string;
}

export type WsServerEvent =
  | WsErrorMessage
  | { type: string; data?: unknown; [key: string]: unknown };
