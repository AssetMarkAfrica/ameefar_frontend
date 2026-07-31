"use client";

import { useEffect, useState, useCallback } from "react";
import { Hanken_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchNewsListThunk,
  fetchNewsStatsThunk,
  fetchNewsCategoriesThunk,
} from "@/store/content/contentThunks";
import {
  selectNewsArticles,
  selectNewsPagination,
  selectNewsStats,
  selectNewsCategories,
  selectContentOpStatus,
} from "@/store/content/contentSelectors";
import { NewsCard, SkeletonCard, useFadeIn, CATEGORY_COLORS } from "@/components/content/NewsCard";
import type { NewsListParams } from "@/types/content";

const hanken = Hanken_Grotesk({ subsets: ["latin"], weight: ["400", "600", "700", "800"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"] });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500", "700"] });

/* ─── Stat Card ─────────────────────────────────────── */
function StatCard({
  label,
  value,
  sub,
  delay,
}: {
  label: string;
  value: string | number;
  sub?: string;
  delay: number;
}) {
  const fade = useFadeIn(delay);
  return (
    <div ref={fade.ref} style={fade.style} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 flex flex-col gap-2 ring-1 ring-white/5 hover:ring-white/15 hover:bg-white/[0.07] transition-all duration-300">
      <p className={`${jetbrains.className} text-[10px] tracking-[0.18em] text-white/40 uppercase`}>{label}</p>
      <p className={`${hanken.className} text-[34px] font-black text-white leading-none`}>{value}</p>
      {sub && <p className="text-[12px] text-white/30">{sub}</p>}
    </div>
  );
}

