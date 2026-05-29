# Profile Module — Implementation Reference

All endpoints live under `PROFILE_API = http://localhost:82/profile`.  
All requests require a Bearer `Authorization` header using the `access` token from the auth module.  
All responses follow `{ success, message, data }` except where noted.

---

## File Structure

```
types/
  profile.ts

services/
  profile/
    ProfileService.ts

store/
  profile/
    profileSlice.ts
    profileThunks.ts
    profileSelectors.ts
```

---

## 1. Types — `types/profile.ts`

### Enumerations

```ts
type ProfileStatus = "incomplete" | "pending" | "verified" | "rejected";

type CompanySize =
  | "1_10"
  | "11_50"
  | "51_200"
  | "201_500"
  | "500_plus";

type VatRegion =
  | "uk"
  | "eu"
  | "us"
  | "other";

type SiteType =
  | "recycling"
  | "processing"
  | "collection"
  | "storage"
  | "other";

type DocType =
  | "business_registration"
  | "representative_id"
  | "proof_of_authority";

type DocumentStatus = "pending" | "approved" | "rejected";
```

> `Material` is already defined in `types/auth.ts` — import and reuse it here.

### Sub-Models

```ts
interface BankingDetails {
  id: string;
  bank_name: string;
  bank_code: string;
  account_name: string;
  account_number: string;
  is_verified: boolean;
  verified_at: string | null; // ISO 8601
  created_at: string;
  updated_at: string;
}

interface SiteLocation {
  id: string;
  site_name: string;
  site_type: SiteType;
  is_primary: boolean;
  street_address: string;
  address_line_2: string;
  postcode: string;
  city: string;
  state_region: string;
  country: string;
  latitude: string;
  longitude: string;
  contact_person: string;
  contact_email: string;
  contact_phone: string;
  operating_hours: string;
  materials_handled: Material[];
  monthly_capacity: string;
  has_export_capability: boolean;
  created_at: string;
  updated_at: string;
}

interface ProfileDocument {
  id: string;
  doc_type: DocType;
  file: string;        // server-relative path e.g. /media/profile_docs/...
  file_name: string;
  status: DocumentStatus;
  rejection_reason: string;
  uploaded_at: string;
  reviewed_at: string | null;
}
```

### Core Profile Model

```ts
interface CompanyProfile {
  id: string;
  status: ProfileStatus;
  step1_complete: boolean;
  step2_complete: boolean;
  step3_complete: boolean;
  completion_percentage: number;  // 0 | 33 | 66 | 100
  is_complete: boolean;
  declaration_accepted: boolean;
  submitted_at: string | null;
  reviewed_at: string | null;
  rejection_reason: string;

  // Step 1 — Company Information
  vat_region: VatRegion | "";
  company_registration_no: string;
  vat_registration_no: string;
  company_size: CompanySize | "";
  company_website: string;
  company_description: string;
  year_established: number | null;
  street_address: string;
  address_line_2: string;
  postcode: string;
  city: string;
  state_region: string;
  country: string;

  // Step 2 — Sites
  sites: SiteLocation[];

  // Step 3 — Documents + Declaration + Banking
  documents: ProfileDocument[];
  banking: BankingDetails | null;

  created_at: string;
  updated_at: string;
}
```

### Personal Profile Model (for `PATCH /me/`)

```ts
interface PersonalProfile {
  gender: string;
  date_of_birth: string;  // YYYY-MM-DD
  age?: number;           // read-only, returned by server
  phone_number: string;
  nationality: string;
  occupation: string;
  id_type: string;
  id_number: string;
  address_line1: string;
  address_line2: string;
  city: string;
  region_state: string;
  postal_code: string;
  country: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  bio: string;
  is_profile_complete?: boolean;        // read-only
  missing_required_fields?: string[];   // read-only
  created_at?: string;
  updated_at?: string;
}
```

### Request Payloads

