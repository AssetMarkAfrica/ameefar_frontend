import { createAsyncThunk } from "@reduxjs/toolkit";

import { AuthService } from "@/services/auth/AuthService";
import type {
  AdminVerify2faPayload,
  AdminVerify2faResponse,
  LoginPayload,
  LoginResult,
  PasswordResetConfirmPayload,
  PasswordResetConfirmResponse,
  PasswordResetRequestPayload,
  PasswordResetRequestResponse,
  RegisterPayload,
  RegisterResponse,
  VerifyOtpPayload,
  VerifyOtpResponse,
  LogoutPayload,
} from "@/types/auth";

export const registerThunk = createAsyncThunk<
  RegisterResponse,
  RegisterPayload
>("auth/register", (payload) => AuthService.register(payload));

export const verifyOtpThunk = createAsyncThunk<
  VerifyOtpResponse,
  VerifyOtpPayload
>("auth/verifyOtp", (payload) => AuthService.verifyOtp(payload));

export const loginThunk = createAsyncThunk<LoginResult, LoginPayload>(
  "auth/login",
  (payload) => AuthService.login(payload),
);

export const verifyAdmin2faThunk = createAsyncThunk<
  AdminVerify2faResponse,
  AdminVerify2faPayload
>("auth/verifyAdmin2fa", (payload) => AuthService.verifyAdmin2fa(payload));

export const requestPasswordResetThunk = createAsyncThunk<
  PasswordResetRequestResponse,
  PasswordResetRequestPayload
>("auth/requestPasswordReset", (payload) =>
  AuthService.requestPasswordReset(payload),
);

export const confirmPasswordResetThunk = createAsyncThunk<
  PasswordResetConfirmResponse,
  PasswordResetConfirmPayload
>("auth/confirmPasswordReset", (payload) =>
  AuthService.confirmPasswordReset(payload),
);

export const logoutThunk = createAsyncThunk<
  unknown,
  LogoutPayload
>("auth/logout", (payload) => AuthService.logout(payload));