/* ─── Category Pill ─────────────────────────────────── */
function CategoryPill({
  label,
  value,
  count,
  active,
  onClick,
}: {
  label: string;
  value: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  const grad = CATEGORY_COLORS[value] ?? "from-slate-500 to-slate-700";
  return (
    <button
      onClick={onClick}
      className={`${jetbrains.className} shrink-0 inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-bold tracking-wide uppercase transition-all duration-250 ${
        active
          ? `bg-gradient-to-r ${grad} text-white shadow-[0_4px_18px_rgba(0,0,0,0.4)]`
          : "border border-white/10 bg-white/[0.05] text-white/50 hover:bg-white/[0.1] hover:text-white/80"
      }`}
    >
      {label}
      <span className={`rounded-full px-1.5 py-0.5 text-[9px] ${active ? "bg-white/25 text-white" : "bg-white/10 text-white/40"}`}>
        {count}
      </span>
    </button>
  );
}

/* ─── Pagination Controls ───────────────────────────── */
function PaginationBar({
  currentPage,
  totalPages,
  hasNext,
  hasPrev,
  onPrev,
  onNext,
}: {
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="mt-12 flex items-center justify-center gap-4">
      <button
        onClick={onPrev}
        disabled={!hasPrev}
        className={`${hanken.className} inline-flex items-center gap-2 rounded-xl border px-6 py-3 text-[13px] font-semibold transition-all duration-250 disabled:opacity-30 disabled:cursor-not-allowed ${
          hasPrev
            ? "border-white/20 bg-white/[0.06] text-white hover:bg-white/[0.12] hover:border-white/30"
            : "border-white/10 text-white/30"
        }`}
      >
        <svg fill="none" height="14" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="14">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Previous
      </button>

      <span className={`${jetbrains.className} text-[12px] text-white/30 tracking-wide`}>
        Page {currentPage} of {totalPages}
      </span>

      <button
        onClick={onNext}
        disabled={!hasNext}
        className={`${hanken.className} inline-flex items-center gap-2 rounded-xl border px-6 py-3 text-[13px] font-semibold transition-all duration-250 disabled:opacity-30 disabled:cursor-not-allowed ${
          hasNext
            ? "border-[#00bfa5]/30 bg-[#00bfa5]/10 text-[#00bfa5] hover:bg-[#00bfa5]/20 hover:border-[#00bfa5]/50"
            : "border-white/10 text-white/30"
        }`}
      >
        Next
        <svg fill="none" height="14" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="14">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────── */
export default function ContentPage() {
  const dispatch = useAppDispatch();
  const articles = useAppSelector(selectNewsArticles);
  const pagination = useAppSelector(selectNewsPagination);
  const stats = useAppSelector(selectNewsStats);
  const categories = useAppSelector(selectNewsCategories);

  const listStatus = useAppSelector((s) => selectContentOpStatus(s, "fetchNewsList"));
  const statsStatus = useAppSelector((s) => selectContentOpStatus(s, "fetchNewsStats"));

  const isListLoading = listStatus === "idle" || listStatus === "loading";
  const isStatsLoading = statsStatus === "idle" || statsStatus === "loading";

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const headerFade = useFadeIn(0);
  const statsFade = useFadeIn(100);
  const filtersFade = useFadeIn(200);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch stats & categories once
  useEffect(() => {
    dispatch(fetchNewsStatsThunk());
    dispatch(fetchNewsCategoriesThunk());
  }, [dispatch]);

  // Fetch list whenever filters/page change
  const fetchList = useCallback(
    (params: NewsListParams) => dispatch(fetchNewsListThunk(params)),
    [dispatch],
  );

  useEffect(() => {
    const params: NewsListParams = {
      page: currentPage,
      page_size: 12,
      ...(activeCategory ? { category: activeCategory } : {}),
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
    };
    fetchList(params);
  }, [fetchList, currentPage, activeCategory, debouncedSearch]);

  const handleCategory = (val: string | null) => {
    setActiveCategory(val);
    setCurrentPage(1);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  // Format a date string nicely
  const fmtDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    } catch {
      return iso;
    }
  };

  return (
    <div className="min-h-screen bg-[#001a1a]">
      {/* ── Background ambience ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 h-[800px] w-[800px] translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00bfa5]/5 blur-[180px]" />
        <div className="absolute bottom-0 left-0 h-[700px] w-[700px] -translate-x-1/3 translate-y-1/3 rounded-full bg-[#006d40]/6 blur-[160px]" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,191,165,0.5) 1px,transparent 1px),linear-gradient(to right,rgba(0,191,165,0.5) 1px,transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative">

        <div className="mx-auto max-w-[1440px] px-6 pb-24 pt-14 md:px-12">

          {/* ── Page Header ── */}
          <div ref={headerFade.ref} style={headerFade.style} className="mb-14 max-w-3xl">
            <span className={`${jetbrains.className} inline-flex items-center gap-2 rounded-full border border-[#006d40]/40 bg-[#006d40]/15 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#00bfa5]`}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00bfa5] opacity-70" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00bfa5]" />
              </span>
              Recycling News Hub
            </span>
            <h1 className={`${hanken.className} mt-5 text-[44px] font-extrabold text-white leading-tight md:text-[60px]`}>
              The Circular{" "}
              <span className="bg-gradient-to-r from-[#00bfa5] to-emerald-300 bg-clip-text text-transparent">
                Economy Feed
              </span>
            </h1>
            <p className={`${inter.className} mt-4 text-[17px] leading-relaxed text-slate-400 max-w-xl`}>
              Curated recycling &amp; sustainability headlines from across the globe, updated daily by Ameefar's content engine.
            </p>
          </div>

          {/* ── Stats Row ── */}
          <div ref={statsFade.ref} style={statsFade.style} className="mb-14">
            {isStatsLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 h-28 animate-pulse" />
                ))}
              </div>
            ) : stats ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                  label="Total Articles"
                  value={stats.total_articles.toLocaleString()}
                  sub="Published globally"
                  delay={0}
                />
                <StatCard
                  label="Featured"
                  value={stats.featured_articles}
                  sub="Hand-curated picks"
                  delay={80}
                />
                <StatCard
                  label="Last Fetched"
                  value={fmtDate(stats.latest_fetch)}
                  sub="Auto-refresh daily"
                  delay={160}
                />
                <StatCard
                  label="Newest Article"
                  value={fmtDate(stats.newest_article)}
                  sub="From our sources"
                  delay={240}
                />
              </div>
            ) : null}
          </div>

          {/* ── Filters ── */}
          <div ref={filtersFade.ref} style={filtersFade.style} className="mb-10">
            {/* Search bar */}
            <div className="relative mb-5 max-w-xl">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
                fill="none"
                height="16"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                width="16"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 105.25 17.65 7.5 7.5 0 0016.65 16.65z" />
              </svg>
              <input
                type="text"
                placeholder="Search articles…"
                value={searchQuery}
                onChange={handleSearch}
                className={`${inter.className} w-full rounded-xl border border-white/10 bg-white/[0.05] py-3 pl-11 pr-4 text-[14px] text-white placeholder-white/30 outline-none transition-all duration-200 focus:border-[#00bfa5]/40 focus:bg-white/[0.08] focus:ring-1 focus:ring-[#00bfa5]/20`}
              />
            </div>

            {/* Category pills */}
            <div className="flex flex-wrap gap-2.5">
              <CategoryPill
                label="All"
                value=""
                count={stats?.total_articles ?? 0}
                active={activeCategory === null}
                onClick={() => handleCategory(null)}
              />
              {categories.map((cat) => (
                <CategoryPill
                  key={cat.value}
                  label={cat.label}
                  value={cat.value}
                  count={cat.count}
                  active={activeCategory === cat.value}
                  onClick={() => handleCategory(cat.value === activeCategory ? null : cat.value)}
                />
              ))}
            </div>
          </div>

          {/* ── Article Grid ── */}
          {isListLoading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(12)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : articles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="mb-4 text-5xl">📭</div>
              <h3 className={`${hanken.className} text-[22px] font-bold text-white/70`}>No articles found</h3>
              <p className="mt-2 text-[14px] text-white/30">Try adjusting your search or category filter.</p>
              <button
                onClick={() => { handleCategory(null); setSearchQuery(""); }}
                className={`${hanken.className} mt-6 rounded-xl border border-white/15 bg-white/[0.06] px-6 py-2.5 text-[13px] font-semibold text-white hover:bg-white/[0.12] transition-all`}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {articles.map((article, i) => (
                  <NewsCard
                    key={article.id}
                    article={article}
                    index={i}
                    useInternalLink
                  />
                ))}
              </div>

              {pagination && pagination.total_pages > 1 && (
                <PaginationBar
                  currentPage={pagination.current_page}
                  totalPages={pagination.total_pages}
                  hasNext={!!pagination.next}
                  hasPrev={!!pagination.previous}
                  onPrev={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  onNext={() => setCurrentPage((p) => p + 1)}
                />
              )}
            </>
          )}

          {/* Footer credit */}
          <div className={`${jetbrains.className} mt-16 border-t border-white/[0.06] pt-8 text-center text-[11px] tracking-wider text-white/20 uppercase`}>
            Powered by Ameefar Content Engine · Articles sourced from Google News &amp; NewsData · Refreshed daily
          </div>
        </div>
      </div>
    </div>
  );
}
