import { createAsyncThunk } from "@reduxjs/toolkit";

import { ProfileService } from "@/services/profile/ProfileService";
import type {
  AddSitePayload,
  DocType,
  GetProfileResponse,
  ProfileStepResponse,
  SiteResponse,
  Step1DraftPayload,
  Step1SavePayload,
  Step3Payload,
  UpdatePersonalProfilePayload,
  UpdatePersonalProfileResponse,
  UpdateSitePayload,
  UploadDocumentResponse,
} from "@/types/profile";

type TokenArg = {
  token: string;
};

export const fetchProfileThunk = createAsyncThunk<
  GetProfileResponse,
  TokenArg
>("profile/fetch", ({ token }) => ProfileService.getProfile(token));

export const updatePersonalProfileThunk = createAsyncThunk<
  UpdatePersonalProfileResponse,
  TokenArg & UpdatePersonalProfilePayload
>("profile/updatePersonal", ({ token, ...payload }) =>
  ProfileService.updatePersonalProfile(token, payload),
);

export const saveStep1DraftThunk = createAsyncThunk<
  ProfileStepResponse,
  TokenArg & Step1DraftPayload
>("profile/saveStep1Draft", ({ token, ...payload }) =>
  ProfileService.saveStep1Draft(token, payload),
);

export const saveStep1Thunk = createAsyncThunk<
  ProfileStepResponse,
  TokenArg & Step1SavePayload
>("profile/saveStep1", ({ token, ...payload }) =>
  ProfileService.saveStep1(token, payload),
);

export const addSiteThunk = createAsyncThunk<
  SiteResponse,
  TokenArg & AddSitePayload
>("profile/addSite", ({ token, ...payload }) =>
  ProfileService.addSite(token, payload),
);

export const updateSiteThunk = createAsyncThunk<
  SiteResponse,
  TokenArg & { siteId: string } & UpdateSitePayload
>("profile/updateSite", ({ token, siteId, ...payload }) =>
  ProfileService.updateSite(token, siteId, payload),
);

export const completeStep2Thunk = createAsyncThunk<
  ProfileStepResponse,
  TokenArg
>("profile/completeStep2", ({ token }) => ProfileService.completeStep2(token));

export const uploadDocumentThunk = createAsyncThunk<
  UploadDocumentResponse,
  TokenArg & { file: File; doc_type: DocType }
>("profile/uploadDocument", ({ token, file, doc_type }) =>
  ProfileService.uploadDocument(token, { file, doc_type }),
);

export const saveStep3Thunk = createAsyncThunk<
  ProfileStepResponse,
  TokenArg & Step3Payload
>("profile/saveStep3", ({ token, ...payload }) =>
  ProfileService.saveStep3(token, payload),
);

export const submitProfileThunk = createAsyncThunk<
  ProfileStepResponse,
  TokenArg
>("profile/submit", ({ token }) => ProfileService.submitProfile(token));

export const approveProfileThunk = createAsyncThunk<
  ProfileStepResponse,
  TokenArg & { profileId: string }
>("profile/approve", ({ token, profileId }) =>
  ProfileService.approveProfile(token, profileId),
);
