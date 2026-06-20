import { createSlice } from "@reduxjs/toolkit";
import {
  verifyReferenceThunk,
  getSubaccountMeThunk,
  initiateTradePaymentThunk,
  getTradePaymentSummaryThunk,
  listPendingPayoutsThunk,
  approvePayoutThunk,
} from "./paymentThunks";
import type { TradePaymentSummary, Subaccount, TradePayment, TradePayout } from "@/types/payment";

interface PaymentState {
  tradeSummary: TradePaymentSummary | null;
  subaccount: Subaccount | null;
  lastInitiatedPayment: TradePayment | null;
  pendingPayouts: TradePayout[];
  loading: boolean;
  error: string | null;
  status: {
    listPendingPayouts: "idle" | "loading" | "succeeded" | "failed";
    approvePayout: "idle" | "loading" | "succeeded" | "failed";
  };
}

const initialState: PaymentState = {
  tradeSummary: null,
  subaccount: null,
  lastInitiatedPayment: null,
  pendingPayouts: [],
  loading: false,
  error: null,
  status: {
    listPendingPayouts: "idle",
    approvePayout: "idle",
  },
};

const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    clearPaymentError: (state) => {
      state.error = null;
    },
    clearPaymentState: (state) => {
      state.tradeSummary = null;
      state.subaccount = null;
      state.lastInitiatedPayment = null;
      state.pendingPayouts = [];
      state.error = null;
      state.status = {
        listPendingPayouts: "idle",
        approvePayout: "idle",
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // getTradePaymentSummary
      .addCase(getTradePaymentSummaryThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTradePaymentSummaryThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.tradeSummary = action.payload.data;
      })
      .addCase(getTradePaymentSummaryThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to load payment summary";
      })
      // getSubaccountMe
      .addCase(getSubaccountMeThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSubaccountMeThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.subaccount = action.payload.data;
      })
      .addCase(getSubaccountMeThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to load subaccount";
      })
      // initiateTradePayment
      .addCase(initiateTradePaymentThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initiateTradePaymentThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.lastInitiatedPayment = action.payload.data;
      })
      .addCase(initiateTradePaymentThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to initiate payment";
      })
      // verifyReference
      .addCase(verifyReferenceThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyReferenceThunk.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(verifyReferenceThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to verify payment";
      })
      // listPendingPayouts
      .addCase(listPendingPayoutsThunk.pending, (state) => {
        state.status.listPendingPayouts = "loading";
        state.error = null;
      })
      .addCase(listPendingPayoutsThunk.fulfilled, (state, action) => {
        state.status.listPendingPayouts = "succeeded";
        state.pendingPayouts = action.payload.data;
      })
      .addCase(listPendingPayoutsThunk.rejected, (state, action) => {
        state.status.listPendingPayouts = "failed";
        state.error = action.error.message || "Failed to load pending payouts";
      })
      // approvePayout
      .addCase(approvePayoutThunk.pending, (state) => {
        state.status.approvePayout = "loading";
        state.error = null;
      })
      .addCase(approvePayoutThunk.fulfilled, (state, action) => {
        state.status.approvePayout = "succeeded";
        const updatedPayout = action.payload.data;
        // Update it in the list if it exists
        const index = state.pendingPayouts.findIndex(p => p.id === updatedPayout.id);
        if (index !== -1) {
          state.pendingPayouts[index] = updatedPayout;
          // Optionally, since it's approved, you might want to remove it from "pendingPayouts" list:
          // state.pendingPayouts.splice(index, 1);
        }
      })
      .addCase(approvePayoutThunk.rejected, (state, action) => {
        state.status.approvePayout = "failed";
        state.error = action.error.message || "Failed to approve payout";
      });
  },
});

export const { clearPaymentError, clearPaymentState } = paymentSlice.actions;
export default paymentSlice.reducer;
