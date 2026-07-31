"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectAdminPosts,
  selectAdminBlogLoading,
  selectBlogError,
} from "@/store/blog/blogSelectors";
import { fetchAdminPosts } from "@/store/blog/blogThunks";

export default function BlogAdminPage() {
  const dispatch = useAppDispatch();
  const posts = useAppSelector(selectAdminPosts);
  const loading = useAppSelector(selectAdminBlogLoading);
  const error = useAppSelector(selectBlogError);

  useEffect(() => {
    dispatch(fetchAdminPosts());
  }, [dispatch]);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-primary">Blog Admin</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">Manage blog posts.</p>
        </div>
        <Link
          href="/blog/admin/posts/create"
          className="bg-secondary/80 text-black px-4 py-2 rounded-lg font-body-sm text-body-sm hover:bg-white transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Post
        </Link>
      </div>

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
        <div className="space-y-3">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-xl border border-border-subtle p-5 flex items-center justify-between hover:shadow-md transition-shadow"
            >
              <Link
                href={`/blog/${post.slug}`}
                className="flex items-center gap-4 min-w-0 flex-1 group"
              >
                {post.featured_image && (
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container-low">
                    <img className="w-full h-full object-cover" src={post.featured_image} alt="" />
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="font-headline-md text-headline-md text-ameefar-navy truncate group-hover:text-primary transition-colors">{post.title}</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    {post.category?.name ?? "Uncategorized"}
                    {post.published_at && (
                      <>
                        {" · "}
                        {new Date(post.published_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </>
                    )}
                    {" · "}
                    {post.view_count} views
                  </p>
                </div>
              </Link>
              <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                <span
                  className={`px-2.5 py-0.5 rounded-full font-label-md text-label-md ${post.status === "published"
                    ? "bg-trust-green-subtle text-secondary"
                    : "bg-surface-gray text-on-surface-variant"
                    }`}
                >
                  {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                </span>
                <Link
                  href={`/blog/admin/posts/${post.id}/edit`}
                  className="text-primary hover:underline font-body-sm text-body-sm"
                >
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
