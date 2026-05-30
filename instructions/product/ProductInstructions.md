# Products App — API Reference

## Base Configuration

| Key | Value |
|-----|-------|
| Base URL | `http://localhost:82/api/products` |
| Auth Header | `Authorization: Bearer <access_token>` |

All endpoints require a Bearer token. All responses follow this envelope:

```json
{
  "success": true,
  "message": "Human-readable message",
  "data": {}
}
```

---

## Overview

The API supports two listing types:

| Type | `listing_type` value | Description |
|------|----------------------|-------------|
| Sell Offer | `"sell"` | Seller advertising material for sale |
| Buy Request | `"buy"` | Buyer posting a material requirement |

Both flows share identical endpoints. The only difference is the `listing_type` field.

---

## Recommended Listing Creation Flow

```
Step 1 → Create listing as draft
Step 2 → Upload at least one image
Step 3 → Listing auto-activates (trigger PATCH after first image upload)
Step 4 → Optionally upload specifications (MSDS, lab reports, etc.)
```

> **UX Tip:** Don't expose an "Activate" button. After the first successful image upload, automatically call the activate endpoint. This creates a smoother, lower-friction experience.

---

## Endpoints

### 1. Create Listing

```http
POST /api/products/
```

Creates a new listing in `draft` state.

**Request Body**

```json
{
  "listing_type": "sell",
  "status": "draft",
  "material_type": "hdpe",
  "material_name": "HDPE Natural Regrind Drums",
  "average_weight_per_load_mt": "4.50",
  "quantity_available_mt": "98.00",
  "material_location_country": "Nigeria",
  "availability_status": "available_now",
  "description": "Natural HDPE regrind sourced from industrial drums. Consistent MFI, low contamination. Suitable for pipe and container manufacturing.",
  "seller_notes": "Packed in 1MT jumbo bags. Full container loads preferred. Inspection welcome.",
  "mfi_value": "8.500"
}
```

**Fields**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `listing_type` | string | ✅ | `"sell"` or `"buy"` |
| `status` | string | ✅ | Always `"draft"` on creation |
| `material_type` | string | ✅ | e.g. `"hdpe"`, `"pet"`, `"pvc"` |
| `material_name` | string | ✅ | Display name of the material |
| `average_weight_per_load_mt` | decimal string | ✅ | Average load weight in metric tonnes |
| `quantity_available_mt` | decimal string | ✅ | Total available quantity in metric tonnes |
| `material_location_country` | string | ✅ | Country where material is located |
| `availability_status` | string | ✅ | `"available_now"` or `"ongoing"` |
| `description` | string | ✅ | Full product description |
| `seller_notes` | string | ➖ | Notes visible to buyers |
| `mfi_value` | decimal string | ➖ | Melt Flow Index value |

**Response `201`**

```json
{
  "success": true,
  "message": "Listing created.",
  "data": {
    "id": "e5803571-7766-487a-8754-0fb4a135345c",
    "owner": "082f0192-54e5-486b-99b0-32a251a93b85",
    "listing_type": "sell",
    "status": "draft",
    "material_type": "hdpe",
    "material_name": "HDPE Natural Regrind Drums",
    "number_of_loads": 22,
    "average_weight_per_load_mt": "4.50",
    "quantity_available_mt": "98.00",
    "remaining_loads": 22,
    "material_location_country": "Nigeria",
    "availability_status": "available_now",
    "description": "Natural HDPE regrind sourced from industrial drums...",
    "seller_notes": "Packed in 1MT jumbo bags...",
    "mfi_value": "8.500",
    "seller_verified_snapshot": true,
    "images": [],
    "specifications": [],
    "listed_at": "2026-05-29T10:18:24.039015Z",
    "updated_at": "2026-05-29T10:18:24.039015Z"
  }
}
```

---

### 2. Upload Listing Image

```http
POST /api/products/{listing_id}/images/
Content-Type: multipart/form-data
```

**Request Fields**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `image` | file | ✅ | Image file |
| `caption` | string | ➖ | Image caption |
| `is_primary` | boolean | ➖ | Set as primary image |
| `sort_order` | integer | ➖ | Display order |

**Response `201`**

```json
{
  "success": true,
  "message": "Listing image uploaded.",
  "data": {
    "id": "7a7e3beb-288c-4b3c-92d5-3bbdcf18e68f",
    "image_url": "http://localhost/media/products/images/product1_9TfrTV3.png",
    "caption": "Front Image",
    "is_primary": true,
    "sort_order": 0,
    "created_at": "2026-05-29T10:20:48.374672Z"
  }
}
```

**UX Notes**
- Auto-set `is_primary: true` on the first uploaded image
- After the first successful upload, immediately trigger the activate endpoint (Step 3)
- Support multiple image uploads, drag-and-drop, and upload progress indicators

---

### 3. Activate Listing

```http
PATCH /api/products/{listing_id}/
```

Transitions a listing from `draft` → `active`. Must be called after at least one image is uploaded.

