import { createSlice } from "@reduxjs/toolkit";

import type {
  CompanyProfile,
  PersonalProfile,
  ProfileDocument,
  SiteLocation,
} from "@/types/profile";

import {
  addSiteThunk,
  approveProfileThunk,
  completeStep2Thunk,
  fetchProfileThunk,
  saveStep1DraftThunk,
  saveStep1Thunk,
  saveStep3Thunk,
  submitProfileThunk,
  updatePersonalProfileThunk,
  updateSiteThunk,
  uploadDocumentThunk,
} from "./profileThunks";

export type ProfileOperation =
  | "fetchProfile"
  | "updatePersonal"
  | "saveStep1Draft"
  | "saveStep1"
  | "addSite"
  | "updateSite"
  | "completeStep2"
  | "uploadDocument"
  | "saveStep3"
  | "submitProfile"
  | "approveProfile";

export type ProfileOperationStatus =
  | "idle"
  | "loading"
  | "succeeded"
  | "failed";

export interface ProfileState {
  profile: CompanyProfile | null;
  personalProfile: PersonalProfile | null;
  sites: SiteLocation[];
  documents: ProfileDocument[];
  status: Record<ProfileOperation, ProfileOperationStatus>;
  errors: Record<ProfileOperation, string | null>;
}

const initialStatus: Record<ProfileOperation, ProfileOperationStatus> = {
  fetchProfile: "idle",
  updatePersonal: "idle",
  saveStep1Draft: "idle",
  saveStep1: "idle",
  addSite: "idle",
  updateSite: "idle",
  completeStep2: "idle",
  uploadDocument: "idle",
  saveStep3: "idle",
  submitProfile: "idle",
  approveProfile: "idle",
};

const initialErrors: Record<ProfileOperation, string | null> = {
  fetchProfile: null,
  updatePersonal: null,
  saveStep1Draft: null,
  saveStep1: null,
  addSite: null,
  updateSite: null,
  completeStep2: null,
  uploadDocument: null,
  saveStep3: null,
  submitProfile: null,
  approveProfile: null,
};

const initialState: ProfileState = {
  profile: null,
  personalProfile: null,
  sites: [],
  documents: [],
  status: initialStatus,
  errors: initialErrors,
};

function getRejectedMessage(message?: string): string {
  return message ?? "Something went wrong.";
}

function setProfile(state: ProfileState, profile: CompanyProfile) {
  state.profile = profile;
  state.sites = profile.sites;
  state.documents = profile.documents;
}

function syncProfileSites(state: ProfileState) {
  if (state.profile) {
    state.profile.sites = state.sites;
  }
}

function syncProfileDocuments(state: ProfileState) {
  if (state.profile) {
    state.profile.documents = state.documents;
  }
}

function upsertSite(sites: SiteLocation[], site: SiteLocation): SiteLocation[] {
  const existingIndex = sites.findIndex((item) => item.id === site.id);

  if (existingIndex === -1) {
    return [...sites, site];
  }

  return sites.map((item) => (item.id === site.id ? site : item));
}

function upsertDocument(
  documents: ProfileDocument[],
  document: ProfileDocument,
): ProfileDocument[] {
  const existingIndex = documents.findIndex((item) => item.id === document.id);

  if (existingIndex === -1) {
    return [...documents, document];
  }

  return documents.map((item) => (item.id === document.id ? document : item));
}