```ts
// PATCH /me/
type UpdatePersonalProfilePayload = Partial<Omit<
  PersonalProfile,
  "age" | "is_profile_complete" | "missing_required_fields" | "created_at" | "updated_at"
>>;

// PATCH /step/1/ — draft save (does NOT mark step complete)
interface Step1DraftPayload {
  company_size?: CompanySize;
  company_website?: string;
  city?: string;
  country?: string;
  street_address?: string;
  postcode?: string;
  state_region?: string;
  // any other step 1 field subset
}

// PUT /step/1/ — full save (marks step complete)
interface Step1SavePayload {
  vat_region: VatRegion;
  company_registration_no: string;
  vat_registration_no: string;
  company_size: CompanySize;
  company_website: string;
  company_description: string;
  year_established: number;
  street_address: string;
  address_line_2: string;
  postcode: string;
  city: string;
  state_region: string;
  country: string;
}

// POST /sites/
interface AddSitePayload {
  site_name: string;
  site_type: SiteType;
  is_primary: boolean;
  street_address: string;
  address_line_2: string;
  postcode: string;
  city: string;
  state_region: string;
  country: string;
  latitude: string;
  longitude: string;
  contact_person: string;
  contact_email: string;
  contact_phone: string;
  operating_hours: string;
  materials_handled: Material[];
  monthly_capacity: string;
  has_export_capability: boolean;
}

// PUT/PATCH /sites/:id/
type UpdateSitePayload = Partial<AddSitePayload>;

// PUT /step/3/
interface Step3Payload {
  declaration_accepted: true;
  banking?: {
    bank_name: string;
    bank_code: string;
    account_name: string;
    account_number: string;
  };
}

// Document upload — multipart/form-data (not JSON)
interface UploadDocumentPayload {
  file: File;
  doc_type: DocType;
}
```

### Response Shapes

```ts
// GET /  →  data: CompanyProfile
interface GetProfileResponse {
  success: true;
  message: string;
  data: CompanyProfile;
}

// PATCH /me/  →  data: PersonalProfile
interface UpdatePersonalProfileResponse {
  success: true;
  message: string;
  data: PersonalProfile;
}

// PATCH /step/1/  →  data: CompanyProfile (step1_complete still false)
// PUT   /step/1/  →  data: CompanyProfile (step1_complete: true, completion_percentage: 33)
// POST  /step/2/complete/  →  data: CompanyProfile (step2_complete: true, completion_percentage: 66)
// PUT   /step/3/  →  data: CompanyProfile (step3_complete: true, completion_percentage: 100)
// POST  /submit/ →  data: CompanyProfile (status: "pending")
// POST  /:id/approve/ →  data: CompanyProfile (status: "verified")
interface ProfileStepResponse {
  success: true;
  message: string;
  data: CompanyProfile;
}

// POST /sites/  →  data: SiteLocation (single object)
// PUT/PATCH /sites/:id/  →  data: SiteLocation (single object)
interface SiteResponse {
  success: true;
  message: string;
  data: SiteLocation;
}

// GET /sites/         →  data: SiteLocation[] (array)
// GET /sites/:id/     →  data: SiteLocation[] (single-element array)
interface ListSitesResponse {
  success: true;
  message: string;
  data: SiteLocation[];
}

// GET /documents/  →  data: ProfileDocument[]
interface ListDocumentsResponse {
  success: true;
  message: string;
  data: ProfileDocument[];
}
```

---

## 2. Service — `services/profile/ProfileService.ts`

- Base URL: `process.env.NEXT_PUBLIC_PROFILE_API` (value: `http://localhost:82/profile`).
- All requests except document upload send and receive `application/json`.
- Document upload sends `multipart/form-data` — do **not** set `Content-Type` manually; let the browser set it with the boundary.
- Every request must include `Authorization: Bearer <accessToken>`. Pass the token as a parameter to each method.
- On non-2xx, throw an `Error` using the body's `message` field if present, otherwise HTTP status text.

### Methods

