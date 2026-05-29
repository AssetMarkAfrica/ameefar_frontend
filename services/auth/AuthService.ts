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

type ErrorBody = {
  message?: string;
};

const configuredAuthUrl =
  process.env.NEXT_PUBLIC_AUTH_URL ?? process.env.NEXT_PUBLIC_AUTH_API;

const AUTH_API =
  configuredAuthUrl ??
  (process.env.NEXT_PUBLIC_API_URL
    ? `${process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "")}/auth`
    : "http://localhost:82/api/auth");

async function postJson<TResponse, TPayload>(
  endpoint: string,
  payload: TPayload,
): Promise<TResponse> {
  const response = await fetch(`${AUTH_API.replace(/\/$/, "")}${endpoint}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const body = (await response.json().catch(() => null)) as ErrorBody | null;

  if (!response.ok) {
    throw new Error(body?.message ?? response.statusText);
  }

  return body as TResponse;
}

export const AuthService = {
  register(payload: RegisterPayload): Promise<RegisterResponse> {
    return postJson<RegisterResponse, RegisterPayload>("/register/", payload);
  },

  verifyOtp(payload: VerifyOtpPayload): Promise<VerifyOtpResponse> {
    return postJson<VerifyOtpResponse, VerifyOtpPayload>(
      "/verify-otp/",
      payload,
    );
  },

  login(payload: LoginPayload): Promise<LoginResponse> {
    return postJson<LoginResponse, LoginPayload>("/login/", payload);
  },

  requestPasswordReset(
    payload: PasswordResetRequestPayload,
  ): Promise<PasswordResetRequestResponse> {
    return postJson<
      PasswordResetRequestResponse,
      PasswordResetRequestPayload
    >("/password-reset-request/", payload);
  },

  confirmPasswordReset(
    payload: PasswordResetConfirmPayload,
  ): Promise<PasswordResetConfirmResponse> {
    return postJson<
      PasswordResetConfirmResponse,
      PasswordResetConfirmPayload
    >("/password-reset-confirm/", payload);
  },
};
