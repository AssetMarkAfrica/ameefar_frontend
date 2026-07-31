import { apiClient } from "../utils/api";
import type {
  PaginatedResponse,
  DataResponse,
  MessageResponse,
} from "@/types/api";
import type {
  SubscribePayload,
  Subscriber,
  Campaign,
  CampaignPayload,
  CampaignStats,
} from "@/types/newsletter";

const BASE =
  process.env.NEXT_PUBLIC_NEWSLETTER_URL ??
  (process.env.NEXT_PUBLIC_API_URL
    ? `${process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "")}/newsletter`
    : "http://localhost:82/api/newsletter");

export const NewsletterService = {
  subscribe(payload: SubscribePayload): Promise<MessageResponse> {
    return apiClient
      .post<MessageResponse>(`${BASE}/subscribe/`, payload)
      .then((res) => res.data);
  },

  unsubscribe(payload: { token: string }): Promise<MessageResponse> {
    return apiClient
      .post<MessageResponse>(`${BASE}/unsubscribe/`, payload)
      .then((res) => res.data);
  },

  fetchSubscribers(params?: {
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResponse<Subscriber>> {
    return apiClient
      .get<PaginatedResponse<Subscriber>>(`${BASE}/admin/subscribers/`, {
        params,
      })
      .then((res) => res.data);
  },

  fetchCampaigns(params?: {
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResponse<Campaign>> {
    return apiClient
      .get<PaginatedResponse<Campaign>>(`${BASE}/admin/campaigns/`, { params })
      .then((res) => res.data);
  },

  fetchCampaign(campaignId: string): Promise<DataResponse<Campaign>> {
    return apiClient
      .get<DataResponse<Campaign>>(`${BASE}/admin/campaigns/${campaignId}/`)
      .then((res) => res.data);
  },

  createCampaign(
    payload: CampaignPayload,
  ): Promise<DataResponse<Campaign>> {
    return apiClient
      .post<DataResponse<Campaign>>(`${BASE}/admin/campaigns/`, payload)
      .then((res) => res.data);
  },

  updateCampaign(
    campaignId: string,
    payload: CampaignPayload,
  ): Promise<DataResponse<Campaign>> {
    return apiClient
      .put<DataResponse<Campaign>>(
        `${BASE}/admin/campaigns/${campaignId}/`,
        payload,
      )
      .then((res) => res.data);
  },

  deleteCampaign(campaignId: string): Promise<MessageResponse> {
    return apiClient
      .delete<MessageResponse>(`${BASE}/admin/campaigns/${campaignId}/`)
      .then((res) => res.data);
  },

  sendCampaign(campaignId: string): Promise<MessageResponse> {
    return apiClient
      .post<MessageResponse>(`${BASE}/admin/campaigns/${campaignId}/send/`)
      .then((res) => res.data);
  },

  fetchCampaignStats(
    campaignId: string,
  ): Promise<DataResponse<CampaignStats>> {
    return apiClient
      .get<DataResponse<CampaignStats>>(
        `${BASE}/admin/campaigns/${campaignId}/stats/`,
      )
      .then((res) => res.data);
  },
};
