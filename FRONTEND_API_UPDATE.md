# Frontend API Integration — Update: Comments & Likes on Blog Posts

> **Prerequisite:** Read the original `FRONTEND_API_INTEGRATION.md` first. This document only covers the additions — comments and likes on blog posts. It follows the same patterns and file structure established in the original guide.

---

## Table of Contents

1. [Updated Types](#1-updated-types)
2. [Updated BlogService.ts](#2-updated-blogservicets)
3. [Updated blogSlice.ts — State & Reducers](#3-updated-blogslicets--state--reducers)
4. [New: blogCommentThunks.ts](#4-new-blogcommentthunksts)
5. [New: blogLikeThunks.ts](#5-new-bloglikethunksts)
6. [Updated blogSelectors.ts](#6-updated-blogselectorts)
7. [Endpoint Summary](#7-endpoint-summary)

---

## 1. Updated Types

Add these interfaces to `src/types/blog.ts`. The `BlogPostSummary` and `BlogPostDetail` interfaces from the original guide have been extended with `likes_count` and `comments_count`. The detail response now also includes `comments`.

```typescript
// ── Existing type extensions ──────────────────────────────────────────────────
// Add these fields to the existing BlogPostSummary interface:

// BlogPostSummary now also includes:
//   likes_count: number;
//   comments_count: number;

// BlogPostDetail now also includes:
//   likes_count: number;
//   comments_count: number;
//   comments: BlogComment[];


// ── Comment ───────────────────────────────────────────────────────────────────

export interface BlogComment {
  id: string;                  // UUID
  post: string;                // BlogPost UUID
  author_id: string;           // User UUID
  author_name: string;         // User full name
  content: string;             // The comment text
  created_at: string;          // ISO datetime
  updated_at: string;          // ISO datetime
}

export interface BlogCommentPayload {
  content: string;             // required
}

// ── Like ──────────────────────────────────────────────────────────────────────

export interface BlogLikeStatus {
  liked: boolean;              // whether the current user has liked
  likes_count: number;         // total likes on the post
}

// ── Comment create response (returned by POST) ────────────────────────────────
// Same shape as BlogComment above. The backend returns it wrapped in:
//   { "success": true, "message": "Comment created.", "data": { ... BlogComment } }
```

---

## 2. Updated BlogService.ts

Add these new service functions to `src/services/BlogService.ts`. Import the new types at the top:

```typescript
// Add these to the existing import from "@/types/blog":
import type {
  BlogComment,
  BlogCommentPayload,
  BlogLikeStatus,
  // ... existing imports
} from "@/types/blog";
```

### 2.1 Comment Service Functions

Add these after the existing `fetchTags()` function (before the ADMIN ENDPOINTS section):

```typescript
// ═══════════════════════════════════════════════════════════════════════════════
// COMMENTS  (mix of public and authenticated)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/blog/posts/<slug>/comments/
 *
 * Fetch all comments for a published post.
 * Public — no auth required.
 *
 * Response:
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "id": "uuid",
 *       "post": "post-uuid",
 *       "author_id": "user-uuid",
 *       "author_name": "John Doe",
 *       "content": "Great article!",
 *       "created_at": "2026-07-30T10:00:00Z",
 *       "updated_at": "2026-07-30T10:00:00Z"
 *     }
 *   ]
 * }
 */
export async function fetchComments(
  slug: string
): Promise<DataResponse<BlogComment[]>> {
  const { data } = await apiClient.get(`/api/blog/posts/${slug}/comments/`);
  return data;
}

/**
 * POST /api/blog/posts/<slug>/comments/
 *
 * Create a comment on a published post.
 * Requires authentication (any logged-in user).
 *
 * Request body:
 * {
 *   "content": "This is my comment text"   // required
 * }
 *
 * Response (201):
 * {
 *   "success": true,
 *   "message": "Comment created.",
 *   "data": {
 *     "id": "uuid",
 *     "post": "post-uuid",
 *     "author_id": "user-uuid",
 *     "author_name": "John Doe",
 *     "content": "This is my comment text",
 *     "created_at": "2026-07-30T10:00:00Z",
 *     "updated_at": "2026-07-30T10:00:00Z"
 *   }
 * }
 *
 * Notes:
 * - 'author_id' and 'author_name' are set server-side from the JWT
 * - Returns 401 if no valid auth token is provided
 * - Returns 404 if the post slug doesn't exist or isn't published
 */
export async function createComment(
  slug: string,
  payload: BlogCommentPayload
): Promise<DataResponse<BlogComment>> {
  const { data } = await apiClient.post(
    `/api/blog/posts/${slug}/comments/`,
    payload
  );
  return data;
}

/**
 * DELETE /api/blog/admin/comments/<comment_id>/
 *
 * Delete a comment. The requesting user must be the comment author
 * or an admin.
 *
 * Requires authentication.
 *
 * Response (200):
 *   { "success": true, "message": "Comment deleted." }
 *
 * Forbidden (403):
 *   { "detail": "You do not have permission to delete this comment." }
 *
 * Not found (404):
 *   { "detail": "Comment not found." }
 */
export async function deleteComment(
  commentId: string
): Promise<MessageResponse> {
  const { data } = await apiClient.delete(
    `/api/blog/admin/comments/${commentId}/`
  );
  return data;
}
```

### 2.2 Like Service Functions

Add these after the comment functions:

```typescript
// ═══════════════════════════════════════════════════════════════════════════════
// LIKES  (toggle + status check)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * POST /api/blog/posts/<slug>/like/
 *
 * Toggle like on a published post.
 * - If the user has NOT liked it → creates a like (liked: true)
 * - If the user HAS liked it → removes the like (liked: false)
 *
 * Requires authentication.
 *
 * Response (liked):
 *   { "success": true, "message": "Post liked.", "data": { "liked": true, "likes_count": 5 } }
 *
 * Response (unliked):
 *   { "success": true, "message": "Like removed.", "data": { "liked": false, "likes_count": 4 } }
 *
 * Not found (404):
 *   { "detail": "Post not found." }
 */
export async function toggleLike(
  slug: string
): Promise<DataResponse<BlogLikeStatus>> {
  const { data } = await apiClient.post(`/api/blog/posts/${slug}/like/`);
  return data;
}

/**
 * GET /api/blog/posts/<slug>/like/status/
 *
 * Check whether the current user has liked this post, and get the
 * total like count.
 *
 * Public — if no user is authenticated, liked will be false.
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "liked": false,            // true if authenticated user has liked
 *     "likes_count": 42          // total likes
 *   }
 * }
 */
export async function fetchLikeStatus(
  slug: string
): Promise<DataResponse<BlogLikeStatus>> {
  const { data } = await apiClient.get(
    `/api/blog/posts/${slug}/like/status/`
  );
  return data;
}
```

---

## 3. Updated blogSlice.ts — State & Reducers

The blog slice needs new state fields and reducers for comment/like operations. Update the existing `src/store/blog/blogSlice.ts`.

### 3.1 State Shape — Add New Fields

Add these to the `BlogState` interface and `initialState`:

```typescript
// Add to the BlogState interface (after existing fields):
export interface BlogState {
  // ... existing fields (posts, categories, tags, etc.)

  // ── NEW: Comments ─────────────────────────────────────────────────────────
  comments: BlogComment[];               // comments for the currently viewed post
  commentsLoading: boolean;              // loading state for comment operations
  commentsError: string | null;

  // ── NEW: Likes ────────────────────────────────────────────────────────────
  liked: boolean;                        // whether current user has liked currentPost
  likesCount: number;                    // total likes on currentPost
  likeToggling: boolean;                 // true while toggle request is in flight
}

// Update initialState to include:
const initialState: BlogState = {
  // ... existing initial values
  comments: [],
  commentsLoading: false,
  commentsError: null,
  liked: false,
  likesCount: 0,
  likeToggling: false,
};

// Add these types to the imports at the top:
import type {
  BlogComment,
  BlogLikeStatus,
  // ... existing imports
} from "@/types/blog";
import * as blogCommentThunks from "./blogCommentThunks";
import * as blogLikeThunks from "./blogLikeThunks";
```

### 3.2 Reducers — Add Synchronous Actions

Add these inside the `reducers` block of `createSlice`:

```typescript
reducers: {
  // ... existing reducers (clearCurrentPost, clearError, resetBlog)

  /** Clear the comment list (e.g. when navigating away). */
  clearComments(state) {
    state.comments = [];
  },
  /** Reset like state (e.g. when navigating away). */
  clearLikeStatus(state) {
    state.liked = false;
    state.likesCount = 0;
  },
},
```

### 3.3 ExtraReducers — Add Comment/Like Handlers

Add these cases inside the `extraReducers` builder:

```typescript
extraReducers: (builder) => {
  // ── All existing extraReducers stay unchanged ─────────────────────────────
  // (... existing fetchPosts, fetchPostBySlug, categories, tags, admin ...)

  // ══════════════════════════════════════════════════════════════════════════
  // COMMENTS
  // ══════════════════════════════════════════════════════════════════════════

  // ── fetchComments ──────────────────────────────────────────────────────
  builder.addCase(blogCommentThunks.fetchComments.pending, (state) => {
    state.commentsLoading = true;
    state.commentsError = null;
  });
  builder.addCase(
    blogCommentThunks.fetchComments.fulfilled,
    (state, action: PayloadAction<BlogComment[]>) => {
      state.commentsLoading = false;
      state.comments = action.payload;
    }
  );
  builder.addCase(blogCommentThunks.fetchComments.rejected, (state, action) => {
    state.commentsLoading = false;
    state.commentsError = action.error.message ?? "Failed to load comments";
  });

  // ── createComment ──────────────────────────────────────────────────────
  builder.addCase(blogCommentThunks.createComment.pending, (state) => {
    state.commentsLoading = true;
    state.commentsError = null;
  });
  builder.addCase(
    blogCommentThunks.createComment.fulfilled,
    (state, action: PayloadAction<BlogComment>) => {
      state.commentsLoading = false;
      state.comments.push(action.payload);       // prepend or append
    }
  );
  builder.addCase(blogCommentThunks.createComment.rejected, (state, action) => {
    state.commentsLoading = false;
    state.commentsError = action.error.message ?? "Failed to create comment";
  });

  // ── deleteComment ──────────────────────────────────────────────────────
  builder.addCase(blogCommentThunks.deleteComment.fulfilled, (state, action) => {
    state.comments = state.comments.filter(
      (c) => c.id !== action.payload       // payload is the commentId
    );
  });

  // ══════════════════════════════════════════════════════════════════════════
  // LIKES
  // ══════════════════════════════════════════════════════════════════════════

  // ── fetchLikeStatus ─────────────────────────────────────────────────────
  builder.addCase(
    blogLikeThunks.fetchLikeStatus.fulfilled,
    (state, action: PayloadAction<BlogLikeStatus>) => {
      state.liked = action.payload.liked;
      state.likesCount = action.payload.likes_count;
    }
  );

  // ── toggleLike ──────────────────────────────────────────────────────────
  builder.addCase(blogLikeThunks.toggleLike.pending, (state) => {
    state.likeToggling = true;
  });
  builder.addCase(
    blogLikeThunks.toggleLike.fulfilled,
    (state, action: PayloadAction<BlogLikeStatus>) => {
      state.likeToggling = false;
      state.liked = action.payload.liked;
      state.likesCount = action.payload.likes_count;
    }
  );
  builder.addCase(blogLikeThunks.toggleLike.rejected, (state) => {
    state.likeToggling = false;
  });
},
```

### 3.4 Exports — Updated

```typescript
export const {
  clearCurrentPost,
  clearComments,
  clearLikeStatus,
  clearError,
  resetBlog,
} = blogSlice.actions;
export default blogSlice.reducer;
```

---

## 4. New: blogCommentThunks.ts

**File: `src/store/blog/blogCommentThunks.ts`**

Create a new file for comment-specific thunks. This keeps the original `blogThunks.ts` clean.

```typescript
import { createAsyncThunk } from "@reduxjs/toolkit";
import * as BlogService from "@/services/BlogService";
import type { BlogComment, BlogCommentPayload } from "@/types/blog";

/**
 * Fetch all comments for a blog post.
 *
 * Usage:
 *   dispatch(fetchComments("how-recycling-works"))
 *
 * Populates:
 *   blog.comments         → BlogComment[]
 *   blog.commentsLoading  → true/false
 */
export const fetchComments = createAsyncThunk(
  "blog/fetchComments",
  async (slug: string) => {
    const response = await BlogService.fetchComments(slug);
    return response.data; // BlogComment[]
  }
);

/**
 * Create a new comment on a blog post.
 * Requires the user to be authenticated.
 *
 * Usage:
 *   dispatch(createComment({ slug: "how-recycling-works", payload: { content: "Nice post!" } }))
 *
 * Populates:
 *   blog.comments         → appends the new comment
 *   blog.commentsLoading  → true/false
 */
export const createComment = createAsyncThunk(
  "blog/createComment",
  async ({
    slug,
    payload,
  }: {
    slug: string;
    payload: BlogCommentPayload;
  }) => {
    const response = await BlogService.createComment(slug, payload);
    return response.data; // BlogComment
  }
);

/**
 * Delete a comment. The user must be the comment author or an admin.
 *
 * Usage:
 *   dispatch(deleteComment("comment-uuid"))
 *
 * Populates:
 *   blog.comments         → removes the deleted comment
 */
export const deleteComment = createAsyncThunk(
  "blog/deleteComment",
  async (commentId: string) => {
    await BlogService.deleteComment(commentId);
    return commentId; // returned so the slice can filter it out
  }
);
```

---

## 5. New: blogLikeThunks.ts

**File: `src/store/blog/blogLikeThunks.ts`**

```typescript
import { createAsyncThunk } from "@reduxjs/toolkit";
import * as BlogService from "@/services/BlogService";
import type { BlogLikeStatus } from "@/types/blog";

/**
 * Get the like status for the current user on a post.
 * Public — works for unauthenticated users (returns liked=false).
 *
 * Usage:
 *   dispatch(fetchLikeStatus("how-recycling-works"))
 *
 * Populates:
 *   blog.liked       → boolean
 *   blog.likesCount  → number
 */
export const fetchLikeStatus = createAsyncThunk(
  "blog/fetchLikeStatus",
  async (slug: string) => {
    const response = await BlogService.fetchLikeStatus(slug);
    return response.data; // BlogLikeStatus
  }
);

/**
 * Toggle the like on a blog post.
 * Requires authentication.
 *
 * Usage:
 *   dispatch(toggleLike("how-recycling-works"))
 *
 * Populates:
 *   blog.liked          → toggled boolean
 *   blog.likesCount     → updated count
 *   blog.likeToggling   → true during request
 *
 * Optimistic update pattern is NOT used here — the slice waits for
 * the server response to ensure accuracy. If you want optimistic UI,
 * invert the liked flag in a pending reducer.
 */
export const toggleLike = createAsyncThunk(
  "blog/toggleLike",
  async (slug: string) => {
    const response = await BlogService.toggleLike(slug);
    return response.data; // BlogLikeStatus
  }
);
```

---

## 6. Updated blogSelectors.ts

Add these new selectors to `src/store/blog/blogSelectors.ts`:

```typescript
// ── Comment Selectors ─────────────────────────────────────────────────────────

/** All comments for the currently viewed post. */
export const selectComments = createSelector(
  selectBlogState,
  (blog) => blog.comments
);

/** Loading state for comment operations. */
export const selectCommentsLoading = createSelector(
  selectBlogState,
  (blog) => blog.commentsLoading
);

/** Error message from the last failed comment operation. */
export const selectCommentsError = createSelector(
  selectBlogState,
  (blog) => blog.commentsError
);

/**
 * Comments sorted newest-first.
 * By default the backend returns them oldest-first.
 */
export const selectCommentsNewestFirst = createSelector(
  selectComments,
  (comments) => [...comments].reverse()
);

// ── Like Selectors ────────────────────────────────────────────────────────────

/** Whether the current user has liked the currently viewed post. */
export const selectLiked = createSelector(
  selectBlogState,
  (blog) => blog.liked
);

/** Total number of likes on the currently viewed post. */
export const selectLikesCount = createSelector(
  selectBlogState,
  (blog) => blog.likesCount
);

/** Whether a like toggle request is in progress. */
export const selectLikeToggling = createSelector(
  selectBlogState,
  (blog) => blog.likeToggling
);

/**
 * Convenience: combined like state.
 *
 * Usage in component:
 *   const { liked, count, toggling } = useSelector(selectLikeState);
 */
export const selectLikeState = createSelector(
  [selectLiked, selectLikesCount, selectLikeToggling],
  (liked, likesCount, likeToggling) => ({
    liked,
    count: likesCount,
    toggling: likeToggling,
  })
);
```

---

## 7. Endpoint Summary

### Comments

| Method | URL | Auth | Request Body | Response |
|--------|-----|------|-------------|----------|
| **GET** | `/api/blog/posts/<slug>/comments/` | No | — | `{ "success": true, "data": [ BlogComment ] }` |
| **POST** | `/api/blog/posts/<slug>/comments/` | Yes | `{ "content": "..." }` | `{ "success": true, "message": "Comment created.", "data": BlogComment }` |
| **DELETE** | `/api/blog/admin/comments/<uuid:id>/` | Yes (owner or admin) | — | `{ "success": true, "message": "Comment deleted." }` |

### Likes

| Method | URL | Auth | Response |
|--------|-----|------|----------|
| **POST** | `/api/blog/posts/<slug>/like/` | Yes | `{ "success": true, "message": "Post liked.", "data": { "liked": true, "likes_count": N } }` (or `"Like removed."` with `liked: false`) |
| **GET** | `/api/blog/posts/<slug>/like/status/` | No | `{ "success": true, "data": { "liked": false, "likes_count": N } }` |

### Updated Post Responses

The `GET /api/blog/posts/<slug>/` detail response now includes:

| New Field | Type | Description |
|-----------|------|-------------|
| `likes_count` | number | Total likes on this post |
| `comments_count` | number | Total comments on this post |
| `comments` | BlogComment[] | Full list of comments (nested with author info, sorted oldest-first) |

The `GET /api/blog/posts/` list response also includes `likes_count` and `comments_count` on each post (but not the full comments array, which is only on the detail endpoint).

---

## Recommended Testing Order in Postman

1. **Like a post**
   - `GET /api/blog/posts/how-recycling-works/like/status/` — see `liked: false`, `likes_count: 0`
   - `POST /api/blog/posts/how-recycling-works/like/` — see `liked: true`, `likes_count: 1`
   - `POST /api/blog/posts/how-recycling-works/like/` again — toggles off, see `liked: false`, `likes_count: 0`

2. **Comment on a post**
   - `POST /api/blog/posts/how-recycling-works/comments/` with body `{ "content": "Great article!" }`
   - `GET /api/blog/posts/how-recycling-works/comments/` — see the comment in the list

3. **Verify post detail now includes comments**
   - `GET /api/blog/posts/how-recycling-works/` — check `likes_count`, `comments_count`, and `comments` array

4. **Delete a comment (as the author or admin)**
   - `DELETE /api/blog/admin/comments/<comment-uuid>/`
