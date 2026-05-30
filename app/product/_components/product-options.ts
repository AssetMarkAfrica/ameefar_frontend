import type {
  ProductAvailabilityStatus,
  ProductListingType,
  ProductMaterialType,
} from "@/types/product";
import type { User } from "@/types/auth";

export const materialOptions: Array<{
  value: ProductMaterialType;
  label: string;
}> = [
  { value: "pvc", label: "PVC" },
  { value: "pp", label: "PP" },
  { value: "pc", label: "PC" },
  { value: "pet", label: "PET" },
  { value: "hdpe", label: "HDPE" },
  { value: "ldpe", label: "LDPE" },
  { value: "eps", label: "EPS" },
  { value: "acrylic", label: "Acrylic" },
  { value: "abs", label: "ABS" },
  { value: "ps", label: "PS" },
  { value: "tyres", label: "Tyres" },
];

export const availabilityOptions: Array<{
  value: ProductAvailabilityStatus;
  label: string;
}> = [
  { value: "available_now", label: "Available now" },
  { value: "ongoing", label: "Ongoing supply" },
];

export const countryOptions = [
  "Ghana",
  "Nigeria",
  "Kenya",
  "South Africa",
  "Cote d'Ivoire",
  "United Kingdom",
  "United States",
  "Germany",
  "France",
];

export function getAllowedListingTypes(user: User | null): ProductListingType[] {
  if (!user) {
    return [];
  }

  const canSell = user.role === "seller" || user.role === "both" || user.is_seller;
  const canBuy = user.role === "buyer" || user.role === "both" || user.is_buyer;

  if (canSell && canBuy) {
    return ["sell", "buy"];
  }

  if (canSell) {
    return ["sell"];
  }

  if (canBuy) {
    return ["buy"];
  }

  return [];
}

export function formatListingType(type: ProductListingType) {
  return type === "sell" ? "Sell material" : "Buy material";
}

export function formatMaterialType(value: string) {
  return (
    materialOptions.find((option) => option.value === value.toLowerCase())
      ?.label ?? value.toUpperCase()
  );
}

export function formatAvailability(value: ProductAvailabilityStatus) {
  return (
    availabilityOptions.find((option) => option.value === value)?.label ?? value
  );
}
