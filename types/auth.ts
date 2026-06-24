export type Prefix = "Dr" | "Mr" | "Mrs" | "Ms" | "Prof" | "Other";

export type CompanyType =
  | "aerospace"
  | "agriculture"
  | "broker_trader"
  | "construction"
  | "manufacturer"
  | "recycler"
  | "waste_management"
  | "other";

export type UserRole = "buyer" | "seller" | "both" | "admin";

export type Material =
  | "plastic"
  | "fibre"
  | "rubber"
  | "metal"
  | "other";

export type ReferralSource =
  | "google_search"
  | "trade_show"
  | "sustainability_show"
  | "k_show"
  | "interplas"
  | "word_of_mouth"
  | "other";

export type UserProfile = Record<string, unknown>;

export interface User {
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
  date_joined: string;
  profile: UserProfile | null;
  avatar_url?: string;
}

export interface RegisterPayload {
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

export interface VerifyOtpPayload {
  email: string;
  pending_token: string;
  code: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AdminVerify2faPayload {
  admin_challenge_token: string;
  code: string;
}

export interface LogoutPayload {
  refresh: string;
}

export interface PasswordResetRequestPayload {
  email: string;
}

export interface PasswordResetConfirmPayload {
  uid: string;
  token: string;
  new_password: string;
}

export interface RegisterResponse {
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

export interface VerifyOtpResponse {
  success: true;
  message: string;
  data: {
    access: string;
    refresh: string;
    user: User;
  };
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface AdminLogin2faResponse {
  requires_2fa: true;
  admin_challenge_token: string;
  delivery: {
    email: boolean;
    sms: boolean;
  };
  detail: string;
}

export type LoginResult = LoginResponse | AdminLogin2faResponse;

export interface AdminVerify2faResponse {
  success: true;
  message: string;
  data: {
    access: string;
    refresh: string;
    user: User;
  };
}

export interface PasswordResetRequestResponse {
  success: true;
  message: string;
}

export interface PasswordResetConfirmResponse {
  success: true;
  message: string;
}
