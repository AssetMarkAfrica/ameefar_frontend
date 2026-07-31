export interface Subscriber {
  id: string;
  email: string;
  name: string;
  is_active: boolean;
  subscribed_at: string;
  unsubscribed_at: string | null;
}

export interface SubscribePayload {
  email: string;
  name?: string;
}

export interface UnsubscribePayload {
  token: string;
}

export interface Campaign {
  id: string;
  subject: string;
  body: string;
  created_by: string;
  created_by_name: string;
  status: "draft" | "sending" | "sent";
  recipient_count: number;
  sent_count: number;
  open_count: number;
  click_count: number;
  created_at: string;
  sent_at: string | null;
}

export interface CampaignPayload {
  subject: string;
  body: string;
}

export interface CampaignStats {
  recipient_count: number;
  sent_count: number;
  open_count: number;
  click_count: number;
  open_rate: number;
  click_rate: number;
}
