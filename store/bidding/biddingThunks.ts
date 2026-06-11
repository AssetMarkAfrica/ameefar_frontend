import { createAsyncThunk } from "@reduxjs/toolkit";

import { BiddingService } from "@/services/bidding/BiddingService";
import type {
  BiddingAck,
  BiddingAdminOverviewResponse,
  CancelTradePayload,
  CompleteInspectionPayload,
  CompleteTradePayload,
  CounterEnquiryPayload,
  CreateEnquiryPayload,
  CreateInspectionRequirementsResponse,
  DeclineEnquiryPayload,
  DraftInspectionPayload,
  EnquiryDetailResponse,
  EnquiryListResponse,
  EnquiryMessageListResponse,
  EnquiryMessageResponse,
  InspectionImageResponse,
  ListEnquiriesParams,
  ListTradesParams,
  MarkInProgressPayload,
  RaiseDisputePayload,
  RejectInspectionPayload,
  RequestInspectionParams,
  RequestInspectionResponse,
  ResolveDisputePayload,
  ScheduleInspectionPayload,
  SendEnquiryMessagePayload,
  SendTradeMessagePayload,
  SetInspectionRequirementsPayload,
  SetInspectionRequirementsResponse,
  TradeDetailResponse,
  TradeDocumentListResponse,
  TradeDocumentResponse,
  TradeListResponse,
  TradeMessageListResponse,
  TradeMessageResponse,
  UpdateAdminNotesPayload,
  UploadInspectionImagePayload,
  UploadTradeDocumentPayload,
} from "@/types/bidding";

// ─── Shared Arg Types ─────────────────────────────────────────────────────────

type TokenArg = { token: string };
type EnquiryIdArg = { enquiryId: string };
type TradeIdArg = { tradeId: string };

// ─── Enquiry Thunks ───────────────────────────────────────────────────────────

export const listEnquiriesThunk = createAsyncThunk<
  EnquiryListResponse,
  TokenArg & { params?: ListEnquiriesParams }
>("bidding/listEnquiries", ({ token, params }) =>
  BiddingService.listEnquiries(token, params),
);

export const createEnquiryThunk = createAsyncThunk<
  EnquiryDetailResponse,
  TokenArg & CreateEnquiryPayload
>("bidding/createEnquiry", ({ token, ...payload }) =>
  BiddingService.createEnquiry(token, payload),
);

export const fetchEnquiryThunk = createAsyncThunk<
  EnquiryDetailResponse,
  TokenArg & EnquiryIdArg
>("bidding/fetchEnquiry", ({ token, enquiryId }) =>
  BiddingService.getEnquiry(token, enquiryId),
);

export const acceptEnquiryThunk = createAsyncThunk<
  TradeDetailResponse,
  TokenArg & EnquiryIdArg
>("bidding/acceptEnquiry", ({ token, enquiryId }) =>
  BiddingService.acceptEnquiry(token, enquiryId),
);

export const declineEnquiryThunk = createAsyncThunk<
  BiddingAck,
  TokenArg & EnquiryIdArg & DeclineEnquiryPayload
>("bidding/declineEnquiry", ({ token, enquiryId, ...payload }) =>
  BiddingService.declineEnquiry(token, enquiryId, payload),
);

export const counterEnquiryThunk = createAsyncThunk<
  EnquiryDetailResponse,
  TokenArg & EnquiryIdArg & CounterEnquiryPayload
>("bidding/counterEnquiry", ({ token, enquiryId, ...payload }) =>
  BiddingService.counterEnquiry(token, enquiryId, payload),
);

export const withdrawEnquiryThunk = createAsyncThunk<
  BiddingAck,
  TokenArg & EnquiryIdArg
>("bidding/withdrawEnquiry", ({ token, enquiryId }) =>
  BiddingService.withdrawEnquiry(token, enquiryId),
);

export const buyerCounterEnquiryThunk = createAsyncThunk<
  EnquiryDetailResponse,
  TokenArg & EnquiryIdArg & CounterEnquiryPayload
>("bidding/buyerCounterEnquiry", ({ token, enquiryId, ...payload }) =>
  BiddingService.buyerCounterEnquiry(token, enquiryId, payload),
);

export const acceptCounterThunk = createAsyncThunk<
  TradeDetailResponse,
  TokenArg & EnquiryIdArg
>("bidding/acceptCounter", ({ token, enquiryId }) =>
  BiddingService.acceptCounter(token, enquiryId),
);

