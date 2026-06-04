import type { RootState } from "@/store";
import type {
  EnquiryDetail,
  EnquiryMessage,
  EnquirySummary,
  TradeDetail,
  TradeDocument,
  TradeMessage,
  TradeSummary,
} from "@/types/bidding";

import type { BiddingOperation, BiddingState } from "./biddingSlice";

// ─── Enquiry Selectors ────────────────────────────────────────────────────────

export const selectEnquiries = (
  state: RootState,
): EnquirySummary[] => state.bidding.enquiries;

export const selectCurrentEnquiry = (
  state: RootState,
): EnquiryDetail | null => state.bidding.currentEnquiry;

export const selectEnquiryById = (
  state: RootState,
  enquiryId: string,
): EnquirySummary | undefined =>
  state.bidding.enquiries.find((e) => e.id === enquiryId);

export const selectEnquiriesByStatus = (
  state: RootState,
  status: EnquirySummary["status"],
): EnquirySummary[] =>
  state.bidding.enquiries.filter((e) => e.status === status);

export const selectEnquiriesByRole = (
  state: RootState,
  role: "buyer" | "seller",
): EnquirySummary[] =>
  state.bidding.enquiries.filter((e) =>
    role === "buyer" ? e.buyer_email !== "" : e.seller_email !== "",
  );

// ─── Enquiry Message Selectors ────────────────────────────────────────────────

export const selectEnquiryMessages = (
  state: RootState,
  enquiryId: string,
): EnquiryMessage[] => state.bidding.enquiryMessages[enquiryId] ?? [];

// ─── Trade Selectors ──────────────────────────────────────────────────────────

export const selectTrades = (
  state: RootState,
): TradeSummary[] => state.bidding.trades;

export const selectCurrentTrade = (
  state: RootState,
): TradeDetail | null => state.bidding.currentTrade;

export const selectTradeById = (
  state: RootState,
  tradeId: string,
): TradeSummary | undefined =>
  state.bidding.trades.find((t) => t.id === tradeId);

export const selectTradesByStatus = (
  state: RootState,
  status: TradeSummary["status"],
): TradeSummary[] =>
  state.bidding.trades.filter((t) => t.status === status);

export const selectActiveTradeCount = (
  state: RootState,
): number =>
  state.bidding.trades.filter(
    (t) =>
      t.status !== "completed" &&
      t.status !== "cancelled",
  ).length;

// ─── Trade Message Selectors ──────────────────────────────────────────────────

export const selectTradeMessages = (
  state: RootState,
  tradeId: string,
): TradeMessage[] => state.bidding.tradeMessages[tradeId] ?? [];

export const selectTradePublicMessages = (
  state: RootState,
  tradeId: string,
): TradeMessage[] =>
  (state.bidding.tradeMessages[tradeId] ?? []).filter((m) => !m.is_internal);

// ─── Trade Document Selectors ─────────────────────────────────────────────────

export const selectTradeDocuments = (
  state: RootState,
  tradeId: string,
): TradeDocument[] => state.bidding.tradeDocuments[tradeId] ?? [];

export const selectTradeDocumentsByType = (
  state: RootState,
  tradeId: string,
  docType: TradeDocument["doc_type"],
): TradeDocument[] =>
  (state.bidding.tradeDocuments[tradeId] ?? []).filter(
    (d) => d.doc_type === docType,
  );

// ─── Admin Selectors ──────────────────────────────────────────────────────────

export const selectBiddingAdminOverview = (
  state: RootState,
): BiddingState["adminOverview"] => state.bidding.adminOverview;

// ─── Status / Error Selectors ─────────────────────────────────────────────────

export const selectBiddingOpStatus = <TOperation extends BiddingOperation>(
  state: RootState,
  operation: TOperation,
): BiddingState["status"][TOperation] => state.bidding.status[operation];

export const selectBiddingError = <TOperation extends BiddingOperation>(
  state: RootState,
  operation: TOperation,
): BiddingState["errors"][TOperation] => state.bidding.errors[operation];

export const selectIsBiddingLoading = (
  state: RootState,
  operation: BiddingOperation,
): boolean => state.bidding.status[operation] === "loading";

export const selectHasBiddingError = (
  state: RootState,
  operation: BiddingOperation,
): boolean => state.bidding.status[operation] === "failed";
