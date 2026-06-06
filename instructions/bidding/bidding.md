# Bidding API Reference

Base REST path: `/api/bidding/`

Base websocket path: `/ws/bidding/`

All REST endpoints require authentication with:

```http
Authorization: Bearer <access_token>
```

Websocket connections accept the same access token as a query parameter:

```text
ws://<host>/ws/bidding/enquiries/<enquiry_id>/?token=<access_token>
```

## Response Envelope

Successful REST responses use this shape:

```json
{
  "success": true,
  "message": "OK",
  "data": {}
}
```

`data` is omitted when there is no response body.

Created resources return HTTP `201` with the same envelope.

Validation and permission errors are handled by the project exception handler and generally use:

```json
{
  "success": false,
  "error": {
    "code": "validation_error",
    "message": "Validation error",
    "detail": {}
  }
}
```

## Common Values

Enquiry statuses:

```text
pending, countered, accepted, declined, withdrawn, expired
```

Enquiry units:

```text
mt, kg, lt, load, unit
```

Trade statuses:

```text
negotiating, agreed, contract_sent, contract_signed, in_progress, completed, cancelled, disputed
```

Inspection statuses:

```text
not_requested, requested, scheduled, in_progress, passed, failed
```

Cancellation reasons:

```text
buyer_request, seller_request, admin_decision, payment_failed, logistics_failed, other
```

Trade document types:

```text
contract, quality_cert, delivery_note, invoice, weighbridge, photo_evidence, customs_doc, insurance, other
```

Inspection verdicts:

```text
passed, failed
```

Inspection recommendations:

```text
proceed, renegotiate, cancel
```

## Permissions

Verified marketplace users can list/create enquiries and trades relevant to them. A verified marketplace user must be active, verified, and have one of these roles:

```text
buyer, seller, both, admin
```

Enquiry participants are:

- The enquiry initiator.
- The listing owner.
- Admin users.

Trade participants are:

- The buyer.
- The seller.
- Admin users.

For sell listings, the enquiry initiator is the buyer and the listing owner is the seller. For buy-request listings, the listing owner is the buyer and the enquiry initiator is the seller.

## Enquiries

### List Enquiries

```http
GET /api/bidding/enquiries/
```

Query parameters:

| Name | Values | Notes |
| --- | --- | --- |
| `role` | `buyer`, `seller` | Filters by the user's role in the enquiry. |
| `participant` | `initiator`, `listing_owner`, `owner` | Filters by participation side. |
| `status` | enquiry status | Filters by enquiry status. |
| `listing_id` | UUID | Filters to a listing. |

Response `data` is a list of enquiry summaries:

```json
{
  "success": true,
  "message": "OK",
  "data": [
    {
      "id": "00000000-0000-0000-0000-000000000000",
      "reference": "ENQ-2026-00001",
      "listing_id": "00000000-0000-0000-0000-000000000000",
      "listing_name": "PET flakes",
      "listing_type": "sell",
      "initiator_name": "Buyer Name",
      "initiator_email": "buyer@example.com",
      "initiator_role": "buyer",
      "listing_owner_name": "Seller Name",
      "listing_owner_email": "seller@example.com",
      "listing_owner_role": "seller",
      "buyer_name": "Buyer Name",
      "buyer_email": "buyer@example.com",
      "seller_name": "Seller Name",
      "seller_email": "seller@example.com",
      "status": "pending",
      "quantity": "10.00",
      "unit": "mt",
      "proposed_price_per_unit": "1200.00",
      "currency": "GHS",
      "total_value": "12000.00",
      "created_at": "2026-06-03T10:00:00Z",
      "updated_at": "2026-06-03T10:00:00Z"
    }
  ]
}
```

### Create Enquiry

```http
POST /api/bidding/enquiries/
Content-Type: application/json
```

Request body:

```json
{
  "listing_id": "00000000-0000-0000-0000-000000000000",
  "quantity": "10.00",
  "unit": "mt",
  "proposed_price_per_unit": "1200.00",
  "currency": "GHS",
  "message": "Interested in this material.",
  "delivery_terms": "EXW",
  "delivery_address": "Accra",
  "target_delivery_date": "2026-06-20"
}
```

