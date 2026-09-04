export interface DirectPurchasePayload {
  listing_id: string;
  quantity: string;
  delivery_address: string;
}

export interface DirectPurchaseTrade {
  id: string;
  reference: string;
  listing_id: string;
  listing_name: string;
  buyer_name: string;
  buyer_email: string;
  seller_name: string;
  seller_email: string;
  quantity: string;
  unit: string;
  price_per_unit: string;
  currency: string;
  total_value: string;
  delivery_terms: string;
  named_place: string;
  delivery_address: string;
  status: string;
  cancelled_reason: string;
  trade_id: string;
  source_enquiry_reference: string | null;
  created_at: string;
  updated_at: string;
}

export interface DirectPurchaseResponse {
  success: boolean;
  message: string;
  data: DirectPurchaseTrade;
}
