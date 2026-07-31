# Frontend API Integration Guide — Blog & Newsletter Modules

This document provides detailed instructions for building the frontend data layer (services, thunks, slices, and selectors) for the Blog and Newsletter modules. The backend is a Django REST API; the frontend is a Next.js application using Redux Toolkit for state management.

---

## Table of Contents

1. [Shared Types](#1-shared-types)
2. [Blog Module](#2-blog-module)
   - [BlogService.ts](#blogservicets)
   - [blogThunks.ts](#blogthunksts)
   - [blogSlice.ts](#blog slicets)
   - [blogSelectors.ts](#blogselectorts)
3. [Newsletter Module](#3-newsletter-module)
   - [NewsletterService.ts](#newsletterservicets)
   - [newsletterThunks.ts](#newsletterthunksts)
   - [newsletterSlice.ts](#newsletterslicets)
   - [newsletterSelectors.ts](#newsletterselectorts)
4. [Store Integration](#4-store-integration)

---

## 1. Shared Types

Create a file `src/types/blog.ts` and `src/types/newsletter.ts` with the following TypeScript interfaces. These match the backend serializer output shapes exactly.

### `src/types/blog.ts`

```typescript
// ── Category ──────────────────────────────────────────────────────────────────
export interface BlogCategory {
  id: string;           // UUID
  name: string;
  slug: string;
  description: string;
  post_count: number;
}

// ── Tag ───────────────────────────────────────────────────────────────────────
export interface BlogTag {
  id: string;           // UUID
  name: string;
  slug: string;
}

// ── Post (list view) ──────────────────────────────────────────────────────────
export interface BlogPostSummary {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image: string;
  category: BlogCategory | null;
  tags: BlogTag[];
  author_name: string;
  status: "draft" | "published";
  published_at: string | null;   // ISO datetime
  view_count: number;
  created_at: string;
  updated_at: string;
}

// ── Post (detail view — includes full content) ────────────────────────────────
export interface BlogPostDetail extends BlogPostSummary {
  content: string;      // HTML
}

// ── Post create/update payload (admin) ────────────────────────────────────────
export interface BlogPostPayload {
  title: string;
  content: string;
  excerpt?: string;
  featured_image?: string;
  category_id?: string | null;   // UUID
  tag_ids?: string[];            // UUIDs
  status?: "draft" | "published";
}

// ── Category create/update payload (admin) ────────────────────────────────────
export interface BlogCategoryPayload {
  name: string;
  description?: string;
}

// ── Tag create/update payload (admin) ─────────────────────────────────────────
export interface BlogTagPayload {
  name: string;
}
```

### `src/types/newsletter.ts`

```typescript
// ── Subscriber (admin list) ───────────────────────────────────────────────────
export interface Subscriber {
  id: string;
  email: string;
  name: string;
  is_active: boolean;
  subscribed_at: string;
  unsubscribed_at: string | null;
}

// ── Subscribe request (public) ────────────────────────────────────────────────
export interface SubscribePayload {
  email: string;
  name?: string;
}

// ── Unsubscribe request (public) ──────────────────────────────────────────────
export interface UnsubscribePayload {
  token: string;
}

// ── Campaign ──────────────────────────────────────────────────────────────────
export interface Campaign {
  id: string;
  subject: string;
  body: string;                 // HTML
  created_by: string;           // UUID
  created_by_name: string;
  status: "draft" | "sending" | "sent";
  recipient_count: number;
  sent_count: number;
  open_count: number;
  click_count: number;
  created_at: string;
  sent_at: string | null;
}

// ── Campaign create/update payload (admin) ────────────────────────────────────
export interface CampaignPayload {
  subject: string;
  body: string;
}

// ── Campaign stats (admin) ────────────────────────────────────────────────────
export interface CampaignStats {
  recipient_count: number;
  sent_count: number;
  open_count: number;
  click_count: number;
  open_rate: number;             // percentage
  click_rate: number;            // percentage
}
```

### `src/types/api.ts` (shared API response shapes)

```typescript
/** Standard paginated list response */
export interface PaginatedResponse<T> {
  success: true;
  pagination: {
    count: number;
    total_pages: number;
    current_page: number;
    next: string | null;
    previous: string | null;
  };
  results: T[];
}

/** Standard single-item response */
export interface DataResponse<T> {
  success: true;
  message?: string;
  data: T;
}

/** Standard message-only response */
export interface MessageResponse {
  success: true;
  message: string;
}

/** Standard error response */
export interface ErrorResponse {
  success: false;
  error: {
    code?: string;
    message: string;
    detail?: Record<string, string[]>;
  };
}
```

---

## 2. Blog Module

### BlogService.ts

**File: `src/services/BlogService.ts`**

This service encapsulates all HTTP calls to `/api/blog/` endpoints. It uses an axios instance that already includes the `Authorization` header when the user is logged in.

```typescript
import apiClient from "./apiClient"; // your pre-configured axios instance
import type {
  PaginatedResponse,
  DataResponse,
  MessageResponse,
} from "@/types/api";
import type {
  BlogPostSummary,
  BlogPostDetail,
  BlogPostPayload,
  BlogCategory,
  BlogCategoryPayload,
  BlogTag,
  BlogTagPayload,
} from "@/types/blog";

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC ENDPOINTS  (no auth required)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/blog/posts/
 *
 * Fetch published blog posts. Supports filtering via query params.
 *
 * @param params.category - Filter by category slug
 * @param params.tag       - Filter by tag slug
 * @param params.search    - Search in title (case-insensitive)
 * @param params.page      - Page number (default: 1)
 * @param params.page_size - Items per page (default: 20, max: 100)
 *
 * Response shape:
 * {
 *   "success": true,
 *   "pagination": { "count": N, "total_pages": N, "current_page": 1, ... },
 *   "results": [
 *     {
 *       "id": "uuid",
 *       "title": "...",
 *       "slug": "...",
 *       "excerpt": "...",
 *       "featured_image": "...",
 *       "category": { "id": "uuid", "name": "...", "slug": "...", ... },
 *       "tags": [ { "id": "uuid", "name": "...", "slug": "..." } ],
 *       "author_name": "Full Name",
 *       "status": "published",
 *       "published_at": "2026-07-30T10:00:00Z",
 *       "view_count": 42,
 *       "created_at": "...",
 *       "updated_at": "..."
 *     }
 *   ]
 * }
 */
export async function fetchPublicPosts(params?: {
  category?: string;
  tag?: string;
  search?: string;
  page?: number;
  page_size?: number;
}): Promise<PaginatedResponse<BlogPostSummary>> {
  const { data } = await apiClient.get("/api/blog/posts/", { params });
  return data;
}

/**
 * GET /api/blog/posts/<slug>/
 *
 * Fetch a single published post by its slug. Increments the view count
 * on the backend.
 *
 * Response shape:
 * {
 *   "success": true,
 *   "data": {
 *     "id": "uuid",
 *     "title": "...",
 *     "slug": "...",
 *     "content": "<h1>Full HTML body</h1>",
 *     "excerpt": "...",
 *     "featured_image": "...",
 *     "category": { ... },
 *     "tags": [ ... ],
 *     "author_name": "...",
 *     "status": "published",
 *     "published_at": "...",
 *     "view_count": 43,   // incremented on each fetch
 *     "created_at": "...",
 *     "updated_at": "..."
 *   }
 * }
 */
export async function fetchPublicPostBySlug(
  slug: string
): Promise<DataResponse<BlogPostDetail>> {
  const { data } = await apiClient.get(`/api/blog/posts/${slug}/`);
  return data;
}

/**
 * GET /api/blog/categories/
 *
 * Fetch all blog categories.
 *
 * Response: BlogCategory[]  (not wrapped in success envelope; it's a list endpoint)
 */
export async function fetchCategories(): Promise<BlogCategory[]> {
  const { data } = await apiClient.get("/api/blog/categories/");
  return data;
}

/**
 * GET /api/blog/tags/
 *
 * Fetch all blog tags.
 *
 * Response: BlogTag[]  (not wrapped in success envelope)
 */
export async function fetchTags(): Promise<BlogTag[]> {
  const { data } = await apiClient.get("/api/blog/tags/");
  return data;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN ENDPOINTS  (auth required — admin role)
// ═══════════════════════════════════════════════════════════════════════════════

// ── Posts ─────────────────────────────────────────────────────────────────────

/**
 * GET /api/blog/admin/posts/
 *
 * Fetch all posts (including drafts). Paginated.
 *
 * Response: same as fetchPublicPosts but includes drafts.
 */
export async function fetchAdminPosts(params?: {
  page?: number;
  page_size?: number;
}): Promise<PaginatedResponse<BlogPostSummary>> {
  const { data } = await apiClient.get("/api/blog/admin/posts/", { params });
  return data;
}

/**
 * GET /api/blog/admin/posts/<post_id>/
 *
 * Fetch a single post by UUID (any status).
 *
 * Response:
 * {
 *   "success": true,
 *   "data": { ... BlogPostDetail (includes 'content', 'slug', etc.) }
 * }
 */
export async function fetchAdminPost(
  postId: string
): Promise<DataResponse<BlogPostDetail>> {
  const { data } = await apiClient.get(`/api/blog/admin/posts/${postId}/`);
  return data;
}

/**
 * POST /api/blog/admin/posts/
 *
 * Create a new blog post (draft or published).
 *
 * Request body:
 * {
 *   "title": "How Recycling Works",              // required
 *   "content": "<h1>Full HTML content</h1>",     // required
 *   "excerpt": "Short summary",                  // optional
 *   "featured_image": "https://...",             // optional
 *   "category_id": "uuid",                       // optional, nullable
 *   "tag_ids": ["uuid", "uuid"],                 // optional
 *   "status": "draft"                            // optional, defaults to "draft"
 * }
 *
 * Response (201):
 * {
 *   "success": true,
 *   "message": "Created",
 *   "data": { ... BlogPostSummary with generated 'slug', 'author_name', etc. }
 * }
 *
 * Notes:
 * - 'slug' is auto-generated from title (appended with -N if duplicate)
 * - 'published_at' is auto-set to now when status="published"
 * - 'author' is set to the authenticated admin user
 */
export async function createPost(
  payload: BlogPostPayload
): Promise<DataResponse<BlogPostSummary>> {
  const { data } = await apiClient.post("/api/blog/admin/posts/", payload);
  return data;
}

/**
 * PUT /api/blog/admin/posts/<post_id>/
 *
 * Fully update a blog post.
 *
 * Request body: same shape as createPost
 *
 * Response: { "success": true, "data": { ... updated BlogPostSummary } }
 *
 * Notes:
 * - Changing status from "draft" → "published" sets published_at to now
 * - Only publish once; subsequent updates keep the original published_at
 */
export async function updatePost(
  postId: string,
  payload: Partial<BlogPostPayload>
): Promise<DataResponse<BlogPostSummary>> {
  const { data } = await apiClient.put(
    `/api/blog/admin/posts/${postId}/`,
    payload
  );
  return data;
}

/**
 * PATCH /api/blog/admin/posts/<post_id>/
 *
 * Partially update a blog post (send only the fields to change).
 *
 * Response: same as updatePost
 */
export async function patchPost(
  postId: string,
  payload: Partial<BlogPostPayload>
): Promise<DataResponse<BlogPostSummary>> {
  const { data } = await apiClient.patch(
    `/api/blog/admin/posts/${postId}/`,
    payload
  );
  return data;
}

/**
 * DELETE /api/blog/admin/posts/<post_id>/
 *
 * Delete a blog post permanently.
 *
 * Response: { "success": true, "message": "Post deleted." }
 */
export async function deletePost(
  postId: string
): Promise<MessageResponse> {
  const { data } = await apiClient.delete(
    `/api/blog/admin/posts/${postId}/`
  );
  return data;
}

// ── Categories (Admin) ────────────────────────────────────────────────────────

/**
 * GET /api/blog/admin/categories/
 *
 * Fetch all categories (admin — same as public for now).
 */
export async function fetchAdminCategories(): Promise<BlogCategory[]> {
  const { data } = await apiClient.get("/api/blog/admin/categories/");
  return data;
}

/**
 * POST /api/blog/admin/categories/
 *
 * Create a category.
 *
 * Request body:
 * {
 *   "name": "Plastics",              // required
 *   "description": "About plastics"  // optional
 * }
 *
 * Response (201): { "success": true, "message": "Created", "data": { ... } }
 * 'slug' is auto-generated from 'name'
 */
export async function createCategory(
  payload: BlogCategoryPayload
): Promise<DataResponse<BlogCategory>> {
  const { data } = await apiClient.post(
    "/api/blog/admin/categories/",
    payload
  );
  return data;
}

/**
 * PUT /api/blog/admin/categories/<category_id>/
 *
 * Update a category.
 *
 * Response: { "success": true, "data": { ... } }
 */
export async function updateCategory(
  categoryId: string,
  payload: BlogCategoryPayload
): Promise<DataResponse<BlogCategory>> {
  const { data } = await apiClient.put(
    `/api/blog/admin/categories/${categoryId}/`,
    payload
  );
  return data;
}

/**
 * DELETE /api/blog/admin/categories/<category_id>/
 *
 * Delete a category (sets post.category to null).
 *
 * Response: { "success": true, "message": "OK" }
 */
export async function deleteCategory(
  categoryId: string
): Promise<MessageResponse> {
  const { data } = await apiClient.delete(
    `/api/blog/admin/categories/${categoryId}/`
  );
  return data;
}

// ── Tags (Admin) ──────────────────────────────────────────────────────────────

/**
 * GET /api/blog/admin/tags/
 *
 * Fetch all tags.
 */
export async function fetchAdminTags(): Promise<BlogTag[]> {
  const { data } = await apiClient.get("/api/blog/admin/tags/");
  return data;
}

/**
 * POST /api/blog/admin/tags/
 *
 * Create a tag.
 *
 * Request body:  { "name": "recycling" }
 * Response (201): { "success": true, "message": "Created", "data": { ... } }
 */
export async function createTag(
  payload: BlogTagPayload
): Promise<DataResponse<BlogTag>> {
  const { data } = await apiClient.post("/api/blog/admin/tags/", payload);
  return data;
}

/**
 * PUT /api/blog/admin/tags/<tag_id>/
 *
 * Update a tag.
 */
export async function updateTag(
  tagId: string,
  payload: BlogTagPayload
): Promise<DataResponse<BlogTag>> {
  const { data } = await apiClient.put(
    `/api/blog/admin/tags/${tagId}/`,
    payload
  );
  return data;
}

/**
 * DELETE /api/blog/admin/tags/<tag_id>/
 *
 * Delete a tag (disassociates from posts).
 *
 * Response: { "success": true, "message": "OK" }
 */
export async function deleteTag(
  tagId: string
): Promise<MessageResponse> {
  const { data } = await apiClient.delete(
    `/api/blog/admin/tags/${tagId}/`
  );
  return data;
}
```

### blogThunks.ts

**File: `src/store/blog/blogThunks.ts`**

Thunks bridge the service layer to Redux. Each thunk calls a service function and dispatches pending/fulfilled/rejected actions automatically via `createAsyncThunk`.

```typescript
import { createAsyncThunk } from "@reduxjs/toolkit";
import * as BlogService from "@/services/BlogService";
import type {
  BlogPostSummary,
  BlogPostDetail,
  BlogPostPayload,
  BlogCategory,
  BlogCategoryPayload,
  BlogTag,
  BlogTagPayload,
} from "@/types/blog";

// ── Public Thunks ─────────────────────────────────────────────────────────────

/**
 * Fetch paginated published blog posts.
 * Supports optional filtering by category slug, tag slug, and search text.
 *
 * Usage in component:
 *   dispatch(fetchPosts({ category: "plastics", page: 1 }))
 *
 * State keys populated:
 *   blog.posts         → BlogPostSummary[]
 *   blog.pagination    → pagination metadata
 *   blog.loading       → true while fetching
 *   blog.error         → string | null on failure
 */
export const fetchPosts = createAsyncThunk(
  "blog/fetchPosts",
  async (params: {
    category?: string;
    tag?: string;
    search?: string;
    page?: number;
    page_size?: number;
  }) => {
    const response = await BlogService.fetchPublicPosts(params);
    return response; // { pagination, results }
  }
);

/**
 * Fetch a single published post by its slug.
 * Backend increments view_count automatically.
 *
 * Usage:
 *   dispatch(fetchPostBySlug("how-recycling-works"))
 *
 * State keys populated:
 *   blog.currentPost → BlogPostDetail
 *   blog.loading     → true
 */
export const fetchPostBySlug = createAsyncThunk(
  "blog/fetchPostBySlug",
  async (slug: string) => {
    const response = await BlogService.fetchPublicPostBySlug(slug);
    return response.data; // BlogPostDetail
  }
);

/**
 * Fetch all blog categories (public).
 *
 * Usage:
 *   dispatch(fetchCategories())
 *
 * State keys populated:
 *   blog.categories → BlogCategory[]
 */
export const fetchCategories = createAsyncThunk(
  "blog/fetchCategories",
  async () => {
    return await BlogService.fetchCategories();
  }
);

/**
 * Fetch all blog tags (public).
 *
 * Usage:
 *   dispatch(fetchTags())
 *
 * State keys populated:
 *   blog.tags → BlogTag[]
 */
export const fetchTags = createAsyncThunk(
  "blog/fetchTags",
  async () => {
    return await BlogService.fetchTags();
  }
);

// ── Admin Thunks ──────────────────────────────────────────────────────────────

/**
 * Fetch all posts including drafts (admin-only).
 * Requires authenticated admin user.
 */
export const fetchAdminPosts = createAsyncThunk(
  "blog/fetchAdminPosts",
  async (params?: { page?: number; page_size?: number }) => {
    const response = await BlogService.fetchAdminPosts(params);
    return response;
  }
);

/**
 * Fetch a single post by UUID (any status, admin-only).
 */
export const fetchAdminPost = createAsyncThunk(
  "blog/fetchAdminPost",
  async (postId: string) => {
    const response = await BlogService.fetchAdminPost(postId);
    return response.data;
  }
);

/**
 * Create a new blog post (admin-only).
 *
 * @param payload - BlogPostPayload (title, content, status, etc.)
 *                  Set status="published" to publish immediately.
 *
 * After creation, the frontend should typically navigate to the
 * edit page or refresh the admin list.
 */
export const createPost = createAsyncThunk(
  "blog/createPost",
  async (payload: BlogPostPayload) => {
    const response = await BlogService.createPost(payload);
    return response.data;
  }
);

/**
 * Fully update a blog post (admin-only).
 */
export const updatePost = createAsyncThunk(
  "blog/updatePost",
  async ({ postId, payload }: { postId: string; payload: BlogPostPayload }) => {
    const response = await BlogService.updatePost(postId, payload);
    return response.data;
  }
);

/**
 * Partially update a blog post (admin-only).
 * Only sends the fields that need to change.
 */
export const patchPost = createAsyncThunk(
  "blog/patchPost",
  async ({
    postId,
    payload,
  }: {
    postId: string;
    payload: Partial<BlogPostPayload>;
  }) => {
    const response = await BlogService.patchPost(postId, payload);
    return response.data;
  }
);

/**
 * Delete a blog post (admin-only).
 */
export const deletePost = createAsyncThunk(
  "blog/deletePost",
  async (postId: string) => {
    await BlogService.deletePost(postId);
    return postId; // return the ID so the slice can remove it from the list
  }
);

/**
 * Create a category (admin-only).
 */
export const createCategory = createAsyncThunk(
  "blog/createCategory",
  async (payload: BlogCategoryPayload) => {
    const response = await BlogService.createCategory(payload);
    return response.data;
  }
);

/**
 * Update a category (admin-only).
 */
export const updateCategory = createAsyncThunk(
  "blog/updateCategory",
  async ({
    categoryId,
    payload,
  }: {
    categoryId: string;
    payload: BlogCategoryPayload;
  }) => {
    const response = await BlogService.updateCategory(categoryId, payload);
    return response.data;
  }
);

/**
 * Delete a category (admin-only).
 */
export const deleteCategory = createAsyncThunk(
  "blog/deleteCategory",
  async (categoryId: string) => {
    await BlogService.deleteCategory(categoryId);
    return categoryId;
  }
);

/**
 * Create a tag (admin-only).
 */
export const createTag = createAsyncThunk(
  "blog/createTag",
  async (payload: BlogTagPayload) => {
    const response = await BlogService.createTag(payload);
    return response.data;
  }
);

/**
 * Update a tag (admin-only).
 */
export const updateTag = createAsyncThunk(
  "blog/updateTag",
  async ({ tagId, payload }: { tagId: string; payload: BlogTagPayload }) => {
    const response = await BlogService.updateTag(tagId, payload);
    return response.data;
  }
);

/**
 * Delete a tag (admin-only).
 */
export const deleteTag = createAsyncThunk(
  "blog/deleteTag",
  async (tagId: string) => {
    await BlogService.deleteTag(tagId);
    return tagId;
  }
);
```

### blogSlice.ts

**File: `src/store/blog/blogSlice.ts`**

The slice manages the blog state tree: lists, current post, categories, tags, loading flags, and error messages. Every async thunk above updates precisely the fields that changed.

```typescript
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  BlogPostSummary,
  BlogPostDetail,
  BlogCategory,
  BlogTag,
} from "@/types/blog";
import type { PaginatedResponse } from "@/types/api";
import * as blogThunks from "./blogThunks";

// ── State Shape ───────────────────────────────────────────────────────────────

export interface BlogState {
  // Public
  posts: BlogPostSummary[];
  currentPost: BlogPostDetail | null;
  categories: BlogCategory[];
  tags: BlogTag[];

  // Admin
  adminPosts: BlogPostSummary[];
  adminCategories: BlogCategory[];
  adminTags: BlogTag[];

  // Pagination (public + admin re-use same shape)
  pagination: {
    count: number;
    total_pages: number;
    current_page: number;
    next: string | null;
    previous: string | null;
  } | null;

  // UI state
  loading: boolean;
  loadingAdmin: boolean;
  error: string | null;
}

const initialState: BlogState = {
  posts: [],
  currentPost: null,
  categories: [],
  tags: [],
  adminPosts: [],
  adminCategories: [],
  adminTags: [],
  pagination: null,
  loading: false,
  loadingAdmin: false,
  error: null,
};

// ── Slice ─────────────────────────────────────────────────────────────────────

const blogSlice = createSlice({
  name: "blog",
  initialState,
  reducers: {
    /** Clear the current post (e.g. when navigating away from detail page). */
    clearCurrentPost(state) {
      state.currentPost = null;
    },
    /** Clear any stored error. */
    clearError(state) {
      state.error = null;
    },
    /** Reset entire blog state (useful on logout). */
    resetBlog() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    // ── Public: fetchPosts ──────────────────────────────────────────────────
    builder.addCase(blogThunks.fetchPosts.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(blogThunks.fetchPosts.fulfilled, (state, action) => {
      state.loading = false;
      state.posts = action.payload.results;
      state.pagination = action.payload.pagination;
    });
    builder.addCase(blogThunks.fetchPosts.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message ?? "Failed to fetch posts";
    });

    // ── Public: fetchPostBySlug ─────────────────────────────────────────────
    builder.addCase(blogThunks.fetchPostBySlug.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(blogThunks.fetchPostBySlug.fulfilled, (state, action) => {
      state.loading = false;
      state.currentPost = action.payload;
    });
    builder.addCase(blogThunks.fetchPostBySlug.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message ?? "Post not found";
    });

    // ── Public: fetchCategories ─────────────────────────────────────────────
    builder.addCase(blogThunks.fetchCategories.fulfilled, (state, action) => {
      state.categories = action.payload;
    });

    // ── Public: fetchTags ───────────────────────────────────────────────────
    builder.addCase(blogThunks.fetchTags.fulfilled, (state, action) => {
      state.tags = action.payload;
    });

    // ── Admin: fetchAdminPosts ──────────────────────────────────────────────
    builder.addCase(blogThunks.fetchAdminPosts.pending, (state) => {
      state.loadingAdmin = true;
      state.error = null;
    });
    builder.addCase(
      blogThunks.fetchAdminPosts.fulfilled,
      (state, action: PayloadAction<PaginatedResponse<BlogPostSummary>>) => {
        state.loadingAdmin = false;
        state.adminPosts = action.payload.results;
        state.pagination = action.payload.pagination;
      }
    );
    builder.addCase(blogThunks.fetchAdminPosts.rejected, (state, action) => {
      state.loadingAdmin = false;
      state.error = action.error.message ?? "Failed to fetch admin posts";
    });

    // ── Admin: createPost ───────────────────────────────────────────────────
    builder.addCase(blogThunks.createPost.fulfilled, (state, action) => {
      state.adminPosts.unshift(action.payload);
    });

    // ── Admin: updatePost / patchPost ───────────────────────────────────────
    builder.addCase(blogThunks.updatePost.fulfilled, (state, action) => {
      const idx = state.adminPosts.findIndex((p) => p.id === action.payload.id);
      if (idx !== -1) state.adminPosts[idx] = action.payload;
      if (state.currentPost?.id === action.payload.id) {
        state.currentPost = { ...state.currentPost, ...action.payload };
      }
    });
    builder.addCase(blogThunks.patchPost.fulfilled, (state, action) => {
      const idx = state.adminPosts.findIndex((p) => p.id === action.payload.id);
      if (idx !== -1) state.adminPosts[idx] = action.payload;
      if (state.currentPost?.id === action.payload.id) {
        state.currentPost = { ...state.currentPost, ...action.payload };
      }
    });

    // ── Admin: deletePost ───────────────────────────────────────────────────
    builder.addCase(blogThunks.deletePost.fulfilled, (state, action) => {
      state.adminPosts = state.adminPosts.filter(
        (p) => p.id !== action.payload
      );
      if (state.currentPost?.id === action.payload) {
        state.currentPost = null;
      }
    });

    // ── Admin: createCategory ───────────────────────────────────────────────
    builder.addCase(blogThunks.createCategory.fulfilled, (state, action) => {
      state.categories.unshift(action.payload);
      state.adminCategories.unshift(action.payload);
    });

    // ── Admin: updateCategory ───────────────────────────────────────────────
    builder.addCase(blogThunks.updateCategory.fulfilled, (state, action) => {
      const update = (arr: BlogCategory[]) => {
        const idx = arr.findIndex((c) => c.id === action.payload.id);
        if (idx !== -1) arr[idx] = action.payload;
      };
      update(state.categories);
      update(state.adminCategories);
    });

    // ── Admin: deleteCategory ───────────────────────────────────────────────
    builder.addCase(blogThunks.deleteCategory.fulfilled, (state, action) => {
      const remove = (arr: BlogCategory[]) =>
        arr.filter((c) => c.id !== action.payload);
      state.categories = remove(state.categories);
      state.adminCategories = remove(state.adminCategories);
    });

    // ── Admin: createTag ────────────────────────────────────────────────────
    builder.addCase(blogThunks.createTag.fulfilled, (state, action) => {
      state.tags.unshift(action.payload);
      state.adminTags.unshift(action.payload);
    });

    // ── Admin: updateTag ────────────────────────────────────────────────────
    builder.addCase(blogThunks.updateTag.fulfilled, (state, action) => {
      const update = (arr: BlogTag[]) => {
        const idx = arr.findIndex((t) => t.id === action.payload.id);
        if (idx !== -1) arr[idx] = action.payload;
      };
      update(state.tags);
      update(state.adminTags);
    });

    // ── Admin: deleteTag ────────────────────────────────────────────────────
    builder.addCase(blogThunks.deleteTag.fulfilled, (state, action) => {
      const remove = (arr: BlogTag[]) =>
        arr.filter((t) => t.id !== action.payload);
      state.tags = remove(state.tags);
      state.adminTags = remove(state.adminTags);
    });
  },
});

export const { clearCurrentPost, clearError, resetBlog } = blogSlice.actions;
export default blogSlice.reducer;
```

### blogSelectors.ts

**File: `src/store/blog/blogSelectors.ts`**

Selectors provide a clean interface for UI components to read state and derive computed values (e.g. pagination metadata, loading + error combos).

```typescript
import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "@/store"; // your store root types

// ── Base selector ─────────────────────────────────────────────────────────────
const selectBlogState = (state: RootState) => state.blog;

// ── Public selectors ──────────────────────────────────────────────────────────

/** All published posts from the current page. */
export const selectPosts = createSelector(
  selectBlogState,
  (blog) => blog.posts
);

/** Pagination metadata for the current post list. */
export const selectPagination = createSelector(
  selectBlogState,
  (blog) => blog.pagination
);

/** Currently viewed post detail (full content). Null if no post is selected. */
export const selectCurrentPost = createSelector(
  selectBlogState,
  (blog) => blog.currentPost
);

/** All blog categories. */
export const selectCategories = createSelector(
  selectBlogState,
  (blog) => blog.categories
);

/** All blog tags. */
export const selectTags = createSelector(
  selectBlogState,
  (blog) => blog.tags
);

/**
 * Loading state for public blog pages.
 * True when fetching the post list or a single post.
 */
export const selectBlogLoading = createSelector(
  selectBlogState,
  (blog) => blog.loading
);

/**
 * Any error message from the last blog API call.
 * Null when the last call succeeded.
 */
export const selectBlogError = createSelector(
  selectBlogState,
  (blog) => blog.error
);

// ── Derived selectors ─────────────────────────────────────────────────────────

/** Total number of published posts across all pages. */
export const selectTotalPosts = createSelector(
  selectPagination,
  (pagination) => pagination?.count ?? 0
);

/** Whether there is a next page of posts. */
export const selectHasNextPage = createSelector(
  selectPagination,
  (pagination) => pagination?.next !== null
);

/** Whether there is a previous page of posts. */
export const selectHasPrevPage = createSelector(
  selectPagination,
  (pagination) => pagination?.previous !== null
);

/** Current page number. */
export const selectCurrentPage = createSelector(
  selectPagination,
  (pagination) => pagination?.current_page ?? 1
);

/** Total number of pages. */
export const selectTotalPages = createSelector(
  selectPagination,
  (pagination) => pagination?.total_pages ?? 1
);

// ── Admin selectors ───────────────────────────────────────────────────────────

/** All posts including drafts for the admin panel. */
export const selectAdminPosts = createSelector(
  selectBlogState,
  (blog) => blog.adminPosts
);

/** Loading state for admin blog operations. */
export const selectAdminBlogLoading = createSelector(
  selectBlogState,
  (blog) => blog.loadingAdmin
);

/** Posts filtered by status (useful for admin tabs: Drafts vs Published). */
export const selectAdminPostsByStatus = (status: "draft" | "published") =>
  createSelector(selectAdminPosts, (posts) =>
    posts.filter((p) => p.status === status)
  );

/** Post by ID (useful for edit page). */
export const selectAdminPostById = (postId: string) =>
  createSelector(selectAdminPosts, (posts) =>
    posts.find((p) => p.id === postId) ?? null
  );
```

---

## 3. Newsletter Module

### NewsletterService.ts

**File: `src/services/NewsletterService.ts`**

```typescript
import apiClient from "./apiClient";
import type {
  PaginatedResponse,
  DataResponse,
  MessageResponse,
} from "@/types/api";
import type {
  SubscribePayload,
  Subscriber,
  Campaign,
  CampaignPayload,
  CampaignStats,
} from "@/types/newsletter";

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC ENDPOINTS  (no auth required)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * POST /api/newsletter/subscribe/
 *
 * Subscribe a visitor to the newsletter.
 *
 * Request body:
 * {
 *   "email": "user@example.com",   // required
 *   "name": "John"                   // optional
 * }
 *
 * New subscription:
 *   { "success": true, "message": "Subscribed successfully." }
 *
 * Already active:
 *   { "success": true, "message": "Already subscribed." }
 *
 * Re-activating (was previously unsubscribed):
 *   { "success": true, "message": "Subscription reactivated." }
 */
export async function subscribe(
  payload: SubscribePayload
): Promise<MessageResponse> {
  const { data } = await apiClient.post("/api/newsletter/subscribe/", payload);
  return data;
}

/**
 * POST /api/newsletter/unsubscribe/
 *
 * Unsubscribe using the token from the email link.
 *
 * Request body:
 * {
 *   "token": "abc123..."  // 64-char hex token stored per subscriber
 * }
 *
 * Success:
 *   { "success": true, "message": "Unsubscribed successfully." }
 *
 * Invalid token (404):
 *   { "detail": "Invalid or expired token." }
 *
 * Missing token (400):
 *   { "detail": "Unsubscribe token is required." }
 */
export async function unsubscribe(
  payload: { token: string }
): Promise<MessageResponse> {
  const { data } = await apiClient.post(
    "/api/newsletter/unsubscribe/",
    payload
  );
  return data;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN ENDPOINTS  (auth required)
// ═══════════════════════════════════════════════════════════════════════════════

// ── Subscribers ───────────────────────────────────────────────────────────────

/**
 * GET /api/newsletter/admin/subscribers/
 *
 * List all subscribers (active and inactive). Paginated.
 *
 * Response:
 * {
 *   "success": true,
 *   "pagination": { "count": N, ... },
 *   "results": [
 *     {
 *       "id": "uuid",
 *       "email": "user@example.com",
 *       "name": "John",
 *       "is_active": true,
 *       "subscribed_at": "2026-07-30T10:00:00Z",
 *       "unsubscribed_at": null
 *     }
 *   ]
 * }
 */
export async function fetchSubscribers(params?: {
  page?: number;
  page_size?: number;
}): Promise<PaginatedResponse<Subscriber>> {
  const { data } = await apiClient.get("/api/newsletter/admin/subscribers/", {
    params,
  });
  return data;
}

// ── Campaigns ─────────────────────────────────────────────────────────────────

/**
 * GET /api/newsletter/admin/campaigns/
 *
 * List all campaigns. Paginated.
 *
 * Response shape:
 * {
 *   "success": true,
 *   "pagination": { ... },
 *   "results": [
 *     {
 *       "id": "uuid",
 *       "subject": "March Newsletter",
 *       "body": "<h1>HTML content</h1>",
 *       "created_by": "admin-uuid",
 *       "created_by_name": "Admin Name",
 *       "status": "draft",           // "draft" | "sending" | "sent"
 *       "recipient_count": 150,
 *       "sent_count": 0,
 *       "open_count": 0,
 *       "click_count": 0,
 *       "created_at": "2026-07-30T10:00:00Z",
 *       "sent_at": null
 *     }
 *   ]
 * }
 */
export async function fetchCampaigns(params?: {
  page?: number;
  page_size?: number;
}): Promise<PaginatedResponse<Campaign>> {
  const { data } = await apiClient.get("/api/newsletter/admin/campaigns/", {
    params,
  });
  return data;
}

/**
 * GET /api/newsletter/admin/campaigns/<campaign_id>/
 *
 * Fetch a single campaign.
 *
 * Response: { "success": true, "data": { ... Campaign } }
 */
export async function fetchCampaign(
  campaignId: string
): Promise<DataResponse<Campaign>> {
  const { data } = await apiClient.get(
    `/api/newsletter/admin/campaigns/${campaignId}/`
  );
  return data;
}

/**
 * POST /api/newsletter/admin/campaigns/
 *
 * Create a new campaign (starts as "draft").
 *
 * Request body:
 * {
 *   "subject": "March Newsletter",        // required
 *   "body": "<h1>Full HTML content</h1>"  // required
 * }
 *
 * Response (201):
 * {
 *   "success": true,
 *   "message": "Created",
 *   "data": { ... Campaign with status="draft" }
 * }
 * Note: 'created_by' is set to the authenticated admin automatically.
 */
export async function createCampaign(
  payload: CampaignPayload
): Promise<DataResponse<Campaign>> {
  const { data } = await apiClient.post(
    "/api/newsletter/admin/campaigns/",
    payload
  );
  return data;
}

/**
 * PUT /api/newsletter/admin/campaigns/<campaign_id>/
 *
 * Update a campaign (only allowed while still "draft").
 *
 * Request body: { "subject": "Updated", "body": "Updated HTML" }
 * Response: { "success": true, "data": { ... updated Campaign } }
 */
export async function updateCampaign(
  campaignId: string,
  payload: CampaignPayload
): Promise<DataResponse<Campaign>> {
  const { data } = await apiClient.put(
    `/api/newsletter/admin/campaigns/${campaignId}/`,
    payload
  );
  return data;
}

/**
 * DELETE /api/newsletter/admin/campaigns/<campaign_id>/
 *
 * Delete a campaign.
 *
 * Response: { "success": true, "message": "Campaign deleted." }
 */
export async function deleteCampaign(
  campaignId: string
): Promise<MessageResponse> {
  const { data } = await apiClient.delete(
    `/api/newsletter/admin/campaigns/${campaignId}/`
  );
  return data;
}

/**
 * POST /api/newsletter/admin/campaigns/<campaign_id>/send/
 *
 * Trigger sending a campaign to all active subscribers.
 * Dispatches a Celery background task. Returns immediately.
 *
 * Success (202):
 *   { "success": true, "message": "Accepted — processing in background" }
 *
 * Already sent (400):
 *   { "detail": "Only draft campaigns can be sent." }
 *
 * Notes:
 * - Campaign status changes: "draft" → "sending" → "sent"
 * - Each subscriber gets a CampaignRecipient record created.
 * - The frontend should poll GET /stats/ after a delay to see delivery progress.
 */
export async function sendCampaign(
  campaignId: string
): Promise<MessageResponse> {
  const { data } = await apiClient.post(
    `/api/newsletter/admin/campaigns/${campaignId}/send/`
  );
  return data;
}

/**
 * GET /api/newsletter/admin/campaigns/<campaign_id>/stats/
 *
 * Fetch delivery and engagement stats for a sent campaign.
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "recipient_count": 150,
 *     "sent_count": 148,
 *     "open_count": 72,
 *     "click_count": 23,
 *     "open_rate": 48.65,      // percentage
 *     "click_rate": 15.54      // percentage
 *   }
 * }
 */
export async function fetchCampaignStats(
  campaignId: string
): Promise<DataResponse<CampaignStats>> {
  const { data } = await apiClient.get(
    `/api/newsletter/admin/campaigns/${campaignId}/stats/`
  );
  return data;
}
```

### newsletterThunks.ts

**File: `src/store/newsletter/newsletterThunks.ts`**

```typescript
import { createAsyncThunk } from "@reduxjs/toolkit";
import * as NewsletterService from "@/services/NewsletterService";
import type {
  SubscribePayload,
  CampaignPayload,
  Campaign,
  CampaignStats,
  Subscriber,
} from "@/types/newsletter";

// ── Public Thunks ─────────────────────────────────────────────────────────────

/**
 * Subscribe an email to the newsletter.
 *
 * Usage:
 *   dispatch(subscribe({ email: "user@example.com", name: "John" }))
 *
 * The fulfilled action payload is the message string.
 */
export const subscribe = createAsyncThunk(
  "newsletter/subscribe",
  async (payload: SubscribePayload) => {
    const response = await NewsletterService.subscribe(payload);
    return response.message;
  }
);

/**
 * Unsubscribe using the token from the email.
 */
export const unsubscribe = createAsyncThunk(
  "newsletter/unsubscribe",
  async (token: string) => {
    await NewsletterService.unsubscribe({ token });
  }
);

// ── Admin Thunks ──────────────────────────────────────────────────────────────

/**
 * Fetch all subscribers (paginated).
 */
export const fetchSubscribers = createAsyncThunk(
  "newsletter/fetchSubscribers",
  async (params?: { page?: number; page_size?: number }) => {
    const response = await NewsletterService.fetchSubscribers(params);
    return response; // { pagination, results }
  }
);

/**
 * Fetch all campaigns (paginated).
 */
export const fetchCampaigns = createAsyncThunk(
  "newsletter/fetchCampaigns",
  async (params?: { page?: number; page_size?: number }) => {
    const response = await NewsletterService.fetchCampaigns(params);
    return response;
  }
);

/**
 * Fetch a single campaign by ID.
 */
export const fetchCampaign = createAsyncThunk(
  "newsletter/fetchCampaign",
  async (campaignId: string) => {
    const response = await NewsletterService.fetchCampaign(campaignId);
    return response.data;
  }
);

/**
 * Create a new campaign (draft).
 */
export const createCampaign = createAsyncThunk(
  "newsletter/createCampaign",
  async (payload: CampaignPayload) => {
    const response = await NewsletterService.createCampaign(payload);
    return response.data;
  }
);

/**
 * Update an existing campaign.
 */
export const updateCampaign = createAsyncThunk(
  "newsletter/updateCampaign",
  async ({
    campaignId,
    payload,
  }: {
    campaignId: string;
    payload: CampaignPayload;
  }) => {
    const response = await NewsletterService.updateCampaign(
      campaignId,
      payload
    );
    return response.data;
  }
);

/**
 * Delete a campaign.
 */
export const deleteCampaign = createAsyncThunk(
  "newsletter/deleteCampaign",
  async (campaignId: string) => {
    await NewsletterService.deleteCampaign(campaignId);
    return campaignId;
  }
);

/**
 * Trigger sending a campaign. The backend processes this in a
 * Celery background task.
 *
 * The frontend should show a "sending" state and periodically
 * poll fetchCampaignStats to monitor progress.
 */
export const sendCampaign = createAsyncThunk(
  "newsletter/sendCampaign",
  async (campaignId: string) => {
    const response = await NewsletterService.sendCampaign(campaignId);
    return { campaignId, message: response.message };
  }
);

/**
 * Fetch campaign delivery/engagement stats.
 */
export const fetchCampaignStats = createAsyncThunk(
  "newsletter/fetchCampaignStats",
  async (campaignId: string) => {
    const response = await NewsletterService.fetchCampaignStats(campaignId);
    return { campaignId, stats: response.data };
  }
);
```

### newsletterSlice.ts

**File: `src/store/newsletter/newsletterSlice.ts`**

```typescript
import { createSlice } from "@reduxjs/toolkit";
import type { Campaign, CampaignStats, Subscriber } from "@/types/newsletter";
import type { PaginatedResponse } from "@/types/api";
import * as newsletterThunks from "./newsletterThunks";

// ── State Shape ───────────────────────────────────────────────────────────────

export interface NewsletterState {
  subscribers: Subscriber[];
  campaigns: Campaign[];
  currentCampaign: Campaign | null;
  campaignStats: Record<string, CampaignStats>; // keyed by campaign ID

  pagination: {
    count: number;
    total_pages: number;
    current_page: number;
    next: string | null;
    previous: string | null;
  } | null;

  // Subscribe flow
  subscribeMessage: string | null;

  // UI state
  loading: boolean;
  sendingCampaignId: string | null; // which campaign is currently sending
  error: string | null;
}

const initialState: NewsletterState = {
  subscribers: [],
  campaigns: [],
  currentCampaign: null,
  campaignStats: {},
  pagination: null,
  subscribeMessage: null,
  loading: false,
  sendingCampaignId: null,
  error: null,
};

// ── Slice ─────────────────────────────────────────────────────────────────────

const newsletterSlice = createSlice({
  name: "newsletter",
  initialState,
  reducers: {
    clearSubscribeMessage(state) {
      state.subscribeMessage = null;
    },
    clearError(state) {
      state.error = null;
    },
    clearCurrentCampaign(state) {
      state.currentCampaign = null;
    },
    resetNewsletter() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    // ── Public: subscribe ───────────────────────────────────────────────────
    builder.addCase(newsletterThunks.subscribe.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.subscribeMessage = null;
    });
    builder.addCase(newsletterThunks.subscribe.fulfilled, (state, action) => {
      state.loading = false;
      state.subscribeMessage = action.payload;
    });
    builder.addCase(newsletterThunks.subscribe.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message ?? "Subscription failed";
    });

    // ── Public: unsubscribe ─────────────────────────────────────────────────
    builder.addCase(newsletterThunks.unsubscribe.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(newsletterThunks.unsubscribe.fulfilled, (state) => {
      state.loading = false;
      state.subscribeMessage = "Unsubscribed successfully.";
    });
    builder.addCase(newsletterThunks.unsubscribe.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message ?? "Unsubscribe failed";
    });

    // ── Admin: fetchSubscribers ─────────────────────────────────────────────
    builder.addCase(newsletterThunks.fetchSubscribers.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      newsletterThunks.fetchSubscribers.fulfilled,
      (state, action) => {
        state.loading = false;
        state.subscribers = action.payload.results;
        state.pagination = action.payload.pagination;
      }
    );
    builder.addCase(
      newsletterThunks.fetchSubscribers.rejected,
      (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to fetch subscribers";
      }
    );

    // ── Admin: fetchCampaigns ───────────────────────────────────────────────
    builder.addCase(newsletterThunks.fetchCampaigns.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      newsletterThunks.fetchCampaigns.fulfilled,
      (state, action: PayloadAction<PaginatedResponse<Campaign>>) => {
        state.loading = false;
        state.campaigns = action.payload.results;
        state.pagination = action.payload.pagination;
      }
    );
    builder.addCase(
      newsletterThunks.fetchCampaigns.rejected,
      (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to fetch campaigns";
      }
    );

    // ── Admin: fetchCampaign ────────────────────────────────────────────────
    builder.addCase(newsletterThunks.fetchCampaign.fulfilled, (state, action) => {
      state.currentCampaign = action.payload;
    });

    // ── Admin: createCampaign ───────────────────────────────────────────────
    builder.addCase(
      newsletterThunks.createCampaign.fulfilled,
      (state, action) => {
        state.campaigns.unshift(action.payload);
      }
    );

    // ── Admin: updateCampaign ───────────────────────────────────────────────
    builder.addCase(
      newsletterThunks.updateCampaign.fulfilled,
      (state, action) => {
        const idx = state.campaigns.findIndex(
          (c) => c.id === action.payload.id
        );
        if (idx !== -1) state.campaigns[idx] = action.payload;
        if (state.currentCampaign?.id === action.payload.id) {
          state.currentCampaign = action.payload;
        }
      }
    );

    // ── Admin: deleteCampaign ───────────────────────────────────────────────
    builder.addCase(
      newsletterThunks.deleteCampaign.fulfilled,
      (state, action) => {
        state.campaigns = state.campaigns.filter(
          (c) => c.id !== action.payload
        );
        if (state.currentCampaign?.id === action.payload) {
          state.currentCampaign = null;
        }
      }
    );

    // ── Admin: sendCampaign ─────────────────────────────────────────────────
    builder.addCase(newsletterThunks.sendCampaign.pending, (state, action) => {
      state.sendingCampaignId = action.meta.arg; // the campaignId
    });
    builder.addCase(
      newsletterThunks.sendCampaign.fulfilled,
      (state, action) => {
        state.sendingCampaignId = null;
        // Update the campaign status locally to "sending"
        const idx = state.campaigns.findIndex(
          (c) => c.id === action.payload.campaignId
        );
        if (idx !== -1) {
          state.campaigns[idx] = {
            ...state.campaigns[idx],
            status: "sending",
          };
        }
      }
    );
    builder.addCase(
      newsletterThunks.sendCampaign.rejected,
      (state, action) => {
        state.sendingCampaignId = null;
        state.error = action.error.message ?? "Failed to send campaign";
      }
    );

    // ── Admin: fetchCampaignStats ───────────────────────────────────────────
    builder.addCase(
      newsletterThunks.fetchCampaignStats.fulfilled,
      (state, action) => {
        state.campaignStats[action.payload.campaignId] =
          action.payload.stats;
      }
    );
  },
});

export const {
  clearSubscribeMessage,
  clearError,
  clearCurrentCampaign,
  resetNewsletter,
} = newsletterSlice.actions;
export default newsletterSlice.reducer;
```

### newsletterSelectors.ts

**File: `src/store/newsletter/newsletterSelectors.ts`**

```typescript
import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "@/store";

const selectNewsletterState = (state: RootState) => state.newsletter;

// ── Subscribers ───────────────────────────────────────────────────────────────

export const selectSubscribers = createSelector(
  selectNewsletterState,
  (nl) => nl.subscribers
);

export const selectActiveSubscribers = createSelector(
  selectSubscribers,
  (subs) => subs.filter((s) => s.is_active)
);

export const selectInactiveSubscribers = createSelector(
  selectSubscribers,
  (subs) => subs.filter((s) => !s.is_active)
);

// ── Campaigns ─────────────────────────────────────────────────────────────────

export const selectCampaigns = createSelector(
  selectNewsletterState,
  (nl) => nl.campaigns
);

export const selectDraftCampaigns = createSelector(selectCampaigns, (cmps) =>
  cmps.filter((c) => c.status === "draft")
);

export const selectSentCampaigns = createSelector(selectCampaigns, (cmps) =>
  cmps.filter((c) => c.status === "sent")
);

export const selectCurrentCampaign = createSelector(
  selectNewsletterState,
  (nl) => nl.currentCampaign
);

export const selectCampaignById = (campaignId: string) =>
  createSelector(selectCampaigns, (cmps) =>
    cmps.find((c) => c.id === campaignId) ?? null
  );

// ── Campaign Stats ────────────────────────────────────────────────────────────

export const selectCampaignStats = createSelector(
  selectNewsletterState,
  (nl) => nl.campaignStats
);

export const selectStatsByCampaignId = (campaignId: string) =>
  createSelector(selectCampaignStats, (stats) => stats[campaignId] ?? null);

// ── Send Flow ─────────────────────────────────────────────────────────────────

/** ID of the campaign currently being sent, or null. */
export const selectSendingCampaignId = createSelector(
  selectNewsletterState,
  (nl) => nl.sendingCampaignId
);

/** Whether any campaign is currently being sent. */
export const selectIsSending = createSelector(
  selectSendingCampaignId,
  (id) => id !== null
);

// ── Pagination ────────────────────────────────────────────────────────────────

export const selectNewsletterPagination = createSelector(
  selectNewsletterState,
  (nl) => nl.pagination
);

// ── UI State ──────────────────────────────────────────────────────────────────

export const selectNewsletterLoading = createSelector(
  selectNewsletterState,
  (nl) => nl.loading
);

export const selectNewsletterError = createSelector(
  selectNewsletterState,
  (nl) => nl.error
);

export const selectSubscribeMessage = createSelector(
  selectNewsletterState,
  (nl) => nl.subscribeMessage
);
```

---

## 4. Store Integration

In your Redux store configuration file (e.g. `src/store/index.ts`), register both reducers:

```typescript
import { configureStore } from "@reduxjs/toolkit";
import blogReducer from "./blog/blogSlice";
import newsletterReducer from "./newsletter/newsletterSlice";

export const store = configureStore({
  reducer: {
    blog: blogReducer,
    newsletter: newsletterReducer,
    // ... other reducers
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

---

## Summary of All Endpoints

### Blog (`/api/blog/`)

| Method | Path | Public? | Purpose |
|--------|------|---------|---------|
| GET | `posts/` | Yes | List published posts (paginated, filterable) |
| GET | `posts/<slug>/` | Yes | Get single post (increments view_count) |
| GET | `categories/` | Yes | List categories |
| GET | `tags/` | Yes | List tags |
| GET | `admin/posts/` | No | List all posts including drafts |
| POST | `admin/posts/` | No | Create post |
| GET | `admin/posts/<id>/` | No | Get any post by UUID |
| PUT | `admin/posts/<id>/` | No | Full update |
| PATCH | `admin/posts/<id>/` | No | Partial update |
| DELETE | `admin/posts/<id>/` | No | Delete post |
| GET | `admin/categories/` | No | List categories |
| POST | `admin/categories/` | No | Create category |
| PUT | `admin/categories/<id>/` | No | Update category |
| DELETE | `admin/categories/<id>/` | No | Delete category |
| GET | `admin/tags/` | No | List tags |
| POST | `admin/tags/` | No | Create tag |
| PUT | `admin/tags/<id>/` | No | Update tag |
| DELETE | `admin/tags/<id>/` | No | Delete tag |

### Newsletter (`/api/newsletter/`)

| Method | Path | Public? | Purpose |
|--------|------|---------|---------|
| POST | `subscribe/` | Yes | Subscribe email |
| POST | `unsubscribe/` | Yes | Unsubscribe with token |
| GET | `admin/subscribers/` | No | List all subscribers |
| GET | `admin/campaigns/` | No | List campaigns |
| POST | `admin/campaigns/` | No | Create campaign |
| GET | `admin/campaigns/<id>/` | No | Get campaign |
| PUT | `admin/campaigns/<id>/` | No | Update campaign |
| DELETE | `admin/campaigns/<id>/` | No | Delete campaign |
| POST | `admin/campaigns/<id>/send/` | No | Trigger send |
| GET | `admin/campaigns/<id>/stats/` | No | Get delivery stats |
