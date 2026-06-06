import { createSlice } from "@reduxjs/toolkit";
import {
  verifyReferenceThunk,
  getSubaccountMeThunk,
  initiateTradePaymentThunk,
  getTradePaymentSummaryThunk,
} from "./paymentThunks";
import type { TradePaymentSummary, Subaccount, TradePayment } from "@/types/payment";

interface PaymentState {
  tradeSummary: TradePaymentSummary | null;
  subaccount: Subaccount | null;
  lastInitiatedPayment: TradePayment | null;
  loading: boolean;
  error: string | null;
}

const initialState: PaymentState = {
  tradeSummary: null,
  subaccount: null,
  lastInitiatedPayment: null,
  loading: false,
  error: null,
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
      state.error = null;
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
      });
  },
});

export const { clearPaymentError, clearPaymentState } = paymentSlice.actions;
export default paymentSlice.reducer;
