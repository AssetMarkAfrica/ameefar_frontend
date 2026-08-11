import type {
  CompanySize,
  DocType,
  Material,
  SiteType,
  VatRegion,
} from "@/types";

export const profileLogoSrc =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuB867Z4NnfE9y8w6L6xti3YIxQmGmpBGXAJnlFRNWIpd82DciRw7AeFdN0TZRAr-Oov5knd9fNX3FVcqKvYpoqSyoDzMwb0h2FQwFBBJ6XxyV_zaFtMlNJ0OZOJmrwTzUZr9CVQmAGmmkc6_ZEy9Q-NaTHAJaoZRezgqR05U-zT_jbs25LGDBLPMB54hY8ogQQ_XrEhB-pKzyJsZQ6SrxzKiE36Dq7KA5d9UdJexM9UKiHfvQOsBcoDMy3q54HvMZU9viJ9fOCkKOb3";

export const vatRegions: Array<{ label: string; value: VatRegion }> = [
  { label: "United Kingdom", value: "uk" },
  { label: "European Union", value: "eu" },
  { label: "United States", value: "us" },
  { label: "Other", value: "other" },
];

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

