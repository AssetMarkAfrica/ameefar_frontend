// ─── Common Value Types ───────────────────────────────────────────────────────

import type { InspectionFeePayment, TradePaymentSummary } from "./payment";

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
  | "in_progress"
  | "completed"
  | "cancelled"
  | "disputed";

export type InspectionStatus =
  | "not_requested"
  | "awaiting_requirements"
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

export type TradeMessageStatus = "sent" | "delivered" | "read";

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

export type InspectionVerdict = "passed" | "failed" | "conditional";

export type InspectionRecommendation = "proceed" | "reject" | "renegotiate" | "cancel";

export type InspectionValueType = "decimal" | "percent" | "text" | "boolean";

export type InspectionOperator =
  | "lt"
  | "lte"
  | "gt"
  | "gte"
  | "eq"
  | "neq"
  | "between"
  | "present"
  | "absent"
  | "contains";

export interface TradeInspectionImage {
  id: string;
  image_url: string;
  image_name: string;
  caption: string;
  created_at: string;
}

export interface InspectionRequirement {
  id: string;
  name: string;
  description: string;
  value_type: InspectionValueType;
  operator: InspectionOperator;
  /** Numeric / percent / decimal target. Null when operator is "between", "absent", or "contains". */
  target_value: string | null;
  /** Lower bound when operator is "between". */
  min_value: string | null;
  /** Upper bound when operator is "between". */
  max_value: string | null;
  /** Text comparison target for operator "contains". */
  target_text: string;
  /** Boolean target (null unless value_type is "boolean"). */
  target_boolean: boolean | null;
  unit: string;
  is_mandatory: boolean;
  sort_order: number;
  /** Human-readable summary of the threshold, e.g. "<= 4.0000 %". */
  threshold_display: string;
  /** True once the inspection has been completed and results recorded. */
  is_locked: boolean;
  locked_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface InspectionRequirementResult {
  /** ID of the InspectionRequirement this result is for. */
  requirement_id: string;
  requirement_name: string;
  /** The actual observed value recorded during inspection. */
  actual_value: string;
  /** Whether the requirement was met. */
  passed: boolean;
  notes: string;
}

/** Payload shape for each requirement result sent to complete-inspection endpoint. */
export interface RequirementResultPayload {
  requirement_id: string;
  /** True if the requirement was met. */
  is_met: boolean;
  /** Measured value for decimal / integer / percent types. */
  measured_value?: string;
  /** Measured value for boolean types. */
  measured_boolean?: boolean;
  /** Measured value for text types. */
  measured_text?: string;
  notes?: string;
}

export interface InspectionReport {
  id: string;
  verdict: InspectionVerdict;
  summary: string;
  findings: string;
  recommendation: InspectionRecommendation | null;
  report_document_name: string;
  report_document_url: string | null;
  /** Requirement results recorded during this inspection. */
  requirement_results: InspectionRequirementResult[];
  /** Photos captured during the inspection. */
  images: TradeInspectionImage[];
  created_by_name: string;
  created_at: string;
  updated_at: string;
}

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
  listing_type?: ListingType;
  buyer_name: string;
  seller_name: string;
  status: TradeStatus;
  quantity: string;
  unit: EnquiryUnit;
  price_per_unit: string;
  currency: string;
  total_value: string;
  target_delivery_date: string | null;
  inspection_required?: boolean;
  inspection_status?: InspectionStatus;
  created_at: string;
  updated_at: string;
}

export interface TradeStatusLog {
  id: string;
  from_status: TradeStatus | "";
  to_status: TradeStatus;
  changed_by_name: string;
  notes: string;
  created_at: string;
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
  inspection_assigned_to_name?: string | null;
  inspection_report: InspectionReport | null;
  /** Requirements the buyer set before inspection was performed. */
  inspection_requirements: InspectionRequirement[];
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
  payment_summary?: TradePaymentSummary;
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

export interface DraftInspectionPayload {
  verdict?: InspectionVerdict | null;
  summary?: string;
  findings?: string;
  recommendation?: InspectionRecommendation;
  report_document?: File;
  requirement_results?: RequirementResultPayload[];
}


export interface CompleteInspectionPayload {
  verdict: InspectionVerdict;
  /** Minimum 10 characters. */
  summary: string;
  findings?: string;
  recommendation?: InspectionRecommendation;
  report_document?: File;
  /** Results for each buyer-set requirement. Sent as JSON string in multipart. */
  requirement_results?: RequirementResultPayload[];
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

export interface InspectionRequirementInput {
  name: string;
  description?: string;
  value_type: InspectionValueType;
  operator: InspectionOperator;
  /** Numeric / percent / decimal target. */
  target_value?: string;
  /** Lower bound when operator is "between". */
  min_value?: string;
  /** Upper bound when operator is "between". */
  max_value?: string;
  /** Text comparison target for operator "contains". */
  target_text?: string;
  /** Boolean target for value_type "boolean". */
  target_boolean?: boolean;
  unit?: string;
  is_mandatory?: boolean;
  sort_order?: number;
}

/** Payload for POST or PUT /trades/{trade_id}/inspection-requirements/ */
export interface SetInspectionRequirementsPayload {
  requirements: InspectionRequirementInput[];
}

/** PUT returns the full updated list of requirements as `data`. */
export type SetInspectionRequirementsResponse =
  BiddingEnvelope<InspectionRequirement[]>;

export interface CreateInspectionRequirementsResponseData {
  trade: TradeDetail;
  requirements: InspectionRequirement[];
  inspection_fee_payment?: any; // typed as any here to avoid circular dep, casted in slice/component
}

/** POST returns the trade, requirements, and payment info. */
export type CreateInspectionRequirementsResponse =
  BiddingEnvelope<CreateInspectionRequirementsResponseData>;

export interface UploadInspectionImagePayload {
  image: File;
  caption?: string;
}

export type InspectionImageResponse = BiddingEnvelope<TradeInspectionImage>;

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
export type InspectionRequirementsListResponse =
  BiddingEnvelope<InspectionRequirement[]>;

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
  | { type: string; data?: unknown;[key: string]: unknown };
