import type { RootState } from "@/store";

import type { ContentState, ContentOperation } from "./contentSlice";

// ─── Data selectors ───────────────────────────────────────────────────────────

export const selectFeaturedArticles = (
  state: RootState,
): ContentState["featuredArticles"] => state.content.featuredArticles;

export const selectNewsArticles = (
  state: RootState,
): ContentState["articles"] => state.content.articles;

export const selectNewsPagination = (
  state: RootState,
): ContentState["pagination"] => state.content.pagination;

export const selectCurrentArticle = (
  state: RootState,
): ContentState["currentArticle"] => state.content.currentArticle;

export const selectNewsStats = (
  state: RootState,
): ContentState["stats"] => state.content.stats;

export const selectNewsCategories = (
  state: RootState,
): ContentState["categories"] => state.content.categories;

// ─── Derived selectors ────────────────────────────────────────────────────────

/** Returns articles filtered by a given category value. */
export const selectArticlesByCategory = (
  state: RootState,
  category: string,
): ContentState["articles"] =>
  state.content.articles.filter(
    (article) => article.category === category,
  );

/** Returns only the featured articles from the paginated list (if any). */
export const selectFeaturedFromList = (
  state: RootState,
): ContentState["articles"] =>
  state.content.articles.filter((article) => article.is_featured);

// ─── Status & error selectors ─────────────────────────────────────────────────

export const selectContentOpStatus = <TOperation extends ContentOperation>(
  state: RootState,
  operation: TOperation,
): ContentState["status"][TOperation] => state.content.status[operation];

export const selectContentError = <TOperation extends ContentOperation>(
  state: RootState,
  operation: TOperation,
): ContentState["errors"][TOperation] => state.content.errors[operation];

/** Convenience: true while any content fetch is in-flight. */
export const selectAnyContentLoading = (state: RootState): boolean =>
  Object.values(state.content.status).some((s) => s === "loading");