// ─── Enquiry Message Thunks ───────────────────────────────────────────────────

export const listEnquiryMessagesThunk = createAsyncThunk<
  EnquiryMessageListResponse,
  TokenArg & EnquiryIdArg
>("bidding/listEnquiryMessages", ({ token, enquiryId }) =>
  BiddingService.listEnquiryMessages(token, enquiryId),
);

export const sendEnquiryMessageThunk = createAsyncThunk<
  EnquiryMessageResponse,
  TokenArg & EnquiryIdArg & SendEnquiryMessagePayload
>("bidding/sendEnquiryMessage", ({ token, enquiryId, ...payload }) =>
  BiddingService.sendEnquiryMessage(token, enquiryId, payload),
);

// ─── Trade Thunks ─────────────────────────────────────────────────────────────

export const listTradesThunk = createAsyncThunk<
  TradeListResponse,
  TokenArg & { params?: ListTradesParams }
>("bidding/listTrades", ({ token, params }) =>
  BiddingService.listTrades(token, params),
);

export const fetchTradeThunk = createAsyncThunk<
  TradeDetailResponse,
  TokenArg & TradeIdArg
>("bidding/fetchTrade", ({ token, tradeId }) =>
  BiddingService.getTrade(token, tradeId),
);

export const agreeTradeTermsThunk = createAsyncThunk<
  TradeDetailResponse,
  TokenArg & TradeIdArg
>("bidding/agreeTerms", ({ token, tradeId }) =>
  BiddingService.agreeTerms(token, tradeId),
);

export const agreeTermsThunk = agreeTradeTermsThunk;


export const markInProgressThunk = createAsyncThunk<
  BiddingAck,
  TokenArg & TradeIdArg & MarkInProgressPayload
>("bidding/markInProgress", ({ token, tradeId, ...payload }) =>
  BiddingService.markInProgress(token, tradeId, payload),
);

export const completeTradeThunk = createAsyncThunk<
  BiddingAck,
  TokenArg & TradeIdArg & CompleteTradePayload
>("bidding/completeTrade", ({ token, tradeId, ...payload }) =>
  BiddingService.completeTrade(token, tradeId, payload),
);

export const cancelTradeThunk = createAsyncThunk<
  BiddingAck,
  TokenArg & TradeIdArg & CancelTradePayload
>("bidding/cancelTrade", ({ token, tradeId, ...payload }) =>
  BiddingService.cancelTrade(token, tradeId, payload),
);

export const raiseDisputeThunk = createAsyncThunk<
  BiddingAck,
  TokenArg & TradeIdArg & RaiseDisputePayload
>("bidding/raiseDispute", ({ token, tradeId, ...payload }) =>
  BiddingService.raiseDispute(token, tradeId, payload),
);

export const resolveDisputeThunk = createAsyncThunk<
  BiddingAck,
  TokenArg & TradeIdArg & ResolveDisputePayload
>("bidding/resolveDispute", ({ token, tradeId, ...payload }) =>
  BiddingService.resolveDispute(token, tradeId, payload),
);

export const requestInspectionThunk = createAsyncThunk<
  RequestInspectionResponse,
  TokenArg & TradeIdArg & { params?: RequestInspectionParams }
>("bidding/requestInspection", ({ token, tradeId, params }) =>
  BiddingService.requestInspection(token, tradeId, params),
);

export const skipInspectionThunk = createAsyncThunk<
  TradeDetailResponse,
  TokenArg & TradeIdArg
>("bidding/skipInspection", ({ token, tradeId }) =>
  BiddingService.skipInspection(token, tradeId),
);

export const scheduleInspectionThunk = createAsyncThunk<
  TradeDetailResponse,
  TokenArg & TradeIdArg & ScheduleInspectionPayload
>("bidding/scheduleInspection", ({ token, tradeId, ...payload }) =>
  BiddingService.scheduleInspection(token, tradeId, payload),
);

export const startInspectionThunk = createAsyncThunk<
  TradeDetailResponse,
  TokenArg & TradeIdArg
>("bidding/startInspection", ({ token, tradeId }) =>
  BiddingService.startInspection(token, tradeId),
);

export const draftInspectionThunk = createAsyncThunk<
  TradeDetailResponse,
  TokenArg & TradeIdArg & DraftInspectionPayload
