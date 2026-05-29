````md
# Thorough UI/UX Design Instructions — Profile & Verification Module

Design a premium, enterprise-grade **Profile & Verification (KYC/Onboarding) experience** for a B2B recycling/material trading platform. The experience should feel significantly more polished than a standard admin dashboard. Prioritize clarity, trust, credibility, low friction, and progressive completion.

The module is not just a form — it is a **multi-step business verification workflow** with onboarding, profile management, site management, document verification, banking setup, and compliance submission.

---

# Core UX Principles

## 1. Premium B2B Feel

The interface should feel:

- Professional
- Trustworthy
- Modern enterprise SaaS
- High-conversion onboarding
- Low cognitive load
- Clean but information-rich

Avoid:

- Cluttered dashboards
- Overwhelming forms
- Generic bootstrap-style layouts
- Long intimidating form walls

Reference the quality level of:

- Stripe onboarding
- Deel verification
- Mercury business onboarding
- Ramp
- Brex
- Modern fintech KYC experiences

---

# Overall Information Architecture

The profile module should be structured as:

## A. Profile Dashboard (Entry Screen)

This acts as the central hub.

The user lands here before entering the onboarding flow.

### Purpose

Help users immediately understand:

- Verification progress
- What is completed
- What is missing
- What is blocking submission
- Next best action

### Layout

#### Verification Status Card

Large, visually prominent card showing:

### States

- Incomplete
- Pending Review
- Verified
- Rejected

Each status should have a visually distinct treatment.

### Status Behaviors

#### Incomplete

Show:

- Progress percentage
- Missing steps

CTA:

**Continue Verification**

#### Pending

Show:

- Timeline-style messaging
- “Your profile is under review”
- Submission timestamp
- Estimated review expectations
- Disable editing

#### Verified

Show:

- Strong trust signal
- Verification badge
- Approved timestamp
- Locked state

#### Rejected

Show:

- Clear rejection reason
- Contextual explanation

CTA:

**Fix & Resubmit**

---

## Progress Experience

Display:

### Horizontal Step Progress

3-step progress tracker:

1. Company Information
2. Operational Sites
3. Compliance & Documents

Must show:

- Completed
- Active
- Locked
- Incomplete states

Also show:

**Completion percentage**

`0% | 33% | 66% | 100%`

This should feel rewarding and motivating.

---

## Missing Requirements Panel

Display smart onboarding guidance.

Examples:

### Missing Company Information

> Complete your company details to continue.

### No Sites Added

> Add at least one operational site.

### Missing Documents

> Upload all required compliance documents.

This panel should intelligently reflect backend state.

---

## Profile Overview Cards

Provide quick business snapshot.

### Company Information Card

Show:

- Registration number
- VAT region
- Company size
- Website
- Establishment year

CTA:

**Edit**

### Sites Card

Show:

- Number of operational sites
- Primary site indicator
- Materials handled summary

CTA:

**Manage Sites**

### Documents Card

Show:

- Upload status
- Approved/rejected/pending document indicators

CTA:

**Manage Documents**

### Banking Card

Show:

- Bank verification status
- Masked account number

CTA:

**Update Banking**

---

# Multi-Step Verification Flow

The onboarding should be designed as a **guided wizard**.

Never feel overwhelming.

Use:

- Auto-save
- Step indicators
- Sticky progress
- Smart validation
- Clear completion feedback

---

# STEP 1 — Company Information

## Goal

Collect company identity and registration information.

This is a high-trust step and should feel structured and professional.

## Layout

Two-column responsive layout.

### Desktop

- Form left
- Context/help panel right

### Mobile

- Single column

---

## Form Structure

Break the form into logical sections.

### Section A — Company Details

Fields:

- VAT region
- Company registration number
- VAT registration number
- Company size
- Year established

#### UX Requirements

- Use dropdowns for enums
- Inline helper text
- Smart formatting
- Validation states

---

### Section B — Business Identity

Fields:

- Company website
- Company description

#### UX Requirements

- Rich textarea
- Character guidance
- Helpful placeholder examples

For website:

- Auto URL formatting
- Domain validation

---

### Section C — Registered Address

Fields:

- Street address
- Address line 2
- Postcode
- City
- State/Region
- Country

#### UX Requirements

- Address autocomplete if possible
- Country selector
- Intelligent grouping

---

## Save Experience

Two actions:

### Save Draft

Partial save.

#### Behavior

- Saves incomplete progress
- Does **NOT** mark step complete
- Non-blocking

Microcopy:

> Your progress has been saved.

---

### Continue

Full validation.

#### Behavior

- Requires all mandatory fields
- Marks Step 1 complete
- Progress updates to `33%`

Success feedback:

> Company information completed.

---

## Validation UX

Avoid giant red error walls.

Use:

- Inline field validation
- Helpful messaging
- Real-time feedback

### Example

Instead of:

> Invalid field

Use:

> Please enter a valid company registration number.

---

# STEP 2 — Operational Sites

## Goal

Capture company operational footprint.

This should feel dynamic and visual.

The experience should not feel like another long form.

---

## Empty State

When no sites exist:

- Large illustration/icon

Message:

# Add your first operational site

Explanation:

> Sites represent facilities where materials are collected, processed, stored, or recycled.

Primary CTA:

**Add Site**

---

## Site Management UX

Use card-based UI.

Each site should appear as a card.

Display:

- Site name
- Site type
- Location
- Primary badge
- Materials handled
- Monthly capacity
- Export capability indicator

Actions:

- Edit
- Delete
- View details

---

## Add/Edit Site Modal or Drawer

Avoid full-page transitions.

Prefer:

- Side drawer
- OR modal wizard

### Site Information Sections

#### Site Identity

Fields:

- Site name
- Site type
- Primary toggle

