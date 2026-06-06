import type { ApiResponse } from "./api";

export type PaymentStatus = "initiated" | "success" | "failed" | "abandoned";
export type PaymentType = "inspection_fee" | "trade_payment";

export interface InspectionFeePayment {
  id: string;
  trade: string;
  payment_type: "inspection_fee";
  status: PaymentStatus;
  currency: string;
  amount_major: string;
  amount_minor: number;
  fee_percent: string;
  paystack_reference: string;
  paystack_access_code: string;
  paystack_authorization_url: string;
  paid_at: string | null;
  failure_reason: string;
  created_at: string;
  updated_at: string;
}

export interface TradePayment {
  id: string;
  trade: string;
  payment_type: "trade_payment";
  status: PaymentStatus;
  currency: string;
  amount_major: string;
  amount_minor: number;
  fee_percent: string;
  paystack_reference: string;
  paystack_access_code: string;
  paystack_authorization_url: string;
  paid_at?: string | null;
  failure_reason?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TradePaymentSummary {
  platform_fee_percent: string;
  platform_fee_amount: string;
  trade_total_amount: string;
  trade_payment_amount: string;
  inspection_fee_amount: string;
  inspection_fee_paid: boolean;
  trade_payment_paid: boolean;
  latest_inspection_fee_status: string | null;
  latest_trade_payment_status: string | null;
}



export interface InitiateTradePaymentPayload {
  callback_url?: string;
}

export interface VerifyPaymentPayload {
  reference: string;
}

export interface Subaccount {
  subaccount_code: string;
  [key: string]: unknown;
}

export type InitiateTradePaymentResponse = ApiResponse<TradePayment>;
export type PaymentSummaryResponse = ApiResponse<TradePaymentSummary>;
export type VerifyPaymentResponse = ApiResponse<InspectionFeePayment | TradePayment>;
export type SubaccountResponse = ApiResponse<Subaccount>;