>("bidding/draftInspection", ({ token, tradeId, ...payload }) =>
  BiddingService.draftInspection(token, tradeId, payload),
);

export const completeInspectionThunk = createAsyncThunk<
  TradeDetailResponse,
  TokenArg & TradeIdArg & CompleteInspectionPayload
>("bidding/completeInspection", ({ token, tradeId, ...payload }) =>
  BiddingService.completeInspection(token, tradeId, payload),
);

export const approveInspectionThunk = createAsyncThunk<
  BiddingAck,
  TokenArg & TradeIdArg
>("bidding/approveInspection", ({ token, tradeId }) =>
  BiddingService.approveInspection(token, tradeId),
);

export const rejectInspectionThunk = createAsyncThunk<
  TradeDetailResponse,
  TokenArg & TradeIdArg & RejectInspectionPayload
>("bidding/rejectInspection", ({ token, tradeId, ...payload }) =>
  BiddingService.rejectInspection(token, tradeId, payload),
);

export const updateAdminNotesThunk = createAsyncThunk<
  BiddingAck,
  TokenArg & TradeIdArg & UpdateAdminNotesPayload
>("bidding/updateAdminNotes", ({ token, tradeId, ...payload }) =>
  BiddingService.updateAdminNotes(token, tradeId, payload),
);

// ─── Trade Message Thunks ─────────────────────────────────────────────────────

export const listTradeMessagesThunk = createAsyncThunk<
  TradeMessageListResponse,
  TokenArg & TradeIdArg
>("bidding/listTradeMessages", ({ token, tradeId }) =>
  BiddingService.listTradeMessages(token, tradeId),
);

export const sendTradeMessageThunk = createAsyncThunk<
  TradeMessageResponse,
  TokenArg & TradeIdArg & SendTradeMessagePayload
>("bidding/sendTradeMessage", ({ token, tradeId, ...payload }) =>
  BiddingService.sendTradeMessage(token, tradeId, payload),
);

// ─── Trade Inspection Requirements Thunk ─────────────────────────────────────

export const createInspectionRequirementsThunk = createAsyncThunk<
  CreateInspectionRequirementsResponse,
  TokenArg & TradeIdArg & SetInspectionRequirementsPayload
>("bidding/createInspectionRequirements", ({ token, tradeId, ...payload }) =>
  BiddingService.createInspectionRequirements(token, tradeId, payload),
);

export const setInspectionRequirementsThunk = createAsyncThunk<
  SetInspectionRequirementsResponse,
  TokenArg & TradeIdArg & SetInspectionRequirementsPayload
>("bidding/setInspectionRequirements", ({ token, tradeId, ...payload }) =>
  BiddingService.setInspectionRequirements(token, tradeId, payload),
);

// ─── Trade Inspection Image Thunks ──────────────────────────────────────────────

export const uploadInspectionImageThunk = createAsyncThunk<
  InspectionImageResponse,
  TokenArg & TradeIdArg & UploadInspectionImagePayload
>("bidding/uploadInspectionImage", ({ token, tradeId, ...payload }) =>
  BiddingService.uploadInspectionImage(token, tradeId, payload),
);

export const deleteInspectionImageThunk = createAsyncThunk<
  BiddingAck,
  TokenArg & TradeIdArg & { imageId: string }
>("bidding/deleteInspectionImage", ({ token, tradeId, imageId }) =>
  BiddingService.deleteInspectionImage(token, tradeId, imageId),
);

// ─── Trade Document Thunks ────────────────────────────────────────────────────

export const listTradeDocumentsThunk = createAsyncThunk<
  TradeDocumentListResponse,
  TokenArg & TradeIdArg
>("bidding/listTradeDocuments", ({ token, tradeId }) =>
  BiddingService.listTradeDocuments(token, tradeId),
);

export const uploadTradeDocumentThunk = createAsyncThunk<
  TradeDocumentResponse,
  TokenArg & TradeIdArg & UploadTradeDocumentPayload
>("bidding/uploadTradeDocument", ({ token, tradeId, ...payload }) =>
  BiddingService.uploadTradeDocument(token, tradeId, payload),
);

// ─── Admin Thunks ─────────────────────────────────────────────────────────────

export const fetchAdminOverviewThunk = createAsyncThunk<
  BiddingAdminOverviewResponse,
  TokenArg
>("bidding/fetchAdminOverview", ({ token }) =>
  BiddingService.getAdminOverview(token),
);
