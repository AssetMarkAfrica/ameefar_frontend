import type { Material } from "./auth";

export type ProfileStatus = "incomplete" | "pending" | "verified" | "rejected";

export type CompanySize =
  | "1_10"
  | "11_50"
  | "51_200"
  | "201_500"
  | "500_plus";

export type VatRegion = "uk" | "eu" | "us" | "other";

export type SiteType =
  | "recycling"
  | "processing"
  | "collection"
  | "storage"
  | "other";

export type DocType =
  | "business_registration"
  | "representative_id"
  | "proof_of_authority";

export type DocumentStatus = "pending" | "approved" | "rejected";

export interface BankingDetails {
  id: string;
  bank_name: string;
  bank_code: string;
  account_name: string;
  account_number: string;
  is_verified: boolean;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SiteLocation {
  id: string;
  site_name: string;
  site_type: SiteType;
  is_primary: boolean;
  street_address: string;
  address_line_2: string;
  postcode: string;
  city: string;
  state_region: string;
  country: string;
  latitude: string;
  longitude: string;
  contact_person: string;
  contact_email: string;
  contact_phone: string;
  operating_hours: string;
  materials_handled: Material[];
  monthly_capacity: string;
  has_export_capability: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProfileDocument {
  id: string;
  doc_type: DocType;
  file: string;
  file_name: string;
  status: DocumentStatus;
  rejection_reason: string;
  uploaded_at: string;
  reviewed_at: string | null;
}

export interface CompanyProfile {
  id: string;
  status: ProfileStatus;
  step1_complete: boolean;
  step2_complete: boolean;
  step3_complete: boolean;
  completion_percentage: number;
  is_complete: boolean;
  declaration_accepted: boolean;
  submitted_at: string | null;
  reviewed_at: string | null;
  rejection_reason: string;
  vat_region: VatRegion | "";
  company_registration_no: string;
  vat_registration_no: string;
  company_size: CompanySize | "";
  company_website: string;
  company_description: string;
  year_established: number | null;
  street_address: string;
  address_line_2: string;
  postcode: string;
  city: string;
  state_region: string;
  country: string;
  sites: SiteLocation[];
  documents: ProfileDocument[];
  banking: BankingDetails | null;
  created_at: string;
  updated_at: string;
}

export interface PersonalProfile {
  gender: string;
  date_of_birth: string;
  age?: number;
  phone_number: string;
  nationality: string;
  occupation: string;
  id_type: string;
  id_number: string;
  address_line1: string;
  address_line2: string;
  city: string;
  region_state: string;
  postal_code: string;
  country: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  bio: string;
  is_profile_complete?: boolean;
  missing_required_fields?: string[];
  created_at?: string;
  updated_at?: string;
}

export type UpdatePersonalProfilePayload = Partial<
  Omit<
    PersonalProfile,
    | "age"
    | "is_profile_complete"
    | "missing_required_fields"
    | "created_at"
    | "updated_at"
  >
>;

export interface Step1DraftPayload {
  vat_region?: VatRegion;
  company_registration_no?: string;
  vat_registration_no?: string;
  company_size?: CompanySize;
  company_website?: string;
  company_description?: string;
  year_established?: number;
  street_address?: string;
  address_line_2?: string;
  postcode?: string;
  city?: string;
  state_region?: string;
  country?: string;
}

export interface Step1SavePayload {
  vat_region: VatRegion;
  company_registration_no: string;
  vat_registration_no: string;
  company_size: CompanySize;
  company_website: string;
  company_description: string;
  year_established: number;
  street_address: string;
  address_line_2: string;
  postcode: string;
  city: string;
  state_region: string;
  country: string;
}

export interface AddSitePayload {
  site_name: string;
  site_type: SiteType;
  is_primary: boolean;
  street_address: string;
  address_line_2: string;
  postcode: string;
  city: string;
  state_region: string;
  country: string;
  latitude: string;
  longitude: string;
  contact_person: string;
  contact_email: string;
  contact_phone: string;
  operating_hours: string;
  materials_handled: Material[];
  monthly_capacity: string;
  has_export_capability: boolean;
}

export type UpdateSitePayload = Partial<AddSitePayload>;

export interface Step3Payload {
  declaration_accepted: true;
  banking?: {
    bank_name: string;
    bank_code: string;
    account_name: string;
    account_number: string;
  };
}

export interface UploadDocumentPayload {
  file: File;
  doc_type: DocType;
}

export interface GetProfileResponse {
  success: true;
  message: string;
  data: CompanyProfile;
}

export interface UpdatePersonalProfileResponse {
  success: true;
  message: string;
  data: PersonalProfile;
}

export interface ProfileStepResponse {
  success: true;
  message: string;
  data: CompanyProfile;
}

export interface SiteResponse {
  success: true;
  message: string;
  data: SiteLocation;
}

export interface ListSitesResponse {
  success: true;
  message: string;
  data: SiteLocation[];
}

export interface UploadDocumentResponse {
  success: true;
  message: string;
  data: ProfileDocument;
}

export interface ListDocumentsResponse {
  success: true;
  message: string;
  data: ProfileDocument[];
}

export interface ListPendingProfilesResponse {
  success: true;
  message: string;
  data: CompanyProfile[];
}