**Request Body**

```json
{
  "status": "active"
}
```

**Response `200`**

```json
{
  "success": true,
  "message": "Listing updated.",
  "data": {
    "id": "e5803571-7766-487a-8754-0fb4a135345c",
    "status": "active",
    "images": [
      {
        "id": "7a7e3beb-288c-4b3c-92d5-3bbdcf18e68f",
        "image_url": "http://localhost/media/products/images/product1_9TfrTV3.png",
        "caption": "Front Image",
        "is_primary": true,
        "sort_order": 0
      }
    ],
    "updated_at": "2026-05-29T10:20:53.072726Z"
  }
}
```

> **Activation Rules:** The listing must have at least one image and all required fields complete before activating.

---

### 4. Get Listing by ID

```http
GET /api/products/{listing_id}/
```

Returns the full listing object including images, specifications, seller verification snapshot, and all metadata. Response structure matches the create/activate responses above.

---

### 5. Upload Specification

```http
POST /api/products/{listing_id}/specifications/
Content-Type: multipart/form-data
```

Attach supporting documents to a listing — MSDS, lab reports, quality certificates, technical specs, etc.

**Request Fields**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | ✅ | Document title |
| `document` | file | ✅ | The file to upload |
| `description` | string | ➖ | Additional context |

**Response `201`**

```json
{
  "success": true,
  "message": "Specification uploaded.",
  "data": {
    "id": "0b8f1ff4-ee55-4fde-82d6-cc7af7a9fb3d",
    "title": "Material Safety Data Sheet",
    "document_url": "http://localhost/media/products/specifications/file.docx",
    "description": "MSDS for PVC Regrind Grade",
    "uploaded_by": "e3963c66-de2a-4565-8353-f1b2ff377a46",
    "created_at": "2026-05-25T09:11:48.255219Z"
  }
}
```

---

### 6. List My Listings

```http
GET /api/products/?mine=true
```

Returns all listings created by the authenticated user.

**Response `200`**

```json
{
  "success": true,
  "pagination": {
    "count": 2,
    "total_pages": 1,
    "current_page": 1,
    "next": null,
    "previous": null
  },
  "results": [
    {
      "id": "e5803571-7766-487a-8754-0fb4a135345c",
      "listing_type": "sell",
      "status": "active",
      "material_type": "hdpe",
      "material_name": "HDPE Natural Regrind Drums",
      "number_of_loads": 22,
      "average_weight_per_load_mt": "4.50",
      "quantity_available_mt": "48.00",
      "remaining_loads": 10,
      "material_location_country": "Nigeria",
      "availability_status": "available_now",
      "primary_image_url": "http://localhost/media/products/images/product1_9TfrTV3.png",
      "images_count": 1,
      "seller_verified_snapshot": true,
      "listed_at": "2026-05-29T10:18:24.039015Z"
    }
  ]
}
```

**Result Fields**

| Field | Description |
|-------|-------------|
| `id` | Listing UUID |
| `listing_type` | `"sell"` or `"buy"` |
| `status` | Current status (`draft`, `active`) |
| `material_type` | Material category |
| `material_name` | Display name |
| `number_of_loads` | Computed load count |
| `average_weight_per_load_mt` | Per-load weight |
| `quantity_available_mt` | Total quantity |
| `remaining_loads` | Remaining inventory |
| `material_location_country` | Country |
| `availability_status` | `available_now` or `ongoing` |
| `primary_image_url` | Primary image URL |
| `images_count` | Total attached images |
| `seller_verified_snapshot` | Seller verification state at time of listing |
| `listed_at` | Creation timestamp |

---

### 6a. List All Listings

```http
GET /api/products/
```

Returns all publicly visible listings (both `sell` and `buy`). Supports pagination.

**Response `200`** — same structure as [List My Listings](#6-list-my-listings), with results from all users.

---

## Buy Request Flow

Identical to the Sell Offer flow. Set `listing_type` to `"buy"` and proceed through the same steps.

**Example payload:**

```json
{
  "listing_type": "buy",
  "status": "draft",
  "material_type": "pet",
  "material_name": "PET Bottle Flakes Clear Grade A",
  "average_weight_per_load_mt": "3.00",
  "quantity_available_mt": "25.00",
  "material_location_country": "Ghana",
  "availability_status": "available_now",
  "description": "Looking for premium PET bottle flakes.",
  "seller_notes": "Consistent supply preferred."
}
```

---

## Quick Reference

| Action | Method | Endpoint |
|--------|--------|----------|
| Create listing | `POST` | `/api/products/` |
| Upload image | `POST` | `/api/products/{id}/images/` |
| Activate listing | `PATCH` | `/api/products/{id}/` |
| Get listing | `GET` | `/api/products/{id}/` |
| Upload specification | `POST` | `/api/products/{id}/specifications/` |
| My listings | `GET` | `/api/products/?mine=true` |
| All listings | `GET` | `/api/products/` |