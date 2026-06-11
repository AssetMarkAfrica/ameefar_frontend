import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type {
  BiddingAdminOverview,
  EnquiryDetail,
  EnquiryMessage,
  EnquirySummary,
  TradeDetail,
  TradeDocument,
  TradeMessage,
  TradeSummary,
} from "@/types/bidding";

import {
  acceptCounterThunk,
  acceptEnquiryThunk,
  agreeTermsThunk,
  approveInspectionThunk,
  cancelTradeThunk,
  completeInspectionThunk,
  completeTradeThunk,
  counterEnquiryThunk,
  buyerCounterEnquiryThunk,
  createEnquiryThunk,
  createInspectionRequirementsThunk,
  declineEnquiryThunk,
  draftInspectionThunk,
  fetchAdminOverviewThunk,
  fetchEnquiryThunk,
  fetchTradeThunk,
  listEnquiriesThunk,
  listEnquiryMessagesThunk,
  listTradeDocumentsThunk,
  listTradeMessagesThunk,
  listTradesThunk,
  markInProgressThunk,
  raiseDisputeThunk,
  rejectInspectionThunk,
  requestInspectionThunk,
  resolveDisputeThunk,
  scheduleInspectionThunk,
  sendEnquiryMessageThunk,
  sendTradeMessageThunk,
  setInspectionRequirementsThunk,
  skipInspectionThunk,
  startInspectionThunk,
  updateAdminNotesThunk,
  uploadTradeDocumentThunk,
  uploadInspectionImageThunk,
  deleteInspectionImageThunk,
  withdrawEnquiryThunk,
} from "./biddingThunks";

// ─── Operation Types ──────────────────────────────────────────────────────────

export type BiddingOperation =
  // Enquiries
  | "listEnquiries"
  | "createEnquiry"
  | "fetchEnquiry"
  | "acceptEnquiry"
  | "declineEnquiry"
  | "counterEnquiry"
  | "buyerCounterEnquiry"

  | "withdrawEnquiry"
  | "acceptCounter"
  | "listEnquiryMessages"
  | "sendEnquiryMessage"
  // Trades
  | "listTrades"
  | "fetchTrade"
  | "agreeTerms"
  | "markInProgress"
  | "completeTrade"
  | "cancelTrade"
  | "raiseDispute"
  | "resolveDispute"
  | "requestInspection"
  | "skipInspection"
  | "scheduleInspection"
  | "startInspection"
  | "draftInspection"
  | "completeInspection"
  | "approveInspection"
  | "rejectInspection"
  | "createInspectionRequirements"
  | "setInspectionRequirements"
  | "updateAdminNotes"
  | "listTradeMessages"
  | "sendTradeMessage"
  | "listTradeDocuments"
  | "uploadTradeDocument"
  | "uploadInspectionImage"
  | "deleteInspectionImage"
  // Admin
  | "fetchAdminOverview";

export type BiddingOperationStatus =
  | "idle"
  | "loading"
  | "succeeded"
  | "failed";

// ─── State Shape ──────────────────────────────────────────────────────────────

export interface BiddingState {
  /** Flat list of enquiry summaries from the most recent list call. */
  enquiries: EnquirySummary[];
  /** Full detail for the currently viewed / active enquiry. */
  currentEnquiry: EnquiryDetail | null;
  /** Messages keyed by enquiry ID. */
  enquiryMessages: Record<string, EnquiryMessage[]>;

  /** Flat list of trade summaries from the most recent list call. */
  trades: TradeSummary[];
  /** Full detail for the currently viewed / active trade. */
  currentTrade: TradeDetail | null;
  /** Messages keyed by trade ID. */
  tradeMessages: Record<string, TradeMessage[]>;
  /** Documents keyed by trade ID. */
  tradeDocuments: Record<string, TradeDocument[]>;

  /** Admin overview stats. */
  adminOverview: BiddingAdminOverview | null;

  status: Record<BiddingOperation, BiddingOperationStatus>;
  errors: Record<BiddingOperation, string | null>;
}

// ─── Initial Values ───────────────────────────────────────────────────────────

const ops: BiddingOperation[] = [
  "listEnquiries",
  "createEnquiry",
  "fetchEnquiry",
  "acceptEnquiry",
  "declineEnquiry",
  "counterEnquiry",

  "buyerCounterEnquiry",
  "withdrawEnquiry",
  "acceptCounter",
  "listEnquiryMessages",
  "sendEnquiryMessage",
  "listTrades",
  "fetchTrade",
  "agreeTerms",
  "markInProgress",
  "completeTrade",
  "cancelTrade",
  "raiseDispute",
  "resolveDispute",
  "requestInspection",
  "skipInspection",
  "scheduleInspection",
  "startInspection",
  "draftInspection",
  "completeInspection",
  "approveInspection",
  "rejectInspection",
  "createInspectionRequirements",
  "setInspectionRequirements",
  "updateAdminNotes",
  "listTradeMessages",
  "sendTradeMessage",
  "listTradeDocuments",
  "uploadTradeDocument",
  "uploadInspectionImage",
  "deleteInspectionImage",
  "fetchAdminOverview",
];

