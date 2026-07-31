"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Hanken_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchArticleBySlugThunk } from "@/store/content/contentThunks";
import {
  selectCurrentArticle,
  selectContentOpStatus,
  selectContentError,
} from "@/store/content/contentSelectors";
import { categoryColor, useFadeIn } from "@/components/content/NewsCard";

const hanken = Hanken_Grotesk({ subsets: ["latin"], weight: ["400", "600", "700", "800"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"] });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500", "700"] });

/* ─── Skeleton loader ───────────────────────────────── */
function ArticleSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-[50vh] bg-white/10 rounded-none md:rounded-2xl mb-10" />
      <div className="mx-auto max-w-3xl px-6 space-y-4">
        <div className="h-4 w-24 rounded-full bg-white/10" />
        <div className="h-8 w-full rounded-xl bg-white/10" />
        <div className="h-8 w-4/5 rounded-xl bg-white/10" />
        <div className="h-4 w-48 rounded-full bg-white/[0.07]" />
        <div className="mt-8 space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`h-4 rounded-full bg-white/[0.06] ${i % 3 === 2 ? "w-3/4" : "w-full"}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Single Article Page ───────────────────────────── */
export default function ArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const article = useAppSelector(selectCurrentArticle);
  const status = useAppSelector((s) => selectContentOpStatus(s, "fetchArticleBySlug"));
  const error = useAppSelector((s) => selectContentError(s, "fetchArticleBySlug"));

  const isLoading = status === "idle" || status === "loading";
  const isError = status === "failed";

  const contentFade = useFadeIn(200);

  useEffect(() => {
    if (slug) dispatch(fetchArticleBySlugThunk(slug));
  }, [slug, dispatch]);

  const gradClass = article ? categoryColor(article.category) : "from-teal-500 to-emerald-600";

  const fmtDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="min-h-screen bg-[#001a1a]">

        {/* ── Loading ── */}
        {isLoading && (
          <div className="pt-10">
            <ArticleSkeleton />
          </div>
        )}

        {/* ── Error ── */}
        {isError && !isLoading && (
          <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-6 text-center">
            <div className="text-6xl">📰</div>
            <h1 className={`${hanken.className} text-[28px] font-bold text-white/80`}>Article Not Found</h1>
            <p className="text-[15px] text-white/40 max-w-sm">
              {error ?? "We couldn't load this article. It may have been removed or the URL might be incorrect."}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => router.back()}
                className={`${hanken.className} rounded-xl border border-white/15 bg-white/[0.06] px-6 py-2.5 text-[13px] font-semibold text-white hover:bg-white/[0.12] transition-all`}
              >
                Go Back
              </button>
              <Link
                href="/content"
                className={`${hanken.className} rounded-xl bg-gradient-to-r from-[#00bfa5] to-[#006d40] px-6 py-2.5 text-[13px] font-bold text-white hover:opacity-90 transition-all`}
              >
                Browse All Articles
              </Link>
            </div>
          </div>
        )}

        {/* ── Article ── */}
        {!isLoading && !isError && article && (
          <>
            {/* ── Hero Image / Colour Banner ── */}
            <div className="relative h-[55vh] min-h-[360px] overflow-hidden">
              {article.has_image && article.image_url ? (
                <img
                  src={article.image_url}
                  alt={article.title}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className={`absolute inset-0 bg-gradient-to-br ${gradClass}`} />
              )}

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#001a1a] via-[#001a1a]/60 to-black/20" />
              <div className={`absolute inset-0 bg-gradient-to-br ${gradClass} opacity-20 mix-blend-multiply`} />

              {/* Category badge */}
              <div className="absolute top-8 left-8 z-10">
                <span className={`${jetbrains.className} inline-block rounded-full border border-white/25 bg-white/15 backdrop-blur-sm px-4 py-1.5 text-[11px] font-bold tracking-widest text-white uppercase`}>
                  {article.category_display}
                </span>
              </div>
            </div>

            {/* ── Article content ── */}
            <div
              ref={contentFade.ref}
              style={contentFade.style}
              className="mx-auto max-w-3xl px-6 pb-24 -mt-24 relative z-10 md:px-0"
            >
              {/* Meta */}
              <p className={`${jetbrains.className} mb-5 text-[11px] tracking-[0.2em] text-white/40 uppercase`}>
                {article.source}
                {article.source_type_display && (
                  <span className="ml-2 rounded-full border border-white/10 bg-white/[0.06] px-2 py-0.5 text-[9px]">
                    via {article.source_type_display}
                  </span>
                )}
                {" · "}
                {fmtDate(article.published_at)}
                {" · "}
                {article.read_time} min read
              </p>

              {/* Headline */}
              <h1 className={`${hanken.className} text-[32px] font-extrabold leading-tight text-white md:text-[46px]`}>
                {article.title}
              </h1>

              {/* Divider */}
              <div className={`my-8 h-0.5 w-16 rounded-full bg-gradient-to-r ${gradClass}`} />

              {/* Snippet / body */}
              <div className={`${inter.className} prose prose-invert max-w-none text-[16px] leading-[1.85] text-slate-300`}>
                <p>{article.snippet}</p>
              </div>

              {/* Source attribution + CTA */}
              <div className="mt-12 rounded-2xl border border-white/10 bg-white/[0.04] p-7 ring-1 ring-white/5">
                <p className={`${jetbrains.className} mb-2 text-[10px] tracking-[0.16em] text-white/30 uppercase`}>
                  Original Source
                </p>
                <p className={`${hanken.className} mb-4 text-[17px] font-bold text-white`}>
                  {article.source}
                </p>
                <p className="mb-5 text-[13px] leading-relaxed text-white/40">
                  This article was originally published on{" "}
                  <span className="font-medium text-white/60">{article.source}</span>. Click below to read the full article on the original source website.
                </p>
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${hanken.className} inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#00bfa5] to-[#006d40] px-7 py-3 text-[14px] font-bold text-white shadow-[0_4px_20px_rgba(0,191,165,0.25)] hover:shadow-[0_6px_28px_rgba(0,191,165,0.4)] hover:-translate-y-0.5 transition-all duration-300`}
                >
                  Read Full Article
                  <svg fill="none" height="14" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" width="14">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </a>
              </div>

              {/* Back link */}
              <div className="mt-10 flex items-center gap-4">
                <button
                  onClick={() => router.back()}
                  className={`${jetbrains.className} flex items-center gap-2 text-[12px] tracking-wide text-white/30 hover:text-white/70 transition-colors`}
                >
                  <svg fill="none" height="12" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="12">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                  Back
                </button>
                <div className="h-px flex-1 bg-white/[0.06]" />
                <Link
                  href="/content"
                  className={`${jetbrains.className} flex items-center gap-2 text-[12px] tracking-wide text-[#00bfa5] hover:text-white transition-colors`}
                >
                  All Articles
                  <svg fill="none" height="12" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="12">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </Link>
              </div>
            </div>
          </>
        )}
    </div>
  );
}
