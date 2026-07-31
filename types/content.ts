// ─── Article ──────────────────────────────────────────────────────────────────

export type NewsSourceType = "google_news" | "newsdata";

export interface NewsArticle {
  id: string;
  slug: string;
  title: string;
  /** External link to the original article */
  url: string;
  source: string;
  source_type?: NewsSourceType;
  source_type_display?: string;
  snippet: string;
  image_url: string | null;
  has_image: boolean;
  category: string;
  category_display: string;
  is_featured: boolean;
  /** Estimated reading time in minutes */
  read_time: number;
  published_at: string;
  /** Pre-computed relative string e.g. "3 hours ago" */
  time_ago: string;
}

// ─── Category ─────────────────────────────────────────────────────────────────

export interface NewsCategory {
  value: string;
  label: string;
  count: number;
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface NewsPagination {
  count: number;
  total_pages: number;
  current_page: number;
  next: string | null;
  previous: string | null;
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export interface NewsStats {
  total_articles: number;
  featured_articles: number;
  /** Map of category value → count */
  categories: Record<string, number>;
  /** Map of source type → count */
  sources: Record<string, number>;
  latest_fetch: string;
  newest_article: string;
}

// ─── Query params ─────────────────────────────────────────────────────────────

export interface NewsListParams {
  page?: number;
  page_size?: number;
  category?: string;
  search?: string;
  featured?: boolean;
  source_type?: NewsSourceType;
}

// ─── API response envelopes ───────────────────────────────────────────────────

export interface NewsFeaturedResponse {
  success: boolean;
  message: string;
  data: NewsArticle[];
}

export interface NewsListResponse {
  success: boolean;
  pagination: NewsPagination;
  results: NewsArticle[];
}

export interface NewsStatsResponse {
  success: boolean;
  message: string;
  data: NewsStats;
}

export interface NewsArticleDetailResponse {
  success: boolean;
  message: string;
  data: NewsArticle;
}
