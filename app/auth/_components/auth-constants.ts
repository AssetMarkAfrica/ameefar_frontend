import type {
  CompanyType,
  Material,
  Prefix,
  ReferralSource,
  UserRole,
} from "@/types/auth";

export const logoSrc =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDlwhA2Wy_Nz4pjukpFySVPQXWDhVDhIFMaHnr6mzkc6EtB-duAYhri3R0CBWt-iwpKLunl4RBv4Q63aGCpXwYHaFgGhdjACCm9bA8qIF9z_eh4xHl1o6T7HERNJ5o-___RGc0OuvZQQZui-gwZFmx0ZtAb825ffgyiZ5WDzzYhb1qlyRhHoz-iJzjs5VzJqcgVgOk0rITcq2K-lmqtBuMz_vMCiyGJqg3yJspoPGGqaAawbNySSZf7Rh_hn9O9lnhMsBBicHKtzuPX";

export const tradeVisualSrc =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDMDEv4EyCalEwV8P1IqTToe66mmyvNQ097WzZLEKX3AlKsHzRR4HLgBsvJLe6Syf0u-VrO_68UAEWDbwsEFJM5wBJpMeDP-S5g1MLiymVwiSbP-78lhGiuZ5RIU0oqs8GJTlprls02sWwAAVx9vR_8A0nTLuoA0O8sCc8ZxMyXubgeGM8pBgjqot1CG0Vngg2UvPaV9JtPJgzwyC-AnW8EKJ1EC6DS8S09jqYbt99ZgeRhXKPPOQuW_RvD0157h1v25gdZKI-5hI7g";

export const prefixes: Prefix[] = ["Dr", "Mr", "Mrs", "Ms", "Prof", "Other"];

export const companyTypes: Array<{ label: string; value: CompanyType }> = [
  { label: "Aerospace", value: "aerospace" },
  { label: "Agriculture", value: "agriculture" },
  { label: "Broker/Trader", value: "broker_trader" },
  { label: "Construction", value: "construction" },
  { label: "Manufacturer", value: "manufacturer" },
  { label: "Recycler", value: "recycler" },
  { label: "Waste Management", value: "waste_management" },
  { label: "Other", value: "other" },
];

export const roles: Array<{ label: string; value: UserRole }> = [
  { label: "Buyer", value: "buyer" },
  { label: "Seller", value: "seller" },
  { label: "Buyer and seller", value: "both" },
];

export const materials: Array<{ label: string; value: Material }> = [
  { label: "Plastic", value: "plastic" },
  { label: "Fibre", value: "fibre" },
  { label: "Rubber", value: "rubber" },
  { label: "Metal", value: "metal" },
  { label: "Other", value: "other" },
];

export const referralSources: Array<{
  label: string;
  value: ReferralSource;
}> = [
  { label: "Google Search", value: "google_search" },
  { label: "Trade Show", value: "trade_show" },
  { label: "Sustainability Show", value: "sustainability_show" },
  { label: "K-Show", value: "k_show" },
  { label: "Interplas", value: "interplas" },
  { label: "Word of Mouth", value: "word_of_mouth" },
  { label: "Other", value: "other" },
];
