import { createSlice } from "@reduxjs/toolkit";
import { createDirectPurchaseThunk } from "./directPurchaseThunks";

export interface DirectPurchaseState {
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: DirectPurchaseState = {
  status: "idle",
  error: null,
};

const directPurchaseSlice = createSlice({
  name: "directPurchase",
  initialState,
  reducers: {
    clearDirectPurchaseError(state) {
      state.error = null;
      state.status = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createDirectPurchaseThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(createDirectPurchaseThunk.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(createDirectPurchaseThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to purchase";
      });
  },
});

export const { clearDirectPurchaseError } = directPurchaseSlice.actions;
export default directPurchaseSlice.reducer;
