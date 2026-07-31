import { createSlice } from "@reduxjs/toolkit";

import type { NewsArticle, NewsCategory, NewsPagination, NewsStats } from "@/types/content";

import {
  fetchFeaturedNewsThunk,
  fetchNewsListThunk,
  fetchNewsStatsThunk,
  fetchNewsCategoriesThunk,
  fetchArticleBySlugThunk,
} from "./contentThunks";

// ─── Operation types ──────────────────────────────────────────────────────────

export type ContentOperation =
  | "fetchFeaturedNews"
  | "fetchNewsList"
  | "fetchNewsStats"
  | "fetchNewsCategories"
  | "fetchArticleBySlug";

export type ContentOperationStatus =
  | "idle"
  | "loading"
  | "succeeded"
  | "failed";

// ─── State shape ──────────────────────────────────────────────────────────────

export interface ContentState {
  /** Featured articles for the landing page hero / carousel */
  featuredArticles: NewsArticle[];

  /** Paginated list of articles (main news listing page) */
  articles: NewsArticle[];
  pagination: NewsPagination | null;

  /** Currently viewed article detail */
  currentArticle: NewsArticle | null;

  /** Platform activity statistics */
  stats: NewsStats | null;

  /** Category filter options with counts */
  categories: NewsCategory[];

  status: Record<ContentOperation, ContentOperationStatus>;
  errors: Record<ContentOperation, string | null>;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const initialStatus: Record<ContentOperation, ContentOperationStatus> = {
  fetchFeaturedNews: "idle",
  fetchNewsList: "idle",
  fetchNewsStats: "idle",
  fetchNewsCategories: "idle",
  fetchArticleBySlug: "idle",
};

const initialErrors: Record<ContentOperation, string | null> = {
  fetchFeaturedNews: null,
  fetchNewsList: null,
  fetchNewsStats: null,
  fetchNewsCategories: null,
  fetchArticleBySlug: null,
};

const initialState: ContentState = {
  featuredArticles: [],
  articles: [],
  pagination: null,
  currentArticle: null,
  stats: null,
  categories: [],
  status: initialStatus,
  errors: initialErrors,
};

function rejectedMessage(message?: string): string {
  return message ?? "Something went wrong.";
}

// ─── Slice ────────────────────────────────────────────────────────────────────

export const contentSlice = createSlice({
  name: "content",
  initialState,
  reducers: {
    clearCurrentArticle(state) {
      state.currentArticle = null;
    },
    clearContentErrors(state) {
      state.errors = { ...initialErrors };
    },
    resetContentState() {
      return {
        ...initialState,
        status: { ...initialStatus },
        errors: { ...initialErrors },
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Featured news ────────────────────────────────────────────────────
      .addCase(fetchFeaturedNewsThunk.pending, (state) => {
        state.status.fetchFeaturedNews = "loading";
        state.errors.fetchFeaturedNews = null;
      })
      .addCase(fetchFeaturedNewsThunk.fulfilled, (state, action) => {
        state.status.fetchFeaturedNews = "succeeded";
        state.featuredArticles = action.payload.data ?? [];
      })
      .addCase(fetchFeaturedNewsThunk.rejected, (state, action) => {
        state.status.fetchFeaturedNews = "failed";
        state.errors.fetchFeaturedNews = rejectedMessage(action.error.message);
      })

      // ── Paginated list ───────────────────────────────────────────────────
      .addCase(fetchNewsListThunk.pending, (state) => {
        state.status.fetchNewsList = "loading";
        state.errors.fetchNewsList = null;
      })
      .addCase(fetchNewsListThunk.fulfilled, (state, action) => {
        state.status.fetchNewsList = "succeeded";
        state.articles = action.payload.results ?? [];
        state.pagination = action.payload.pagination ?? null;
      })
      .addCase(fetchNewsListThunk.rejected, (state, action) => {
        state.status.fetchNewsList = "failed";
        state.errors.fetchNewsList = rejectedMessage(action.error.message);
      })

      // ── Stats ────────────────────────────────────────────────────────────
      .addCase(fetchNewsStatsThunk.pending, (state) => {
        state.status.fetchNewsStats = "loading";
        state.errors.fetchNewsStats = null;
      })
      .addCase(fetchNewsStatsThunk.fulfilled, (state, action) => {
        state.status.fetchNewsStats = "succeeded";
        state.stats = action.payload.data ?? null;
      })
      .addCase(fetchNewsStatsThunk.rejected, (state, action) => {
        state.status.fetchNewsStats = "failed";
        state.errors.fetchNewsStats = rejectedMessage(action.error.message);
      })

      // ── Categories ───────────────────────────────────────────────────────
      .addCase(fetchNewsCategoriesThunk.pending, (state) => {
        state.status.fetchNewsCategories = "loading";
        state.errors.fetchNewsCategories = null;
      })
      .addCase(fetchNewsCategoriesThunk.fulfilled, (state, action) => {
        state.status.fetchNewsCategories = "succeeded";
        state.categories = action.payload.data ?? [];
      })
      .addCase(fetchNewsCategoriesThunk.rejected, (state, action) => {
        state.status.fetchNewsCategories = "failed";
        state.errors.fetchNewsCategories = rejectedMessage(
          action.error.message,
        );
      })

      // ── Article detail ───────────────────────────────────────────────────
      .addCase(fetchArticleBySlugThunk.pending, (state) => {
        state.status.fetchArticleBySlug = "loading";
        state.errors.fetchArticleBySlug = null;
        state.currentArticle = null;
      })
      .addCase(fetchArticleBySlugThunk.fulfilled, (state, action) => {
        state.status.fetchArticleBySlug = "succeeded";
        state.currentArticle = action.payload.data ?? null;
      })
      .addCase(fetchArticleBySlugThunk.rejected, (state, action) => {
        state.status.fetchArticleBySlug = "failed";
        state.errors.fetchArticleBySlug = rejectedMessage(
          action.error.message,
        );
      });
  },
});

export const {
  clearCurrentArticle,
  clearContentErrors,
  resetContentState,
} = contentSlice.actions;

export default contentSlice.reducer;
