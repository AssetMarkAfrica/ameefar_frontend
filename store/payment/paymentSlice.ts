import { createSlice } from "@reduxjs/toolkit";
import {
  verifyReferenceThunk,
  getSubaccountMeThunk,
  initiateTradePaymentThunk,
  initiateInspectionFeePaymentThunk,
  getTradePaymentSummaryThunk,
  listPayoutsThunk,
  approvePayoutThunk,
} from "./paymentThunks";
import type { TradePaymentSummary, Subaccount, TradePayment, TradePayout } from "@/types/payment";

interface PaymentState {
  tradeSummary: TradePaymentSummary | null;
  subaccount: Subaccount | null;
  lastInitiatedPayment: TradePayment | null;
  payouts: TradePayout[];
  loading: boolean;
  error: string | null;
  status: {
    listPayouts: "idle" | "loading" | "succeeded" | "failed";
    approvePayout: "idle" | "loading" | "succeeded" | "failed";
  };
}

const initialState: PaymentState = {
  tradeSummary: null,
  subaccount: null,
  lastInitiatedPayment: null,
  payouts: [],
  loading: false,
  error: null,
  status: {
    listPayouts: "idle",
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
      state.payouts = [];
      state.error = null;
      state.status = {
        listPayouts: "idle",
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
        state.lastInitiatedPayment = action.payload.data as any;
      })
      .addCase(initiateTradePaymentThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to initiate payment";
      })
      // initiateInspectionFeePayment
      .addCase(initiateInspectionFeePaymentThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initiateInspectionFeePaymentThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.lastInitiatedPayment = action.payload.data as any;
      })
      .addCase(initiateInspectionFeePaymentThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to initiate inspection fee payment";
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
      // listPayouts
      .addCase(listPayoutsThunk.pending, (state) => {
        state.status.listPayouts = "loading";
        state.error = null;
      })
      .addCase(listPayoutsThunk.fulfilled, (state, action) => {
        state.status.listPayouts = "succeeded";
        state.payouts = action.payload.data;
      })
      .addCase(listPayoutsThunk.rejected, (state, action) => {
        state.status.listPayouts = "failed";
        state.error = action.error.message || "Failed to load payouts";
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
        const index = state.payouts.findIndex(p => p.id === updatedPayout.id);
        if (index !== -1) {
          state.payouts[index] = updatedPayout;
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
