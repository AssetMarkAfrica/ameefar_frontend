# Blog & Newsletter — UI/UX Design Blueprint

This document defines every screen, component, state, and interaction for the Blog and Newsletter modules. Use it as the single source of truth when creating Stitch designs.

---

## Table of Contents

1. [Color & Typography Constants](#1-color--typography-constants)
2. [Blog — Public Screens](#2-blog--public-screens)
   - [2.1 Blog List Page](#21-blog-list-page)
   - [2.2 Blog Post Detail Page](#22-blog-post-detail-page)
3. [Blog — Admin Screens](#3-blog--admin-screens)
   - [3.1 Admin Post List / Management Table](#31-admin-post-list--management-table)
   - [3.2 Admin Post Create/Edit Form](#32-admin-post-createedit-form)
   - [3.3 Admin Category Manager](#33-admin-category-manager)
   - [3.4 Admin Tag Manager](#34-admin-tag-manager)
4. [Newsletter — Public Screens](#4-newsletter--public-screens)
   - [4.1 Subscribe Section (inline, embeddable)](#41-subscribe-section-inline-embeddable)
   - [4.2 Unsubscribe Page](#42-unsubscribe-page)
5. [Newsletter — Admin Screens](#5-newsletter--admin-screens)
   - [5.1 Admin Subscriber List](#51-admin-subscriber-list)
   - [5.2 Admin Campaign List](#52-admin-campaign-list)
   - [5.3 Admin Campaign Create/Edit Form](#53-admin-campaign-createedit-form)
   - [5.4 Campaign Stats Panel](#54-campaign-stats-panel)
   - [5.5 Send Campaign Flow](#55-send-campaign-flow)
6. [Shared Components & Patterns](#6-shared-components--patterns)
7. [Redux State → UI Mapping](#7-redux-state--ui-mapping)

---

## 1. Color & Typography Constants

Use the same design tokens as the rest of the app:

| Token | Value | Usage |
|-------|-------|-------|
| `bg-page` | `#f8f9ff` | Page background |
| `text-primary` | `#0b1c30` | Body text |
| `text-muted` | `#64748b` / `slate-500` | Secondary text |
| `accent` | `#002627` | Links, active states, primary buttons |
| `accent-light` | `#002627/10` | Tag/category badges |
| `border-light` | `#e2e8f0` / `slate-200` | Card borders, dividers |
| `surface` | `#ffffff` | Cards, modals, inputs |
| `surface-hover` | `#f8fafc` / `slate-50` | Row hover, button hover |
| `error-bg` | `#fef2f2` / `red-50` | Error alert background |
| `error-text` | `#b91c1c` / `red-700` | Error text |
| `success-bg` | `#f0fdf4` / `green-50` | Success alert background |
| `success-text` | `#15803d` / `green-700` | Success text |
| Font heading | `var(--font-hanken)` | Headings (H1-H3) |
| Font body | `var(--font-inter)` | Body text, labels, inputs |
| Font mono | `var(--font-jetbrains)` | Code/monospace (if needed) |

---

## 2. Blog — Public Screens

### 2.1 Blog List Page

**Route:** `/blog`  
**Data source:** `fetchPosts` thunk → `selectPosts`, `selectPagination`, `selectBlogLoading`, `selectBlogError`

#### API Response (`PaginatedResponse<BlogPostSummary>`)
```typescript
{
  success: true,
  pagination: { count, total_pages, current_page, next, previous },
  results: [
    {
      id: "uuid",
      title: "How Recycling Works",
      slug: "how-recycling-works",
      excerpt: "Short summary...",
      featured_image: "https://cdn.example.com/image.jpg",
      category: { id, name: "Plastics", slug: "plastics", description, post_count },
      tags: [{ id, name: "recycling", slug: "recycling" }],
      author_name: "Jane Doe",
      status: "published",
      published_at: "2026-07-30T10:00:00Z",
      view_count: 42,
      created_at: "...",
      updated_at: "..."
    }
  ]
}
```

#### Layout

```
┌─────────────────────────────────────────────────────┐
│  Blog                                     [heading] │
│                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │ [img]       │  │ [img]       │  │ [img]       │ │
│  │ Category ·  │  │ Category ·  │  │ Category ·  │ │
│  │ Jul 30, 2026│  │ Jul 30, 2026│  │ Jul 30, 2026│ │
│  │             │  │             │  │             │ │
│  │ Post Title  │  │ Post Title  │  │ Post Title  │ │
│  │ Excerpt     │  │ Excerpt     │  │ Excerpt     │ │
│  │ lines...    │  │ lines...    │  │ lines...    │ │
│  │             │  │             │  │             │ │
│  │ Author · 42 │  │ Author · 15 │  │ Author · 7  │ │
│  │ views       │  │ views       │  │ views       │ │
│  └─────────────┘  └─────────────┘  └─────────────┘ │
│                                                     │
│           [< Previous]  Page 2 of 8  [Next >]       │
└─────────────────────────────────────────────────────┘
```

#### States

| State | What to show |
|-------|-------------|
| **Loading** | Centered spinner or skeleton cards (3 skeleton cards in grid) |
| **Empty** | Centered "No posts yet." message |
| **Error** | Red alert banner with error text + retry option |
| **Loaded** | 3-column card grid (→ 2-col on tablet → 1-col on mobile) |
| **Paginating** | Previous/Next buttons at bottom; disable Previous on page 1, Next on last page; show "Page X of Y" |

#### Interactive Behaviors

- **Card click**: Navigate to `/blog/{slug}` (full page navigation)
- **Card hover**: Image scales up slightly (`scale-105`), title color shifts to accent
- **Category badge**: Could link to filtered list in future (not MVP)
- **Pagination buttons**: `dispatch(fetchPosts({ page: N }))` on click
- **Page load**: `useEffect` dispatches `fetchPosts({ page: 1 })`

---

### 2.2 Blog Post Detail Page

**Route:** `/blog/[slug]`  
**Data source:** `fetchPostBySlug` thunk → `selectCurrentPost`, `selectBlogLoading`, `selectBlogError`

#### API Response (`DataResponse<BlogPostDetail>`)
```typescript
{
  success: true,
  data: {
    // All BlogPostSummary fields plus:
    content: "<h1>Full HTML body</h1><p>...</p>"
  }
}
```

#### Layout

```
┌─────────────────────────────────────────────────────┐
│  ← Back to blog                                     │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │           Featured Image (full width)       │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│  [Category]  July 30, 2026  ·  Jane Doe  ·  43 views│
│                                                     │
│  #recycling  #waste-management  [tag pills]         │
│                                                     │
│  How Recycling Works                  [H1 headline] │
│  ─────────────────────────────────────────────────  │
│                                                     │
│  (HTML content rendered via dangerouslySetInnerHTML)│
│  ...                                                │
│  ...                                                │
│  ...                                                │
└─────────────────────────────────────────────────────┘
```

#### States

| State | What to show |
|-------|-------------|
| **Loading** | Centered "Loading..." text (or skeleton) |
| **Error** | Red alert with error message + "Back to blog" link |
| **Not found** | "Post not found." message + "Back to blog" link |
| **Loaded** | Full article layout as shown above |

#### Interactive Behaviors

- **← Back to blog link**: Navigate to `/blog`
- **Category badge**: Static (for now)
- **Tag pills**: Static (for now)
- **Share (future)**: Not MVP — no share buttons needed yet
- **View count**: Automatically incremented by backend on each fetch; displayed but not interactive

---

## 3. Blog — Admin Screens

### 3.1 Admin Post List / Management Table

**Route:** `/blog/admin` (or within admin panel)  
**Data source:** `fetchAdminPosts` thunk → `selectAdminPosts`, `selectAdminBlogLoading`, `selectBlogError`

#### API Response (`PaginatedResponse<BlogPostSummary>`)
Same shape as public list but **includes `draft` posts**.

#### Layout

```
┌─────────────────────────────────────────────────────┐
│  Blog Management                  [+ New Post]      │
│                                                     │
│  ┌─────┬────────────┬────────┬────────┬──────────┐  │
│  │     │  Title      │ Status │ Author │  Date    │  │
│  ├─────┼────────────┼────────┼────────┼──────────┤  │
│  │     │ How Recyc… │ Draft  │ Jane   │ Jul 30   │  │
│  │ img │            │        │        │          │  │
│  │     ├────────────┼────────┼────────┼──────────┤  │
│  │     │ Plastic W… │ Publi… │ John   │ Jul 29   │  │
│  └─────┴────────────┴────────┴────────┴──────────┘  │
│                                                     │
│           [< Previous]  Page 1 of 4  [Next >]       │
└─────────────────────────────────────────────────────┘
```

Each row is clickable → navigates to edit form.

#### Filtering / Tabs (optional but useful)

```
┌─────────────────────────────────────────────────────┐
│  [All] [Drafts] [Published]     [Search…]  [Filter] │
└─────────────────────────────────────────────────────┘
```

Tab filter can be done client-side via `selectAdminPostsByStatus("draft")`.

#### States

| State | What to show |
|-------|-------------|
| **Loading** | Skeleton table rows |
| **Empty** | "No posts yet. Create your first post." with CTA button |
| **Error** | Red alert with error message |
| **Loaded** | Table with data; pagination at bottom |

#### Row Actions (on hover or via ⋮ menu)

| Action | Effect |
|--------|--------|
| **Edit** | Navigate to admin post edit form |
| **Delete** | Confirmation modal → `dispatch(deletePost(id))` → row removed |
| **View** (published) | Open public post in new tab |

---

### 3.2 Admin Post Create/Edit Form

**Route:** `/blog/admin/new` | `/blog/admin/[id]/edit`  
**Data source (edit):** `fetchAdminPost` thunk → `selectAdminPostById(id)`  
**Submit:** `createPost` / `updatePost` / `patchPost` thunks

#### API Request Payload (`BlogPostPayload`)
```typescript
{
  title: string,              // required
  content: string,             // required (HTML)
  excerpt?: string,            // optional
  featured_image?: string,     // optional (URL)
  category_id?: string | null, // optional (UUID or null)
  tag_ids?: string[],          // optional (array of UUIDs)
  status?: "draft" | "published"
}
```

#### API Response (`DataResponse<BlogPostSummary>`)
```typescript
{
  success: true,
  message: "Created",
  data: { /* BlogPostSummary with generated slug, author_name, etc. */ }
}
```

#### Form Layout

```
┌─────────────────────────────────────────────────────┐
│  ← Back to Post List                                │
│                                                     │
│  Create New Post                      [Save Draft]  │
│                                      [Publish]      │
│  ┌─────────────────────────────────────────────┐    │
│  │  Title *                                    │    │
│  │  ┌───────────────────────────────────────┐  │    │
│  │  │ Enter post title...                   │  │    │
│  │  └───────────────────────────────────────┘  │    │
│  │                                             │    │
│  │  Content * (HTML)                           │    │
│  │  ┌───────────────────────────────────────┐  │    │
│  │  │ [Rich text editor or textarea with   ]│  │    │
│  │  │  HTML toolbar]                        │  │    │
│  │  └───────────────────────────────────────┘  │    │
│  │                                             │    │
│  │  Excerpt                                    │    │
│  │  ┌───────────────────────────────────────┐  │    │
│  │  │ Brief summary for cards...            │  │    │
│  │  └───────────────────────────────────────┘  │    │
│  │                                             │    │
│  │  Featured Image URL                         │    │
│  │  ┌───────────────────────────────────────┐  │    │
│  │  │ https://...                           │  │    │
│  │  └───────────────────────────────────────┘  │    │
│  │                                             │    │
│  │  Category                                   │    │
│  │  ┌───────────────────────────────────────┐  │    │
│  │  │ Select a category...        [▼]       │  │    │
│  │  └───────────────────────────────────────┘  │    │
│  │                                             │    │
│  │  Tags                                       │    │
│  │  ┌───────────────────────────────────────┐  │    │
│  │  │ [recycling ✕] [plastic ✕]  Add tag…  │  │    │
│  │  └───────────────────────────────────────┘  │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

#### Field Specifications

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Title | Text input | Yes | Max length TBD by backend |
| Content | Rich text / textarea (HTML) | Yes | Should support basic HTML formatting |
| Excerpt | Textarea | No | Shown in card preview; 2-3 lines |
| Featured Image URL | Text input | No | Full URL; show preview thumbnail when filled |
| Category | Select dropdown | No | Options from `fetchCategories`; "None" option |
| Tags | Multi-select / tag input | No | Typeahead + create; options from `fetchTags` |
| Status | Buttons | - | "Save as Draft" (default) vs "Publish" |

#### States

| State | What to show |
|-------|-------------|
| **Loading (edit)** | Form skeleton/spinner while `fetchAdminPost` resolves |
| **Submitting** | Disable all buttons; show spinner on Save/Publish button |
| **Validation error** | Inline field errors under each invalid field |
| **API error** | Red alert at top of form with error message |
| **Success (create)** | Redirect to edit page for the new post; toast "Post created" |
| **Success (update)** | Toast "Post updated"; form stays editable |

#### Interactive Behaviors

- **Category dropdown**: Load options via `dispatch(fetchCategories())` on mount
- **Tag input**: Load options via `dispatch(fetchTags())` on mount; typeahead filter; allow creating new tags inline
- **Save Draft**: `dispatch(createPost({ ...payload, status: "draft" }))`
- **Publish**: `dispatch(createPost({ ...payload, status: "published" }))`
- **On edit**: Pre-populate all fields from `selectAdminPostById(id)`

---

### 3.3 Admin Category Manager

**Route:** `/blog/admin/categories` (modal or page)  
**Data source:** `fetchCategories` thunk → `selectCategories`  
**Submit:** `createCategory` / `updateCategory` / `deleteCategory` thunks

#### API Payload (`BlogCategoryPayload`)
```typescript
{ name: string, description?: string }
```

#### API Response (`DataResponse<BlogCategory>`)
```typescript
{ success: true, message: "Created", data: { id, name, slug, description, post_count } }
```

#### UI Design

Keep it simple — a **table with inline add row** or a **small modal form**:

```
┌─────────────────────────────────────────────────────┐
│  Categories                              [+ Add]    │
│                                                     │
│  ┌──────────────┬──────────────┬──────────┬──────┐  │
│  │  Name         │ Slug         │ Posts    │      │  │
│  ├──────────────┼──────────────┼──────────┼──────┤  │
│  │  Plastics     │ plastics     │ 12       │ ✎ ✕ │  │
│  │  Metals       │ metals       │ 8        │ ✎ ✕ │  │
│  │  Paper        │ paper        │ 5        │ ✎ ✕ │  │
│  └──────────────┴──────────────┴──────────┴──────┘  │
└─────────────────────────────────────────────────────┘
```

**Inline edit:** Click ✎ → row becomes editable fields → Save/Cancel buttons  
**Delete:** Click ✕ → confirm modal → `dispatch(deleteCategory(id))` → row removed  
**Add:** Click [+ Add] → empty row appears at top → type name + description → Save

#### States

| State | What to show |
|-------|-------------|
| **Loading** | Skeleton rows |
| **Empty** | "No categories yet. Add your first category." |
| **Error** | Toast or inline error |

---

### 3.4 Admin Tag Manager

**Route:** `/blog/admin/tags` (modal or page)  
**Data source:** `fetchTags` thunk → `selectTags`  
**Submit:** `createTag` / `updateTag` / `deleteTag` thunks

#### API Payload (`BlogTagPayload`)
```typescript
{ name: string }
```

#### API Response (`DataResponse<BlogTag>`)
```typescript
{ success: true, message: "Created", data: { id, name, slug } }
```

#### UI Design

Simpler than categories — just a name column. Same table pattern as categories but without description:

```
┌─────────────────────────────────────────────────────┐
│  Tags                                   [+ Add]     │
│                                                     │
│  ┌──────────────┬──────────────┬──────────┬──────┐  │
│  │  Name         │ Slug         │ Used in  │      │  │
│  ├──────────────┼──────────────┼──────────┼──────┤  │
│  │  recycling    │ recycling    │ 15 posts  │ ✎ ✕ │  │
│  │  plastic      │ plastic      │ 10 posts  │ ✎ ✕ │  │
│  │  cardboard    │ cardboard    │ 3 posts   │ ✎ ✕ │  │
│  └──────────────┴──────────────┴──────────┴──────┘  │
└─────────────────────────────────────────────────────┘
```

---

## 4. Newsletter — Public Screens

### 4.1 Subscribe Section (inline, embeddable)

**Usage:** Embedded in landing page, footer, or dedicated section  
**Data source:** `subscribe` thunk → `selectSubscribeMessage`, `selectNewsletterLoading`

#### API Payload (`SubscribePayload`)
```typescript
{ email: string, name?: string }
```

#### API Response (`MessageResponse`)
```typescript
// New subscription:
{ success: true, message: "Subscribed successfully." }
// Already active:
{ success: true, message: "Already subscribed." }
// Re-activated:
{ success: true, message: "Subscription reactivated." }
```

#### Component Design

```
┌─────────────────────────────────────────────────────┐
│  Stay Updated                     [compact variant] │
│                                                     │
│  Get the latest news and updates.                   │
│                                                     │
│  ┌────────────────────────────┬──────────────┐      │
│  │  your@email.com            │ [Subscribe]  │      │
│  └────────────────────────────┴──────────────┘      │
│                                                     │
│  [Name — optional]                                  │
│  ┌──────────────────────────────────────────┐       │
│  │  Your name                                │       │
│  └──────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────┘
```

#### States

| State | What to show |
|-------|-------------|
| **Default** | Email input + Subscribe button |
| **Submitting** | Button shows spinner + "Subscribing..." |
| **Success** | Button/input replaced with success message ("You're subscribed! 🎉") |
| **Error** | Red inline error below input (e.g., "Invalid email") |
| **Already subscribed** | Success message "Already subscribed!" |

#### Success Message Display

After successful subscribe, show the `subscribeMessage` from state (which maps to the API response message). Auto-clear after a timeout or hide permanently. Use `clearSubscribeMessage` reducer when user dismisses or navigates away.

---

### 4.2 Unsubscribe Page

**Route:** `/newsletter/unsubscribe?token=abc123...`  
**Data source:** `unsubscribe` thunk → `selectNewsletterLoading`, `selectNewsletterError`

#### API Payload (`{ token: string }`)
```typescript
{ token: "abc123def456..." }
```

#### API Response (`MessageResponse`)
```typescript
{ success: true, message: "Unsubscribed successfully." }
```

#### Page Design

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│             ┌─────────────────────────┐              │
│             │                         │              │
│             │    ✉️ (mail icon)       │              │
│             │                         │              │
│             │  Unsubscribed           │              │
│             │                         │              │
│             │  You've been removed    │              │
│             │  from our mailing list. │              │
│             │                         │              │
│             │  [Back to Homepage]     │              │
│             │                         │              │
│             └─────────────────────────┘              │
│                                                     │
└─────────────────────────────────────────────────────┘
```

#### States

| State | What to show |
|-------|-------------|
| **Loading** | Centered spinner while processing |
| **Success** | Centered card with success message |
| **Error (invalid token)** | Centered card with error + "Try again" link |
| **Error (missing token)** | Centered card with "Invalid link" message |

#### Flow
1. Page mounts → read `token` from query params
2. `useEffect` dispatches `unsubscribe(token)`
3. On success → show success state
4. On error → show error state

---

## 5. Newsletter — Admin Screens

### 5.1 Admin Subscriber List

**Route:** `/newsletter/admin/subscribers`  
**Data source:** `fetchSubscribers` thunk → `selectSubscribers`, `selectActiveSubscribers`, `selectInactiveSubscribers`

#### API Response (`PaginatedResponse<Subscriber>`)
```typescript
{
  success: true,
  pagination: { count, total_pages, current_page, next, previous },
  results: [
    {
      id: "uuid",
      email: "user@example.com",
      name: "John",
      is_active: true,
      subscribed_at: "2026-07-30T10:00:00Z",
      unsubscribed_at: null
    }
  ]
}
```

#### Layout

```
┌─────────────────────────────────────────────────────┐
│  Subscribers (247 total)                             │
│                                                     │
│  [All (247)] [Active (198)] [Inactive (49)]         │
│                                                     │
│  ┌────────────────┬──────────┬──────────┬─────────┐ │
│  │  Email          │ Name     │ Status   │ Since   │ │
│  ├────────────────┼──────────┼──────────┼─────────┤ │
│  │  john@email…  │ John     │ Active   │ Jul 30  │ │
│  │  jane@email…  │ Jane     │ Inactive │ Jun 15  │ │
│  └────────────────┴──────────┴──────────┴─────────┘ │
│                                                     │
│           [< Previous]  Page 1 of 5  [Next >]       │
└─────────────────────────────────────────────────────┘
```

#### States

| State | What to show |
|-------|-------------|
| **Loading** | Skeleton rows |
| **Empty** | "No subscribers yet." |
| **Error** | Red alert with error message |

#### Notes
- **Status badges**: Green dot/pill for "Active", Gray for "Inactive"
- **Tabs**: Filter by `selectActiveSubscribers` / `selectInactiveSubscribers`
- **Pagination**: Same pattern as blog admin list

---

### 5.2 Admin Campaign List

**Route:** `/newsletter/admin/campaigns`  
**Data source:** `fetchCampaigns` thunk → `selectCampaigns`, `selectDraftCampaigns`, `selectSentCampaigns`

#### API Response (`PaginatedResponse<Campaign>`)
```typescript
{
  success: true,
  pagination: { ... },
  results: [
    {
      id: "uuid",
      subject: "March Newsletter",
      body: "<h1>HTML content</h1>",
      created_by: "admin-uuid",
      created_by_name: "Admin Name",
      status: "draft",         // "draft" | "sending" | "sent"
      recipient_count: 150,
      sent_count: 100,
      open_count: 45,
      click_count: 12,
      created_at: "2026-07-30T10:00:00Z",
      sent_at: null
    }
  ]
}
```

#### Layout

```
┌─────────────────────────────────────────────────────┐
│  Campaigns                          [+ New Campaign]│
│                                                     │
│  [All] [Drafts] [Sending] [Sent]                    │
│                                                     │
│  ┌──────────────┬────────┬──────┬───────┬─────────┐ │
│  │  Subject      │ Status │ Sent │ Opens │ Actions │ │
│  ├──────────────┼────────┼──────┼───────┼─────────┤ │
│  │  March News… │ Draft  │ —    │ —     │ ✎ Send  │ │
│  │  February N… │ Sent   │ 148  │ 72    │ 📊      │ │
│  └──────────────┴────────┴──────┴───────┴─────────┘ │
│                                                     │
│           [< Previous]  Page 1 of 3  [Next >]       │
└─────────────────────────────────────────────────────┘
```

#### Status Badge Colors

| Status | Color |
|--------|-------|
| **Draft** | Gray (`bg-gray-100 text-gray-700`) |
| **Sending** | Blue with pulse animation (`bg-blue-100 text-blue-700`) |
| **Sent** | Green (`bg-green-100 text-green-700`) |

#### Row Actions

| Campaign Status | Actions |
|----------------|---------|
| **Draft** | Edit (✎), Delete (✕), Send (▶) |
| **Sending** | View Stats (📊) — polling state |
| **Sent** | View Stats (📊) |

---

### 5.3 Admin Campaign Create/Edit Form

**Route:** `/newsletter/admin/campaigns/new` | `/newsletter/admin/campaigns/[id]/edit`  
**Data source (edit):** `fetchCampaign` thunk → `selectCurrentCampaign`  
**Submit:** `createCampaign` / `updateCampaign` thunks

#### API Payload (`CampaignPayload`)
```typescript
{ subject: string, body: string }  // body is HTML
```

#### API Response (`DataResponse<Campaign>`)
```typescript
{ success: true, message: "Created", data: { /* Campaign with status="draft" */ } }
```

#### Form Layout

```
┌─────────────────────────────────────────────────────┐
│  ← Back to Campaigns                                │
│                                                     │
│  Create New Campaign                  [Save Draft]  │
│                                                     │
│  Subject *                                          │
│  ┌──────────────────────────────────────────────┐   │
│  │  Enter email subject line...                 │   │
│  └──────────────────────────────────────────────┘   │
│                                                     │
│  Email Body * (HTML)                                │
│  ┌──────────────────────────────────────────────┐   │
│  │ [Rich text editor or HTML textarea]          │   │
│  │                                              │   │
│  │                                              │   │
│  └──────────────────────────────────────────────┘   │
│                                                     │
│  Preview:                                           │
│  ┌──────────────────────────────────────────────┐   │
│  │  Subject: March Newsletter                   │   │
│  │  ─────────────────────────────────────       │   │
│  │  (Rendered HTML preview)                     │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

#### States

| State | What to show |
|-------|-------------|
| **Loading (edit)** | Form skeleton while `fetchCampaign` resolves |
| **Submitting** | Button disabled with spinner |
| **Validation error** | Inline field errors |
| **API error** | Red alert at top |
| **Success (create)** | Redirect to campaign list or edit page; toast |
| **Success (update)** | Toast; form stays editable |

---

### 5.4 Campaign Stats Panel

**Route:** As a panel on the campaign detail/edit page, or `/newsletter/admin/campaigns/[id]/stats`  
**Data source:** `fetchCampaignStats` thunk → `selectStatsByCampaignId(id)`

#### API Response (`DataResponse<CampaignStats>`)
```typescript
{
  success: true,
  data: {
    recipient_count: 150,
    sent_count: 148,
    open_count: 72,
    click_count: 23,
    open_rate: 48.65,    // percentage
    click_rate: 15.54    // percentage
  }
}
```

#### Stats Card Design

```
┌─────────────────────────────────────────────────────┐
│  Campaign Performance                                │
│                                                     │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐   │
│  │  148   │  │  72    │  │  23    │  │ 48.65% │   │
│  │  Sent  │  │ Opens  │  │ Clicks │  │Open Rt │   │
│  └────────┘  └────────┘  └────────┘  └────────┘   │
│                                                     │
│  150 recipients  ·  Sent to 148  ·  15.54% click rt│
└─────────────────────────────────────────────────────┘
```

Each stat in a small card/tile with:
- Large number (primary metric)
- Label beneath
- For rates: show as percentage with one decimal

#### States

| State | What to show |
|-------|-------------|
| **Loading** | Skeleton stat cards |
| **No stats yet** | "Stats will appear after sending begins." |
| **Loaded** | Four stat cards in a row |

**Polling:** When campaign status is "sending", poll `fetchCampaignStats` every 5-10 seconds until status changes to "sent".

---

### 5.5 Send Campaign Flow

**Trigger:** Click "Send" on a draft campaign  
**Thunk:** `sendCampaign` → `selectSendingCampaignId` → `selectIsSending`

#### Confirmation Modal

```
┌─────────────────────────────────────┐
│                                     │
│  Send Campaign?                     │
│                                     │
│  Subject: "March Newsletter"        │
│  Will be sent to 150 subscribers.   │
│                                     │
│  This action cannot be undone.      │
│                                     │
│       [Cancel]    [Send Now]        │
│                                     │
└─────────────────────────────────────┘
```

#### Sending State

- Campaign row shows animated "Sending..." badge (blue pulsing)
- Send button replaced with disabled "Sending..." state
- `selectIsSending` becomes `true`
- Stats panel (if visible) auto-polls `fetchCampaignStats` every 5s

#### Sent State

- Badge turns green "Sent"
- Stats show final numbers
- `selectSendingCampaignId` returns to `null`
- No further Send action possible

---

## 6. Shared Components & Patterns

### 6.1 Pagination Bar

```
[< Previous]  Page X of Y  [Next >]
```

- First page: Previous disabled (opacity-50, cursor-not-allowed)
- Last page: Next disabled
- Middle: both enabled
- Click fires thunk with `{ page: N }`

### 6.2 Status Badge

Small rounded pill with text + color:
- Draft: `bg-gray-100 text-gray-700`
- Published: `bg-green-100 text-green-700`  
- Sending: `bg-blue-100 text-blue-700` (with optional pulse animation)
- Sent: `bg-green-100 text-green-700`

### 6.3 Empty State

Centered column with:
- Optional icon (can use Material Symbols)
- Descriptive text
- CTA button (for admin views)

### 6.4 Error Alert

```
┌─────────────────────────────────────────────────────┐
│  ⚠ Error message from action.error.message          │
│  [Dismiss]                                          │
└─────────────────────────────────────────────────────┘
```

- Red background (`bg-red-50`, `border-red-200`, `text-red-700`)
- Dismiss button dispatches `clearError` from the appropriate slice

### 6.5 Loading Skeleton

For card grids: gray placeholder rectangles matching card dimensions.  
For tables: gray placeholder rows.  
For stat cards: gray placeholder stat tiles.

### 6.6 Confirmation Modal

```
┌─ Overlay ─────────────────────────────┐
│  ┌─ Modal ─────────────────────────┐  │
│  │  Title                          │  │
│  │  Body text explaining action    │  │
│  │                                 │  │
│  │    [Cancel]    [Confirm]        │  │
│  └─────────────────────────────────┘  │
└───────────────────────────────────────┘
```

- Overlay darkens background
- Cancel closes modal
- Confirm dispatches the destructive action
- Used for: delete post, delete category, delete tag, delete campaign, send campaign

---

## 7. Redux State → UI Mapping

### Blog State

```typescript
// Public pages use:
blog.posts          → Post cards on blog list
blog.currentPost    → Full article on detail page
blog.categories     → Category dropdown in filters/admin
blog.tags           → Tag input suggestions
blog.pagination     → Pagination bar on list
blog.loading        → Skeleton / spinner
blog.error          → Error alert

// Admin pages additionally use:
blog.adminPosts     → Admin table rows
blog.adminCategories → Admin category manager
blog.adminTags      → Admin tag manager
blog.loadingAdmin   → Admin skeleton / spinner
```

### Newsletter State

```typescript
// Public pages use:
newsletter.subscribeMessage  → Success message after subscribe
newsletter.loading           → Button spinner on subscribe form
newsletter.error             → Error alert on subscribe/unsubscribe

// Admin pages use:
newsletter.subscribers       → Subscriber table rows
newsletter.campaigns         → Campaign table rows
newsletter.currentCampaign   → Campaign edit form prefill
newsletter.campaignStats     → Stats panel cards (keyed by campaign ID)
newsletter.pagination        → Pagination bar
newsletter.sendingCampaignId → Sending state indicator
newsletter.loading           → Skeleton / spinner
newsletter.error             → Error alert
```

---

## Index of All API Endpoints (Quick Reference)

### Blog

| Method | Endpoint | Public | Response Shape |
|--------|----------|--------|---------------|
| GET | `/api/blog/posts/` | Yes | `PaginatedResponse<BlogPostSummary>` |
| GET | `/api/blog/posts/{slug}/` | Yes | `DataResponse<BlogPostDetail>` |
| GET | `/api/blog/categories/` | Yes | `BlogCategory[]` |
| GET | `/api/blog/tags/` | Yes | `BlogTag[]` |
| GET | `/api/blog/admin/posts/` | No | `PaginatedResponse<BlogPostSummary>` |
| POST | `/api/blog/admin/posts/` | No | `DataResponse<BlogPostSummary>` |
| GET | `/api/blog/admin/posts/{id}/` | No | `DataResponse<BlogPostDetail>` |
| PUT | `/api/blog/admin/posts/{id}/` | No | `DataResponse<BlogPostSummary>` |
| PATCH | `/api/blog/admin/posts/{id}/` | No | `DataResponse<BlogPostSummary>` |
| DELETE | `/api/blog/admin/posts/{id}/` | No | `MessageResponse` |
| GET | `/api/blog/admin/categories/` | No | `BlogCategory[]` |
| POST | `/api/blog/admin/categories/` | No | `DataResponse<BlogCategory>` |
| PUT | `/api/blog/admin/categories/{id}/` | No | `DataResponse<BlogCategory>` |
| DELETE | `/api/blog/admin/categories/{id}/` | No | `MessageResponse` |
| GET | `/api/blog/admin/tags/` | No | `BlogTag[]` |
| POST | `/api/blog/admin/tags/` | No | `DataResponse<BlogTag>` |
| PUT | `/api/blog/admin/tags/{id}/` | No | `DataResponse<BlogTag>` |
| DELETE | `/api/blog/admin/tags/{id}/` | No | `MessageResponse` |

### Newsletter

| Method | Endpoint | Public | Response Shape |
|--------|----------|--------|---------------|
| POST | `/api/newsletter/subscribe/` | Yes | `MessageResponse` |
| POST | `/api/newsletter/unsubscribe/` | Yes | `MessageResponse` |
| GET | `/api/newsletter/admin/subscribers/` | No | `PaginatedResponse<Subscriber>` |
| GET | `/api/newsletter/admin/campaigns/` | No | `PaginatedResponse<Campaign>` |
| POST | `/api/newsletter/admin/campaigns/` | No | `DataResponse<Campaign>` |
| GET | `/api/newsletter/admin/campaigns/{id}/` | No | `DataResponse<Campaign>` |
| PUT | `/api/newsletter/admin/campaigns/{id}/` | No | `DataResponse<Campaign>` |
| DELETE | `/api/newsletter/admin/campaigns/{id}/` | No | `MessageResponse` |
| POST | `/api/newsletter/admin/campaigns/{id}/send/` | No | `MessageResponse` |
| GET | `/api/newsletter/admin/campaigns/{id}/stats/` | No | `DataResponse<CampaignStats>` |
