import { createSlice } from "@reduxjs/toolkit";

import {
  confirmPasswordResetThunk,
  loginThunk,
  registerThunk,
  requestPasswordResetThunk,
  verifyOtpThunk,
} from "./authThunks";
import type { User } from "@/types/auth";

export type AuthOperation =
  | "register"
  | "verifyOtp"
  | "login"
  | "passwordResetRequest"
  | "passwordResetConfirm";

export type AuthStatus = "idle" | "loading" | "succeeded" | "failed";

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  pendingToken: string | null;
  pendingEmail: string | null;
  otpDelivery: { email: boolean; sms: boolean } | null;
  status: Record<AuthOperation, AuthStatus>;
  errors: Record<AuthOperation, string | null>;
}

const initialStatus: Record<AuthOperation, AuthStatus> = {
  register: "idle",
  verifyOtp: "idle",
  login: "idle",
  passwordResetRequest: "idle",
  passwordResetConfirm: "idle",
};

const initialErrors: Record<AuthOperation, string | null> = {
  register: null,
  verifyOtp: null,
  login: null,
  passwordResetRequest: null,
  passwordResetConfirm: null,
};

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  pendingToken: null,
  pendingEmail: null,
  otpDelivery: null,
  status: initialStatus,
  errors: initialErrors,
};

function rejectedMessage(message?: string): string {
  return message ?? "Something went wrong.";
}

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
    },
    clearAuthErrors(state) {
      state.errors = { ...initialErrors };
    },
    clearPendingAuth(state) {
      state.pendingToken = null;
      state.pendingEmail = null;
      state.otpDelivery = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerThunk.pending, (state) => {
        state.status.register = "loading";
        state.errors.register = null;
      })
      .addCase(registerThunk.fulfilled, (state, action) => {
        state.status.register = "succeeded";
        state.pendingToken = action.payload.data.pending_token;
        state.pendingEmail = action.meta.arg.email;
        state.otpDelivery = action.payload.data.delivery;
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.status.register = "failed";
        state.errors.register = rejectedMessage(action.error.message);
      })
      .addCase(verifyOtpThunk.pending, (state) => {
        state.status.verifyOtp = "loading";
        state.errors.verifyOtp = null;
      })
      .addCase(verifyOtpThunk.fulfilled, (state, action) => {
        state.status.verifyOtp = "succeeded";
        state.user = action.payload.data.user;
        state.accessToken = action.payload.data.access;
        state.refreshToken = action.payload.data.refresh;
        state.isAuthenticated = true;
        state.pendingToken = null;
        state.pendingEmail = null;
        state.otpDelivery = null;
      })
      .addCase(verifyOtpThunk.rejected, (state, action) => {
        state.status.verifyOtp = "failed";
        state.errors.verifyOtp = rejectedMessage(action.error.message);
      })
      .addCase(loginThunk.pending, (state) => {
        state.status.login = "loading";
        state.errors.login = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.status.login = "succeeded";
        state.user = action.payload.user;
        state.accessToken = action.payload.access;
        state.refreshToken = action.payload.refresh;
        state.isAuthenticated = true;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.status.login = "failed";
        state.errors.login = rejectedMessage(action.error.message);
      })
      .addCase(requestPasswordResetThunk.pending, (state) => {
        state.status.passwordResetRequest = "loading";
        state.errors.passwordResetRequest = null;
      })
      .addCase(requestPasswordResetThunk.fulfilled, (state) => {
        state.status.passwordResetRequest = "succeeded";
      })
      .addCase(requestPasswordResetThunk.rejected, (state, action) => {
        state.status.passwordResetRequest = "failed";
        state.errors.passwordResetRequest = rejectedMessage(
          action.error.message,
        );
      })
      .addCase(confirmPasswordResetThunk.pending, (state) => {
        state.status.passwordResetConfirm = "loading";
        state.errors.passwordResetConfirm = null;
      })
      .addCase(confirmPasswordResetThunk.fulfilled, (state) => {
        state.status.passwordResetConfirm = "succeeded";
      })
      .addCase(confirmPasswordResetThunk.rejected, (state, action) => {
        state.status.passwordResetConfirm = "failed";
        state.errors.passwordResetConfirm = rejectedMessage(
          action.error.message,
        );
      });
  },
});

export const { clearAuthErrors, clearPendingAuth, logout } = authSlice.actions;

export default authSlice.reducer;
