# Weekly Changelog (Aug 6 - Aug 13, 2026)

This document summarizes the updates, features, and fixes made to both the Ameefar backend and frontend over the past week.

## 🎨 Frontend Updates

### Profile & Authentication
- **Buyer-Only Verification Flow**: Introduced a role-aware UI that simplifies the verification flow for buyer-only accounts.
- **Dynamic Profile Forms**: Added dynamic format hints and a country dropdown to Step 1 of the company verification process.
- **Registration Enhancements**: Added a "Show Password" toggle box to the registration form.
- **Footer Updates**: Updated authentication and main site footers for better consistency.

### Bidding, Trading, & Payments
- **Resume Payments**: Added functionality allowing buyers to easily resume dropped inspection fee payments.
- **Financial Summaries**: Added a detailed financial summary to every trade detail page (`trade/[id]`).
- **UI & Routing Refinements**: Made extensive refinements to the UI and routing for trade detail pages and the chat panel.
- **Inspection Simplifications**: 
  - Removed the explicit "Inspection Report" attachment section from the admin `complete-inspection` page.
  - Removed the "Skip Inspection" button from the `InspectionModule`.
- **Admin Payouts**: Addressed issues and made fixes to the admin payouts feature.

### Marketplace & General Navigation
- **Role-Based Views**: Hid the "My listings only" filter option in the marketplace for users with the buyer role.
- **Landing Page Enhancements**: Updated the landing page to feature the company and marketplace buttons more prominently.
- **Routing Fixes**: Resolved miscellaneous routing and role-based rendering issues across bidding and product browsing.

---

## ⚙️ Backend Updates

### Email & Notifications Ecosystem
- **Trade & Enquiry Emails**: Added automated email notifications for new enquiries and active trades between buyers and sellers.
- **Admin Alerts**: Admins now receive notifications when a trade is marked as in-progress or complete.
- **Automated Reminders**: Added background tasks for abandoned enquiry reminders.
- **Notification Services**: Centralized email sending by adding `send_email_task` and `queue_email` functionality to a dedicated `notifications` app.
- **Product Digest**: Added a product listing digest email powered by `celery_beat`.
- **Email Styling**: Upgraded email styling for password reset requests/confirmations and added a professional OTP email template with an embedded inline logo.

### Profiles & Authentication
- **Validation**: Enforced country-specific validation for company IDs and VAT numbers on user profiles.
- **Verification Flow**: Simplified the backend verification flow and model logic for buyer-only accounts to match frontend changes.
- **SMS Integration**: Added an SMS service for password resets and OTPs (currently supporting Ghana numbers).
- **Bug Fix**: Fixed a `FRONTEND_URL` issue in the `PasswordResetRequestView`.

### Payments & Bidding Models
- **Payment Resumption**: Exposed a new API endpoint to allow users to re-initiate inspection fee payments.
- **Model Constraints**: Removed the `unique=True` attribute from recipient code and subaccount code in the payments models to fix edge cases.

### Infrastructure & Task Management
- **Celery Activation**: Removed the `sync_task` monkey-patch to fully activate real Celery workers for asynchronous processing.
- **Periodic Tasks**: Added `celery_beat` periodic tasks to the users app for KYC verification reminders and inactive engagement reminders.
