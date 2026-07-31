import type { RootState } from "@/store";
import type { NewsletterState } from "./newsletterSlice";

const selectNewsletterState = (state: RootState): NewsletterState =>
  state.newsletter;

export const selectSubscribers = (state: RootState) =>
  selectNewsletterState(state).subscribers;
export const selectActiveSubscribers = (state: RootState) =>
  selectSubscribers(state).filter((s) => s.is_active);
export const selectInactiveSubscribers = (state: RootState) =>
  selectSubscribers(state).filter((s) => !s.is_active);
export const selectCampaigns = (state: RootState) =>
  selectNewsletterState(state).campaigns;
export const selectDraftCampaigns = (state: RootState) =>
  selectCampaigns(state).filter((c) => c.status === "draft");
export const selectSentCampaigns = (state: RootState) =>
  selectCampaigns(state).filter((c) => c.status === "sent");
export const selectCurrentCampaign = (state: RootState) =>
  selectNewsletterState(state).currentCampaign;
export const selectCampaignById = (campaignId: string) => (state: RootState) =>
  selectCampaigns(state).find((c) => c.id === campaignId) ?? null;
export const selectCampaignStats = (state: RootState) =>
  selectNewsletterState(state).campaignStats;
export const selectStatsByCampaignId =
  (campaignId: string) => (state: RootState) =>
    selectCampaignStats(state)[campaignId] ?? null;
export const selectSendingCampaignId = (state: RootState) =>
  selectNewsletterState(state).sendingCampaignId;
export const selectIsSending = (state: RootState) =>
  selectSendingCampaignId(state) !== null;
export const selectNewsletterPagination = (state: RootState) =>
  selectNewsletterState(state).pagination;
export const selectNewsletterLoading = (state: RootState) =>
  selectNewsletterState(state).loading;
export const selectNewsletterError = (state: RootState) =>
  selectNewsletterState(state).error;
export const selectSubscribeMessage = (state: RootState) =>
  selectNewsletterState(state).subscribeMessage;
