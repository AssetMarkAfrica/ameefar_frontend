import { createSlice } from "@reduxjs/toolkit";

import {
  confirmPasswordResetThunk,
  loginThunk,
  logoutThunk,
  registerThunk,
  requestPasswordResetThunk,
  verifyOtpThunk,
} from "./authThunks";
import type { User } from "@/types/auth";

export type AuthOperation =
  | "register"
  | "verifyOtp"
  | "login"
  | "logout"
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

type AuthSessionState = Pick<AuthState, "accessToken" | "refreshToken" | "user">;

const initialStatus: Record<AuthOperation, AuthStatus> = {
  register: "idle",
  verifyOtp: "idle",
  login: "idle",
  logout: "idle",
  passwordResetRequest: "idle",
  passwordResetConfirm: "idle",
};

const initialErrors: Record<AuthOperation, string | null> = {
  register: null,
  verifyOtp: null,
  login: null,
  logout: null,
  passwordResetRequest: null,
  passwordResetConfirm: null,
};

export function createInitialAuthState(
  session?: AuthSessionState | null,
): AuthState {
  return {
    user: session?.user ?? null,
    accessToken: session?.accessToken ?? null,
    refreshToken: session?.refreshToken ?? null,
    isAuthenticated: Boolean(session?.accessToken),
    pendingToken: null,
    pendingEmail: null,
    otpDelivery: null,
    status: { ...initialStatus },
    errors: { ...initialErrors },
  };
}

const initialState = createInitialAuthState();

function rejectedMessage(message?: string): string {
  return message ?? "Something went wrong.";
}

function setAuthenticatedSession(
  state: AuthState,
  session: { access: string; refresh: string; user: User },
) {
  state.user = session.user;
  state.accessToken = session.access;
  state.refreshToken = session.refresh;
  state.isAuthenticated = Boolean(session.access);
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
        setAuthenticatedSession(state, action.payload.data);
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
        setAuthenticatedSession(state, action.payload);
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.status.login = "failed";
        state.errors.login = rejectedMessage(action.error.message);
      })
      .addCase(logoutThunk.pending, (state) => {
        state.status.logout = "loading";
        state.errors.logout = null;
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.status.logout = "succeeded";
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
      })
      .addCase(logoutThunk.rejected, (state, action) => {
        state.status.logout = "failed";
        state.errors.logout = rejectedMessage(action.error.message);
        // Even if the backend fails, log out the client
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
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