Required fields:

```text
listing_id, quantity, unit
```

Optional fields:

```text
proposed_price_per_unit, currency, message, delivery_terms, delivery_address, target_delivery_date
```

Response: `201 Created`

```json
{
  "success": true,
  "message": "Enquiry submitted successfully.",
  "data": {
    "id": "00000000-0000-0000-0000-000000000000",
    "reference": "ENQ-2026-00001",
    "listing_id": "00000000-0000-0000-0000-000000000000",
    "listing_name": "PET flakes",
    "listing_type": "sell",
    "status": "pending",
    "quantity": "10.00",
    "unit": "mt",
    "proposed_price_per_unit": "1200.00",
    "currency": "GHS",
    "total_value": "12000.00",
    "message": "Interested in this material.",
    "delivery_terms": "EXW",
    "delivery_address": "Accra",
    "target_delivery_date": "2026-06-20",
    "counter_price_per_unit": null,
    "counter_quantity": null,
    "counter_message": "",
    "countered_at": null,
    "decline_reason": "",
    "responded_at": null,
    "expires_at": null,
    "has_trade": false,
    "trade_id": null,
    "created_at": "2026-06-03T10:00:00Z",
    "updated_at": "2026-06-03T10:00:00Z"
  }
}
```

### Get Enquiry Detail

```http
GET /api/bidding/enquiries/<enquiry_id>/
```

Response `data` uses the same detail shape as create enquiry.

### Enquiry Actions

All enquiry actions use:

```http
POST /api/bidding/enquiries/<enquiry_id>/<action>/
```

#### Accept Enquiry

Action: `accept`

Only the listing owner can accept. Creates a trade.

Request body:

```json
{}
```

Response: `201 Created`

```json
{
  "success": true,
  "message": "Enquiry accepted. Trade created.",
  "data": {
    "id": "00000000-0000-0000-0000-000000000000",
    "reference": "TRD-2026-00001",
    "status": "negotiating"
  }
}
```

The actual `data` object is a full trade detail object.

#### Decline Enquiry

Action: `decline`

Request body:

```json
{
  "reason": "Price is too low."
}
```

Response:

```json
{
  "success": true,
  "message": "Enquiry declined."
}
```

#### Counter Enquiry

Action: `counter`

At least one of `counter_price_per_unit` or `counter_message` is required.

Request body:

```json
{
  "counter_price_per_unit": "1350.00",
  "counter_quantity": "8.00",
  "counter_message": "Can do 8 MT at this price."
}
```

Response:

```json
{
  "success": true,
  "message": "Counter offer sent.",
  "data": {
    "id": "00000000-0000-0000-0000-000000000000",
    "status": "countered",
    "counter_price_per_unit": "1350.00",
    "counter_quantity": "8.00",
    "counter_message": "Can do 8 MT at this price."
  }
}
```

The actual `data` object is a full enquiry detail object.

#### Withdraw Enquiry

Action: `withdraw`

Only the initiator can withdraw.

Request body:

```json
{}
```

Response:

```json
{
  "success": true,
  "message": "Enquiry withdrawn."
}
```

#### Accept Counter

Action: `accept-counter`

Only the initiator can accept a counter offer. Creates a trade.

Request body:

```json
{}
```

Response: `201 Created`

```json
{
  "success": true,
  "message": "Counter offer accepted. Trade created.",
  "data": {
    "id": "00000000-0000-0000-0000-000000000000",
    "reference": "TRD-2026-00001",
    "status": "negotiating"
  }
}
```

The actual `data` object is a full trade detail object.

## Enquiry Messages

### List Enquiry Messages

```http
GET /api/bidding/enquiries/<enquiry_id>/messages/
```

Marks unread messages as read for the requesting participant.

Response:

