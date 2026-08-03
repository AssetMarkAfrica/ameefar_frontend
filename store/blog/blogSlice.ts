import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  BlogPostSummary,
  BlogPostDetail,
  BlogCategory,
  BlogTag,
  BlogComment,
  BlogLikeStatus,
} from "@/types/blog";
import type { PaginatedResponse } from "@/types/api";
import * as blogThunks from "./blogThunks";

export interface BlogState {
  posts: BlogPostSummary[];
  currentPost: BlogPostDetail | null;
  categories: BlogCategory[];
  tags: BlogTag[];
  adminPosts: BlogPostSummary[];
  adminCategories: BlogCategory[];
  adminTags: BlogTag[];
  pagination: {
    count: number;
    total_pages: number;
    current_page: number;
    next: string | null;
    previous: string | null;
  } | null;
  comments: BlogComment[];
  commentsLoading: boolean;
  commentsError: string | null;
  liked: boolean;
  likesCount: number;
  likeToggling: boolean;
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
  comments: [],
  commentsLoading: false,
  commentsError: null,
  liked: false,
  likesCount: 0,
  likeToggling: false,
  loading: false,
  loadingAdmin: false,
  error: null,
};

const blogSlice = createSlice({
  name: "blog",
  initialState,
  reducers: {
    clearCurrentPost(state) {
      state.currentPost = null;
    },
    clearComments(state) {
      state.comments = [];
    },
    clearLikeStatus(state) {
      state.liked = false;
      state.likesCount = 0;
    },
    clearError(state) {
      state.error = null;
    },
    resetBlog() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
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

    builder.addCase(blogThunks.fetchCategories.fulfilled, (state, action) => {
      state.categories = action.payload;
    });

    builder.addCase(blogThunks.fetchTags.fulfilled, (state, action) => {
      state.tags = action.payload;
    });

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
      },
    );
    builder.addCase(blogThunks.fetchAdminPosts.rejected, (state, action) => {
      state.loadingAdmin = false;
      state.error = action.error.message ?? "Failed to fetch admin posts";
    });

    builder.addCase(blogThunks.fetchAdminPost.pending, (state) => {
      state.loadingAdmin = true;
      state.error = null;
    });
    builder.addCase(blogThunks.fetchAdminPost.fulfilled, (state, action) => {
      state.loadingAdmin = false;
      state.currentPost = action.payload;
    });
    builder.addCase(blogThunks.fetchAdminPost.rejected, (state, action) => {
      state.loadingAdmin = false;
      state.error = action.error.message ?? "Post not found";
    });

    builder.addCase(blogThunks.createPost.fulfilled, (state, action) => {
      state.adminPosts.unshift(action.payload);
    });

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

    builder.addCase(blogThunks.deletePost.fulfilled, (state, action) => {
      state.adminPosts = state.adminPosts.filter(
        (p) => p.id !== action.payload,
      );
      if (state.currentPost?.id === action.payload) {
        state.currentPost = null;
      }
    });

    builder.addCase(blogThunks.createCategory.fulfilled, (state, action) => {
      state.categories.unshift(action.payload);
      state.adminCategories.unshift(action.payload);
    });

    builder.addCase(blogThunks.updateCategory.fulfilled, (state, action) => {
      const update = (arr: BlogCategory[]) => {
        const idx = arr.findIndex((c) => c.id === action.payload.id);
        if (idx !== -1) arr[idx] = action.payload;
      };
      update(state.categories);
      update(state.adminCategories);
    });

    builder.addCase(blogThunks.deleteCategory.fulfilled, (state, action) => {
      const remove = (arr: BlogCategory[]) =>
        arr.filter((c) => c.id !== action.payload);
      state.categories = remove(state.categories);
      state.adminCategories = remove(state.adminCategories);
    });

    builder.addCase(blogThunks.createTag.fulfilled, (state, action) => {
      state.tags.unshift(action.payload);
      state.adminTags.unshift(action.payload);
    });

    builder.addCase(blogThunks.updateTag.fulfilled, (state, action) => {
      const update = (arr: BlogTag[]) => {
        const idx = arr.findIndex((t) => t.id === action.payload.id);
        if (idx !== -1) arr[idx] = action.payload;
      };
      update(state.tags);
      update(state.adminTags);
    });

    builder.addCase(blogThunks.deleteTag.fulfilled, (state, action) => {
      const remove = (arr: BlogTag[]) =>
        arr.filter((t) => t.id !== action.payload);
      state.tags = remove(state.tags);
      state.adminTags = remove(state.adminTags);
    });

    builder.addCase(blogThunks.fetchComments.pending, (state) => {
      state.commentsLoading = true;
      state.commentsError = null;
    });
    builder.addCase(
      blogThunks.fetchComments.fulfilled,
      (state, action: PayloadAction<BlogComment[]>) => {
        state.commentsLoading = false;
        state.comments = action.payload;
      },
    );
    builder.addCase(blogThunks.fetchComments.rejected, (state, action) => {
      state.commentsLoading = false;
      state.commentsError = action.error.message ?? "Failed to load comments";
    });

    builder.addCase(blogThunks.createComment.pending, (state) => {
      state.commentsLoading = true;
      state.commentsError = null;
    });
    builder.addCase(
      blogThunks.createComment.fulfilled,
      (state, action: PayloadAction<BlogComment>) => {
        state.commentsLoading = false;
        state.comments.push(action.payload);
      },
    );
    builder.addCase(blogThunks.createComment.rejected, (state, action) => {
      state.commentsLoading = false;
      state.commentsError = action.error.message ?? "Failed to create comment";
    });

    builder.addCase(blogThunks.deleteComment.fulfilled, (state, action) => {
      state.comments = state.comments.filter(
        (c) => c.id !== action.payload,
      );
    });

    builder.addCase(
      blogThunks.fetchLikeStatus.fulfilled,
      (state, action: PayloadAction<BlogLikeStatus>) => {
        state.liked = action.payload.liked;
        state.likesCount = action.payload.likes_count;
      },
    );

    builder.addCase(blogThunks.toggleLike.pending, (state) => {
      state.likeToggling = true;
    });
    builder.addCase(
      blogThunks.toggleLike.fulfilled,
      (state, action: PayloadAction<BlogLikeStatus>) => {
        state.likeToggling = false;
        state.liked = action.payload.liked;
        state.likesCount = action.payload.likes_count;
      },
    );
    builder.addCase(blogThunks.toggleLike.rejected, (state) => {
      state.likeToggling = false;
    });
  },
});

export const { clearCurrentPost, clearComments, clearLikeStatus, clearError, resetBlog } = blogSlice.actions;
export default blogSlice.reducer;
