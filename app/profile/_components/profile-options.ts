import type {
  CompanySize,
  DocType,
  Material,
  SiteType,
} from "@/types";

export const profileLogoSrc =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuB867Z4NnfE9y8w6L6xti3YIxQmGmpBGXAJnlFRNWIpd82DciRw7AeFdN0TZRAr-Oov5knd9fNX3FVcqKvYpoqSyoDzMwb0h2FQwFBBJ6XxyV_zaFtMlNJ0OZOJmrwTzUZr9CVQmAGmmkc6_ZEy9Q-NaTHAJaoZRezgqR05U-zT_jbs25LGDBLPMB54hY8ogQQ_XrEhB-pKzyJsZQ6SrxzKiE36Dq7KA5d9UdJexM9UKiHfvQOsBcoDMy3q54HvMZU9viJ9fOCkKOb3";



export const companySizes: Array<{ label: string; value: CompanySize }> = [
  { label: "1-10", value: "1_10" },
  { label: "11-50", value: "11_50" },
  { label: "51-200", value: "51_200" },
  { label: "201-500", value: "201_500" },
  { label: "500+", value: "500_plus" },
];

export const siteTypes: Array<{ label: string; value: SiteType }> = [
  { label: "Manufacturing Plant", value: "manufacturing" },
  { label: "Recycling Facility", value: "recycling" },
  { label: "Warehouse", value: "warehouse" },
  { label: "Processing Plant", value: "processing" },
  { label: "Distribution Center", value: "distribution" },
  { label: "Storage Yard", value: "storage_yard" },
  { label: "Corporate Office", value: "corporate_office" },
  { label: "Other", value: "other" },
];

export const materialOptions: Array<{ label: string; value: Material }> = [
  { label: "Plastic", value: "plastic" },
  { label: "Fibre", value: "fibre" },
  { label: "Rubber", value: "rubber" },
  { label: "Metal", value: "metal" },
  { label: "Other", value: "other" },
];

export const requiredDocuments: Array<{
  description: string;
  label: string;
  type: DocType;
}> = [
  {
    description: "Trade license or certificate of incorporation.",
    label: "Business Registration",
    type: "business_registration",
  },
  {
    description: "Government-issued ID for the primary account representative.",
    label: "Representative ID",
    type: "representative_id",
  },
  {
    description: "Letter authorizing this user to act for the company.",
    label: "Proof of Authority",
    type: "proof_of_authority",
  },
];

/** Simplified document list for buyer-only accounts. Only a government-issued
 *  ID is mandatory; business registration is encouraged but not enforced. */
export const buyerRequiredDocuments: Array<{
  description: string;
  label: string;
  type: DocType;
}> = [
  {
    description:
      "Valid passport, national ID card, or driver's licence for the authorised account representative.",
    label: "Representative ID",
    type: "representative_id",
  },
];

// ---------------------------------------------------------------------------
// Country list & ID format hints
// ---------------------------------------------------------------------------

/** Countries shown in the country dropdown.
 *  value = ISO 3166-1 alpha-2 code sent to & stored by the backend.
 *  Non-specifically-supported countries should select "OTHER". */
export const supportedCountries: Array<{ code: string; label: string }> = [
  // Primary markets (strict validation on backend)
  { code: "GB", label: "United Kingdom" },
  { code: "NG", label: "Nigeria" },
  { code: "GH", label: "Ghana" },
  { code: "KE", label: "Kenya" },
  { code: "ZA", label: "South Africa" },
  // Extended Africa
  { code: "ET", label: "Ethiopia" },
  { code: "TZ", label: "Tanzania" },
  { code: "UG", label: "Uganda" },
  { code: "RW", label: "Rwanda" },
  { code: "SN", label: "Senegal" },
  { code: "CM", label: "Cameroon" },
  { code: "CI", label: "Côte d'Ivoire" },
  { code: "ZM", label: "Zambia" },
  { code: "ZW", label: "Zimbabwe" },
  { code: "BW", label: "Botswana" },
  { code: "NA", label: "Namibia" },
  { code: "MZ", label: "Mozambique" },
  { code: "EG", label: "Egypt" },
  { code: "MA", label: "Morocco" },
  // Global
  { code: "US", label: "United States" },
  { code: "CA", label: "Canada" },
  { code: "DE", label: "Germany" },
  { code: "FR", label: "France" },
  { code: "NL", label: "Netherlands" },
  { code: "AE", label: "United Arab Emirates" },
  { code: "IN", label: "India" },
  { code: "CN", label: "China" },
  { code: "OTHER", label: "Other / Not listed" },
];

type IdHint = { hint: string; example: string; placeholder: string; pattern?: string };

/** Per-country UX hints for the Company Registration and VAT/Tax ID fields.
 *  Mirrors COUNTRY_ID_RULES in the backend serializers.py. */
export const countryIdHints: Record<
  string,
  { crn?: IdHint; vat?: IdHint }
> = {
  GB: {
    crn: {
      hint: "8-character Companies House number — 2-letter/digit prefix + 6 digits",
      example: "SC123456 or 09226141",
      placeholder: "e.g. SC123456",
      pattern: "^([A-Z0-9]{2}[0-9]{6})$",
    },
    vat: {
      hint: "GB followed by 9 digits (spaces allowed)",
      example: "GB123456789",
      placeholder: "e.g. GB123456789",
      pattern: "^GB\\s?[0-9]{3}\\s?[0-9]{4}\\s?[0-9]{2}$",
    },
  },
  NG: {
    crn: {
      hint: "CAC number — prefix RC, BN, IT, LP, or LLP followed by digits",
      example: "RC1713818",
      placeholder: "e.g. RC1713818",
      pattern: "^(RC|BN|IT|LP|LLP)[0-9]+$",
    },
    vat: {
      hint: "10-digit FIRS TIN, or your CAC RC/BN number (unified as of 2026)",
      example: "1234567890",
      placeholder: "e.g. 1234567890",
      pattern: "^([0-9]{10}|(RC|BN|IT|LP|LLP)[0-9]+)$",
    },
  },
  GH: {
    crn: {
      hint: "ORC registration number starting with CS",
      example: "CS556632015",
      placeholder: "e.g. CS556632015",
      pattern: "^CS[A-Z0-9]+$",
    },
    vat: {
      hint: "GRA TIN — letter C followed by 10 alphanumeric characters",
      example: "C0000725633",
      placeholder: "e.g. C0000725633",
      pattern: "^C[A-Z0-9]{10}$",
    },
  },
  KE: {
    crn: {
      hint: "BRS certificate number as shown on your incorporation document",
      example: "PVT-XXXXX or BN-RPC2G7RR",
      placeholder: "e.g. PVT-XXXXX",
      pattern: "^(PVT|BN)-[A-Z0-9]+$",
    },
    vat: {
      hint: "KRA PIN — 1 letter + 9 digits + 1 letter (11 characters)",
      example: "P051234567C",
      placeholder: "e.g. P051234567C",
      pattern: "^[A-Z][0-9]{9}[A-Z]$",
    },
  },
  ZA: {
    crn: {
      hint: "CIPC registration number in the format YYYY/NNNNNN/NN",
      example: "2017/123456/07",
      placeholder: "e.g. 2017/123456/07",
      pattern: "^[0-9]{4}/[0-9]{6}/[0-9]{2}$",
    },
    vat: {
      hint: "SARS VAT number — 10 digits starting with 4",
      example: "4480152117",
      placeholder: "e.g. 4480152117",
      pattern: "^4[0-9]{9}$",
    },
  },
};


