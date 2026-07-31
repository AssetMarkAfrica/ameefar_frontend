import type {
  NewsArticle,
  NewsCategory,
  NewsFeaturedResponse,
  NewsListParams,
  NewsListResponse,
  NewsStatsResponse,
  NewsArticleDetailResponse,
} from "@/types/content";

// ─── Base URL ────────────────────────────────────────────────────────────────

const CONTENT_API = (
  process.env.NEXT_PUBLIC_CONTENT_URL ??
  (process.env.NEXT_PUBLIC_API_URL
    ? `${process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "")}/content/recycling/news`
    : "http://localhost:82/api/content/recycling/news")
).replace(/\/$/, "");

// ─── Helpers ─────────────────────────────────────────────────────────────────

type ErrorBody = {
  message?: string;
  detail?: string;
  error?: string | { code?: string; message?: string };
  errors?: Record<string, unknown>;
  [key: string]: unknown;
};

function getContentUrl(path: string): string {
  return `${CONTENT_API}${path}`;
}

function formatErrorValue(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map(formatErrorValue).join(", ");
  }

  if (value && typeof value === "object") {
    return Object.entries(value)
      .map(([k, v]) => `${k}: ${formatErrorValue(v)}`)
      .join(", ");
  }

  return String(value);
}

function formatErrorBody(body: ErrorBody | null, fallback: string): string {
  if (!body) return fallback;

  // Handle the API's standard error envelope: { success: false, error: { message } }
  if (body.error && typeof body.error === "object" && body.error.message) {
    return body.error.message;
  }

  if (typeof body.error === "string") return body.error;
  if (body.message) return body.message;
  if (body.detail) return body.detail;

  const fieldErrors = body.errors ?? body;
  const formatted = Object.entries(fieldErrors)
    .filter(([k]) => !["success", "message", "detail", "error"].includes(k))
    .map(([k, v]) => `${k}: ${formatErrorValue(v)}`)
    .join(" ");

  return formatted || fallback;
}

async function requestJson<TResponse>(endpoint: string): Promise<TResponse> {
  const response = await fetch(getContentUrl(endpoint), {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  const body = (await response.json().catch(() => null)) as ErrorBody | null;

  if (!response.ok) {
    throw new Error(formatErrorBody(body, response.statusText));
  }

  return body as TResponse;
}

function buildQueryString(params?: NewsListParams): string {
  if (!params) return "";

  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const ContentService = {
  /**
   * GET /recycling/news/featured/
   * Returns featured articles for the landing page hero / carousel.
   */
  getFeaturedNews(): Promise<NewsFeaturedResponse> {
    return requestJson<NewsFeaturedResponse>("/featured/");
  },

  /**
   * GET /recycling/news/
   * Paginated article list with optional filters.
   */
  getNewsList(params?: NewsListParams): Promise<NewsListResponse> {
    return requestJson<NewsListResponse>(`/${buildQueryString(params)}`);
  },

  /**
   * GET /recycling/news/stats/
   * Platform activity statistics.
   */
  getNewsStats(): Promise<NewsStatsResponse> {
    return requestJson<NewsStatsResponse>("/stats/");
  },

  /**
   * GET /recycling/news/categories/
   * Available categories with article counts for filter pills.
   */
  getNewsCategories(): Promise<{ success: boolean; data: NewsCategory[] }> {
    return requestJson<{ success: boolean; data: NewsCategory[] }>(
      "/categories/",
    );
  },

  /**
   * GET /recycling/news/<slug>/
   * Single article detail.
   */
  getArticleBySlug(slug: string): Promise<NewsArticleDetailResponse> {
    return requestJson<NewsArticleDetailResponse>(`/${slug}/`);
  },
};
