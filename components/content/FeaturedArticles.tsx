"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Hanken_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchFeaturedNewsThunk } from "@/store/content/contentThunks";
import {
  selectFeaturedArticles,
  selectContentOpStatus,
} from "@/store/content/contentSelectors";
import type { NewsArticle } from "@/types/content";

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"] });
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

/* ─── Category palette ────────────────────────────────────────────────── */
const CATEGORY_COLORS: Record<string, string> = {
  plastic:   "from-teal-500 to-emerald-600",
  africa:    "from-amber-500 to-orange-500",
  general:   "from-sky-500 to-blue-600",
  recycling: "from-green-500 to-teal-600",
  energy:    "from-yellow-400 to-amber-500",
  policy:    "from-violet-500 to-purple-600",
  technology:"from-indigo-500 to-blue-600",
};
function categoryColor(cat: string): string {
  return CATEGORY_COLORS[cat] ?? "from-slate-500 to-slate-700";
}

/* ─── Intersection-observer fade-up hook ─────────────────────────────── */
function useFadeIn(delay = 0) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.08 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return {
    ref,
    style: {
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(32px)",
      transition: `opacity 0.7s ease-out ${delay}ms, transform 0.7s ease-out ${delay}ms`,
    },
  };
}

/* ─── Skeleton card ───────────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden bg-white/[0.06] ring-1 ring-white/10 animate-pulse">
      <div className="h-52 bg-white/10" />
      <div className="p-5 space-y-3">
        <div className="h-3 w-24 rounded-full bg-white/10" />
        <div className="h-4 w-full rounded-full bg-white/10" />
        <div className="h-4 w-4/5 rounded-full bg-white/10" />
        <div className="h-3 w-20 rounded-full bg-white/[0.07] mt-2" />
      </div>
    </div>
  );
}

/* ─── Hero article (first card, large) ────────────────────────────────── */
function HeroCard({ article, index }: { article: NewsArticle; index: number }) {
  const { ref, style } = useFadeIn(index * 60);
  const [hovered, setHovered] = useState(false);

  return (
    <div ref={ref} style={style} className="col-span-2 row-span-2">
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex h-full min-h-[420px] flex-col overflow-hidden rounded-2xl ring-1 ring-white/10 transition-all duration-500 hover:-translate-y-1 hover:ring-white/25 hover:shadow-[0_32px_80px_rgba(0,0,0,0.6)]"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Background image */}
        {article.has_image && article.image_url ? (
          <img
            src={article.image_url}
            alt={article.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700"
            style={{ transform: hovered ? "scale(1.06)" : "scale(1)" }}
          />
        ) : (
          <div
            className={`absolute inset-0 bg-gradient-to-br ${categoryColor(article.category)}`}
          />
        )}

        {/* Overlay gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/5" />
        <div
          className={`absolute inset-0 bg-gradient-to-br ${categoryColor(article.category)} opacity-20 mix-blend-multiply`}
        />

        {/* Pulse dot */}
        <div className="absolute top-5 left-5 flex items-center gap-2 z-10">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
          </span>
          <span
            className={`${jetbrains.className} text-[10px] tracking-widest text-white/70 uppercase`}
          >
            Live
          </span>
        </div>

        {/* Category pill */}
        <div className="absolute top-5 right-5 z-10">
          <span
            className={`${jetbrains.className} inline-block rounded-full border border-white/20 bg-white/15 backdrop-blur-sm px-3 py-1 text-[10px] font-bold tracking-wider text-white uppercase`}
          >
            {article.category_display}
          </span>
        </div>

        {/* Content */}
        <div className="relative mt-auto p-7 z-10">
          <p
            className={`${jetbrains.className} text-[10px] tracking-[0.2em] text-white/50 uppercase mb-3`}
          >
            {article.source} · {article.time_ago} · {article.read_time} min read
          </p>
          <h3
            className={`${hanken.className} text-[22px] md:text-[26px] font-bold leading-tight text-white line-clamp-3 group-hover:text-[#beebeb] transition-colors duration-300`}
          >
            {article.title}
          </h3>
          <p className="mt-3 text-[14px] leading-relaxed text-white/60 line-clamp-2">
            {article.snippet}
          </p>

          {/* Read more */}
          <div className="mt-5 inline-flex items-center gap-2 text-[12px] font-semibold text-[#beebeb] group-hover:gap-3 transition-all duration-300">
            Read Article
            <svg
              fill="none"
              height="12"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
              width="12"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </div>
        </div>
      </a>
    </div>
  );
}

/* ─── Standard article card ───────────────────────────────────────────── */
function ArticleCard({
  article,
  index,
}: {
  article: NewsArticle;
  index: number;
}) {
  const { ref, style } = useFadeIn(index * 60);
  const [hovered, setHovered] = useState(false);

  return (
    <div ref={ref} style={style}>
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex flex-col overflow-hidden rounded-2xl ring-1 ring-white/10 bg-white/[0.04] transition-all duration-400 hover:-translate-y-1 hover:ring-white/20 hover:bg-white/[0.07] hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Thumbnail */}
        <div className="relative h-44 overflow-hidden">
          {article.has_image && article.image_url ? (
            <img
              src={article.image_url}
              alt={article.title}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-600"
              style={{ transform: hovered ? "scale(1.07)" : "scale(1)" }}
            />
          ) : (
            <div
              className={`absolute inset-0 bg-gradient-to-br ${categoryColor(article.category)}`}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Category pill overlay */}
          <div className="absolute bottom-3 left-3">
            <span
              className={`${jetbrains.className} inline-block rounded-full border border-white/20 bg-black/40 backdrop-blur-sm px-2.5 py-1 text-[9px] font-bold tracking-widest text-white uppercase`}
            >
              {article.category_display}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col p-5">
          <p
            className={`${jetbrains.className} text-[9px] tracking-[0.18em] text-white/35 uppercase mb-2`}
          >
            {article.source} · {article.time_ago}
          </p>
          <h3
            className={`${hanken.className} text-[16px] font-bold leading-snug text-white line-clamp-3 group-hover:text-[#beebeb] transition-colors duration-300 flex-1`}
          >
            {article.title}
          </h3>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-[11px] text-white/30">
              {article.read_time} min read
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#00bfa5] group-hover:gap-2 transition-all duration-300">
              Read
              <svg
                fill="none"
                height="10"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
                width="10"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </span>
          </div>
        </div>
      </a>
    </div>
  );
}

/* ─── Scrolling ticker ────────────────────────────────────────────────── */
function NewsTicker({ articles }: { articles: NewsArticle[] }) {
  if (articles.length === 0) return null;

  const items = [...articles, ...articles]; // duplicate for seamless loop

  return (
    <div className="relative overflow-hidden border-t border-b border-white/[0.07] py-3 bg-white/[0.02]">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 h-full w-16 bg-gradient-to-r from-[#001a1a] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-[#001a1a] to-transparent z-10 pointer-events-none" />

      <div
        className="flex gap-10 whitespace-nowrap"
        style={{
          animation: "tickerScroll 40s linear infinite",
          width: "max-content",
        }}
      >
        {items.map((a, i) => (
          <span
            key={i}
            className={`${jetbrains.className} inline-flex items-center gap-2 text-[11px] text-white/40`}
          >
            <span className="text-[#00bfa5]">✦</span>
            <span className="font-medium text-white/60 truncate max-w-[260px]">
              {a.title}
            </span>
            <span className="text-white/20">·</span>
            <span>{a.source}</span>
          </span>
        ))}
      </div>

      <style>{`
        @keyframes tickerScroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

/* ─── Main component ──────────────────────────────────────────────────── */
export function FeaturedArticles() {
  const dispatch = useAppDispatch();
  const articles = useAppSelector(selectFeaturedArticles);
  const status = useAppSelector((s) =>
    selectContentOpStatus(s, "fetchFeaturedNews"),
  );

  const isLoading = status === "idle" || status === "loading";

  useEffect(() => {
    dispatch(fetchFeaturedNewsThunk());
  }, [dispatch]);

  // Don't render section if loaded and empty
  if (!isLoading && articles.length === 0) return null;

  const [hero, ...rest] = articles;
  // Show up to 4 standard cards alongside the hero
  const sideCards = rest.slice(0, 4);

  const headerFade = useFadeIn(0);

  return (
    <section id="news" className="bg-[#001a1a] px-6 py-20 md:px-12 relative overflow-hidden">
      {/* Background ambience */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 right-0 h-[700px] w-[700px] translate-x-1/3 -translate-y-1/3 rounded-full bg-[#00bfa5]/6 blur-[160px]" />
        <div className="absolute bottom-0 left-0 h-[600px] w-[600px] -translate-x-1/4 translate-y-1/4 rounded-full bg-[#006d40]/8 blur-[140px]" />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,191,165,0.4) 1px, transparent 1px), linear-gradient(to right, rgba(0,191,165,0.4) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-[1440px]">
        {/* ── Header ── */}
        <div
          ref={headerFade.ref}
          style={headerFade.style}
          className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <span
              className={`${jetbrains.className} inline-flex items-center gap-2 rounded-full border border-[#006d40]/40 bg-[#006d40]/15 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#00bfa5]`}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00bfa5] opacity-70" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00bfa5]" />
              </span>
              Recycling News
            </span>
            <h2
              className={`${hanken.className} mt-4 text-[32px] font-bold text-white md:text-[40px] leading-tight`}
            >
              Latest from the{" "}
              <span className="bg-gradient-to-r from-[#00bfa5] to-emerald-300 bg-clip-text text-transparent">
                Circular Economy
              </span>
            </h2>
            <p className={`${inter.className} mt-2 text-[15px] text-slate-400`}>
              Curated recycling & sustainability headlines from across the globe.
            </p>
          </div>

          <Link
            href="/content"
            className={`${hanken.className} shrink-0 inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-5 py-2.5 text-[14px] font-bold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/[0.12] hover:border-white/30 hover:-translate-y-0.5`}
          >
            All Articles
            <svg
              fill="none"
              height="14"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
              width="14"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </Link>
        </div>

        {/* ── Ticker ── */}
        {!isLoading && <NewsTicker articles={articles} />}
        {!isLoading && articles.length > 0 && (
          <div className="mb-8" />
        )}

        {/* ── Grid ── */}
        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={i === 0 ? "sm:col-span-2 sm:row-span-2" : ""}
              >
                <SkeletonCard />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2 auto-rows-auto">
            {hero && <HeroCard article={hero} index={0} />}
            {sideCards.map((article, i) => (
              <ArticleCard key={article.id} article={article} index={i + 1} />
            ))}
          </div>
        )}

        {/* ── Footer note ── */}
        {!isLoading && articles.length > 0 && (
          <div
            className={`${jetbrains.className} mt-8 text-center text-[11px] tracking-wider text-white/20 uppercase`}
          >
            Powered by Ameefar Content Engine · Auto-refreshed daily
          </div>
        )}
      </div>
    </section>
  );
}
