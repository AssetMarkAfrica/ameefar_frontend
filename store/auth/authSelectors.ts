import type { RootState } from "@/store";

import type { AuthState } from "./authSlice";

export const selectUser = (state: RootState): AuthState["user"] =>
  state.auth.user;

export const selectIsAuthenticated = (
  state: RootState,
): AuthState["isAuthenticated"] => state.auth.isAuthenticated;

export const selectAccessToken = (
  state: RootState,
): AuthState["accessToken"] => state.auth.accessToken;

export const selectPendingToken = (
  state: RootState,
): AuthState["pendingToken"] => state.auth.pendingToken;

export const selectPendingEmail = (
  state: RootState,
): AuthState["pendingEmail"] => state.auth.pendingEmail;

export const selectOtpDelivery = (
  state: RootState,
): AuthState["otpDelivery"] => state.auth.otpDelivery;

export const selectAuthStatus = <TOperation extends keyof AuthState["status"]>(
  state: RootState,
  operation: TOperation,
): AuthState["status"][TOperation] => state.auth.status[operation];

export const selectAuthError = <TOperation extends keyof AuthState["errors"]>(
  state: RootState,
  operation: TOperation,
): AuthState["errors"][TOperation] => state.auth.errors[operation];
