import { createAsyncThunk } from "@reduxjs/toolkit";
import { PaymentService } from "@/services/payment/PaymentService";
import type { RootState } from "@/store";
import type {
  InitiateTradePaymentPayload,
  VerifyPaymentPayload,
} from "@/types/payment";

function selectToken(state: unknown): string {
  const token = (state as RootState).auth.accessToken;
  if (!token) throw new Error("Not authenticated");
  return token;
}

export const verifyReferenceThunk = createAsyncThunk(
  "payment/verifyReference",
  async (payload: VerifyPaymentPayload, { getState }) => {
    return PaymentService.verifyReference(selectToken(getState()), payload);
  }
);

export const getSubaccountMeThunk = createAsyncThunk(
  "payment/getSubaccountMe",
  async (_, { getState }) => {
    return PaymentService.getSubaccountMe(selectToken(getState()));
  }
);

export const initiateTradePaymentThunk = createAsyncThunk(
  "payment/initiateTradePayment",
  async (
    args: { tradeId: string; payload: InitiateTradePaymentPayload },
    { getState }
  ) => {
    return PaymentService.initiateTradePayment(
      selectToken(getState()),
      args.tradeId,
      args.payload
    );
  }
);

export const getTradePaymentSummaryThunk = createAsyncThunk(
  "payment/getTradePaymentSummary",
  async (tradeId: string, { getState }) => {
    return PaymentService.getTradePaymentSummary(selectToken(getState()), tradeId);
  }
);
