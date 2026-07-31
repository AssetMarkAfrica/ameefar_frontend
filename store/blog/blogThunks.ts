import { createAsyncThunk } from "@reduxjs/toolkit";
import { BlogService } from "@/services/blog/BlogService";
import type {
  BlogPostPayload,
  BlogCategoryPayload,
  BlogTagPayload,
  BlogCommentPayload,
} from "@/types/blog";

export const fetchPosts = createAsyncThunk(
  "blog/fetchPosts",
  async (params?: {
    category?: string;
    tag?: string;
    search?: string;
    page?: number;
    page_size?: number;
  }) => {
    const response = await BlogService.fetchPublicPosts(params);
    return response;
  },
);

export const fetchPostBySlug = createAsyncThunk(
  "blog/fetchPostBySlug",
  async (slug: string) => {
    const response = await BlogService.fetchPublicPostBySlug(slug);
    return response.data;
  },
);

export const fetchCategories = createAsyncThunk(
  "blog/fetchCategories",
  async () => {
    return await BlogService.fetchCategories();
  },
);

export const fetchTags = createAsyncThunk(
  "blog/fetchTags",
  async () => {
    return await BlogService.fetchTags();
  },
);

export const fetchAdminPosts = createAsyncThunk(
  "blog/fetchAdminPosts",
  async (params?: { page?: number; page_size?: number }) => {
    const response = await BlogService.fetchAdminPosts(params);
    return response;
  },
);

export const fetchAdminPost = createAsyncThunk(
  "blog/fetchAdminPost",
  async (postId: string) => {
    const response = await BlogService.fetchAdminPost(postId);
    return response.data;
  },
);

export const createPost = createAsyncThunk(
  "blog/createPost",
  async (payload: BlogPostPayload) => {
    const response = await BlogService.createPost(payload);
    return response.data;
  },
);

export const updatePost = createAsyncThunk(
  "blog/updatePost",
  async ({ postId, payload }: { postId: string; payload: BlogPostPayload }) => {
    const response = await BlogService.updatePost(postId, payload);
    return response.data;
  },
);

export const patchPost = createAsyncThunk(
  "blog/patchPost",
  async ({
    postId,
    payload,
  }: {
    postId: string;
    payload: Partial<BlogPostPayload>;
  }) => {
    const response = await BlogService.patchPost(postId, payload);
    return response.data;
  },
);

export const deletePost = createAsyncThunk(
  "blog/deletePost",
  async (postId: string) => {
    await BlogService.deletePost(postId);
    return postId;
  },
);

export const createCategory = createAsyncThunk(
  "blog/createCategory",
  async (payload: BlogCategoryPayload) => {
    const response = await BlogService.createCategory(payload);
    return response.data;
  },
);

export const updateCategory = createAsyncThunk(
  "blog/updateCategory",
  async ({
    categoryId,
    payload,
  }: {
    categoryId: string;
    payload: BlogCategoryPayload;
  }) => {
    const response = await BlogService.updateCategory(categoryId, payload);
    return response.data;
  },
);

export const deleteCategory = createAsyncThunk(
  "blog/deleteCategory",
  async (categoryId: string) => {
    await BlogService.deleteCategory(categoryId);
    return categoryId;
  },
);

export const createTag = createAsyncThunk(
  "blog/createTag",
  async (payload: BlogTagPayload) => {
    const response = await BlogService.createTag(payload);
    return response.data;
  },
);

export const updateTag = createAsyncThunk(
  "blog/updateTag",
  async ({ tagId, payload }: { tagId: string; payload: BlogTagPayload }) => {
    const response = await BlogService.updateTag(tagId, payload);
    return response.data;
  },
);

export const deleteTag = createAsyncThunk(
  "blog/deleteTag",
  async (tagId: string) => {
    await BlogService.deleteTag(tagId);
    return tagId;
  },
);

export const fetchComments = createAsyncThunk(
  "blog/fetchComments",
  async (slug: string) => {
    const response = await BlogService.fetchComments(slug);
    return response.data;
  },
);

export const createComment = createAsyncThunk(
  "blog/createComment",
  async ({ slug, payload }: { slug: string; payload: BlogCommentPayload }) => {
    const response = await BlogService.createComment(slug, payload);
    return response.data;
  },
);

export const deleteComment = createAsyncThunk(
  "blog/deleteComment",
  async (commentId: string) => {
    await BlogService.deleteComment(commentId);
    return commentId;
  },
);

export const fetchLikeStatus = createAsyncThunk(
  "blog/fetchLikeStatus",
  async (slug: string) => {
    const response = await BlogService.fetchLikeStatus(slug);
    return response.data;
  },
);

export const toggleLike = createAsyncThunk(
  "blog/toggleLike",
  async (slug: string) => {
    const response = await BlogService.toggleLike(slug);
    return response.data;
  },
);