#### Address

Fields:

- Full address
- Map preview if coordinates exist

#### Coordinates

Fields:

- Latitude
- Longitude

Prefer:

- Pin-on-map interaction
- Auto geolocation

---

#### Contacts

Fields:

- Contact person
- Email
- Phone

Validation:

- Email formatting
- Phone formatting

---

#### Operations

Fields:

- Operating hours
- Materials handled
- Monthly capacity
- Export capability toggle

#### Materials

Use searchable multi-select chips.

---

## Step Completion Logic

**Important UX requirement:**

Adding a site **does not automatically complete Step 2**.

Instead:

After minimum requirement is met:

Show CTA:

**Complete Site Setup**

Only after confirmation:

- Step 2 becomes complete
- Progress becomes `66%`

If no site exists:

Disable completion button.

Message:

> You must add at least one site.

---

# STEP 3 — Compliance & Documents

This is the trust-building step.

Should feel secure and confidence-inspiring.

## Layout

Split into sections.

---

## A. Required Documents

Display the **3 required uploads** as separate upload cards:

1. Business Registration
2. Representative ID
3. Proof of Authority

Each upload should have status:

- Missing
- Uploaded
- Pending Review
- Approved
- Rejected

---

## Upload UX

Use drag-and-drop zones.

Support:

- Click upload
- Drag & drop
- File preview

Show:

- File name
- Upload timestamp
- Replace option

Rejected documents should visibly show:

- Rejection reason
- Fix guidance

---

## Document Status Indicators

### Pending

Neutral styling.

### Approved

Strong success state.

### Rejected

Clear warning treatment.

Include rejection explanation.

---

## Banking Details (Optional but Recommended)

Clearly label:

**Optional**

Encourage completion.

Fields:

- Bank name
- Bank code
- Account name
- Account number

#### UX Requirements

- Secure input styling
- Masked account number display after save

Status:

- Verified
- Unverified

---

## Declaration Section

Critical final action.

Use elevated card styling.

Include checkbox:

> I confirm that all information submitted is accurate and authorized.

Cannot continue unless accepted.

---

## Final Submission Experience

Before submission:

Show review summary screen.

Include:

- Company information
- Sites count
- Uploaded documents
- Banking status

Display checklist:

- ✅ Company Information Complete
- ✅ Site Added
- ✅ Documents Uploaded
- ✅ Declaration Accepted

CTA:

**Submit for Review**

---

## Submission Flow

After submission:

Status becomes:

**Pending Review**

Editing becomes locked.

Show messaging:

> Your profile has been submitted for verification.

> We’ll notify you once the review is complete.

Disable:

- Edit buttons
- Upload actions
- Form editing

---

# Personal Profile Experience (`PATCH /me/`)

Separate from company onboarding.

This should feel like:

**Account Settings → Personal Profile**

Not part of the KYC wizard.

## Layout

Tabbed settings page.

### Personal Information

Fields:

- Gender
- Date of birth
- Nationality
- Occupation

---

### Identity

Fields:

- ID type
- ID number

---

### Contact Information

Fields:

- Phone
- Address
- Country
- Region
- Postal code

---

### Emergency Contact

Fields:

- Contact name
- Contact phone

---

### About

Fields:

- Bio

---

## Completion UX

If incomplete:

Show smart banner:

> Complete your personal profile for a better experience.

Display missing fields.

---

# State-Based UX Rules

## Status = Incomplete

- Editing enabled

---

## Status = Pending

- Entire verification flow becomes read-only
- Inputs disabled
- Locked UI shown

---

## Status = Verified

- Read-only profile
- Trust indicators visible

---

## Status = Rejected

- Editing re-enabled
- Rejected items highlighted
- Rejection reason prominently displayed

---

# Loading States

Every async action must have elegant loading states.

### Fetch Profile

- Skeleton loading

### Save Draft

- Subtle inline spinner
- Avoid page blocking

### Upload Document

- Upload progress bar

### Submit Profile

CTA loading state.

Button text:

**Submitting...**

---

# Error Handling UX

Never expose raw backend errors.

Translate into human-friendly language.

### Bad

> 400 Validation Error

### Good

> We couldn’t save your company details. Please review highlighted fields.

---

# Mobile UX

Must be mobile-first responsive.

Requirements:

- Sticky bottom CTA
- Stepper collapses elegantly
- Cards stack vertically
- Modals become full-screen sheets

---

# Accessibility

Include:

- Keyboard navigation
- Focus states
- Screen reader support
- High contrast validation
- Large click targets

---

# Visual Style Direction

Design system should feel:

- Premium
- Enterprise
- Trustworthy
- Sustainable-tech / climate-tech
- Minimal but rich

Use:

- Spacious layouts
- Rounded cards
- Clean typography hierarchy
- Trust-building iconography
- Status color system

Avoid:

- Harsh enterprise grey dashboards
- Overly playful visuals
- Excessive animations

---

# Key UX Constraints from Backend Logic

These behaviors are **mandatory**:

1. Step 1 draft save (`PATCH`) ≠ complete save (`PUT`)
2. Step 2 only completes after explicit confirmation
3. At least one site required before Step 2 completion
4. Three separate document uploads required:
   - `business_registration`
   - `representative_id`
   - `proof_of_authority`
5. Declaration acceptance is required
6. Banking is optional
7. Profile lifecycle:

```text
incomplete → pending → verified
                         ↘ rejected
```

8. Once pending or verified:
   frontend editing must lock

9. Site API response behavior differs between create/update and fetch — UI state should remain seamless despite backend inconsistency

10. Progress percentages:

- `0%`
- `33%`
- `66%`
- `100%`

The entire experience should feel like a **premium guided verification workflow**, not a collection of forms.
````