const initialStatus = Object.fromEntries(
  ops.map((op) => [op, "idle"]),
) as Record<BiddingOperation, BiddingOperationStatus>;

const initialErrors = Object.fromEntries(
  ops.map((op) => [op, null]),
) as Record<BiddingOperation, string | null>;

const initialState: BiddingState = {
  enquiries: [],
  currentEnquiry: null,
  enquiryMessages: {},
  trades: [],
  currentTrade: null,
  tradeMessages: {},
  tradeDocuments: {},
  adminOverview: null,
  status: initialStatus,
  errors: initialErrors,
};

// ─── Pure Helpers ─────────────────────────────────────────────────────────────

function rejectedMessage(message?: string): string {
  return message ?? "Something went wrong.";
}

function enquiryDetailToSummary(detail: EnquiryDetail): EnquirySummary {
  const {
    // strip detail-only fields
    message: _msg,
    delivery_terms: _dt,
    delivery_address: _da,
    target_delivery_date: _tdd,
    counter_price_per_unit: _cpp,
    counter_quantity: _cq,
    counter_message: _cm,
    countered_at: _ca,
    decline_reason: _dr,
    responded_at: _ra,
    expires_at: _ea,
    has_trade: _ht,
    trade_id: _tid,
    ...summary
  } = detail;
  return summary;
}

function tradeDetailToSummary(detail: TradeDetail): TradeSummary {
  const {
    // strip detail-only fields
    listing_id: _li,
    buyer_email: _be,
    seller_email: _se,
    delivery_terms: _dt,
    delivery_address: _da,
    terms_locked_at: _tla,
    contract_url: _cu,
    contract_sent_at: _csa,
    contract_signed_at: _csga,
    inspection_required: _ir,
    inspection_status: _is,
    inspection_requested_at: _ira,
    inspection_scheduled_for: _isf,
    inspection_completed_at: _ica,
    inspection_assigned_to_name: _iatn,
    inspection_report: _irp,
    inspection_requirements: _ireqs,
    tracking_reference: _tr,
    estimated_arrival: _ear,
    actual_arrival: _aar,
    completed_at: _cat,
    completion_notes: _cn,
    cancellation_reason: _cr,
    cancellation_notes: _cno,
    cancelled_at: _caat,
    dispute_reason: _dsr,
    disputed_at: _diat,
    dispute_resolved_at: _dra,
    dispute_resolution: _dres,
    payment_summary: _ps,
    admin_notes: _an,
    status_logs: _sl,
    documents: _docs,
    ...summary
  } = detail;
  return summary;
}

function upsertEnquiry(
  list: EnquirySummary[],
  incoming: EnquiryDetail | EnquirySummary,
): EnquirySummary[] {
  const summary =
    "has_trade" in incoming
      ? enquiryDetailToSummary(incoming as EnquiryDetail)
      : (incoming as EnquirySummary);

  const idx = list.findIndex((e) => e.id === summary.id);
  if (idx === -1) return [summary, ...list];
  return list.map((e) => (e.id === summary.id ? summary : e));
}

function upsertTrade(
  list: TradeSummary[],
  incoming: TradeDetail | TradeSummary,
): TradeSummary[] {
  const summary =
    "listing_id" in incoming
      ? tradeDetailToSummary(incoming as TradeDetail)
      : (incoming as TradeSummary);

  const idx = list.findIndex((t) => t.id === summary.id);
  if (idx === -1) return [summary, ...list];
  return list.map((t) => (t.id === summary.id ? summary : t));
}

function appendMessage<T extends { id: string }>(
  map: Record<string, T[]>,
  roomId: string,
  message: T,
): Record<string, T[]> {
  const existing = map[roomId] ?? [];
  // Deduplicate in case of WS + REST race.
  if (existing.some((m) => m.id === message.id)) return map;
  return { ...map, [roomId]: [...existing, message] };
}

function upsertDocument(
  map: Record<string, TradeDocument[]>,
  tradeId: string,
  doc: TradeDocument,
): Record<string, TradeDocument[]> {
  const existing = map[tradeId] ?? [];
  const idx = existing.findIndex((d) => d.id === doc.id);
  const next =
    idx === -1 ? [...existing, doc] : existing.map((d) => (d.id === doc.id ? doc : d));
  return { ...map, [tradeId]: next };
}

// Sync trade documents list if the current trade's embedded documents changed.
function syncTradeDocuments(
  state: BiddingState,
  trade: TradeDetail,
): void {
  if (trade.documents.length > 0) {
    const existing = state.tradeDocuments[trade.id] ?? [];
    const merged = [...existing];
    for (const doc of trade.documents) {
      const idx = merged.findIndex((d) => d.id === doc.id);
      if (idx === -1) merged.push(doc);
      else merged[idx] = doc;
    }
    state.tradeDocuments[trade.id] = merged;
  }
}

