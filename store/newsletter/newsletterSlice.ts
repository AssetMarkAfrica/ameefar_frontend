import { createSlice } from "@reduxjs/toolkit";
import type { Campaign, CampaignStats, Subscriber } from "@/types/newsletter";
import * as newsletterThunks from "./newsletterThunks";

export interface NewsletterState {
  subscribers: Subscriber[];
  campaigns: Campaign[];
  currentCampaign: Campaign | null;
  campaignStats: Record<string, CampaignStats>;
  pagination: {
    count: number;
    total_pages: number;
    current_page: number;
    next: string | null;
    previous: string | null;
  } | null;
  subscribeMessage: string | null;
  loading: boolean;
  sendingCampaignId: string | null;
  error: string | null;
}

const initialState: NewsletterState = {
  subscribers: [],
  campaigns: [],
  currentCampaign: null,
  campaignStats: {},
  pagination: null,
  subscribeMessage: null,
  loading: false,
  sendingCampaignId: null,
  error: null,
};

const newsletterSlice = createSlice({
  name: "newsletter",
  initialState,
  reducers: {
    clearSubscribeMessage(state) {
      state.subscribeMessage = null;
    },
    clearError(state) {
      state.error = null;
    },
    clearCurrentCampaign(state) {
      state.currentCampaign = null;
    },
    resetNewsletter() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(newsletterThunks.subscribe.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(newsletterThunks.subscribe.fulfilled, (state, action) => {
      state.loading = false;
      state.subscribeMessage = action.payload;
    });
    builder.addCase(newsletterThunks.subscribe.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message ?? "Subscription failed";
    });

    builder.addCase(newsletterThunks.unsubscribe.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(newsletterThunks.unsubscribe.fulfilled, (state) => {
      state.loading = false;
      state.subscribeMessage = "Unsubscribed successfully.";
    });
    builder.addCase(newsletterThunks.unsubscribe.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message ?? "Unsubscribe failed";
    });

    builder.addCase(newsletterThunks.fetchSubscribers.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      newsletterThunks.fetchSubscribers.fulfilled,
      (state, action) => {
        state.loading = false;
        state.subscribers = action.payload.results;
        state.pagination = action.payload.pagination;
      },
    );
    builder.addCase(
      newsletterThunks.fetchSubscribers.rejected,
      (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to fetch subscribers";
      },
    );

    builder.addCase(newsletterThunks.fetchCampaigns.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      newsletterThunks.fetchCampaigns.fulfilled,
      (state, action) => {
        state.loading = false;
        state.campaigns = action.payload.results;
        state.pagination = action.payload.pagination;
      },
    );
    builder.addCase(
      newsletterThunks.fetchCampaigns.rejected,
      (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to fetch campaigns";
      },
    );

    builder.addCase(
      newsletterThunks.fetchCampaign.fulfilled,
      (state, action) => {
        state.currentCampaign = action.payload;
      },
    );

    builder.addCase(
      newsletterThunks.createCampaign.fulfilled,
      (state, action) => {
        state.campaigns.unshift(action.payload);
      },
    );

    builder.addCase(
      newsletterThunks.updateCampaign.fulfilled,
      (state, action) => {
        const idx = state.campaigns.findIndex(
          (c) => c.id === action.payload.id,
        );
        if (idx !== -1) state.campaigns[idx] = action.payload;
        if (state.currentCampaign?.id === action.payload.id) {
          state.currentCampaign = action.payload;
        }
      },
    );

    builder.addCase(
      newsletterThunks.deleteCampaign.fulfilled,
      (state, action) => {
        state.campaigns = state.campaigns.filter(
          (c) => c.id !== action.payload,
        );
        if (state.currentCampaign?.id === action.payload) {
          state.currentCampaign = null;
        }
      },
    );

    builder.addCase(newsletterThunks.sendCampaign.pending, (state, action) => {
      state.sendingCampaignId = action.meta.arg;
    });
    builder.addCase(
      newsletterThunks.sendCampaign.fulfilled,
      (state, action) => {
        state.sendingCampaignId = null;
        const idx = state.campaigns.findIndex(
          (c) => c.id === action.payload.campaignId,
        );
        if (idx !== -1) {
          state.campaigns[idx] = {
            ...state.campaigns[idx],
            status: "sending",
          };
        }
      },
    );
    builder.addCase(
      newsletterThunks.sendCampaign.rejected,
      (state, action) => {
        state.sendingCampaignId = null;
        state.error = action.error.message ?? "Failed to send campaign";
      },
    );

    builder.addCase(
      newsletterThunks.fetchCampaignStats.fulfilled,
      (state, action) => {
        state.campaignStats[action.payload.campaignId] =
          action.payload.stats;
      },
    );
  },
});

export const {
  clearSubscribeMessage,
  clearError,
  clearCurrentCampaign,
  resetNewsletter,
} = newsletterSlice.actions;
export default newsletterSlice.reducer;
