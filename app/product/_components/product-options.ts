import type {
  ProductAvailabilityStatus,
  ProductListingType,
  ProductMaterialType,
} from "@/types/product";
import type { User } from "@/types/auth";
import { COUNTRIES } from "@/app/auth/_components/PhoneInput";

export const ameefarLogoSrc =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuB867Z4NnfE9y8w6L6xti3YIxQmGmpBGXAJnlFRNWIpd82DciRw7AeFdN0TZRAr-Oov5knd9fNX3FVcqKvYpoqSyoDzMwb0h2FQwFBBJ6XxyV_zaFtMlNJ0OZOJmrwTzUZr9CVQmAGmmkc6_ZEy9Q-NaTHAJaoZRezgqR05U-zT_jbs25LGDBLPMB54hY8ogQQ_XrEhB-pKzyJsZQ6SrxzKiE36Dq7KA5d9UdJexM9UKiHfvQOsBcoDMy3q54HvMZU9viJ9fOCkKOb3";

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

// Derived from the same COUNTRIES dataset used by PhoneInput in RegisterForm,
// ensuring a consistent, complete list of all countries across the app.
export const countryOptions: string[] = COUNTRIES.map((c) => c.name);

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

export type AuctionUrgencyInfo = {
  isAuction: boolean;
  isEnded: boolean;
  diffMs: number;
  diffHours: number;
  diffDays: number;
  remainingText: string;
  badgeText: string;
  urgency: "critical" | "warning" | "normal" | "ended";
};

export function getAuctionUrgencyInfo(
  isAuction?: boolean,
  auctionEndDate?: string,
  auctionClosed?: boolean
): AuctionUrgencyInfo | null {
  if (!isAuction || !auctionEndDate) return null;

  if (auctionClosed) {
    return {
      isAuction: true,
      isEnded: true,
      diffMs: 0,
      diffHours: 0,
      diffDays: 0,
      remainingText: "Auction Closed",
      badgeText: "Ended",
      urgency: "ended",
    };
  }

  const now = new Date().getTime();
  const end = new Date(auctionEndDate).getTime();
  const diffMs = end - now;

  if (diffMs <= 0) {
    return {
      isAuction: true,
      isEnded: true,
      diffMs: 0,
      diffHours: 0,
      diffDays: 0,
      remainingText: "Auction Ended",
      badgeText: "Ended",
      urgency: "ended",
    };
  }

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  let remainingText = "";
  let badgeText = "";
  let urgency: "critical" | "warning" | "normal" = "normal";

  if (diffDays >= 1) {
    const remainingHours = diffHours % 24;
    remainingText = `${diffDays} day${diffDays > 1 ? "s" : ""}${remainingHours > 0 ? ` ${remainingHours}h` : ""} left`;
    badgeText = `${diffDays}d ${remainingHours}h left`;
  } else {
    const diffMins = Math.floor(diffMs / (1000 * 60));
    remainingText = `${diffHours}h ${diffMins % 60}m left`;
    badgeText = `${diffHours}h ${diffMins % 60}m left`;
  }

  if (diffHours <= 24) {
    urgency = "critical";
  } else if (diffDays <= 2) {
    urgency = "warning";
  } else {
    urgency = "normal";
  }

  return {
    isAuction: true,
    isEnded: false,
    diffMs,
    diffHours,
    diffDays,
    remainingText,
    badgeText,
    urgency,
  };
}