// ─── Slice ────────────────────────────────────────────────────────────────────

export const biddingSlice = createSlice({
  name: "bidding",
  initialState,
  reducers: {
    clearBiddingErrors(state) {
      state.errors = { ...initialErrors };
    },

    clearCurrentEnquiry(state) {
      state.currentEnquiry = null;
    },

    clearCurrentTrade(state) {
      state.currentTrade = null;
    },

    resetBiddingState() {
      return {
        ...initialState,
        status: { ...initialStatus },
        errors: { ...initialErrors },
      };
    },

    /**
     * Append a real-time enquiry message received over WebSocket.
     * The component is responsible for calling this action after parsing WS events.
     */
    appendWsEnquiryMessage(
      state,
      action: PayloadAction<{ enquiryId: string; message: EnquiryMessage }>,
    ) {
      const { enquiryId, message } = action.payload;
      state.enquiryMessages = appendMessage(
        state.enquiryMessages,
        enquiryId,
        message,
      );
    },

    /**
     * Append a real-time trade message received over WebSocket.
     */
    appendWsTradeMessage(
      state,
      action: PayloadAction<{ tradeId: string; message: TradeMessage }>,
    ) {
      const { tradeId, message } = action.payload;
      state.tradeMessages = appendMessage(
        state.tradeMessages,
        tradeId,
        message,
      );
    },

    /**
     * Patch the current enquiry with a WS-delivered counter offer update.
     */
    patchCurrentEnquiry(
      state,
      action: PayloadAction<Partial<EnquiryDetail>>,
    ) {
      if (state.currentEnquiry) {
        state.currentEnquiry = { ...state.currentEnquiry, ...action.payload };
        state.enquiries = upsertEnquiry(state.enquiries, state.currentEnquiry);
      }
    },
  },

  extraReducers: (builder) => {
    // ── List Enquiries ──────────────────────────────────────────────────────

    builder
      .addCase(listEnquiriesThunk.pending, (state) => {
        state.status.listEnquiries = "loading";
        state.errors.listEnquiries = null;
      })
      .addCase(listEnquiriesThunk.fulfilled, (state, action) => {
        state.status.listEnquiries = "succeeded";
        state.enquiries = action.payload.data;
      })
      .addCase(listEnquiriesThunk.rejected, (state, action) => {
        state.status.listEnquiries = "failed";
        state.errors.listEnquiries = rejectedMessage(action.error.message);
      })

    // ── Create Enquiry ──────────────────────────────────────────────────────

      .addCase(createEnquiryThunk.pending, (state) => {
        state.status.createEnquiry = "loading";
        state.errors.createEnquiry = null;
      })
      .addCase(createEnquiryThunk.fulfilled, (state, action) => {
        const detail = action.payload.data;
        state.status.createEnquiry = "succeeded";
        state.currentEnquiry = detail;
        state.enquiries = upsertEnquiry(state.enquiries, detail);
      })
      .addCase(createEnquiryThunk.rejected, (state, action) => {
        state.status.createEnquiry = "failed";
        state.errors.createEnquiry = rejectedMessage(action.error.message);
      })

    // ── Fetch Enquiry ───────────────────────────────────────────────────────

      .addCase(fetchEnquiryThunk.pending, (state) => {
        state.status.fetchEnquiry = "loading";
        state.errors.fetchEnquiry = null;
      })
      .addCase(fetchEnquiryThunk.fulfilled, (state, action) => {
        const detail = action.payload.data;
        state.status.fetchEnquiry = "succeeded";
        state.currentEnquiry = detail;
        state.enquiries = upsertEnquiry(state.enquiries, detail);
      })
      .addCase(fetchEnquiryThunk.rejected, (state, action) => {
        state.status.fetchEnquiry = "failed";
        state.errors.fetchEnquiry = rejectedMessage(action.error.message);
      })

    // ── Accept Enquiry (→ creates trade) ────────────────────────────────────

      .addCase(acceptEnquiryThunk.pending, (state) => {
        state.status.acceptEnquiry = "loading";
        state.errors.acceptEnquiry = null;
      })
      .addCase(acceptEnquiryThunk.fulfilled, (state, action) => {
        const trade = action.payload.data;
        state.status.acceptEnquiry = "succeeded";
        state.currentTrade = trade;
        state.trades = upsertTrade(state.trades, trade);
        syncTradeDocuments(state, trade);
        // Reflect has_trade on the current enquiry if it's loaded.
        if (state.currentEnquiry && trade.id) {
          state.currentEnquiry = {
            ...state.currentEnquiry,
            has_trade: true,
            trade_id: trade.id,
            status: "accepted",
          };
          state.enquiries = upsertEnquiry(state.enquiries, state.currentEnquiry);
        }
      })
      .addCase(acceptEnquiryThunk.rejected, (state, action) => {
        state.status.acceptEnquiry = "failed";
        state.errors.acceptEnquiry = rejectedMessage(action.error.message);
      })

    // ── Decline Enquiry ─────────────────────────────────────────────────────

      .addCase(declineEnquiryThunk.pending, (state) => {
        state.status.declineEnquiry = "loading";
        state.errors.declineEnquiry = null;
      })
      .addCase(declineEnquiryThunk.fulfilled, (state, action) => {
        state.status.declineEnquiry = "succeeded";
        const { enquiryId } = action.meta.arg;
        if (state.currentEnquiry?.id === enquiryId) {
          state.currentEnquiry = { ...state.currentEnquiry, status: "declined" };
          state.enquiries = upsertEnquiry(state.enquiries, state.currentEnquiry);
        } else {
          state.enquiries = state.enquiries.map((e) =>
            e.id === enquiryId ? { ...e, status: "declined" } : e,
          );
        }
      })
      .addCase(declineEnquiryThunk.rejected, (state, action) => {
        state.status.declineEnquiry = "failed";
        state.errors.declineEnquiry = rejectedMessage(action.error.message);
      })

    // ── Counter Enquiry ─────────────────────────────────────────────────────

      .addCase(counterEnquiryThunk.pending, (state) => {
        state.status.counterEnquiry = "loading";
        state.errors.counterEnquiry = null;
      })
      .addCase(counterEnquiryThunk.fulfilled, (state, action) => {
        const detail = action.payload.data;
        state.status.counterEnquiry = "succeeded";
        state.currentEnquiry = detail;
        state.enquiries = upsertEnquiry(state.enquiries, detail);
      })
      .addCase(counterEnquiryThunk.rejected, (state, action) => {
        state.status.counterEnquiry = "failed";
        state.errors.counterEnquiry = rejectedMessage(action.error.message);
      })
// ── Buyer Counter Enquiry ───────────────────────────────────────────────

  .addCase(buyerCounterEnquiryThunk.pending, (state) => {
    state.status.buyerCounterEnquiry = "loading";
    state.errors.buyerCounterEnquiry = null;
  })
  .addCase(buyerCounterEnquiryThunk.fulfilled, (state, action) => {
    const detail = action.payload.data;
    state.status.buyerCounterEnquiry = "succeeded";
    state.currentEnquiry = detail;
    state.enquiries = upsertEnquiry(state.enquiries, detail);
  })
  .addCase(buyerCounterEnquiryThunk.rejected, (state, action) => {
    state.status.buyerCounterEnquiry = "failed";
    state.errors.buyerCounterEnquiry = rejectedMessage(action.error.message);
  })
    // ── Withdraw Enquiry ────────────────────────────────────────────────────

      .addCase(withdrawEnquiryThunk.pending, (state) => {
        state.status.withdrawEnquiry = "loading";
        state.errors.withdrawEnquiry = null;
      })
      .addCase(withdrawEnquiryThunk.fulfilled, (state, action) => {
        state.status.withdrawEnquiry = "succeeded";
        const { enquiryId } = action.meta.arg;
        if (state.currentEnquiry?.id === enquiryId) {
          state.currentEnquiry = { ...state.currentEnquiry, status: "withdrawn" };
          state.enquiries = upsertEnquiry(state.enquiries, state.currentEnquiry);
        } else {
          state.enquiries = state.enquiries.map((e) =>
            e.id === enquiryId ? { ...e, status: "withdrawn" } : e,
          );
        }
      })
      .addCase(withdrawEnquiryThunk.rejected, (state, action) => {
        state.status.withdrawEnquiry = "failed";
        state.errors.withdrawEnquiry = rejectedMessage(action.error.message);
      })

    // ── Accept Counter (→ creates trade) ────────────────────────────────────

      .addCase(acceptCounterThunk.pending, (state) => {
        state.status.acceptCounter = "loading";
        state.errors.acceptCounter = null;
      })
      .addCase(acceptCounterThunk.fulfilled, (state, action) => {
        const trade = action.payload.data;
        state.status.acceptCounter = "succeeded";
        state.currentTrade = trade;
        state.trades = upsertTrade(state.trades, trade);
        syncTradeDocuments(state, trade);
        if (state.currentEnquiry && trade.id) {
          state.currentEnquiry = {
            ...state.currentEnquiry,
            has_trade: true,
            trade_id: trade.id,
            status: "accepted",
          };
          state.enquiries = upsertEnquiry(state.enquiries, state.currentEnquiry);
        }
      })
      .addCase(acceptCounterThunk.rejected, (state, action) => {
        state.status.acceptCounter = "failed";
        state.errors.acceptCounter = rejectedMessage(action.error.message);
      })

    // ── List Enquiry Messages ───────────────────────────────────────────────

      .addCase(listEnquiryMessagesThunk.pending, (state) => {
        state.status.listEnquiryMessages = "loading";
        state.errors.listEnquiryMessages = null;
      })
      .addCase(listEnquiryMessagesThunk.fulfilled, (state, action) => {
        state.status.listEnquiryMessages = "succeeded";
        const { enquiryId } = action.meta.arg;
        state.enquiryMessages = {
          ...state.enquiryMessages,
          [enquiryId]: action.payload.data,
        };
      })
      .addCase(listEnquiryMessagesThunk.rejected, (state, action) => {
        state.status.listEnquiryMessages = "failed";
        state.errors.listEnquiryMessages = rejectedMessage(action.error.message);
      })

    // ── Send Enquiry Message ────────────────────────────────────────────────

      .addCase(sendEnquiryMessageThunk.pending, (state) => {
        state.status.sendEnquiryMessage = "loading";
        state.errors.sendEnquiryMessage = null;
      })
      .addCase(sendEnquiryMessageThunk.fulfilled, (state, action) => {
        state.status.sendEnquiryMessage = "succeeded";
        const { enquiryId } = action.meta.arg;
        state.enquiryMessages = appendMessage(
          state.enquiryMessages,
          enquiryId,
          action.payload.data,
        );
      })
      .addCase(sendEnquiryMessageThunk.rejected, (state, action) => {
        state.status.sendEnquiryMessage = "failed";
        state.errors.sendEnquiryMessage = rejectedMessage(action.error.message);
      })

    // ── List Trades ─────────────────────────────────────────────────────────

      .addCase(listTradesThunk.pending, (state) => {
        state.status.listTrades = "loading";
        state.errors.listTrades = null;
      })
      .addCase(listTradesThunk.fulfilled, (state, action) => {
        state.status.listTrades = "succeeded";
        state.trades = action.payload.data;
      })
      .addCase(listTradesThunk.rejected, (state, action) => {
        state.status.listTrades = "failed";
        state.errors.listTrades = rejectedMessage(action.error.message);
      })

    // ── Fetch Trade ─────────────────────────────────────────────────────────

      .addCase(fetchTradeThunk.pending, (state) => {
        state.status.fetchTrade = "loading";
        state.errors.fetchTrade = null;
      })
      .addCase(fetchTradeThunk.fulfilled, (state, action) => {
        const trade = action.payload.data;
        state.status.fetchTrade = "succeeded";
        state.currentTrade = trade;
        state.trades = upsertTrade(state.trades, trade);
        syncTradeDocuments(state, trade);
      })
      .addCase(fetchTradeThunk.rejected, (state, action) => {
        state.status.fetchTrade = "failed";
        state.errors.fetchTrade = rejectedMessage(action.error.message);
      })

    // ── Agree Terms ─────────────────────────────────────────────────────────

      .addCase(agreeTermsThunk.pending, (state) => {
        state.status.agreeTerms = "loading";
        state.errors.agreeTerms = null;
      })
      .addCase(agreeTermsThunk.fulfilled, (state, action) => {
        const trade = action.payload.data;
        state.status.agreeTerms = "succeeded";
        state.currentTrade = trade;
        state.trades = upsertTrade(state.trades, trade);
        syncTradeDocuments(state, trade);
      })
      .addCase(agreeTermsThunk.rejected, (state, action) => {
        state.status.agreeTerms = "failed";
        state.errors.agreeTerms = rejectedMessage(action.error.message);
      })



      .addCase(markInProgressThunk.pending, (state) => {
        state.status.markInProgress = "loading";
        state.errors.markInProgress = null;
      })
      .addCase(markInProgressThunk.fulfilled, (state) => {
        state.status.markInProgress = "succeeded";
        if (state.currentTrade) {
          state.currentTrade = { ...state.currentTrade, status: "in_progress" };
          state.trades = upsertTrade(state.trades, state.currentTrade);
        }
      })
      .addCase(markInProgressThunk.rejected, (state, action) => {
        state.status.markInProgress = "failed";
        state.errors.markInProgress = rejectedMessage(action.error.message);
      })

    // ── Complete Trade ──────────────────────────────────────────────────────

      .addCase(completeTradeThunk.pending, (state) => {
        state.status.completeTrade = "loading";
        state.errors.completeTrade = null;
      })
      .addCase(completeTradeThunk.fulfilled, (state) => {
        state.status.completeTrade = "succeeded";
        if (state.currentTrade) {
          state.currentTrade = { ...state.currentTrade, status: "completed" };
          state.trades = upsertTrade(state.trades, state.currentTrade);
        }
      })
      .addCase(completeTradeThunk.rejected, (state, action) => {
        state.status.completeTrade = "failed";
        state.errors.completeTrade = rejectedMessage(action.error.message);
      })

    // ── Cancel Trade ────────────────────────────────────────────────────────

      .addCase(cancelTradeThunk.pending, (state) => {
        state.status.cancelTrade = "loading";
        state.errors.cancelTrade = null;
      })
      .addCase(cancelTradeThunk.fulfilled, (state) => {
        state.status.cancelTrade = "succeeded";
        if (state.currentTrade) {
          state.currentTrade = { ...state.currentTrade, status: "cancelled" };
          state.trades = upsertTrade(state.trades, state.currentTrade);
        }
      })
      .addCase(cancelTradeThunk.rejected, (state, action) => {
        state.status.cancelTrade = "failed";
        state.errors.cancelTrade = rejectedMessage(action.error.message);
      })

    // ── Raise Dispute ───────────────────────────────────────────────────────

      .addCase(raiseDisputeThunk.pending, (state) => {
        state.status.raiseDispute = "loading";
        state.errors.raiseDispute = null;
      })
      .addCase(raiseDisputeThunk.fulfilled, (state) => {
        state.status.raiseDispute = "succeeded";
        if (state.currentTrade) {
          state.currentTrade = { ...state.currentTrade, status: "disputed" };
          state.trades = upsertTrade(state.trades, state.currentTrade);
        }
      })
      .addCase(raiseDisputeThunk.rejected, (state, action) => {
        state.status.raiseDispute = "failed";
        state.errors.raiseDispute = rejectedMessage(action.error.message);
      })

    // ── Resolve Dispute ─────────────────────────────────────────────────────

      .addCase(resolveDisputeThunk.pending, (state) => {
        state.status.resolveDispute = "loading";
        state.errors.resolveDispute = null;
      })
      .addCase(resolveDisputeThunk.fulfilled, (state) => {
        state.status.resolveDispute = "succeeded";
      })
      .addCase(resolveDisputeThunk.rejected, (state, action) => {
        state.status.resolveDispute = "failed";
        state.errors.resolveDispute = rejectedMessage(action.error.message);
      })

    // ── Request Inspection ──────────────────────────────────────────────────

      .addCase(requestInspectionThunk.pending, (state) => {
        state.status.requestInspection = "loading";
        state.errors.requestInspection = null;
      })
      .addCase(requestInspectionThunk.fulfilled, (state, action) => {
        const trade = action.payload.data.trade;
        state.status.requestInspection = "succeeded";
        state.currentTrade = trade;
        state.trades = upsertTrade(state.trades, trade);
        syncTradeDocuments(state, trade);
      })
      .addCase(requestInspectionThunk.rejected, (state, action) => {
        state.status.requestInspection = "failed";
        state.errors.requestInspection = rejectedMessage(action.error.message);
      })

    // ── Skip Inspection ─────────────────────────────────────────────────────

      .addCase(skipInspectionThunk.pending, (state) => {
        state.status.skipInspection = "loading";
        state.errors.skipInspection = null;
      })
      .addCase(skipInspectionThunk.fulfilled, (state, action) => {
        const trade = action.payload.data;
        state.status.skipInspection = "succeeded";
        state.currentTrade = trade;
        state.trades = upsertTrade(state.trades, trade);
        syncTradeDocuments(state, trade);
      })
      .addCase(skipInspectionThunk.rejected, (state, action) => {
        state.status.skipInspection = "failed";
        state.errors.skipInspection = rejectedMessage(action.error.message);
      })

    // ── Schedule Inspection ─────────────────────────────────────────────────

      .addCase(scheduleInspectionThunk.pending, (state) => {
        state.status.scheduleInspection = "loading";
        state.errors.scheduleInspection = null;
      })
      .addCase(scheduleInspectionThunk.fulfilled, (state, action) => {
        const trade = action.payload.data;
        state.status.scheduleInspection = "succeeded";
        state.currentTrade = trade;
        state.trades = upsertTrade(state.trades, trade);
        syncTradeDocuments(state, trade);
      })
      .addCase(scheduleInspectionThunk.rejected, (state, action) => {
        state.status.scheduleInspection = "failed";
        state.errors.scheduleInspection = rejectedMessage(action.error.message);
      })

    // ── Start Inspection ────────────────────────────────────────────────────

      .addCase(startInspectionThunk.pending, (state) => {
        state.status.startInspection = "loading";
        state.errors.startInspection = null;
      })
      .addCase(startInspectionThunk.fulfilled, (state, action) => {
        const trade = action.payload.data;
        state.status.startInspection = "succeeded";
        state.currentTrade = trade;
        state.trades = upsertTrade(state.trades, trade);
        syncTradeDocuments(state, trade);
      })
      .addCase(startInspectionThunk.rejected, (state, action) => {
        state.status.startInspection = "failed";
        state.errors.startInspection = rejectedMessage(action.error.message);
      })

    // ── Draft Inspection ──────────────────────────────────────────────────────

      .addCase(draftInspectionThunk.pending, (state) => {
        state.status.draftInspection = "loading";
        state.errors.draftInspection = null;
      })
      .addCase(draftInspectionThunk.fulfilled, (state, action) => {
        state.status.draftInspection = "succeeded";
        state.currentTrade = action.payload.data;
      })
      .addCase(draftInspectionThunk.rejected, (state, action) => {
        state.status.draftInspection = "failed";
        state.errors.draftInspection = rejectedMessage(action.error.message);
      })

    // ── Complete Inspection ─────────────────────────────────────────────────

      .addCase(completeInspectionThunk.pending, (state) => {
        state.status.completeInspection = "loading";
        state.errors.completeInspection = null;
      })
      .addCase(completeInspectionThunk.fulfilled, (state, action) => {
        const trade = action.payload.data;
        state.status.completeInspection = "succeeded";
        state.currentTrade = trade;
        state.trades = upsertTrade(state.trades, trade);
        syncTradeDocuments(state, trade);
      })
      .addCase(completeInspectionThunk.rejected, (state, action) => {
        state.status.completeInspection = "failed";
        state.errors.completeInspection = rejectedMessage(action.error.message);
      })

    // ── Approve Inspection ──────────────────────────────────────────────────

      .addCase(approveInspectionThunk.pending, (state) => {
        state.status.approveInspection = "loading";
        state.errors.approveInspection = null;
      })
      .addCase(approveInspectionThunk.fulfilled, (state) => {
        state.status.approveInspection = "succeeded";
      })
      .addCase(approveInspectionThunk.rejected, (state, action) => {
        state.status.approveInspection = "failed";
        state.errors.approveInspection = rejectedMessage(action.error.message);
      })

    // ── Reject Inspection ───────────────────────────────────────────────────

      .addCase(rejectInspectionThunk.pending, (state) => {
        state.status.rejectInspection = "loading";
        state.errors.rejectInspection = null;
      })
      .addCase(rejectInspectionThunk.fulfilled, (state, action) => {
        const trade = action.payload.data;
        state.status.rejectInspection = "succeeded";
        state.currentTrade = trade;
        state.trades = upsertTrade(state.trades, trade);
        syncTradeDocuments(state, trade);
      })
      .addCase(rejectInspectionThunk.rejected, (state, action) => {
        state.status.rejectInspection = "failed";
        state.errors.rejectInspection = rejectedMessage(action.error.message);
      })

    // ── Update Admin Notes ──────────────────────────────────────────────────

      .addCase(updateAdminNotesThunk.pending, (state) => {
        state.status.updateAdminNotes = "loading";
        state.errors.updateAdminNotes = null;
      })
      .addCase(updateAdminNotesThunk.fulfilled, (state) => {
        state.status.updateAdminNotes = "succeeded";
      })
      .addCase(updateAdminNotesThunk.rejected, (state, action) => {
        state.status.updateAdminNotes = "failed";
        state.errors.updateAdminNotes = rejectedMessage(action.error.message);
      })

    // ── List Trade Messages ─────────────────────────────────────────────────

      .addCase(listTradeMessagesThunk.pending, (state) => {
        state.status.listTradeMessages = "loading";
        state.errors.listTradeMessages = null;
      })
      .addCase(listTradeMessagesThunk.fulfilled, (state, action) => {
        state.status.listTradeMessages = "succeeded";
        const { tradeId } = action.meta.arg;
        state.tradeMessages = {
          ...state.tradeMessages,
          [tradeId]: action.payload.data,
        };
      })
      .addCase(listTradeMessagesThunk.rejected, (state, action) => {
        state.status.listTradeMessages = "failed";
        state.errors.listTradeMessages = rejectedMessage(action.error.message);
      })

    // ── Send Trade Message ──────────────────────────────────────────────────

      .addCase(sendTradeMessageThunk.pending, (state) => {
        state.status.sendTradeMessage = "loading";
        state.errors.sendTradeMessage = null;
      })
      .addCase(sendTradeMessageThunk.fulfilled, (state, action) => {
        state.status.sendTradeMessage = "succeeded";
        const { tradeId } = action.meta.arg;
        state.tradeMessages = appendMessage(
          state.tradeMessages,
          tradeId,
          action.payload.data,
        );
      })
      .addCase(sendTradeMessageThunk.rejected, (state, action) => {
        state.status.sendTradeMessage = "failed";
        state.errors.sendTradeMessage = rejectedMessage(action.error.message);
      })

    // ── List Trade Documents ────────────────────────────────────────────────

      .addCase(listTradeDocumentsThunk.pending, (state) => {
        state.status.listTradeDocuments = "loading";
        state.errors.listTradeDocuments = null;
      })
      .addCase(listTradeDocumentsThunk.fulfilled, (state, action) => {
        state.status.listTradeDocuments = "succeeded";
        const { tradeId } = action.meta.arg;
        state.tradeDocuments = {
          ...state.tradeDocuments,
          [tradeId]: action.payload.data,
        };
      })
      .addCase(listTradeDocumentsThunk.rejected, (state, action) => {
        state.status.listTradeDocuments = "failed";
        state.errors.listTradeDocuments = rejectedMessage(action.error.message);
      })

    // ── Upload Trade Document ───────────────────────────────────────────────

      .addCase(uploadTradeDocumentThunk.pending, (state) => {
        state.status.uploadTradeDocument = "loading";
        state.errors.uploadTradeDocument = null;
      })
      .addCase(uploadTradeDocumentThunk.fulfilled, (state, action) => {
        state.status.uploadTradeDocument = "succeeded";
        const { tradeId } = action.meta.arg;
        state.tradeDocuments = upsertDocument(
          state.tradeDocuments,
          tradeId,
          action.payload.data,
        );
        // Also sync onto the embedded documents array if currentTrade matches.
        if (state.currentTrade?.id === tradeId) {
          state.currentTrade = {
            ...state.currentTrade,
            documents: state.tradeDocuments[tradeId],
          };
        }
      })
      .addCase(uploadTradeDocumentThunk.rejected, (state, action) => {
        state.status.uploadTradeDocument = "failed";
        state.errors.uploadTradeDocument = rejectedMessage(action.error.message);
      })

    // ── Create Inspection Requirements (POST) ────────────────────────────────

      .addCase(createInspectionRequirementsThunk.pending, (state) => {
        state.status.createInspectionRequirements = "loading";
        state.errors.createInspectionRequirements = null;
      })
      .addCase(createInspectionRequirementsThunk.fulfilled, (state, action) => {
        state.status.createInspectionRequirements = "succeeded";
        if (state.currentTrade) {
          state.currentTrade = {
            ...state.currentTrade,
            // POST response has `trade` and `requirements` fields inside `data`
            ...action.payload.data.trade,
            inspection_requirements: action.payload.data.requirements,
          };
        }
      })
      .addCase(createInspectionRequirementsThunk.rejected, (state, action) => {
        state.status.createInspectionRequirements = "failed";
        state.errors.createInspectionRequirements = rejectedMessage(action.error.message);
      })

    // ── Set Inspection Requirements (PUT) ───────────────────────────────────

      .addCase(setInspectionRequirementsThunk.pending, (state) => {
        state.status.setInspectionRequirements = "loading";
        state.errors.setInspectionRequirements = null;
      })
      .addCase(setInspectionRequirementsThunk.fulfilled, (state, action) => {
        state.status.setInspectionRequirements = "succeeded";
        if (state.currentTrade) {
          state.currentTrade = {
            ...state.currentTrade,
            inspection_requirements: action.payload.data,
          };
        }
      })
      .addCase(setInspectionRequirementsThunk.rejected, (state, action) => {
        state.status.setInspectionRequirements = "failed";
        state.errors.setInspectionRequirements = rejectedMessage(action.error.message);
      })

    // ── Upload Inspection Image ───────────────────────────────────────────────

      .addCase(uploadInspectionImageThunk.pending, (state) => {
        state.status.uploadInspectionImage = "loading";
        state.errors.uploadInspectionImage = null;
      })
      .addCase(uploadInspectionImageThunk.fulfilled, (state, action) => {
        state.status.uploadInspectionImage = "succeeded";
        const { tradeId } = action.meta.arg;
        if (state.currentTrade?.id === tradeId && state.currentTrade.inspection_report) {
          const images = state.currentTrade.inspection_report.images ?? [];
          state.currentTrade.inspection_report.images = [...images, action.payload.data];
        }
      })
      .addCase(uploadInspectionImageThunk.rejected, (state, action) => {
        state.status.uploadInspectionImage = "failed";
        state.errors.uploadInspectionImage = rejectedMessage(action.error.message);
      })

    // ── Delete Inspection Image ───────────────────────────────────────────────

      .addCase(deleteInspectionImageThunk.pending, (state) => {
        state.status.deleteInspectionImage = "loading";
        state.errors.deleteInspectionImage = null;
      })
      .addCase(deleteInspectionImageThunk.fulfilled, (state, action) => {
        state.status.deleteInspectionImage = "succeeded";
        const { tradeId, imageId } = action.meta.arg;
        if (state.currentTrade?.id === tradeId && state.currentTrade.inspection_report) {
          const images = state.currentTrade.inspection_report.images ?? [];
          state.currentTrade.inspection_report.images = images.filter(img => img.id !== imageId);
        }
      })
      .addCase(deleteInspectionImageThunk.rejected, (state, action) => {
        state.status.deleteInspectionImage = "failed";
        state.errors.deleteInspectionImage = rejectedMessage(action.error.message);
      })

    // ── Fetch Admin Overview ────────────────────────────────────────────────

      .addCase(fetchAdminOverviewThunk.pending, (state) => {
        state.status.fetchAdminOverview = "loading";
        state.errors.fetchAdminOverview = null;
      })
      .addCase(fetchAdminOverviewThunk.fulfilled, (state, action) => {
        state.status.fetchAdminOverview = "succeeded";
        state.adminOverview = action.payload.data;
      })
      .addCase(fetchAdminOverviewThunk.rejected, (state, action) => {
        state.status.fetchAdminOverview = "failed";
        state.errors.fetchAdminOverview = rejectedMessage(action.error.message);
      });
  },
});

// ─── Exports ──────────────────────────────────────────────────────────────────

export const {
  clearBiddingErrors,
  clearCurrentEnquiry,
  clearCurrentTrade,
  resetBiddingState,
  appendWsEnquiryMessage,
  appendWsTradeMessage,
  patchCurrentEnquiry,
} = biddingSlice.actions;

export default biddingSlice.reducer;
