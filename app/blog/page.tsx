"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectPosts,
  selectBlogLoading,
  selectBlogError,
  selectHasNextPage,
  selectHasPrevPage,
  selectCurrentPage,
  selectTotalPages,
} from "@/store/blog/blogSelectors";
import { fetchPosts } from "@/store/blog/blogThunks";

const CATEGORY_COLORS: Record<string, string> = {
  Plastics: "text-primary",
  Metals: "text-secondary",
  Platform: "text-tertiary",
  Paper: "text-on-secondary-fixed-variant",
};

export default function BlogPage() {
  const dispatch = useAppDispatch();
  const posts = useAppSelector(selectPosts);
  const loading = useAppSelector(selectBlogLoading);
  const error = useAppSelector(selectBlogError);
  const hasNext = useAppSelector(selectHasNextPage);
  const hasPrev = useAppSelector(selectHasPrevPage);
  const page = useAppSelector(selectCurrentPage);
  const totalPages = useAppSelector(selectTotalPages);

  useEffect(() => {
    dispatch(fetchPosts({ page }));
  }, [dispatch, page]);

  function goToPage(p: number) {
    dispatch(fetchPosts({ page: p }));
  }

  const pages = useMemo(() => {
    const arr: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) arr.push(i);
    } else {
      arr.push(1);
      if (page > 3) arr.push("...");
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) arr.push(i);
      if (page < totalPages - 2) arr.push("...");
      arr.push(totalPages);
    }
    return arr;
  }, [page, totalPages]);

  function formatDate(dateStr: string | null) {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return (
    <div className="min-h-screen bg-surface-gray font-body-md text-on-surface antialiased flex flex-col">
      

      <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 md:py-20">
        <section className="mb-16 md:mb-24 text-center md:text-left max-w-3xl mx-auto md:mx-0">
          <h1 className="font-display-lg text-display-lg text-ameefar-navy mb-6">Insights & Innovations</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Expert analysis, market trends, and technological breakthroughs driving the circular economy forward.
            Stay informed with our latest editorial content.
          </p>
        </section>

        {loading && (
          <div className="py-12 text-center text-on-surface-variant font-body-md">Loading...</div>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 font-body-md mb-8">{error}</div>
        )}

        {!loading && !error && posts.length === 0 && (
          <div className="py-12 text-center text-on-surface-variant font-body-md">No posts yet.</div>
        )}

        {!loading && posts.length > 0 && (
          <>
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
              {posts.map((post) => {
                const badgeColor = post.category
                  ? (CATEGORY_COLORS[post.category.name] ?? "text-primary")
                  : "text-primary";

                return (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="bg-surface-bright rounded-xl overflow-hidden border border-border-subtle group hover:shadow-lg transition-all duration-300 flex flex-col h-full"
                  >
                    <div className="relative h-64 overflow-hidden bg-surface-container-low">
                      {post.featured_image ? (
                        <img
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          src={post.featured_image}
                          alt={post.title}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
                          <span className="material-symbols-outlined text-4xl">image</span>
                        </div>
                      )}
                      {post.category && (
                        <div className="absolute top-4 left-4">
                          <span className={`px-3 py-1 bg-surface-bright/90 backdrop-blur-sm ${badgeColor} font-label-md text-label-md rounded shadow-sm`}>
                            {post.category.name}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-6 flex flex-col flex-grow">
                      <div className="flex items-center gap-3 text-on-surface-variant font-label-md text-label-md mb-4">
                        <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                        <span>{formatDate(post.published_at)}</span>
                      </div>
                      <h3 className="font-headline-md text-headline-md text-ameefar-navy mb-3 group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="font-body-md text-body-md text-on-surface-variant mb-6 line-clamp-3 flex-grow">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between pt-4 border-t border-border-subtle mt-auto">
                        <div className="flex items-center gap-2 text-on-surface-variant font-label-md text-label-md">
                          <span className="material-symbols-outlined text-[16px]">person</span>
                          <span>{post.author_name}</span>
                        </div>
                        <div className="flex items-center gap-1 text-on-surface-variant font-label-md text-label-md">
                          <span className="material-symbols-outlined text-[16px]">visibility</span>
                          <span>{post.view_count}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </section>

            {totalPages > 1 && (
              <div className="mt-16 flex justify-center items-center gap-2">
                <button
                  onClick={() => goToPage(page - 1)}
                  disabled={!hasPrev}
                  className="p-2 border border-border-subtle rounded hover:bg-surface-container-low transition-colors text-on-surface-variant disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                </button>
                {pages.map((p, idx) =>
                  p === "..." ? (
                    <span key={`e${idx}`} className="px-2 text-on-surface-variant font-label-md">...</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => goToPage(p)}
                      className={`w-10 h-10 rounded font-label-md text-label-md flex items-center justify-center ${
                        p === page
                          ? "bg-primary text-on-primary"
                          : "border border-border-subtle text-on-surface-variant hover:bg-surface-container-low transition-colors"
                      }`}
                    >
                      {p}
                    </button>
                  ),
                )}
                <button
                  onClick={() => goToPage(page + 1)}
                  disabled={!hasNext}
                  className="p-2 border border-border-subtle rounded hover:bg-surface-container-low transition-colors text-on-surface-variant disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="bg-ameefar-navy w-full font-body-sm text-body-sm">
        <div className="w-full py-12 px-margin-mobile md:px-margin-desktop grid grid-cols-1 md:grid-cols-12 gap-gutter max-w-container-max mx-auto">
          <div className="md:col-span-4 flex flex-col gap-4">
            <span className="font-headline-md text-headline-md text-surface-bright">Ameefar Energy</span>
            <p className="text-surface-variant opacity-80 mt-2">&copy; 2024 Ameefar Energy. Powering the Circular Economy.</p>
          </div>
          <div className="md:col-span-8 flex flex-wrap gap-x-8 gap-y-4 md:justify-end items-start pt-2">
            <Link href="#" className="text-surface-variant opacity-80 hover:opacity-100 hover:text-primary-fixed-dim transition-all duration-200">Privacy Policy</Link>
            <Link href="#" className="text-surface-variant opacity-80 hover:opacity-100 hover:text-primary-fixed-dim transition-all duration-200">Terms of Service</Link>
            <Link href="#" className="text-surface-variant opacity-80 hover:opacity-100 hover:text-primary-fixed-dim transition-all duration-200">Locations</Link>
            <Link href="#" className="text-surface-variant opacity-80 hover:opacity-100 hover:text-primary-fixed-dim transition-all duration-200">Global Compliance</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
