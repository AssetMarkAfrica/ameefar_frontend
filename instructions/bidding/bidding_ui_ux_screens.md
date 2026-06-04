# Bidding & Trade UI/UX Screens Architecture

Based on the backend flow, the platform facilitates a robust negotiation and trade execution process. Users can have roles of `buyer`, `seller`, or `both`. The UI must handle real-time updates via WebSockets and clearly separate the **Enquiry Phase** (negotiation) from the **Trade Phase** (execution).

## 1. Bidding & Trade Dashboard (The "Hub")
The central command center for users to manage their bidding activities.

*   **Role Context Switcher:** A prominent toggle or tab system for users with the `both` role to seamlessly switch between "Buying" and "Selling" contexts.
*   **Main Navigation Tabs & Filters:**
    *   **Enquiries (Negotiations):** List of active negotiations. Can be filtered by statuses like `pending`, `countered`.
    *   **Active Trades:** List of accepted enquiries converted into trades. Filtered by execution statuses (`negotiating`, `agreed`, `contract_sent`, `contract_signed`, `in_progress`).
    *   **History:** Completed, cancelled, disputed, withdrawn, and expired items.
*   **List Items (Cards/Rows):**
    *   **Display Elements:** Listing Name, Reference ID, Counterparty Name, Status Badge (color-coded for quick scanning), Total Value, Last Updated Date.
    *   **UX Note:** Emphasize items requiring user action (e.g., "Your Turn to Respond"). Incorporate loading skeletons during data fetches and visual indicators for unread messages.

## 2. Create Enquiry (Entry Point)
The entry point into the bidding process from a Listing Detail page.

*   **Create Enquiry Form (Drawer or Modal):**
    *   **Required Inputs:** Quantity, Unit (`mt`, `kg`, `lt`, `load`, `unit`).
    *   **Optional Negotiable Terms:** Proposed Price per Unit, Currency.
    *   **Optional Delivery Terms:** Delivery Terms (e.g., EXW, FOB), Delivery Address, Target Delivery Date (Datepicker).
    *   **Message:** Initial message to the counterparty (required field).
    *   **UX Note:** Auto-calculate and display "Total Value" dynamically as the user types the price and quantity to provide immediate financial context.

## 3. The Negotiation Room (Enquiry Detail)
A dual-panel layout optimized for real-time (WebSocket) negotiation.

*   **Header:** Reference ID, Listing Name, Counterparty info, and current Status (`pending`, `countered`, `accepted`, `declined`, `withdrawn`, `expired`).
*   **Left Panel (Offer Details & Actions):**
    *   **Current Terms:** Clearly displays the current Quantity, Price per Unit, Delivery Terms, and Total Value.
    *   **Action Bar (Contextual based on role and status):**
        *   *Initiator (e.g., Buyer):* `Withdraw Enquiry`, `Accept Counter`.
        *   *Listing Owner (e.g., Seller):* `Accept Enquiry`, `Decline Enquiry` (requires a decline reason), `Counter Offer`.
    *   **Counter Offer Modal:** Dynamic form with inputs for `counter_price_per_unit`, `counter_quantity`, and a mandatory `counter_message`.
*   **Right Panel (Real-time Chat):**
    *   Chat interface for sending text messages and file attachments.
    *   System events injected inline (e.g., "Seller countered with $1350/MT").
    *   **UX Note:** Auto-scroll to the latest message. Visually differentiate the user's own messages from the counterparty's and system events.

## 4. The Trade Execution Room (Trade Detail)
Once an enquiry is accepted, it becomes a Trade. This highly structured page guides users through fulfillment via WebSocket events.

*   **Header & Stepper (Progress Bar):**
    *   Visual timeline of the happy path: `Negotiating` -> `Agreed` -> `Contract Sent` -> `Contract Signed` -> `In Progress` -> `Completed`.
    *   Alternative terminal states: clearly displayed if `Cancelled` or `Disputed`.
*   **Left Panel (Trade Management & Documents):**
    *   **Trade Details:** Locked terms from the enquiry (Quantity, Price, Target Delivery Date).
    *   **Action Area (Contextual by Role & Status):**
        *   *Both Parties:* `Agree Terms` (locks the negotiation phase of the trade), `Cancel Trade` (requires a text `reason` and a dropdown `cancellation_reason`), `Raise Dispute` (requires `reason`).
        *   *Seller:* `Send Contract` (file upload), `Mark In Progress` (requires `tracking_reference` and `estimated_arrival`).
        *   *Buyer:* `Sign Contract`, `Complete Trade` (requires `notes` to confirm delivery).
    *   **Inspection Module:**
        *   Status tracking: `not_requested` -> `requested` -> `scheduled` -> `in_progress` -> `passed` / `failed`.
        *   *Buyer Actions:* `Request Inspection`, `Skip Inspection`, `Approve Inspection` (only if passed), `Reject Inspection` (requires reason).
    *   **Documents Section:** 
        *   Categorized list of uploaded files mapped to types (`contract`, `quality_cert`, `delivery_note`, `invoice`, `weighbridge`, `photo_evidence`, etc.).
        *   Upload functionality for both parties to add documents with a specific `doc_type`, `title`, and `notes`.
*   **Right Panel (Real-time Chat & Logs):**
    *   Continuous chat history for the trade phase. Supports file attachments.
    *   Inline system events for milestone changes, status updates, and document uploads.

## 5. Admin Bidding & Dispute Dashboard
Internal tools for platform administrators to monitor health, resolve issues, and manage inspections.

*   **Overview Stats Page:**
    *   Metrics dashboard displaying aggregate counts for Enquiries (by status), Trades (by status), and total `pending_disputes`.
*   **Dispute Resolution Center:**
    *   List of trades currently in a `disputed` status.
    *   Deep-dive view into the entire Trade Room history (chat, system logs, and documents).
    *   **Action:** `Resolve Dispute` form (requires a detailed `resolution` text).
*   **Inspection Management:**
    *   List of trades that require platform inspection.
    *   **Actions:** 
        *   `Schedule Inspection` (assign `inspector_id` and `scheduled_for` date).
        *   `Start Inspection`.
        *   `Complete Inspection` (requires `verdict` of passed/failed, `summary`, optional `recommendation`, and a `report_document` upload).
*   **Internal Notes & Chat:** 
    *   Ability to add and view internal `admin_notes` on trades, which remain invisible to the buyer and seller.
    *   Ability to send internal chat messages in the Trade Room (`is_internal: true`), visible only to other administrators.