export const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearProfileErrors(state) {
      state.errors = { ...initialErrors };
    },
    resetProfileState() {
      return {
        ...initialState,
        status: { ...initialStatus },
        errors: { ...initialErrors },
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfileThunk.pending, (state) => {
        state.status.fetchProfile = "loading";
        state.errors.fetchProfile = null;
      })
      .addCase(fetchProfileThunk.fulfilled, (state, action) => {
        state.status.fetchProfile = "succeeded";
        setProfile(state, action.payload.data);
      })
      .addCase(fetchProfileThunk.rejected, (state, action) => {
        state.status.fetchProfile = "failed";
        state.errors.fetchProfile = getRejectedMessage(action.error.message);
      })
      .addCase(updatePersonalProfileThunk.pending, (state) => {
        state.status.updatePersonal = "loading";
        state.errors.updatePersonal = null;
      })
      .addCase(updatePersonalProfileThunk.fulfilled, (state, action) => {
        state.status.updatePersonal = "succeeded";
        state.personalProfile = action.payload.data;
      })
      .addCase(updatePersonalProfileThunk.rejected, (state, action) => {
        state.status.updatePersonal = "failed";
        state.errors.updatePersonal = getRejectedMessage(action.error.message);
      })
      .addCase(saveStep1DraftThunk.pending, (state) => {
        state.status.saveStep1Draft = "loading";
        state.errors.saveStep1Draft = null;
      })
      .addCase(saveStep1DraftThunk.fulfilled, (state, action) => {
        state.status.saveStep1Draft = "succeeded";
        state.profile = state.profile
          ? { ...state.profile, ...action.payload.data }
          : action.payload.data;
        state.sites = action.payload.data.sites;
        state.documents = action.payload.data.documents;
      })
      .addCase(saveStep1DraftThunk.rejected, (state, action) => {
        state.status.saveStep1Draft = "failed";
        state.errors.saveStep1Draft = getRejectedMessage(action.error.message);
      })
      .addCase(saveStep1Thunk.pending, (state) => {
        state.status.saveStep1 = "loading";
        state.errors.saveStep1 = null;
      })
      .addCase(saveStep1Thunk.fulfilled, (state, action) => {
        state.status.saveStep1 = "succeeded";
        setProfile(state, action.payload.data);
      })
      .addCase(saveStep1Thunk.rejected, (state, action) => {
        state.status.saveStep1 = "failed";
        state.errors.saveStep1 = getRejectedMessage(action.error.message);
      })
      .addCase(addSiteThunk.pending, (state) => {
        state.status.addSite = "loading";
        state.errors.addSite = null;
      })
      .addCase(addSiteThunk.fulfilled, (state, action) => {
        state.status.addSite = "succeeded";
        state.sites = upsertSite(state.sites, action.payload.data);
        syncProfileSites(state);
      })
      .addCase(addSiteThunk.rejected, (state, action) => {
        state.status.addSite = "failed";
        state.errors.addSite = getRejectedMessage(action.error.message);
      })
      .addCase(updateSiteThunk.pending, (state) => {
        state.status.updateSite = "loading";
        state.errors.updateSite = null;
      })
      .addCase(updateSiteThunk.fulfilled, (state, action) => {
        state.status.updateSite = "succeeded";
        state.sites = upsertSite(state.sites, action.payload.data);
        syncProfileSites(state);
      })
      .addCase(updateSiteThunk.rejected, (state, action) => {
        state.status.updateSite = "failed";
        state.errors.updateSite = getRejectedMessage(action.error.message);
      })
      .addCase(completeStep2Thunk.pending, (state) => {
        state.status.completeStep2 = "loading";
        state.errors.completeStep2 = null;
      })
      .addCase(completeStep2Thunk.fulfilled, (state, action) => {
        state.status.completeStep2 = "succeeded";
        setProfile(state, action.payload.data);
      })
      .addCase(completeStep2Thunk.rejected, (state, action) => {
        state.status.completeStep2 = "failed";
        state.errors.completeStep2 = getRejectedMessage(action.error.message);
      })
      .addCase(uploadDocumentThunk.pending, (state) => {
        state.status.uploadDocument = "loading";
        state.errors.uploadDocument = null;
      })
      .addCase(uploadDocumentThunk.fulfilled, (state, action) => {
        state.status.uploadDocument = "succeeded";
        state.documents = upsertDocument(state.documents, action.payload.data);
        syncProfileDocuments(state);
      })
      .addCase(uploadDocumentThunk.rejected, (state, action) => {
        state.status.uploadDocument = "failed";
        state.errors.uploadDocument = getRejectedMessage(action.error.message);
      })
      .addCase(saveStep3Thunk.pending, (state) => {
        state.status.saveStep3 = "loading";
        state.errors.saveStep3 = null;
      })
      .addCase(saveStep3Thunk.fulfilled, (state, action) => {
        state.status.saveStep3 = "succeeded";
        setProfile(state, action.payload.data);
      })
      .addCase(saveStep3Thunk.rejected, (state, action) => {
        state.status.saveStep3 = "failed";
        state.errors.saveStep3 = getRejectedMessage(action.error.message);
      })
      .addCase(submitProfileThunk.pending, (state) => {
        state.status.submitProfile = "loading";
        state.errors.submitProfile = null;
      })
      .addCase(submitProfileThunk.fulfilled, (state, action) => {
        state.status.submitProfile = "succeeded";
        setProfile(state, action.payload.data);
      })
      .addCase(submitProfileThunk.rejected, (state, action) => {
        state.status.submitProfile = "failed";
        state.errors.submitProfile = getRejectedMessage(action.error.message);
      })
      .addCase(approveProfileThunk.pending, (state) => {
        state.status.approveProfile = "loading";
        state.errors.approveProfile = null;
      })
      .addCase(approveProfileThunk.fulfilled, (state, action) => {
        state.status.approveProfile = "succeeded";
        setProfile(state, action.payload.data);
      })
      .addCase(approveProfileThunk.rejected, (state, action) => {
        state.status.approveProfile = "failed";
        state.errors.approveProfile = getRejectedMessage(action.error.message);
      });
  },
});

export const { clearProfileErrors, resetProfileState } = profileSlice.actions;

export default profileSlice.reducer;
