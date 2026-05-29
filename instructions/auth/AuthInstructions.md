# Auth Module — Implementation Reference

This document defines the types, service methods, Redux slices, thunks, and selectors for the authentication module. All endpoints live under `AUTH_API = http://localhost:82/auth`.

---

## File Structure

```
types/
  auth.ts

services/
  auth/
    AuthService.ts

store/
  index.ts
  auth/
    authSlice.ts
    authThunks.ts
    authSelectors.ts
```

---

## 1. Types — `types/auth.ts`

### Enumerations

```ts
type Prefix = "Mr" | "Mrs" | "Ms" | "Dr" | "Prof";

type CompanyType =
  | "recycler"
  | "manufacturer"
  | "trader"
  | "broker"
  | "other";

type UserRole = "buyer" | "seller" | "both";

type Material =
  | "plastic"
  | "metal"
  | "rubber"
  | "paper"
  | "glass"
  | "other";

type ReferralSource =
  | "google_search"
  | "social_media"
  | "referral"
  | "event"
  | "other";
```

### User

```ts
interface User {
  id: string;
  email: string;
  prefix: Prefix;
  first_name: string;
  last_name: string;
  full_name: string;
  job_title: string;
  mobile: string;
  company_name: string;
  company_type: CompanyType;
  company_type_other: string;
  role: UserRole;
  is_buyer: boolean;
  is_seller: boolean;
  materials_of_interest: Material[];
  material_other: string;
  referral_source: ReferralSource;
  is_active: boolean;
  is_verified: boolean;
  date_joined: string; // ISO 8601
  profile: UserProfile | null;
}
```

> `UserProfile` can be typed as `Record<string, unknown>` until the profile API is defined.

### Request Payloads

```ts
// POST /register/
interface RegisterPayload {
  email: string;
  password: string;
  password_confirm: string;
  prefix: Prefix;
  first_name: string;
  last_name: string;
  job_title: string;
  mobile: string;
  company_name: string;
  company_type: CompanyType;
  company_type_other: string;
  role: UserRole;
  materials_of_interest: Material[];
  material_other: string;
  referral_source: ReferralSource;
  terms_accepted: boolean;
  campaign_id?: string;
  source_page?: string;
  lead_source?: string;
  subsidiary_source?: string;
  engagement_source_url?: string;
}

// POST /verify-otp/
interface VerifyOtpPayload {
  email: string;
  pending_token: string;
  code: string;
}

// POST /login/
interface LoginPayload {
  email: string;
  password: string;
}

// POST /password-reset-request/
interface PasswordResetRequestPayload {
  email: string;
}

// POST /password-reset-confirm/
interface PasswordResetConfirmPayload {
  uid: string;
  token: string;
  new_password: string;
}
```

### Response Shapes

```ts
// POST /register/ — 200
interface RegisterResponse {
  success: true;
  message: string;
  data: {
    pending_token: string;
    delivery: {
      email: boolean;
      sms: boolean;
    };
  };
}

// POST /verify-otp/ — 200
interface VerifyOtpResponse {
  success: true;
  message: string;
  data: {
    access: string;
    refresh: string;
    user: User;
  };
}

// POST /login/ — 200
interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

// POST /password-reset-request/ — 200
interface PasswordResetRequestResponse {
  success: true;
  message: string;
}

// POST /password-reset-confirm/ — 200
interface PasswordResetConfirmResponse {
  success: true;
  message: string;
}
```

---

## 2. Service — `services/auth/AuthService.ts`

- Base URL comes from an environment variable: `process.env.NEXT_PUBLIC_AUTH_API` (value: `http://localhost:82/auth`).
- All requests send and receive `application/json`.
- No auth header is required on any of these endpoints.
- On non-2xx responses, throw an `Error` using the body's `message` field if present, otherwise the HTTP status text.

### Methods

| Method | HTTP | Endpoint | Payload | Return |
|---|---|---|---|---|
| `register` | POST | `/register/` | `RegisterPayload` | `RegisterResponse` |
| `verifyOtp` | POST | `/verify-otp/` | `VerifyOtpPayload` | `VerifyOtpResponse` |
| `login` | POST | `/login/` | `LoginPayload` | `LoginResponse` |
| `requestPasswordReset` | POST | `/password-reset-request/` | `PasswordResetRequestPayload` | `PasswordResetRequestResponse` |
| `confirmPasswordReset` | POST | `/password-reset-confirm/` | `PasswordResetConfirmPayload` | `PasswordResetConfirmResponse` |

---

## 3. Redux Slice — `store/auth/authSlice.ts`

### State Shape

