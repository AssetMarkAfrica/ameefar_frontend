export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  post_count: number;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
}

export interface BlogComment {
  id: string;
  post: string;
  author_id: string;
  author_name: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface BlogCommentPayload {
  content: string;
}

export interface BlogLikeStatus {
  liked: boolean;
  likes_count: number;
}

export interface BlogPostSummary {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image: string;
  category: BlogCategory | null;
  tags: BlogTag[];
  author_name: string;
  status: "draft" | "published";
  published_at: string | null;
  view_count: number;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
}

export interface BlogPostDetail extends BlogPostSummary {
  content: string;
  comments: BlogComment[];
}

export interface BlogPostPayload {
  title: string;
  content: string;
  excerpt?: string;
  featured_image?: string;
  category_id?: string | null;
  tag_ids?: string[];
  status?: "draft" | "published";
}

export interface BlogCategoryPayload {
  name: string;
  description?: string;
}

export interface BlogTagPayload {
  name: string;
}
