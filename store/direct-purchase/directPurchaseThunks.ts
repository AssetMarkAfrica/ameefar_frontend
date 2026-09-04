import { createAsyncThunk } from "@reduxjs/toolkit";
import { DirectPurchaseService } from "@/services/direct-purchase/DirectPurchaseService";
import type { DirectPurchasePayload, DirectPurchaseResponse } from "@/types/direct-purchase";

export const createDirectPurchaseThunk = createAsyncThunk<
  DirectPurchaseResponse,
  { token: string; payload: DirectPurchasePayload },
  { rejectValue: string }
>(
  "directPurchase/create",
  async ({ token, payload }, { rejectWithValue }) => {
    try {
      const response = await DirectPurchaseService.createDirectPurchase(token, payload);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to create direct purchase");
    }
  }
);
