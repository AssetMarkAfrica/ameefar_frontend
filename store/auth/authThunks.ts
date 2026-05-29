import { createAsyncThunk } from "@reduxjs/toolkit";

import { AuthService } from "@/services/auth/AuthService";
import type {
  LoginPayload,
  LoginResponse,
  PasswordResetConfirmPayload,
  PasswordResetConfirmResponse,
  PasswordResetRequestPayload,
  PasswordResetRequestResponse,
  RegisterPayload,
  RegisterResponse,
  VerifyOtpPayload,
  VerifyOtpResponse,
} from "@/types/auth";

export const registerThunk = createAsyncThunk<
  RegisterResponse,
  RegisterPayload
>("auth/register", (payload) => AuthService.register(payload));

export const verifyOtpThunk = createAsyncThunk<
  VerifyOtpResponse,
  VerifyOtpPayload
>("auth/verifyOtp", (payload) => AuthService.verifyOtp(payload));

export const loginThunk = createAsyncThunk<LoginResponse, LoginPayload>(
  "auth/login",
  (payload) => AuthService.login(payload),
);

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
