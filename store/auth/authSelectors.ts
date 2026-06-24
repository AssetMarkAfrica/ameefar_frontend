import type { RootState } from "@/store";

import type { AuthState } from "./authSlice";

export const selectUser = (state: RootState): AuthState["user"] =>
  state.auth.user;

export const selectIsAuthenticated = (
  state: RootState,
): AuthState["isAuthenticated"] => Boolean(state.auth.accessToken);

export const selectAccessToken = (
  state: RootState,
): AuthState["accessToken"] => state.auth.accessToken;

export const selectHasAuthSession = (state: RootState): boolean =>
  Boolean(state.auth.accessToken);

export const selectPendingToken = (
  state: RootState,
): AuthState["pendingToken"] => state.auth.pendingToken;

export const selectPendingEmail = (
  state: RootState,
): AuthState["pendingEmail"] => state.auth.pendingEmail;

export const selectOtpDelivery = (
  state: RootState,
): AuthState["otpDelivery"] => state.auth.otpDelivery;

export const selectAdminChallengeToken = (
  state: RootState,
): AuthState["adminChallengeToken"] => state.auth.adminChallengeToken;

export const selectAdminChallengeEmail = (
  state: RootState,
): AuthState["adminChallengeEmail"] => state.auth.adminChallengeEmail;

export const selectAdmin2faDelivery = (
  state: RootState,
): AuthState["admin2faDelivery"] => state.auth.admin2faDelivery;

export const selectAuthStatus = <TOperation extends keyof AuthState["status"]>(
  state: RootState,
  operation: TOperation,
): AuthState["status"][TOperation] => state.auth.status[operation];

export const selectAuthError = <TOperation extends keyof AuthState["errors"]>(
  state: RootState,
  operation: TOperation,
): AuthState["errors"][TOperation] => state.auth.errors[operation];

export const selectIsVerified = (state: RootState): boolean =>
  state.auth.user?.is_verified ?? false;

export const selectIsActive = (state: RootState): boolean =>
  state.auth.user?.is_active ?? false;

export const selectIsBuyer = (state: RootState): boolean =>
  state.auth.user?.role === "buyer";

export const selectIsSeller = (state: RootState): boolean =>
  state.auth.user?.role === "seller";

export const selectIsBoth = (state: RootState): boolean =>
  state.auth.user?.role === "both";

export const selectIsAdmin = (state: RootState): boolean =>
  state.auth.user?.role === "admin";
