import { createSlice } from "@reduxjs/toolkit";

import {
  confirmPasswordResetThunk,
  loginThunk,
  logoutThunk,
  registerThunk,
  verifyAdmin2faThunk,
  requestPasswordResetThunk,
  verifyOtpThunk,
} from "./authThunks";
import type { AdminLogin2faResponse, LoginResult, User } from "@/types/auth";

export type AuthOperation =
  | "register"
  | "verifyOtp"
  | "verifyAdmin2fa"
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
  adminChallengeToken: string | null;
  adminChallengeEmail: string | null;
  admin2faDelivery: { email: boolean; sms: boolean } | null;
  status: Record<AuthOperation, AuthStatus>;
  errors: Record<AuthOperation, string | null>;
}

type AuthSessionState = Pick<AuthState, "accessToken" | "refreshToken" | "user">;

const initialStatus: Record<AuthOperation, AuthStatus> = {
  register: "idle",
  verifyOtp: "idle",
  verifyAdmin2fa: "idle",
  login: "idle",
  logout: "idle",
  passwordResetRequest: "idle",
  passwordResetConfirm: "idle",
};

const initialErrors: Record<AuthOperation, string | null> = {
  register: null,
  verifyOtp: null,
  verifyAdmin2fa: null,
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
    adminChallengeToken: null,
    adminChallengeEmail: null,
    admin2faDelivery: null,
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
  state.adminChallengeToken = null;
  state.adminChallengeEmail = null;
  state.admin2faDelivery = null;
}

function isAdminLogin2faResponse(
  response: LoginResult,
): response is AdminLogin2faResponse {
  return "requires_2fa" in response && response.requires_2fa;
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
      state.adminChallengeToken = null;
      state.adminChallengeEmail = null;
      state.admin2faDelivery = null;
    },
    clearAuthErrors(state) {
      state.errors = { ...initialErrors };
    },
    clearPendingAuth(state) {
      state.pendingToken = null;
      state.pendingEmail = null;
      state.otpDelivery = null;
      state.adminChallengeToken = null;
      state.adminChallengeEmail = null;
      state.admin2faDelivery = null;
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
        state.errors.verifyAdmin2fa = null;
        state.adminChallengeToken = null;
        state.adminChallengeEmail = null;
        state.admin2faDelivery = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.status.login = "succeeded";
        if (isAdminLogin2faResponse(action.payload)) {
          state.adminChallengeToken = action.payload.admin_challenge_token;
          state.adminChallengeEmail = action.meta.arg.email;
          state.admin2faDelivery = action.payload.delivery;
          return;
        }

        setAuthenticatedSession(state, action.payload);
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.status.login = "failed";
        state.errors.login = rejectedMessage(action.error.message);
      })
      .addCase(verifyAdmin2faThunk.pending, (state) => {
        state.status.verifyAdmin2fa = "loading";
        state.errors.verifyAdmin2fa = null;
      })
      .addCase(verifyAdmin2faThunk.fulfilled, (state, action) => {
        state.status.verifyAdmin2fa = "succeeded";
        setAuthenticatedSession(state, action.payload.data);
      })
      .addCase(verifyAdmin2faThunk.rejected, (state, action) => {
        state.status.verifyAdmin2fa = "failed";
        state.errors.verifyAdmin2fa = rejectedMessage(action.error.message);
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
        state.adminChallengeToken = null;
        state.adminChallengeEmail = null;
        state.admin2faDelivery = null;
      })
      .addCase(logoutThunk.rejected, (state, action) => {
        state.status.logout = "failed";
        state.errors.logout = rejectedMessage(action.error.message);
        // Even if the backend fails, log out the client
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.adminChallengeToken = null;
        state.adminChallengeEmail = null;
        state.admin2faDelivery = null;
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