```json
{
  "success": true,
  "message": "OK",
  "data": [
    {
      "id": "00000000-0000-0000-0000-000000000000",
      "sender_name": "Buyer Name",
      "sender_role": "buyer",
      "body": "Can you confirm availability?",
      "attachment_url": null,
      "attachment_name": "",
      "is_read_by_buyer": true,
      "is_read_by_seller": false,
      "created_at": "2026-06-03T10:00:00Z"
    }
  ]
}
```

### Create Enquiry Message

```http
POST /api/bidding/enquiries/<enquiry_id>/messages/
Content-Type: multipart/form-data
```

Request fields:

| Name | Type | Required | Notes |
| --- | --- | --- | --- |
| `body` | string | yes | Minimum length 1. |
| `attachment` | file | no | Optional attachment. |

Response: `201 Created`

```json
{
  "success": true,
  "message": "Message sent.",
  "data": {
    "id": "00000000-0000-0000-0000-000000000000",
    "sender_name": "Buyer Name",
    "sender_role": "buyer",
    "body": "Can you confirm availability?",
    "attachment_url": null,
    "attachment_name": "",
    "is_read_by_buyer": true,
    "is_read_by_seller": false,
    "created_at": "2026-06-03T10:00:00Z"
  }
}
```

## Trades

### List Trades

```http
GET /api/bidding/trades/
```

Query parameters:

| Name | Values | Notes |
| --- | --- | --- |
| `role` | `buyer`, `seller` | Filters by buyer/seller side for non-admin users. |
| `status` | trade status | Filters by trade status. |

Response `data` is a list of trade summaries:

```json
{
  "success": true,
  "message": "OK",
  "data": [
    {
      "id": "00000000-0000-0000-0000-000000000000",
      "reference": "TRD-2026-00001",
      "listing_name": "PET flakes",
      "listing_type": "sell",
      "buyer_name": "Buyer Name",
      "seller_name": "Seller Name",
      "status": "negotiating",
      "quantity": "10.00",
      "unit": "mt",
      "price_per_unit": "1200.00",
      "currency": "GHS",
      "total_value": "12000.00",
      "target_delivery_date": "2026-06-20",
      "created_at": "2026-06-03T10:00:00Z",
      "updated_at": "2026-06-03T10:00:00Z"
    }
  ]
}
```

### Get Trade Detail

```http
GET /api/bidding/trades/<trade_id>/
```

Response:

```json
{
  "success": true,
  "message": "OK",
  "data": {
    "id": "00000000-0000-0000-0000-000000000000",
    "reference": "TRD-2026-00001",
    "listing_id": "00000000-0000-0000-0000-000000000000",
    "listing_name": "PET flakes",
    "listing_type": "sell",
    "buyer_name": "Buyer Name",
    "buyer_email": "buyer@example.com",
    "seller_name": "Seller Name",
    "seller_email": "seller@example.com",
    "status": "negotiating",
    "quantity": "10.00",
    "unit": "mt",
    "price_per_unit": "1200.00",
    "currency": "GHS",
    "total_value": "12000.00",
    "delivery_terms": "EXW",
    "delivery_address": "Accra",
    "target_delivery_date": "2026-06-20",
    "terms_locked_at": null,
    "contract_url": null,
    "contract_sent_at": null,
    "contract_signed_at": null,
    "inspection_required": false,
    "inspection_status": "not_requested",
    "inspection_requested_at": null,
    "inspection_scheduled_for": null,
    "inspection_completed_at": null,
    "inspection_assigned_to_name": null,
    "inspection_report": null,
    "tracking_reference": "",
    "estimated_arrival": null,
    "actual_arrival": null,
    "completed_at": null,
    "completion_notes": "",
    "cancellation_reason": "",
    "cancellation_notes": "",
    "cancelled_at": null,
    "dispute_reason": "",
    "disputed_at": null,
    "dispute_resolved_at": null,
    "dispute_resolution": "",
    "payment_summary": {},
    "admin_notes": "",
    "status_logs": [],
    "documents": [],
    "created_at": "2026-06-03T10:00:00Z",
    "updated_at": "2026-06-03T10:00:00Z"
  }
}
```

