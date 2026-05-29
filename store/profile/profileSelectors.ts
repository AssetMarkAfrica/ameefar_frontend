import type { RootState } from "@/store";
import type { DocType, ProfileDocument, SiteLocation } from "@/types/profile";

import type { ProfileState } from "./profileSlice";

export const selectProfile = (
  state: RootState,
): ProfileState["profile"] => state.profile.profile;

export const selectPersonalProfile = (
  state: RootState,
): ProfileState["personalProfile"] => state.profile.personalProfile;

export const selectSites = (
  state: RootState,
): ProfileState["sites"] => state.profile.sites;

export const selectPrimarySite = (
  state: RootState,
): SiteLocation | undefined =>
  state.profile.sites.find((site) => site.is_primary);

export const selectDocuments = (
  state: RootState,
): ProfileState["documents"] => state.profile.documents;

export const selectDocumentByType = (
  state: RootState,
  type: DocType,
): ProfileDocument | undefined =>
  state.profile.documents.find((document) => document.doc_type === type);

export const selectCompletionPercentage = (state: RootState): number =>
  state.profile.profile?.completion_percentage ?? 0;

export const selectProfileStatus = (
  state: RootState,
): NonNullable<ProfileState["profile"]>["status"] =>
  state.profile.profile?.status ?? "incomplete";

export const selectIsProfileComplete = (state: RootState): boolean =>
  state.profile.profile?.is_complete ?? false;

export const selectStep1Complete = (state: RootState): boolean =>
  state.profile.profile?.step1_complete ?? false;

export const selectStep2Complete = (state: RootState): boolean =>
  state.profile.profile?.step2_complete ?? false;

export const selectStep3Complete = (state: RootState): boolean =>
  state.profile.profile?.step3_complete ?? false;

export const selectProfileOpStatus = <
  TOperation extends keyof ProfileState["status"],
>(
  state: RootState,
  operation: TOperation,
): ProfileState["status"][TOperation] => state.profile.status[operation];

export const selectProfileError = <
  TOperation extends keyof ProfileState["errors"],
>(
  state: RootState,
  operation: TOperation,
): ProfileState["errors"][TOperation] => state.profile.errors[operation];
