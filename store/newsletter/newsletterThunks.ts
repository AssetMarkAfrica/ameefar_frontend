import { createAsyncThunk } from "@reduxjs/toolkit";
import { NewsletterService } from "@/services/newsletter/NewsletterService";
import type { SubscribePayload, CampaignPayload } from "@/types/newsletter";

export const subscribe = createAsyncThunk(
  "newsletter/subscribe",
  async (payload: SubscribePayload) => {
    const response = await NewsletterService.subscribe(payload);
    return response.message;
  },
);

export const unsubscribe = createAsyncThunk(
  "newsletter/unsubscribe",
  async (token: string) => {
    await NewsletterService.unsubscribe({ token });
  },
);

export const fetchSubscribers = createAsyncThunk(
  "newsletter/fetchSubscribers",
  async (params?: { page?: number; page_size?: number }) => {
    const response = await NewsletterService.fetchSubscribers(params);
    return response;
  },
);

export const fetchCampaigns = createAsyncThunk(
  "newsletter/fetchCampaigns",
  async (params?: { page?: number; page_size?: number }) => {
    const response = await NewsletterService.fetchCampaigns(params);
    return response;
  },
);

export const fetchCampaign = createAsyncThunk(
  "newsletter/fetchCampaign",
  async (campaignId: string) => {
    const response = await NewsletterService.fetchCampaign(campaignId);
    return response.data;
  },
);

export const createCampaign = createAsyncThunk(
  "newsletter/createCampaign",
  async (payload: CampaignPayload) => {
    const response = await NewsletterService.createCampaign(payload);
    return response.data;
  },
);

export const updateCampaign = createAsyncThunk(
  "newsletter/updateCampaign",
  async ({
    campaignId,
    payload,
  }: {
    campaignId: string;
    payload: CampaignPayload;
  }) => {
    const response = await NewsletterService.updateCampaign(
      campaignId,
      payload,
    );
    return response.data;
  },
);

export const deleteCampaign = createAsyncThunk(
  "newsletter/deleteCampaign",
  async (campaignId: string) => {
    await NewsletterService.deleteCampaign(campaignId);
    return campaignId;
  },
);

export const sendCampaign = createAsyncThunk(
  "newsletter/sendCampaign",
  async (campaignId: string) => {
    const response = await NewsletterService.sendCampaign(campaignId);
    return { campaignId, message: response.message };
  },
);

export const fetchCampaignStats = createAsyncThunk(
  "newsletter/fetchCampaignStats",
  async (campaignId: string) => {
    const response = await NewsletterService.fetchCampaignStats(campaignId);
    return { campaignId, stats: response.data };
  },
);
