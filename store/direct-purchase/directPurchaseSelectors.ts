import type { RootState } from "../index";

export const selectDirectPurchaseStatus = (state: RootState) => state.directPurchase.status;
export const selectDirectPurchaseError = (state: RootState) => state.directPurchase.error;
