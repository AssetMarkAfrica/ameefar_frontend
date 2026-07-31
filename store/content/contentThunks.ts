import { createAsyncThunk } from "@reduxjs/toolkit";

import { ContentService } from "@/services/content/ContentService";
import type {
  NewsFeaturedResponse,
  NewsListParams,
  NewsListResponse,
  NewsStatsResponse,
  NewsArticleDetailResponse,
  NewsCategory,
} from "@/types/content";

// ─── Thunks ───────────────────────────────────────────────────────────────────

/**
 * Fetches the featured articles for the landing page hero / carousel.
 * No arguments required — public, no auth.
 */
export const fetchFeaturedNewsThunk = createAsyncThunk<NewsFeaturedResponse>(
  "content/fetchFeaturedNews",
  () => ContentService.getFeaturedNews(),
);

/**
 * Fetches the paginated news list with optional filters.
 * Pass `params` to filter by category, search query, page, etc.
 */
export const fetchNewsListThunk = createAsyncThunk<
  NewsListResponse,
  NewsListParams | undefined
>("content/fetchNewsList", (params) => ContentService.getNewsList(params));

/**
 * Fetches platform activity statistics (total articles, categories, etc.)
 * No arguments required — public, no auth.
 */
export const fetchNewsStatsThunk = createAsyncThunk<NewsStatsResponse>(
  "content/fetchNewsStats",
  () => ContentService.getNewsStats(),
);

/**
 * Fetches the available news categories with article counts,
 * used to render filter pills dynamically.
 */
export const fetchNewsCategoriesThunk = createAsyncThunk<{
  success: boolean;
  data: NewsCategory[];
}>("content/fetchNewsCategories", () => ContentService.getNewsCategories());

/**
 * Fetches a single article by its slug.
 */
export const fetchArticleBySlugThunk = createAsyncThunk<
  NewsArticleDetailResponse,
  string
>("content/fetchArticleBySlug", (slug) =>
  ContentService.getArticleBySlug(slug),
);
