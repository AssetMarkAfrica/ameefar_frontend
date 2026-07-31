"use client";

import { useEffect, useRef, useState } from "react";
import { Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import type { NewsArticle } from "@/types/content";

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const CATEGORY_COLORS: Record<string, string> = {
  plastic: "from-teal-500 to-emerald-600",
  africa: "from-amber-500 to-orange-500",
  general: "from-sky-500 to-blue-600",
  recycling: "from-green-500 to-teal-600",
  energy: "from-yellow-400 to-amber-500",
  policy: "from-violet-500 to-purple-600",
  technology: "from-indigo-500 to-blue-600",
};

export function categoryColor(cat: string): string {
  return CATEGORY_COLORS[cat] ?? "from-slate-500 to-slate-700";
}

export function useFadeIn(delay = 0) {
  const [node, setNode] = useState<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!node) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.08 },
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [node]);

  return {
    ref: setNode,
    style: {
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(32px)",
      transition: `opacity 0.7s ease-out ${delay}ms, transform 0.7s ease-out ${delay}ms`,
    },
  };
}

export function SkeletonCard() {
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

export function NewsCard({
  article,
  index,
  useInternalLink = true,
}: {
  article: NewsArticle;
  index: number;
  useInternalLink?: boolean;
}) {
  const { ref, style } = useFadeIn(index * 60);
  const [hovered, setHovered] = useState(false);

  const innerContent = (
    <>
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
    </>
  );

  const className =
    "group flex h-full flex-col overflow-hidden rounded-2xl ring-1 ring-white/10 bg-white/[0.04] transition-all duration-400 hover:-translate-y-1 hover:ring-white/20 hover:bg-white/[0.07] hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)]";

  return (
    <div ref={ref} style={style} className="h-full">
      {useInternalLink ? (
        <Link
          href={`/content/${article.slug}`}
          className={className}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {innerContent}
        </Link>
      ) : (
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className={className}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {innerContent}
        </a>
      )}
    </div>
  );
}
