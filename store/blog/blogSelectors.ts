import type { RootState } from "@/store";
import type { BlogState } from "./blogSlice";

const selectBlogState = (state: RootState): BlogState => state.blog;

export const selectPosts = (state: RootState) => selectBlogState(state).posts;
export const selectPagination = (state: RootState) =>
  selectBlogState(state).pagination;
export const selectCurrentPost = (state: RootState) =>
  selectBlogState(state).currentPost;
export const selectCategories = (state: RootState) =>
  selectBlogState(state)?.categories ?? [];
export const selectTags = (state: RootState) =>
  selectBlogState(state)?.tags ?? [];
export const selectBlogLoading = (state: RootState) =>
  selectBlogState(state).loading;
export const selectBlogError = (state: RootState) =>
  selectBlogState(state).error;
export const selectTotalPosts = (state: RootState) =>
  selectBlogState(state).pagination?.count ?? 0;
export const selectHasNextPage = (state: RootState) =>
  selectBlogState(state).pagination?.next !== null;
export const selectHasPrevPage = (state: RootState) =>
  selectBlogState(state).pagination?.previous !== null;
export const selectCurrentPage = (state: RootState) =>
  selectBlogState(state).pagination?.current_page ?? 1;
export const selectTotalPages = (state: RootState) =>
  selectBlogState(state).pagination?.total_pages ?? 1;
export const selectAdminPosts = (state: RootState) =>
  selectBlogState(state).adminPosts;
export const selectAdminBlogLoading = (state: RootState) =>
  selectBlogState(state).loadingAdmin;
export const selectAdminPostsByStatus = (status: "draft" | "published") =>
  (state: RootState) =>
    selectAdminPosts(state).filter((p) => p.status === status);
export const selectAdminPostById = (postId: string) => (state: RootState) =>
  selectAdminPosts(state).find((p) => p.id === postId) ?? null;

export const selectComments = (state: RootState) =>
  selectBlogState(state).comments;
export const selectCommentsLoading = (state: RootState) =>
  selectBlogState(state).commentsLoading;
export const selectCommentsError = (state: RootState) =>
  selectBlogState(state).commentsError;
export const selectCommentsNewestFirst = (state: RootState) =>
  [...selectBlogState(state).comments].reverse();
export const selectLiked = (state: RootState) =>
  selectBlogState(state).liked;
export const selectLikesCount = (state: RootState) =>
  selectBlogState(state).likesCount;
export const selectLikeToggling = (state: RootState) =>
  selectBlogState(state).likeToggling;
export const selectLikeState = (state: RootState) => ({
  liked: selectBlogState(state).liked,
  count: selectBlogState(state).likesCount,
  toggling: selectBlogState(state).likeToggling,
});