```ts
interface AuthState {
  // Authenticated session
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;

  // Registration flow — held between /register/ and /verify-otp/
  pendingToken: string | null;
  pendingEmail: string | null;
  otpDelivery: { email: boolean; sms: boolean } | null;

  // Async status per operation
  status: {
    register: "idle" | "loading" | "succeeded" | "failed";
    verifyOtp: "idle" | "loading" | "succeeded" | "failed";
    login: "idle" | "loading" | "succeeded" | "failed";
    passwordResetRequest: "idle" | "loading" | "succeeded" | "failed";
    passwordResetConfirm: "idle" | "loading" | "succeeded" | "failed";
  };

  // Per-operation error messages
  errors: {
    register: string | null;
    verifyOtp: string | null;
    login: string | null;
    passwordResetRequest: string | null;
    passwordResetConfirm: string | null;
  };
}
```

### Initial State

All `status` fields start as `"idle"`, all `errors` as `null`, all session fields as `null`, `isAuthenticated` as `false`.

### Synchronous Actions (reducers)

| Action | What it does |
|---|---|
| `logout` | Clears `user`, both tokens, sets `isAuthenticated: false` |
| `clearAuthErrors` | Resets all `errors` fields to `null` |
| `clearPendingAuth` | Clears `pendingToken`, `pendingEmail`, `otpDelivery` |

### Async Action Handlers (extraReducers)

Wire up all five thunks. For each:

- **pending** → set that operation's `status` to `"loading"`, clear its `error`.
- **fulfilled** → set `status` to `"succeeded"`, store relevant data (see below).
- **rejected** → set `status` to `"failed"`, store `action.error.message` into the matching `errors` field.

**Fulfilled side-effects by thunk:**

| Thunk | State changes on fulfilled |
|---|---|
| `registerThunk` | Store `pending_token`, `pendingEmail` (pass email through thunk arg), `otpDelivery` |
| `verifyOtpThunk` | Store `user`, `accessToken`, `refreshToken`, set `isAuthenticated: true`, clear pending fields |
| `loginThunk` | Store `user`, `accessToken`, `refreshToken`, set `isAuthenticated: true` |
| `requestPasswordResetThunk` | No state changes beyond status |
| `confirmPasswordResetThunk` | No state changes beyond status |

---

## 4. Thunks — `store/auth/authThunks.ts`

Use `createAsyncThunk` from `@reduxjs/toolkit`. Call the matching `AuthService` method inside each thunk. Let errors bubble up naturally so `rejected` handlers receive `error.message`.

| Thunk name | Action type string | Argument type |
|---|---|---|
| `registerThunk` | `"auth/register"` | `RegisterPayload` |
| `verifyOtpThunk` | `"auth/verifyOtp"` | `VerifyOtpPayload` |
| `loginThunk` | `"auth/login"` | `LoginPayload` |
| `requestPasswordResetThunk` | `"auth/requestPasswordReset"` | `PasswordResetRequestPayload` |
| `confirmPasswordResetThunk` | `"auth/confirmPasswordReset"` | `PasswordResetConfirmPayload` |

---

## 5. Selectors — `store/auth/authSelectors.ts`

Accept `RootState` as the argument. `RootState` is exported from `store/index.ts`.

| Selector | Returns |
|---|---|
| `selectUser` | `AuthState["user"]` |
| `selectIsAuthenticated` | `AuthState["isAuthenticated"]` |
| `selectAccessToken` | `AuthState["accessToken"]` |
| `selectPendingToken` | `AuthState["pendingToken"]` |
| `selectPendingEmail` | `AuthState["pendingEmail"]` |
| `selectOtpDelivery` | `AuthState["otpDelivery"]` |
| `selectAuthStatus(operation)` | `AuthState["status"][operation]` |
| `selectAuthError(operation)` | `AuthState["errors"][operation]` |

`selectAuthStatus` and `selectAuthError` are parametric — accept a key of `AuthState["status"]` / `AuthState["errors"]` as a second argument and return the matching field.

---

## 6. Store — `store/index.ts`

- Register the auth reducer under the key `"auth"`.
- Export `RootState` (inferred from `store.getState`) and `AppDispatch` (inferred from `store.dispatch`).
- Export typed hooks `useAppDispatch` and `useAppSelector` here or in a sibling `store/hooks.ts`.

---

## Notes

- `pending_token` from `/register/` must be persisted in Redux state and forwarded as-is to `/verify-otp/`. Do not store it in `localStorage`.
- `access` and `refresh` tokens from `/verify-otp/` and `/login/` follow the same shape and must be stored identically.
- The login response does **not** wrap tokens in a `data` envelope — they sit at the top level alongside `user`. The verify-otp response **does** wrap everything inside `data`. Handle this difference in the thunks or service layer.
- Password reset is a two-step flow: `uid` and `token` arrive via email link query params; parse them from the URL in the page component and pass them directly to the `confirmPasswordReset` thunk.