| Method | HTTP | Endpoint | Payload | Returns |
|---|---|---|---|---|
| `getProfile` | GET | `/` | — | `GetProfileResponse` |
| `updatePersonalProfile` | PATCH | `/me/` | `UpdatePersonalProfilePayload` | `UpdatePersonalProfileResponse` |
| `saveStep1Draft` | PATCH | `/step/1/` | `Step1DraftPayload` | `ProfileStepResponse` |
| `saveStep1` | PUT | `/step/1/` | `Step1SavePayload` | `ProfileStepResponse` |
| `addSite` | POST | `/sites/` | `AddSitePayload` | `SiteResponse` |
| `listSites` | GET | `/sites/` | — | `ListSitesResponse` |
| `getSite` | GET | `/sites/:id/` | — | `ListSitesResponse` |
| `updateSite` | PUT | `/sites/:id/` | `UpdateSitePayload` | `SiteResponse` |
| `patchSite` | PATCH | `/sites/:id/` | `UpdateSitePayload` | `SiteResponse` |
| `completeStep2` | POST | `/step/2/complete/` | — | `ProfileStepResponse` |
| `uploadDocument` | POST | `/documents/` | `UploadDocumentPayload` (FormData) | `{ success: true; message: string; data: ProfileDocument }` |
| `listDocuments` | GET | `/documents/` | — | `ListDocumentsResponse` |
| `saveStep3` | PUT | `/step/3/` | `Step3Payload` | `ProfileStepResponse` |
| `submitProfile` | POST | `/submit/` | — | `ProfileStepResponse` |
| `approveProfile` | POST | `/:profileId/approve/` | — | `ProfileStepResponse` |

---

## 3. Redux Slice — `store/profile/profileSlice.ts`

### State Shape

```ts
interface ProfileState {
  // Company profile (multi-step KYC)
  profile: CompanyProfile | null;

  // Personal profile
  personalProfile: PersonalProfile | null;

  // Sites (kept separately for CRUD convenience)
  sites: SiteLocation[];

  // Documents
  documents: ProfileDocument[];

  // Async status per operation
  status: {
    fetchProfile: "idle" | "loading" | "succeeded" | "failed";
    updatePersonal: "idle" | "loading" | "succeeded" | "failed";
    saveStep1Draft: "idle" | "loading" | "succeeded" | "failed";
    saveStep1: "idle" | "loading" | "succeeded" | "failed";
    addSite: "idle" | "loading" | "succeeded" | "failed";
    updateSite: "idle" | "loading" | "succeeded" | "failed";
    completeStep2: "idle" | "loading" | "succeeded" | "failed";
    uploadDocument: "idle" | "loading" | "succeeded" | "failed";
    saveStep3: "idle" | "loading" | "succeeded" | "failed";
    submitProfile: "idle" | "loading" | "succeeded" | "failed";
    approveProfile: "idle" | "loading" | "succeeded" | "failed";
  };

  errors: {
    fetchProfile: string | null;
    updatePersonal: string | null;
    saveStep1Draft: string | null;
    saveStep1: string | null;
    addSite: string | null;
    updateSite: string | null;
    completeStep2: string | null;
    uploadDocument: string | null;
    saveStep3: string | null;
    submitProfile: string | null;
    approveProfile: string | null;
  };
}
```

### Initial State

All `status` fields start as `"idle"`, all `errors` as `null`, `profile` / `personalProfile` as `null`, `sites` and `documents` as `[]`.

### Synchronous Actions (reducers)

| Action | What it does |
|---|---|
| `clearProfileErrors` | Resets all `errors` fields to `null` |
| `resetProfileState` | Resets entire state to initial (e.g. on logout) |

### Async Action Handlers (extraReducers)

For every thunk: **pending** → `status` to `"loading"`, clear error. **rejected** → `status` to `"failed"`, store message. **fulfilled** → `status` to `"succeeded"` + side-effects below.

| Thunk | State changes on fulfilled |
|---|---|
| `fetchProfileThunk` | Store `data` into `profile`; also sync `sites` and `documents` from `data.sites` / `data.documents` |
| `updatePersonalProfileThunk` | Store `data` into `personalProfile` |
| `saveStep1DraftThunk` | Merge `data` into `profile` |
| `saveStep1Thunk` | Replace `profile` with `data` |
| `addSiteThunk` | Append `data` to `sites`; update `profile.sites` to match |
| `updateSiteThunk` | Replace the matching site in `sites` by `id`; sync `profile.sites` |
| `completeStep2Thunk` | Replace `profile` with `data`; sync `sites` from `data.sites` |
| `uploadDocumentThunk` | Append `data` to `documents`; sync `profile.documents` |
| `saveStep3Thunk` | Replace `profile` with `data`; sync `documents` from `data.documents` |
| `submitProfileThunk` | Replace `profile` with `data` (status becomes `"pending"`) |
| `approveProfileThunk` | Replace `profile` with `data` (status becomes `"verified"`) |

---

