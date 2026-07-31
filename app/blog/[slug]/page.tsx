"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectCurrentPost,
  selectBlogLoading,
  selectBlogError,
  selectComments,
  selectCommentsLoading,
  selectCommentsError,
  selectLiked,
  selectLikesCount,
  selectLikeToggling,
} from "@/store/blog/blogSelectors";
import {
  fetchPostBySlug,
  fetchComments,
  fetchLikeStatus,
  toggleLike,
  createComment,
  deleteComment,
} from "@/store/blog/blogThunks";
import { clearComments, clearLikeStatus } from "@/store/blog/blogSlice";
import { subscribe } from "@/store/newsletter/newsletterThunks";
import { selectNewsletterLoading, selectSubscribeMessage, selectNewsletterError } from "@/store/newsletter/newsletterSelectors";
import { clearSubscribeMessage } from "@/store/newsletter/newsletterSlice";
import { selectIsAuthenticated, selectIsAdmin, selectUser } from "@/store/auth/authSelectors";

function getReadTime(content: string): number {
  const words = content.replace(/<[^>]*>/g, "").split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const dispatch = useAppDispatch();
  const post = useAppSelector(selectCurrentPost);
  const loading = useAppSelector(selectBlogLoading);
  const error = useAppSelector(selectBlogError);
  const newsletterLoading = useAppSelector(selectNewsletterLoading);
  const subscribeMessage = useAppSelector(selectSubscribeMessage);
  const newsletterError = useAppSelector(selectNewsletterError);
  const comments = useAppSelector(selectComments);
  const commentsLoading = useAppSelector(selectCommentsLoading);
  const commentsError = useAppSelector(selectCommentsError);
  const liked = useAppSelector(selectLiked);
  const likesCount = useAppSelector(selectLikesCount);
  const likeToggling = useAppSelector(selectLikeToggling);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isAdmin = useAppSelector(selectIsAdmin);
  const user = useAppSelector(selectUser);

  const [email, setEmail] = useState("");
  const [commentText, setCommentText] = useState("");
  const slugRef = useRef<string | null>(null);
  const dispatchRef = useRef(dispatch);

  const canInteract = isAuthenticated && !isAdmin;

  const slug = slugRef.current;

  useEffect(() => {
    params.then(({ slug: s }) => {
      slugRef.current = s;
      dispatch(fetchPostBySlug(s));
      dispatch(fetchComments(s));
      dispatch(fetchLikeStatus(s));
    });
  }, [dispatch, params]);

  useEffect(() => {
    return () => {
      dispatch(clearSubscribeMessage());
      dispatch(clearComments());
      dispatch(clearLikeStatus());
    };
  }, [dispatch]);

  const handleLike = useCallback(() => {
    if (canInteract && slug && !likeToggling) {
      dispatch(toggleLike(slug));
    }
  }, [canInteract, slug, likeToggling, dispatch]);

  async function handleCommentSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canInteract || !slug || !commentText.trim()) return;
    const result = await dispatch(
      createComment({ slug, payload: { content: commentText.trim() } }),
    );
    if (createComment.fulfilled.match(result)) {
      setCommentText("");
    }
  }

  function handleDeleteComment(commentId: string) {
    if (slug) dispatch(deleteComment(commentId));
  }

  function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (email.trim()) {
      dispatch(subscribe({ email: email.trim() }));
    }
  }

  const loadingState = (
    <div className="min-h-screen bg-surface-gray font-body-md text-on-surface antialiased">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-16 text-center text-on-surface-variant">
        Loading...
      </div>
    </div>
  );

  const errorState = (
    <div className="min-h-screen bg-surface-gray font-body-md text-on-surface antialiased">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-16">
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>
        <Link href="/blog" className="mt-4 inline-block text-primary underline font-body-md">Back to blog</Link>
      </div>
    </div>
  );

  const notFoundState = (
    <div className="min-h-screen bg-surface-gray font-body-md text-on-surface antialiased">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-16 text-center text-on-surface-variant">
        Post not found.
      </div>
    </div>
  );

  if (loading) return loadingState;
  if (error) return errorState;
  if (!post) return notFoundState;

  const readTime = getReadTime(post.content);

  return (
    <div className="min-h-screen bg-surface-gray font-body-md text-on-surface antialiased flex flex-col">
      

      <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8 md:py-12">
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to blog
          </Link>
          {post.category && (
            <span className="px-3 py-1 bg-surface-container-high text-primary font-label-md text-label-md rounded-full uppercase tracking-wider">
              {post.category.name}
            </span>
          )}
        </div>

        <header className="mb-10 text-center md:text-left max-w-4xl">
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile md:font-display-lg md:text-display-lg text-ameefar-navy mb-6">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 font-label-md text-label-md text-on-surface-variant">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-surface-tint overflow-hidden flex-shrink-0 flex items-center justify-center text-surface-bright font-label-md">
                <span className="material-symbols-outlined text-sm">person</span>
              </div>
              <span className="font-medium text-on-surface">{post.author_name}</span>
            </div>
            {post.published_at && (
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">calendar_today</span>
                {new Date(post.published_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base">visibility</span>
              <span className="font-label-md text-label-md">{post.view_count.toLocaleString()} views</span>
            </div>
            <button
              type="button"
              onClick={handleLike}
              disabled={!canInteract || likeToggling}
              className={`flex items-center gap-1.5 transition-colors ${
                canInteract ? "cursor-pointer hover:text-red-500" : "cursor-default"
              } ${liked ? "text-red-500" : "text-on-surface-variant"}`}
              title={
                !isAuthenticated
                  ? "Sign in to like this post"
                  : isAdmin
                    ? "Admins cannot like posts"
                    : liked
                      ? "Unlike this post"
                      : "Like this post"
              }
            >
              <span className="material-symbols-outlined text-base">{liked ? "favorite" : "favorite_border"}</span>
              <span className="font-label-md text-label-md">{likesCount}</span>
            </button>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base">timer</span>
              {readTime} min read
            </div>
          </div>
        </header>

        {post.featured_image && (
          <div className="w-full h-[300px] md:h-[500px] rounded-xl overflow-hidden mb-12 shadow-sm border border-border-subtle bg-surface-gray relative">
            <img className="w-full h-full object-cover" src={post.featured_image} alt={post.title} />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
          <article className="md:col-span-8 lg:col-span-8 font-body-lg text-body-lg text-on-surface-variant space-y-8 leading-relaxed">
            {post.content && (
              <div
                className="[&_h2]:font-headline-lg [&_h2]:text-headline-lg [&_h2]:text-ameefar-navy [&_h2]:mt-12 [&_h2]:mb-6 [&_p]:font-body-lg [&_p]:text-body-lg [&_p]:text-on-surface-variant [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-3 [&_ul]:my-6 [&_ul]:font-body-md [&_ul]:text-body-md [&_li]:font-body-md [&_li]:text-body-md [&_strong]:font-semibold [&_blockquote]:my-10 [&_blockquote]:p-6 [&_blockquote]:bg-surface-container [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:rounded-r-lg [&_blockquote_p]:font-headline-md [&_blockquote_p]:text-headline-md [&_blockquote_p]:text-primary [&_blockquote_p]:italic"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            )}

            {post.tags.length > 0 && (
              <div className="mt-16 pt-8 border-t border-border-subtle flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag.id || tag.slug || tag.name}
                    className="px-3 py-1 bg-surface-gray border border-border-subtle text-on-surface-variant font-label-md text-label-md rounded hover:bg-surface-container-low transition-colors"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-16 pt-8 border-t border-border-subtle">
              <h3 className="font-headline-md text-headline-md text-primary mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-[22px]">chat_bubble</span>
                Comments ({post.comments_count})
              </h3>

              {canInteract ? (
                <form onSubmit={handleCommentSubmit} className="mb-8">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Share your thoughts..."
                    rows={3}
                    className="w-full bg-surface-gray border border-border-subtle rounded-lg font-body-md text-body-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-on-surface placeholder:text-outline resize-none"
                  />
                  <div className="flex justify-end mt-3">
                    <button
                      type="submit"
                      disabled={commentsLoading || !commentText.trim()}
                      className="bg-primary text-on-primary px-5 py-2 rounded-lg font-body-sm text-body-sm hover:bg-ameefar-navy transition-colors disabled:opacity-65 flex items-center gap-2"
                    >
                      {commentsLoading ? "Posting..." : "Post Comment"}
                      <span className="material-symbols-outlined text-[16px]">send</span>
                    </button>
                  </div>
                </form>
              ) : isAuthenticated && isAdmin ? (
                <div className="mb-8 p-4 rounded-lg bg-surface-container border border-border-subtle text-on-surface-variant font-body-sm text-body-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">info</span>
                  Admins cannot comment on posts.
                </div>
              ) : (
                <div className="mb-8 p-4 rounded-lg bg-surface-container border border-border-subtle">
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    <Link href="/auth/login" className="text-primary font-semibold hover:underline">Sign in</Link> to leave a comment.
                  </p>
                </div>
              )}

              {commentsError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 font-body-sm mb-6">{commentsError}</div>
              )}

              {commentsLoading && comments.length === 0 ? (
                <div className="py-8 text-center text-on-surface-variant font-body-sm">Loading comments...</div>
              ) : comments.length === 0 ? (
                <div className="py-8 text-center text-on-surface-variant font-body-sm">
                  No comments yet. Be the first to share your thoughts!
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {[...comments].reverse().map((comment) => (
                    <div key={comment.id} className="p-4 rounded-lg border border-border-subtle bg-white">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center text-primary font-label-sm text-label-sm shrink-0">
                            {comment.author_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-label-md text-label-md text-primary font-semibold">{comment.author_name}</p>
                            <p className="font-label-sm text-label-sm text-outline">{formatDate(comment.created_at)}</p>
                          </div>
                        </div>
                        {canInteract && user?.full_name === comment.author_name && (
                          <button
                            type="button"
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-on-surface-variant hover:text-red-500 transition-colors"
                            title="Delete comment"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        )}
                      </div>
                      <p className="font-body-md text-body-md text-on-surface">{comment.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </article>

          <aside className="md:col-span-4 lg:col-span-4 space-y-8 mt-12 md:mt-0">
            <div className="sticky top-28">
              <div className="bg-surface-bright border border-border-subtle rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded bg-surface-container flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">mark_email_read</span>
                  </div>
                  <h3 className="font-headline-md text-headline-md text-ameefar-navy">Market Insights</h3>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mb-6">
                  Subscribe to receive weekly analyses on material spot prices, regulatory shifts, and
                  technical innovations directly to your inbox.
                </p>
                <form className="space-y-4" onSubmit={handleSubscribe}>
                  <div>
                    <label htmlFor="email" className="sr-only">Email address</label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Corporate email address"
                      className="w-full bg-surface-gray border border-border-subtle rounded font-body-sm text-body-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-on-surface placeholder:text-outline transition-shadow"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={newsletterLoading}
                    className="w-full bg-primary text-on-primary font-label-md text-label-md py-3 rounded hover:bg-ameefar-navy transition-colors flex items-center justify-center gap-2 disabled:opacity-65"
                  >
                    {newsletterLoading ? "Subscribing..." : "Subscribe"}
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </form>
                {subscribeMessage && (
                  <p className="font-label-md text-label-md text-secondary mt-4 text-center">{subscribeMessage}</p>
                )}
                {newsletterError && (
                  <p className="font-label-md text-label-md text-error mt-4 text-center">{newsletterError}</p>
                )}
                <p className="font-label-md text-label-md text-outline mt-4 text-center text-[10px]">
                  By subscribing, you agree to our Privacy Policy.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <footer className="bg-ameefar-navy w-full font-body-sm text-body-sm">
        <div className="w-full py-12 px-margin-mobile md:px-margin-desktop grid grid-cols-1 md:grid-cols-12 gap-gutter max-w-container-max mx-auto">
          <div className="md:col-span-4 flex flex-col gap-4">
            <span className="font-headline-md text-headline-md text-surface-bright font-bold">Ameefar Energy</span>
            <p className="text-surface-variant opacity-80 max-w-sm">&copy; 2024 Ameefar Energy. Powering the Circular Economy.</p>
          </div>
          <div className="md:col-span-8 flex flex-wrap gap-x-8 gap-y-4 md:justify-end items-center">
            <Link href="#" className="text-surface-variant opacity-80 hover:opacity-100 hover:text-primary-fixed-dim transition-opacity">Privacy Policy</Link>
            <Link href="#" className="text-surface-variant opacity-80 hover:opacity-100 hover:text-primary-fixed-dim transition-opacity">Terms of Service</Link>
            <Link href="#" className="text-surface-variant opacity-80 hover:opacity-100 hover:text-primary-fixed-dim transition-opacity">Locations</Link>
            <Link href="#" className="text-surface-variant opacity-80 hover:opacity-100 hover:text-primary-fixed-dim transition-opacity">Global Compliance</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
