"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectCategories, selectTags } from "@/store/blog/blogSelectors";
import { fetchCategories, fetchTags, createPost } from "@/store/blog/blogThunks";

export default function CreatePostPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const categoriesRaw = useAppSelector(selectCategories);
  const tagsRaw = useAppSelector(selectTags);
  const categories = Array.isArray(categoriesRaw) ? categoriesRaw : [];
  const tags = Array.isArray(tagsRaw) ? tagsRaw : [];

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchTags());
  }, [dispatch]);

  function toggleTag(tagId: string) {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId],
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("Title and content are required.");
      return;
    }
    setSaving(true);
    setError("");

    const result = await dispatch(
      createPost({
        title: title.trim(),
        content,
        excerpt: excerpt.trim() || undefined,
        featured_image: featuredImage.trim() || undefined,
        category_id: categoryId || null,
        tag_ids: selectedTagIds.length > 0 ? selectedTagIds : undefined,
        status,
      }),
    );

    setSaving(false);

    if (createPost.fulfilled.match(result)) {
      router.push("/blog/admin");
    } else {
      setError(result.error?.message ?? "Failed to create post.");
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-headline-lg text-headline-lg text-primary">Create Post</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">Write a new blog post.</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 font-body-md mb-6">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-border-subtle p-6 space-y-6 max-w-3xl">
        <div className="space-y-2">
          <label htmlFor="title" className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Title *</label>
          <input
            id="title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter post title"
            className="w-full bg-surface-gray border border-border-subtle rounded-lg font-body-md text-body-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-on-surface placeholder:text-outline"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="content" className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Content (HTML) *</label>
          <textarea
            id="content"
            required
            rows={16}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="<h1>Full HTML content</h1>"
            className="w-full bg-surface-gray border border-border-subtle rounded-lg font-body-md text-body-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-on-surface placeholder:text-outline resize-y font-mono"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="excerpt" className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Excerpt</label>
          <textarea
            id="excerpt"
            rows={3}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Short summary of the post"
            className="w-full bg-surface-gray border border-border-subtle rounded-lg font-body-md text-body-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-on-surface placeholder:text-outline resize-y"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="featured_image" className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Featured Image URL</label>
          <input
            id="featured_image"
            type="url"
            value={featuredImage}
            onChange={(e) => setFeaturedImage(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="w-full bg-surface-gray border border-border-subtle rounded-lg font-body-md text-body-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-on-surface placeholder:text-outline"
          />
          {featuredImage && (
            <div className="mt-2 w-48 h-32 rounded-lg overflow-hidden border border-border-subtle bg-surface-gray">
              <img className="w-full h-full object-cover" src={featuredImage} alt="Preview" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="category" className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Category</label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-surface-gray border border-border-subtle rounded-lg font-body-md text-body-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-on-surface"
            >
              <option value="">No category</option>
              {categories.map((cat) => (
                <option key={cat.id || cat.name} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Status</span>
            <div className="flex gap-3 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="draft"
                  checked={status === "draft"}
                  onChange={() => setStatus("draft")}
                  className="accent-primary w-4 h-4"
                />
                <span className="font-body-md text-body-md text-on-surface">Draft</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="published"
                  checked={status === "published"}
                  onChange={() => setStatus("published")}
                  className="accent-primary w-4 h-4"
                />
                <span className="font-body-md text-body-md text-on-surface">Published</span>
              </label>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Tags</span>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag.id || tag.slug || tag.name}
                type="button"
                onClick={() => toggleTag(tag.id)}
                className={`px-3 py-1.5 rounded-lg font-label-md text-label-md border transition-colors ${
                  selectedTagIds.includes(tag.id)
                    ? "bg-primary text-on-primary border-primary"
                    : "bg-surface-gray text-on-surface-variant border-border-subtle hover:bg-surface-container-low"
                }`}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 pt-4 border-t border-border-subtle">
          <button
            type="submit"
            disabled={saving}
            className="bg-primary text-on-primary px-6 py-3 rounded-lg font-body-sm text-body-sm hover:bg-ameefar-navy transition-colors disabled:opacity-65"
          >
            {saving ? "Saving..." : "Create Post"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-white border border-border-subtle text-on-surface-variant px-6 py-3 rounded-lg font-body-sm text-body-sm hover:bg-surface-gray transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
