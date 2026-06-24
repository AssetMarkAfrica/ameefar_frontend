import type {
  AdminVerify2faPayload,
  AdminVerify2faResponse,
  AdminLogin2faResponse,
  LoginPayload,
  LoginResult,
  LoginResponse,
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

type AuthSessionResponse = {
  access: string;
  refresh: string;
  user: LoginResponse["user"];
};

type ErrorBody = {
  message?: string;
  detail?: string;
  error?: string;
  errors?: Record<string, unknown>;
  [key: string]: unknown;
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
    throw new Error(formatErrorBody(body, response.statusText));
  }

  return body as TResponse;
}

function formatErrorBody(body: ErrorBody | null, fallback: string): string {
  if (!body) {
    return fallback;
  }

  if (body.message) {
    return body.message;
  }

  if (body.detail) {
    return body.detail;
  }

  if (body.error) {
    return body.error;
  }

  const fieldErrors = body.errors ?? body;
  const formattedErrors = Object.entries(fieldErrors)
    .filter(([key]) => !["message", "detail", "error"].includes(key))
    .map(([key, value]) => `${key}: ${formatErrorValue(value)}`)
    .join(" ");

  return formattedErrors || fallback;
}

function formatErrorValue(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map(formatErrorValue).join(", ");
  }

  if (value && typeof value === "object") {
    return Object.entries(value)
      .map(([key, nestedValue]) => `${key}: ${formatErrorValue(nestedValue)}`)
      .join(", ");
  }

  return String(value);
}

function normalizeLoginResponse(body: unknown): LoginResponse {
  const candidate =
    body && typeof body === "object" && "data" in body
      ? (body as { data?: unknown }).data
      : body;

  if (!isAuthSessionResponse(candidate)) {
    throw new Error("Login response did not include a valid auth session.");
  }

  return candidate;
}

function normalizeLoginResult(body: unknown): LoginResult {
  if (isAdminLogin2faResponse(body)) {
    return body;
  }

  return normalizeLoginResponse(body);
}

function normalizeAdminVerify2faResponse(body: unknown): AdminVerify2faResponse {
  const candidate =
    body && typeof body === "object" && "data" in body
      ? (body as { data?: unknown }).data
      : body;

  if (!isAuthSessionResponse(candidate)) {
    throw new Error("Admin 2FA response did not include a valid auth session.");
  }

  return {
    success: true,
    message:
      body && typeof body === "object" && "message" in body
        ? String((body as { message?: unknown }).message)
        : "Admin login verified successfully.",
    data: candidate,
  };
}

function isAdminLogin2faResponse(value: unknown): value is AdminLogin2faResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const response = value as Partial<AdminLogin2faResponse>;

  return (
    response.requires_2fa === true &&
    typeof response.admin_challenge_token === "string" &&
    response.admin_challenge_token.length > 0
  );
}

function isAuthSessionResponse(value: unknown): value is AuthSessionResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const session = value as Partial<AuthSessionResponse>;

  return (
    typeof session.access === "string" &&
    session.access.length > 0 &&
    typeof session.refresh === "string" &&
    session.refresh.length > 0 &&
    Boolean(session.user) &&
    typeof session.user === "object"
  );
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

  login(payload: LoginPayload): Promise<LoginResult> {
    return postJson<unknown, LoginPayload>("/login/", payload).then(
      normalizeLoginResult,
    );
  },

  verifyAdmin2fa(
    payload: AdminVerify2faPayload,
  ): Promise<AdminVerify2faResponse> {
    return postJson<unknown, AdminVerify2faPayload>(
      "/login/admin/verify-2fa/",
      payload,
    ).then(normalizeAdminVerify2faResponse);
  },

  logout(payload: LogoutPayload): Promise<unknown> {
    return postJson<unknown, LogoutPayload>("/logout/", payload);
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