## 4. Thunks — `store/profile/profileThunks.ts`

| Thunk name | Action type string | Argument |
|---|---|---|
| `fetchProfileThunk` | `"profile/fetch"` | `{ token: string }` |
| `updatePersonalProfileThunk` | `"profile/updatePersonal"` | `{ token: string } & UpdatePersonalProfilePayload` |
| `saveStep1DraftThunk` | `"profile/saveStep1Draft"` | `{ token: string } & Step1DraftPayload` |
| `saveStep1Thunk` | `"profile/saveStep1"` | `{ token: string } & Step1SavePayload` |
| `addSiteThunk` | `"profile/addSite"` | `{ token: string } & AddSitePayload` |
| `updateSiteThunk` | `"profile/updateSite"` | `{ token: string; siteId: string } & UpdateSitePayload` |
| `completeStep2Thunk` | `"profile/completeStep2"` | `{ token: string }` |
| `uploadDocumentThunk` | `"profile/uploadDocument"` | `{ token: string; file: File; doc_type: DocType }` |
| `saveStep3Thunk` | `"profile/saveStep3"` | `{ token: string } & Step3Payload` |
| `submitProfileThunk` | `"profile/submit"` | `{ token: string }` |
| `approveProfileThunk` | `"profile/approve"` | `{ token: string; profileId: string }` |

> Destructure `token` inside each thunk before calling the service; do not include it in the request body.

---

## 5. Selectors — `store/profile/profileSelectors.ts`

| Selector | Returns |
|---|---|
| `selectProfile` | `ProfileState["profile"]` |
| `selectPersonalProfile` | `ProfileState["personalProfile"]` |
| `selectSites` | `ProfileState["sites"]` |
| `selectPrimarySite` | `SiteLocation \| undefined` — first site where `is_primary === true` |
| `selectDocuments` | `ProfileState["documents"]` |
| `selectDocumentByType(type)` | `ProfileDocument \| undefined` — first doc matching `doc_type` |
| `selectCompletionPercentage` | `profile?.completion_percentage ?? 0` |
| `selectProfileStatus` | `profile?.status ?? "incomplete"` |
| `selectIsProfileComplete` | `profile?.is_complete ?? false` |
| `selectStep1Complete` | `profile?.step1_complete ?? false` |
| `selectStep2Complete` | `profile?.step2_complete ?? false` |
| `selectStep3Complete` | `profile?.step3_complete ?? false` |
| `selectProfileOpStatus(operation)` | `ProfileState["status"][operation]` |
| `selectProfileError(operation)` | `ProfileState["errors"][operation]` |

---

## 6. Store — `store/index.ts`

Register the profile reducer under the key `"profile"` alongside `"auth"`.

```ts
{
  auth: authReducer,
  profile: profileReducer,
}
```

---

## Notes

### HTTP method distinction for Step 1
- `PATCH /step/1/` is a **draft save** — partial payload, does **not** set `step1_complete: true`.
- `PUT /step/1/` is a **full save** — complete payload, sets `step1_complete: true` and bumps `completion_percentage` to `33`.

### Step 2 flow
Sites are managed independently via `/sites/` CRUD. Step 2 is only marked complete by calling `POST /step/2/complete/` — adding a site alone does not advance the step. At least one site must exist before calling complete.

### Required documents for Step 3
Three documents are required before Step 3 can be completed. They must be uploaded individually:
- `business_registration`
- `representative_id`
- `proof_of_authority`

Each is a separate `POST /documents/` call with `multipart/form-data`.

### Step 3 minimum payload
`declaration_accepted: true` is the only required field. `banking` is optional but recommended.

### Profile status lifecycle
```
incomplete → pending (after /submit/) → verified (after /approve/) 
                                      → rejected (admin rejects)
```
Once `status` is `"pending"` or `"verified"`, editing is locked on the frontend.

### Token forwarding
Pass `selectAccessToken` from the auth selectors into every profile thunk argument. The profile module does not manage tokens itself.

### Site response envelope inconsistency
- `POST /sites/` and `PUT/PATCH /sites/:id/` return `data` as a **single `SiteLocation` object**.
- `GET /sites/` and `GET /sites/:id/` return `data` as a **`SiteLocation[]` array** (even for a single site by ID).

Handle this difference in the service methods, not in the thunks.