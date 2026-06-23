import type {
  AddSitePayload,
  GetProfileResponse,
  ListDocumentsResponse,
  ListPendingProfilesResponse,
  ListSitesResponse,
  ProfileStepResponse,
  SiteResponse,
  Step1DraftPayload,
  Step1SavePayload,
  Step3Payload,
  UpdatePersonalProfilePayload,
  UpdatePersonalProfileResponse,
  UpdateSitePayload,
  UploadDocumentPayload,
  UploadDocumentResponse,
} from "@/types/profile";

type ErrorBody = {
  message?: string;
  detail?: string;
  error?: string;
  errors?: Record<string, unknown>;
  [key: string]: unknown;
};

const configuredProfileUrl =
  process.env.NEXT_PUBLIC_PROFILE_API ?? process.env.NEXT_PUBLIC_PROFILE_URL;

const PROFILE_API =
  configuredProfileUrl ??
  (process.env.NEXT_PUBLIC_API_URL
    ? `${process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "")}/profile`
    : "http://localhost:82/profile");

function getProfileUrl(endpoint: string): string {
  return `${PROFILE_API.replace(/\/$/, "")}${endpoint}`;
}

function getAuthHeaders(token: string): HeadersInit {
  return {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function requestJson<TResponse, TPayload = undefined>({
  endpoint,
  method,
  payload,
  token,
}: {
  endpoint: string;
  method: "GET" | "POST" | "PATCH" | "PUT";
  payload?: TPayload;
  token: string;
}): Promise<TResponse> {
  const headers: HeadersInit = {
    ...getAuthHeaders(token),
    "Content-Type": "application/json",
  };

  const response = await fetch(getProfileUrl(endpoint), {
    method,
    headers,
    body: payload === undefined ? undefined : JSON.stringify(payload),
  });

  const body = (await response.json().catch(() => null)) as ErrorBody | null;

  if (!response.ok) {
    throw new Error(formatErrorBody(body, response.statusText));
  }

  return body as TResponse;
}

async function requestFormData<TResponse>({
  endpoint,
  formData,
  token,
}: {
  endpoint: string;
  formData: FormData;
  token: string;
}): Promise<TResponse> {
  const response = await fetch(getProfileUrl(endpoint), {
    method: "POST",
    headers: getAuthHeaders(token),
    body: formData,
  });

  const body = (await response.json().catch(() => null)) as ErrorBody | null;

  if (!response.ok) {
    throw new Error(formatErrorBody(body, response.statusText));
  }

  return body as TResponse;
}

function formatErrorBody(body: ErrorBody | null, fallback: string): string {
  if (!body) {
    return fallback;
  }

  if (body.message) {
    return body.message;
  }

  if (body.detail) {
    return body.detail;
  }

  if (body.error) {
    return body.error;
  }

  const fieldErrors = body.errors ?? body;
  const formattedErrors = Object.entries(fieldErrors)
    .filter(([key]) => !["message", "detail", "error"].includes(key))
    .map(([key, value]) => `${key}: ${formatErrorValue(value)}`)
    .join(" ");

  return formattedErrors || fallback;
}

function formatErrorValue(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map(formatErrorValue).join(", ");
  }

  if (value && typeof value === "object") {
    return Object.entries(value)
      .map(([key, nestedValue]) => `${key}: ${formatErrorValue(nestedValue)}`)
      .join(", ");
  }

  return String(value);
}

export const ProfileService = {
  getProfile(token: string): Promise<GetProfileResponse> {
    return requestJson<GetProfileResponse>({
      endpoint: "/",
      method: "GET",
      token,
    });
  },

  getProfileById(token: string, profileId: string): Promise<GetProfileResponse> {
    return requestJson<GetProfileResponse>({
      endpoint: `/${profileId}/`,
      method: "GET",
      token,
    });
  },

  updatePersonalProfile(
    token: string,
    payload: UpdatePersonalProfilePayload,
  ): Promise<UpdatePersonalProfileResponse> {
    return requestJson<
      UpdatePersonalProfileResponse,
      UpdatePersonalProfilePayload
    >({
      endpoint: "/me/",
      method: "PATCH",
      payload,
      token,
    });
  },

  saveStep1Draft(
    token: string,
    payload: Step1DraftPayload,
  ): Promise<ProfileStepResponse> {
    return requestJson<ProfileStepResponse, Step1DraftPayload>({
      endpoint: "/step/1/",
      method: "PATCH",
      payload,
      token,
    });
  },

  saveStep1(
    token: string,
    payload: Step1SavePayload,
  ): Promise<ProfileStepResponse> {
    return requestJson<ProfileStepResponse, Step1SavePayload>({
      endpoint: "/step/1/",
      method: "PUT",
      payload,
      token,
    });
  },

  addSite(token: string, payload: AddSitePayload): Promise<SiteResponse> {
    return requestJson<SiteResponse, AddSitePayload>({
      endpoint: "/sites/",
      method: "POST",
      payload,
      token,
    });
  },

  listSites(token: string): Promise<ListSitesResponse> {
    return requestJson<ListSitesResponse>({
      endpoint: "/sites/",
      method: "GET",
      token,
    });
  },

  getSite(token: string, siteId: string): Promise<ListSitesResponse> {
    return requestJson<ListSitesResponse>({
      endpoint: `/sites/${siteId}/`,
      method: "GET",
      token,
    });
  },

  updateSite(
    token: string,
    siteId: string,
    payload: UpdateSitePayload,
  ): Promise<SiteResponse> {
    return requestJson<SiteResponse, UpdateSitePayload>({
      endpoint: `/sites/${siteId}/`,
      method: "PUT",
      payload,
      token,
    });
  },

  patchSite(
    token: string,
    siteId: string,
    payload: UpdateSitePayload,
  ): Promise<SiteResponse> {
    return requestJson<SiteResponse, UpdateSitePayload>({
      endpoint: `/sites/${siteId}/`,
      method: "PATCH",
      payload,
      token,
    });
  },

  completeStep2(token: string): Promise<ProfileStepResponse> {
    return requestJson<ProfileStepResponse>({
      endpoint: "/step/2/complete/",
      method: "POST",
      token,
    });
  },

  uploadDocument(
    token: string,
    payload: UploadDocumentPayload,
  ): Promise<UploadDocumentResponse> {
    const formData = new FormData();
    formData.append("file", payload.file);
    formData.append("doc_type", payload.doc_type);

    return requestFormData<UploadDocumentResponse>({
      endpoint: "/documents/",
      formData,
      token,
    });
  },

  listDocuments(token: string): Promise<ListDocumentsResponse> {
    return requestJson<ListDocumentsResponse>({
      endpoint: "/documents/",
      method: "GET",
      token,
    });
  },

  saveStep3(token: string, payload: Step3Payload): Promise<ProfileStepResponse> {
    return requestJson<ProfileStepResponse, Step3Payload>({
      endpoint: "/step/3/",
      method: "PUT",
      payload,
      token,
    });
  },

  submitProfile(token: string): Promise<ProfileStepResponse> {
    return requestJson<ProfileStepResponse>({
      endpoint: "/submit/",
      method: "POST",
      token,
    });
  },

  approveProfile(
    token: string,
    profileId: string,
  ): Promise<ProfileStepResponse> {
    return requestJson<ProfileStepResponse>({
      endpoint: `/${profileId}/approve/`,
      method: "POST",
      token,
    });// THIS WILL BE FOR ADMIN
  },

  getPendingProfiles(token: string): Promise<ListPendingProfilesResponse> {
    return requestJson<ListPendingProfilesResponse>({
      endpoint: "/pending/",
      method: "GET",
      token,
    });
  },

  rejectProfile(
    token: string,
    profileId: string,
  ): Promise<ProfileStepResponse> {
    return requestJson<ProfileStepResponse>({
      endpoint: `/${profileId}/reject/`,
      method: "POST",
      token,
    });
  },
};
