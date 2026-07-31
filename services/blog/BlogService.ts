import { apiClient } from "../utils/api";
import type {
  PaginatedResponse,
  DataResponse,
  MessageResponse,
} from "@/types/api";
import type {
  BlogPostSummary,
  BlogPostDetail,
  BlogPostPayload,
  BlogCategory,
  BlogCategoryPayload,
  BlogTag,
  BlogTagPayload,
  BlogComment,
  BlogCommentPayload,
  BlogLikeStatus,
} from "@/types/blog";

const BASE =
  process.env.NEXT_PUBLIC_BLOG_URL ??
  (process.env.NEXT_PUBLIC_API_URL
    ? `${process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "")}/blog`
    : "http://localhost:82/api/blog");

export const BlogService = {
  fetchPublicPosts(params?: {
    category?: string;
    tag?: string;
    search?: string;
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResponse<BlogPostSummary>> {
    return apiClient
      .get<PaginatedResponse<BlogPostSummary>>(`${BASE}/posts/`, { params })
      .then((res) => res.data);
  },

  fetchPublicPostBySlug(slug: string): Promise<DataResponse<BlogPostDetail>> {
    return apiClient
      .get<DataResponse<BlogPostDetail>>(`${BASE}/posts/${slug}/`)
      .then((res) => res.data);
  },

  fetchCategories(): Promise<BlogCategory[]> {
    return apiClient
      .get<BlogCategory[]>(`${BASE}/categories/`)
      .then((res) => res.data);
  },

  fetchTags(): Promise<BlogTag[]> {
    return apiClient.get<BlogTag[]>(`${BASE}/tags/`).then((res) => res.data);
  },

  fetchComments(slug: string): Promise<DataResponse<BlogComment[]>> {
    return apiClient
      .get<DataResponse<BlogComment[]>>(`${BASE}/posts/${slug}/comments/`)
      .then((res) => res.data);
  },

  createComment(
    slug: string,
    payload: BlogCommentPayload,
  ): Promise<DataResponse<BlogComment>> {
    return apiClient
      .post<DataResponse<BlogComment>>(
        `${BASE}/posts/${slug}/comments/`,
        payload,
      )
      .then((res) => res.data);
  },

  deleteComment(commentId: string): Promise<MessageResponse> {
    return apiClient
      .delete<MessageResponse>(`${BASE}/admin/comments/${commentId}/`)
      .then((res) => res.data);
  },

  toggleLike(slug: string): Promise<DataResponse<BlogLikeStatus>> {
    return apiClient
      .post<DataResponse<BlogLikeStatus>>(`${BASE}/posts/${slug}/like/`)
      .then((res) => res.data);
  },

  fetchLikeStatus(slug: string): Promise<DataResponse<BlogLikeStatus>> {
    return apiClient
      .get<DataResponse<BlogLikeStatus>>(`${BASE}/posts/${slug}/like/status/`)
      .then((res) => res.data);
  },

  fetchAdminPosts(params?: {
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResponse<BlogPostSummary>> {
    return apiClient
      .get<PaginatedResponse<BlogPostSummary>>(`${BASE}/admin/posts/`, { params })
      .then((res) => res.data);
  },

  fetchAdminPost(postId: string): Promise<DataResponse<BlogPostDetail>> {
    return apiClient
      .get<DataResponse<BlogPostDetail>>(`${BASE}/admin/posts/${postId}/`)
      .then((res) => res.data);
  },

  createPost(
    payload: BlogPostPayload,
  ): Promise<DataResponse<BlogPostSummary>> {
    return apiClient
      .post<DataResponse<BlogPostSummary>>(`${BASE}/admin/posts/`, payload)
      .then((res) => res.data);
  },

  updatePost(
    postId: string,
    payload: BlogPostPayload,
  ): Promise<DataResponse<BlogPostSummary>> {
    return apiClient
      .put<DataResponse<BlogPostSummary>>(
        `${BASE}/admin/posts/${postId}/`,
        payload,
      )
      .then((res) => res.data);
  },

  patchPost(
    postId: string,
    payload: Partial<BlogPostPayload>,
  ): Promise<DataResponse<BlogPostSummary>> {
    return apiClient
      .patch<DataResponse<BlogPostSummary>>(
        `${BASE}/admin/posts/${postId}/`,
        payload,
      )
      .then((res) => res.data);
  },

  deletePost(postId: string): Promise<MessageResponse> {
    return apiClient
      .delete<MessageResponse>(`${BASE}/admin/posts/${postId}/`)
      .then((res) => res.data);
  },

  fetchAdminCategories(): Promise<BlogCategory[]> {
    return apiClient
      .get<BlogCategory[]>(`${BASE}/admin/categories/`)
      .then((res) => res.data);
  },

  createCategory(
    payload: BlogCategoryPayload,
  ): Promise<DataResponse<BlogCategory>> {
    return apiClient
      .post<DataResponse<BlogCategory>>(
        `${BASE}/admin/categories/`,
        payload,
      )
      .then((res) => res.data);
  },

  updateCategory(
    categoryId: string,
    payload: BlogCategoryPayload,
  ): Promise<DataResponse<BlogCategory>> {
    return apiClient
      .put<DataResponse<BlogCategory>>(
        `${BASE}/admin/categories/${categoryId}/`,
        payload,
      )
      .then((res) => res.data);
  },

  deleteCategory(categoryId: string): Promise<MessageResponse> {
    return apiClient
      .delete<MessageResponse>(`${BASE}/admin/categories/${categoryId}/`)
      .then((res) => res.data);
  },

  fetchAdminTags(): Promise<BlogTag[]> {
    return apiClient
      .get<BlogTag[]>(`${BASE}/admin/tags/`)
      .then((res) => res.data);
  },

  createTag(payload: BlogTagPayload): Promise<DataResponse<BlogTag>> {
    return apiClient
      .post<DataResponse<BlogTag>>(`${BASE}/admin/tags/`, payload)
      .then((res) => res.data);
  },

  updateTag(
    tagId: string,
    payload: BlogTagPayload,
  ): Promise<DataResponse<BlogTag>> {
    return apiClient
      .put<DataResponse<BlogTag>>(`${BASE}/admin/tags/${tagId}/`, payload)
      .then((res) => res.data);
  },

  deleteTag(tagId: string): Promise<MessageResponse> {
    return apiClient
      .delete<MessageResponse>(`${BASE}/admin/tags/${tagId}/`)
      .then((res) => res.data);
  },
};