## Trade Actions

All trade actions use:

```http
POST /api/bidding/trades/<trade_id>/<action>/
```

### Agree Terms

Action: `agree`

Request body:

```json
{}
```

Response:

```json
{
  "success": true,
  "message": "Terms agreed.",
  "data": {}
}
```

The `data` object is a full trade detail object.

### Send Contract

Action: `send-contract`

```http
POST /api/bidding/trades/<trade_id>/send-contract/
Content-Type: multipart/form-data
```

Request fields:

| Name | Type | Required |
| --- | --- | --- |
| `contract` | file | yes |

Response:

```json
{
  "success": true,
  "message": "Contract sent."
}
```

### Sign Contract

Action: `sign-contract`

Only the buyer can sign. The trade payment must already be completed. See the [Trade Payment Flow](#2-trade-payment-flow-split-payment) section for details.

Request body:

```json
{}
```

Response:

```json
{
  "success": true,
  "message": "Contract signed."
}
```

### Mark In Progress

Action: `mark-in-progress`

Request body:

```json
{
  "tracking_reference": "TRACK-123",
  "estimated_arrival": "2026-06-25"
}
```

Response:

```json
{
  "success": true,
  "message": "Trade marked as in progress."
}
```

### Complete Trade

Action: `complete`

Request body:

```json
{
  "notes": "Delivered and confirmed."
}
```

Response:

```json
{
  "success": true,
  "message": "Trade completed."
}
```

### Cancel Trade

Action: `cancel`

Request body:

```json
{
  "reason": "Logistics provider failed to collect.",
  "cancellation_reason": "logistics_failed"
}
```

`reason` must be at least 5 characters.

Response:

```json
{
  "success": true,
  "message": "Trade cancelled."
}
```

### Raise Dispute

Action: `dispute`

Request body:

```json
{
  "reason": "Delivered material does not match the agreed quality."
}
```

`reason` must be at least 10 characters.

Response:

```json
{
  "success": true,
  "message": "Dispute raised. Our team will review shortly."
}
```

### Resolve Dispute

Action: `resolve-dispute`

Admin only.

Request body:

```json
{
  "resolution": "Buyer and seller agreed to renegotiate price."
}
```

`resolution` must be at least 10 characters.

Response:

```json
{
  "success": true,
  "message": "Dispute resolved."
}
```

### Request Inspection

Action: `request-inspection`

Only the buyer can request inspection. The action initiates the inspection fee payment. See the [Inspection Fee Payment Flow](#1-inspection-fee-payment-flow) section for details on how to complete and verify this payment.

```http
POST /api/bidding/trades/<trade_id>/request-inspection/
```

By default, inspection is requested. To skip inspection through this endpoint:

```http
POST /api/bidding/trades/<trade_id>/request-inspection/?required=false
```

Response when requesting inspection: `201 Created`

```json
{
  "success": true,
  "message": "Inspection requested. Complete the payment to confirm.",
  "data": {
    "trade": {},
    "inspection_fee_payment": {}
  }
}
```

`trade` is a full trade detail object. `inspection_fee_payment` is serialized by the payments app.

### Skip Inspection

Action: `skip-inspection`

Request body:

```json
{}
```

Response:

```json
{
  "success": true,
  "message": "Inspection skipped.",
  "data": {}
}
```

The `data` object is a full trade detail object.

### Schedule Inspection

Action: `schedule-inspection`

Admin only.

Request body:

```json
{
  "scheduled_for": "2026-06-10T09:00:00Z",
  "inspector_id": "00000000-0000-0000-0000-000000000000"
}
```

`inspector_id` is optional.

Response:

```json
{
  "success": true,
  "message": "Inspection scheduled.",
  "data": {}
}
```

The `data` object is a full trade detail object.

### Start Inspection

Action: `start-inspection`

Admin only.

Request body:

```json
{}
```

Response:

```json
{
  "success": true,
  "message": "Inspection started.",
  "data": {}
}
```

The `data` object is a full trade detail object.

### Complete Inspection

Action: `complete-inspection`

Admin only.

```http
POST /api/bidding/trades/<trade_id>/complete-inspection/
Content-Type: multipart/form-data
```

Request fields:

| Name | Type | Required | Values |
| --- | --- | --- | --- |
| `verdict` | string | yes | `passed`, `failed` |
| `summary` | string | yes | Minimum length 10. |
| `findings` | string | no | Any text. |
| `recommendation` | string | no | `proceed`, `renegotiate`, `cancel` |
| `report_document` | file | no | Inspection report file. |

Response:

```json
{
  "success": true,
  "message": "Inspection completed and report submitted.",
  "data": {}
}
```

The `data` object is a full trade detail object.

### Approve Inspection

Action: `approve-inspection`

Only the buyer can approve after a passed inspection.

Request body:

```json
{}
```

Response:

```json
{
  "success": true,
  "message": "Inspection approved by buyer."
}
```

### Reject Inspection

Action: `reject-inspection`

Only the buyer can reject after an inspection has completed.

Request body:

```json
{
  "reason": "Moisture level is above the agreed threshold."
}
```

Response:

```json
{
  "success": true,
  "message": "Inspection rejected; trade moved to renegotiation.",
  "data": {}
}
```

The `data` object is a full trade detail object.

### Update Admin Notes

```http
PATCH /api/bidding/trades/<trade_id>/admin-notes/
```

Admin only.

Request body:

```json
{
  "admin_notes": "Internal follow-up notes."
}
```

Response:

```json
{
  "success": true,
  "message": "Admin notes updated."
}
```

## Trade Messages

### List Trade Messages

```http
GET /api/bidding/trades/<trade_id>/messages/
```

Marks unread messages as read for the requesting participant. Non-admin users do not receive internal admin messages.

Response:

```json
{
  "success": true,
  "message": "OK",
  "data": [
    {
      "id": "00000000-0000-0000-0000-000000000000",
      "sender_name": "Buyer Name",
      "sender_role": "buyer",
      "body": "Can you share the contract?",
      "attachment_url": null,
      "attachment_name": "",
      "is_internal": false,
      "is_read_by_buyer": true,
      "is_read_by_seller": false,
      "is_read_by_admin": false,
      "created_at": "2026-06-03T10:00:00Z"
    }
  ]
}
```

### Create Trade Message

```http
POST /api/bidding/trades/<trade_id>/messages/
Content-Type: multipart/form-data
```

Request fields:

| Name | Type | Required | Notes |
| --- | --- | --- | --- |
| `body` | string | yes | Minimum length 1. |
| `attachment` | file | no | Optional attachment. |
| `is_internal` | boolean | no | Admin-only internal note. Defaults to `false`. |

Response: `201 Created`

```json
{
  "success": true,
  "message": "Message sent.",
  "data": {
    "id": "00000000-0000-0000-0000-000000000000",
    "sender_name": "Buyer Name",
    "sender_role": "buyer",
    "body": "Can you share the contract?",
    "attachment_url": null,
    "attachment_name": "",
    "is_internal": false,
    "is_read_by_buyer": true,
    "is_read_by_seller": false,
    "is_read_by_admin": false,
    "created_at": "2026-06-03T10:00:00Z"
  }
}
```

## Trade Documents

### List Trade Documents

```http
GET /api/bidding/trades/<trade_id>/documents/
```

Response:

```json
{
  "success": true,
  "message": "OK",
  "data": [
    {
      "id": "00000000-0000-0000-0000-000000000000",
      "doc_type": "invoice",
      "title": "Invoice",
      "file_url": "https://example.com/media/bidding/trade_documents/file.pdf",
      "file_name": "file.pdf",
      "uploaded_by_name": "Seller Name",
      "notes": "",
      "created_at": "2026-06-03T10:00:00Z"
    }
  ]
}
```

### Upload Trade Document

```http
POST /api/bidding/trades/<trade_id>/documents/
Content-Type: multipart/form-data
```

Documents cannot be uploaded to a completed or cancelled trade.

Request fields:

| Name | Type | Required | Notes |
| --- | --- | --- | --- |
| `doc_type` | string | no | Defaults to `other`. |
| `title` | string | no | Display title. |
| `file` | file | yes | Maximum size 25 MB. |
| `notes` | string | no | Any text. |

Response: `201 Created`

```json
{
  "success": true,
  "message": "Document uploaded.",
  "data": {
    "id": "00000000-0000-0000-0000-000000000000",
    "doc_type": "invoice",
    "title": "Invoice",
    "file_url": "https://example.com/media/bidding/trade_documents/file.pdf",
    "file_name": "file.pdf",
    "uploaded_by_name": "Seller Name",
    "notes": "",
    "created_at": "2026-06-03T10:00:00Z"
  }
}
```

## Admin

### Bidding Overview

```http
GET /api/bidding/admin/overview/
```

Admin only.

Response:

```json
{
  "success": true,
  "message": "OK",
  "data": {
    "enquiries": {
      "pending": 3,
      "countered": 1,
      "accepted": 5,
      "declined": 2,
      "withdrawn": 0,
      "expired": 1
    },
    "trades": {
      "negotiating": 2,
      "agreed": 1,
      "contract_sent": 1,
      "contract_signed": 0,
      "in_progress": 0,
      "completed": 4,
      "cancelled": 1,
      "disputed": 1
    },
    "pending_disputes": 1
  }
}
```

## Payment Flows

The bidding platform integrates with a split-payment system via Paystack to handle the inspection fee and the final trade payment (which includes both the product cost and the platform's service fee).

All payment endpoints are mounted under the `/api/payments/` namespace.

---

### 1. Inspection Fee Payment Flow

When a buyer requests an inspection for a trade in the `agreed` status, an inspection fee payment is automatically initiated.

#### Step 1: Request Inspection
The buyer triggers the inspection request.
* **Endpoint**: `POST /api/bidding/trades/<trade_id>/request-inspection/`
* **Preconditions**:
  * The caller must be the trade buyer.
  * Trade status must be `agreed`.
  * `inspection_status` must be `not_requested`.
* **Behavior**:
  * An `inspection_fee` payment record is created in the `initiated` state.
  * The inspection amount is a flat rate set on the server (e.g., `25.00 GHS`).
  * The trade's `inspection_status` is updated to `requested`, and `inspection_required` is set to `true`.
* **Response**: Returns the updated trade object and the initiated `inspection_fee_payment` details.

```json
{
  "success": true,
  "message": "Inspection requested. Complete the payment to confirm.",
  "data": {
    "trade": { ... },
    "inspection_fee_payment": {
      "id": "uuid",
      "payment_type": "inspection_fee",
      "status": "initiated",
      "currency": "GHS",
      "amount_major": "25.00",
      "paystack_reference": "INSPAY-20260604-...",
      "paystack_authorization_url": "https://checkout.paystack.com/..."
    }
  }
}
```

#### Step 2: Customer Redirection & Payment
* The client application redirects the buyer to `paystack_authorization_url` to complete the transaction.

#### Step 3: Verification
* Once the payment is completed, Paystack sends a webhook to `POST /api/payments/webhook/paystack/`.
* Alternatively, the client can manually verify the payment by polling or checking:
  * **Endpoint**: `POST /api/payments/verify-reference/?reference=<paystack_reference>` (Method: `POST`)
* When verified, the payment status changes to `success`.
* Once the inspection fee payment is `success`, the platform admin can schedule the inspection via the `schedule-inspection` action.

---

### 2. Trade Payment Flow (Split Payment)

Before a contract can be signed by the buyer, the buyer must make the full trade payment. This payment combines the **Product Amount** and the **Platform Fee** into a single transaction. It utilizes Paystack's split-payment features to automatically route the product cost to the seller's bank account while retaining the platform fee in the main platform account.

#### Precondition: Seller Subaccount Creation
For the split payment to succeed, the seller must have active banking details set up on their verified profile. 
When the trade payment is initiated, the system checks or automatically creates an active subaccount for the seller on Paystack (`PaystackSubaccount`). If the seller hasn't completed their banking setup, initiation will fail with an error.
You can query the current user's subaccount details using:
* **Endpoint**: `GET /api/payments/subaccount/me/`

#### Step 1: Initiate Trade Payment
The buyer initiates the payment transaction.
* **Endpoint**: `POST /api/payments/trades/<trade_id>/initiate-trade-payment/`
* **Headers**: `Authorization: Bearer <access_token>`
* **Request Body**:
  ```json
  {
    "callback_url": "https://yourfrontend.com/payment-callback"
  }
  ```
  *(The `callback_url` is optional. If not provided, a default url configured on the server is used).*
* **Preconditions**:
  * The caller must be the trade buyer.
  * Trade status must be `contract_sent`.
  * The seller must have an active Paystack subaccount linked.
* **Response**: Returns details of the initiated payment.

```json
{
  "success": true,
  "message": "Trade payment initialized.",
  "data": {
    "id": "uuid",
    "trade": "uuid",
    "payment_type": "trade_payment",
    "status": "initiated",
    "currency": "GHS",
    "amount_major": "12600.00",
    "amount_minor": 1260000,
    "fee_percent": "5.00",
    "paystack_reference": "TRDPAY-...",
    "paystack_access_code": "...",
    "paystack_authorization_url": "https://checkout.paystack.com/..."
  }
}
```

* **Calculation Formula**:
  * **Platform Fee**: `trade.total_value * platform_fee_percent` (e.g. `5%`).
  * **Amount Major**: `trade.total_value + platform_fee`.
  * **Split logic**: The `platform_fee` stays in the platform's primary Paystack account, and the remaining `trade.total_value` is automatically routed to the seller's subaccount.

#### Step 2: Redirection & Authorization
* Redirect the buyer to the `paystack_authorization_url` to authorize the charge.

#### Step 3: Verification
* Completed payments are processed via the webhook or via:
  * **Endpoint**: `POST /api/payments/verify-reference/?reference=<paystack_reference>` (Method: `POST`)
* Once verified, the payment status updates to `success`.
* With `success` status, the buyer is now permitted to sign the contract using the `sign-contract` action:
  * **Endpoint**: `POST /api/bidding/trades/<trade_id>/sign-contract/`
  *(Note: Attempting to sign the contract before the trade payment status is `success` will fail with an HTTP 400 error).*

#### Trade Payment Summary
You can check the payment summary for a trade at any time:
* **Endpoint**: `GET /api/payments/trades/<trade_id>/summary/`
* **Response**:
```json
{
  "success": true,
  "message": "OK",
  "data": {
    "platform_fee_percent": "5.00",
    "platform_fee_amount": "600.00",
    "trade_total_amount": "12000.00",
    "trade_payment_amount": "12600.00",
    "inspection_fee_amount": "25.00",
    "inspection_fee_paid": true,
    "trade_payment_paid": false,
    "latest_inspection_fee_status": "success",
    "latest_trade_payment_status": "initiated"
  }
}
```

## Websocket API

Websocket messages are JSON.

Authentication:

```text
?token=<access_token>
```

Unauthorized connections close with code `4401`. Forbidden connections close with code `4403`.

Errors sent after a connection is accepted use:

```json
{
  "type": "error",
  "code": "error",
  "message": "Message body is required."
}
```

### Enquiry Room

```text
/ws/bidding/enquiries/<enquiry_id>/?token=<access_token>
```

Allowed clients: enquiry initiator, listing owner, admin.

Client actions:

```json
{ "action": "send_message", "body": "Hello" }
```

```json
{
  "action": "counter",
  "counter_price_per_unit": "1350.00",
  "counter_quantity": "8.00",
  "counter_message": "Can do 8 MT at this price."
}
```

```json
{ "action": "accept" }
```

```json
{ "action": "decline", "reason": "Price is too low." }
```

```json
{ "action": "withdraw" }
```

```json
{ "action": "accept_counter" }
```

Server events:

```text
enquiry.created
enquiry.accepted
enquiry.declined
enquiry.countered
enquiry.withdrawn
enquiry.counter_accepted
enquiry.expired
enquiry.message.created
```

Example event:

```json
{
  "type": "enquiry.countered",
  "enquiry": {},
  "actor_id": "00000000-0000-0000-0000-000000000000"
}
```

Message event:

```json
{
  "type": "enquiry.message.created",
  "message": {
    "id": "00000000-0000-0000-0000-000000000000",
    "sender_name": "Seller Name",
    "sender_role": "seller",
    "body": "Can do 8 MT.",
    "attachment_url": null,
    "attachment_name": "",
    "is_read_by_buyer": false,
    "is_read_by_seller": true,
    "created_at": "2026-06-03T10:00:00Z"
  }
}
```

### Trade Room

```text
/ws/bidding/trades/<trade_id>/?token=<access_token>
```

Allowed clients: buyer, seller, admin.

Client actions:

```json
{ "action": "send_message", "body": "Hello", "is_internal": false }
```

```json
{ "action": "agree" }
```

```json
{ "action": "sign_contract" }
```

```json
{
  "action": "mark_in_progress",
  "tracking_reference": "TRACK-123",
  "estimated_arrival": "2026-06-25"
}
```

```json
{ "action": "complete", "notes": "Delivered and confirmed." }
```

```json
{
  "action": "cancel",
  "reason": "Logistics provider failed to collect.",
  "cancellation_reason": "logistics_failed"
}
```

```json
{
  "action": "dispute",
  "reason": "Delivered material does not match the agreed quality."
}
```

```json
{ "action": "skip_inspection" }
```

```json
{
  "action": "reject_inspection",
  "reason": "Moisture level is above the agreed threshold."
}
```

REST-only trade actions because they use file upload, payment initiation, or admin-only scheduling/reporting:

```text
send-contract
request-inspection
schedule-inspection
start-inspection
complete-inspection
approve-inspection
resolve-dispute
admin-notes
documents upload
```

Server events:

```text
trade.created
trade.terms_agreed
trade.contract_sent
trade.contract_signed
trade.in_progress
trade.completed
trade.cancelled
trade.disputed
trade.dispute_resolved
trade.inspection_requested
trade.inspection_skipped
trade.inspection_scheduled
trade.inspection_started
trade.inspection_completed
trade.inspection_rejected
trade.message.created
trade.document.created
```

Example trade event:

```json
{
  "type": "trade.in_progress",
  "trade": {},
  "actor_id": "00000000-0000-0000-0000-000000000000"
}
```

Example message event:

```json
{
  "type": "trade.message.created",
  "message": {
    "id": "00000000-0000-0000-0000-000000000000",
    "sender_name": "Buyer Name",
    "sender_role": "buyer",
    "body": "Can you share the contract?",
    "attachment_url": null,
    "attachment_name": "",
    "is_internal": false,
    "is_read_by_buyer": true,
    "is_read_by_seller": false,
    "is_read_by_admin": false,
    "created_at": "2026-06-03T10:00:00Z"
  }
}
```

Example document event:

```json
{
  "type": "trade.document.created",
  "document": {
    "id": "00000000-0000-0000-0000-000000000000",
    "doc_type": "invoice",
    "title": "Invoice",
    "file_url": "https://example.com/media/bidding/trade_documents/file.pdf",
    "file_name": "file.pdf",
    "uploaded_by_name": "Seller Name",
    "notes": "",
    "created_at": "2026-06-03T10:00:00Z"
  }
}
```

### Admin Stream

```text
/ws/bidding/admin/?token=<access_token>
```

Admin only.

On connect, the server sends:

```json
{
  "type": "admin.snapshot",
  "overview": {
    "enquiries": {},
    "trades": {},
    "pending_disputes": 0
  }
}
```

When bidding state changes, the server sends:

```json
{
  "type": "admin.snapshot.updated",
  "event": "trade.disputed",
  "overview": {
    "enquiries": {},
    "trades": {},
    "pending_disputes": 1
  }
}
```
