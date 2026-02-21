import { create } from "zustand";
import {
  createPostApi,
  getFeedPostsApi,
  getPostByIdApi,
  updatePostApi,
  deletePostApi,
  getPostsByUserApi,
  likePostApi,
  unlikePostApi,
  getPostLikeStatusApi,
  getPostCommentsApi,
  addCommentApi,
  sharePostApi,
  getPostSharesApi,
  CreatePostPayload,
  UpdatePostPayload,
  Post,
  Comment,
  CommentsResponse,
  AddCommentPayload,
  LikeResponse,
  SharePayload,
  ShareListResponse,
} from "../api/postApi";

interface PostState {
  feed: Post[];
  userPosts: Post[];
  selectedPost: Post | null;
  comments: Comment[];
  commentsPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
  shares: Array<{
    id: string;
    sharedWithUserId: string;
    sharedWith: {
      id: string;
      username: string;
      profilePicUrl: string | null;
    };
  }>;
  sharesCount: number;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  nextCursor: string | undefined;

  createPost: (data: CreatePostPayload) => Promise<void>;
  fetchFeed: (cursor?: string, limit?: number) => Promise<void>;
  loadMoreFeed: () => Promise<void>;
  refreshFeed: () => Promise<void>;
  fetchPostById: (postId: string) => Promise<void>;
  fetchUserPosts: (userId: string) => Promise<void>;
  updatePost: (postId: string, data: UpdatePostPayload) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  clearSelectedPost: () => void;

  // Like/Unlike
  likePost: (postId: string) => Promise<void>;
  unlikePost: (postId: string) => Promise<void>;
  getPostLikeStatus: (postId: string) => Promise<LikeResponse | null>;

  // Comments
  fetchPostComments: (postId: string, page?: number, limit?: number) => Promise<void>;
  addComment: (postId: string, payload: AddCommentPayload) => Promise<void>;
  clearComments: () => void;

  // Share
  sharePost: (postId: string, payload: SharePayload) => Promise<void>;
  getPostShares: (postId: string) => Promise<void>;
  clearShares: () => void;
}

const DEFAULT_LIMIT = 10;
const DEFAULT_COMMENTS_LIMIT = 20;

export const usePostStore = create<PostState>((set, get) => ({
  feed: [],
  userPosts: [],
  selectedPost: null,
  comments: [],
  commentsPagination: null,
  shares: [],
  sharesCount: 0,
  loading: false,
  error: null,
  hasMore: true,
  nextCursor: undefined,

  createPost: async (data) => {
    try {
      set({ loading: true, error: null });
      console.log("Creating post with data:", data);
      const res = await createPostApi(data);
      console.log("Create post response:", res);

      set((state) => ({
        feed: [res.data as Post, ...state.feed],
        loading: false,
      }));
    } catch (err: any) {
      console.error("Create post error:", err);
      console.error("Error response:", err.response?.data);
      set({ loading: false, error: err.message });
    }
  },

  fetchFeed: async (cursor?: string, limit: number = DEFAULT_LIMIT) => {
    try {
      set({ loading: true, error: null });
      const res = await getFeedPostsApi(cursor, limit);
      console.log("Fetch feed response:", res);
      // Handle different response structures
      const postsData = (res as any).data?.data || (res as any).data || res || [];
      const nextCursorValue = (res as any).data?.nextCursor || (res as any).nextCursor;
      console.log("Extracted posts:", postsData);
      
      set({ 
        feed: Array.isArray(postsData) ? postsData : [], 
        hasMore: !!nextCursorValue,
        nextCursor: nextCursorValue,
        loading: false 
      });
    } catch (err: any) {
      console.error("Fetch feed error:", err);
      // Handle 500 error gracefully - keep existing feed
      if (err.response?.status === 500) {
        console.log("Server error (500) - keeping existing feed");
      }
      set({ loading: false, error: err.message });
    }
  },

  loadMoreFeed: async () => {
    const { nextCursor, feed, loading, hasMore } = get();
    
    if (!hasMore || loading || !nextCursor) return;
    
    try {
      set({ loading: true, error: null });
      const res = await getFeedPostsApi(nextCursor, DEFAULT_LIMIT);
      
      const postsData = (res as any).data?.data || (res as any).data || res || [];
      const newNextCursor = (res as any).data?.nextCursor || (res as any).nextCursor;
      
      set({ 
        feed: [...feed, ...(Array.isArray(postsData) ? postsData : [])],
        hasMore: !!newNextCursor,
        nextCursor: newNextCursor,
        loading: false 
      });
    } catch (err: any) {
      console.error("Load more feed error:", err);
      set({ loading: false, error: err.message });
    }
  },

  refreshFeed: async () => {
    const { fetchFeed } = get();
    set({ nextCursor: undefined, hasMore: true });
    await fetchFeed(undefined, DEFAULT_LIMIT);
  },

  fetchPostById: async (postId) => {
    try {
      set({ loading: true, error: null });
      const res = await getPostByIdApi(postId);
      set({ selectedPost: res.data ?? null, loading: false });
    } catch (err: any) {
      set({ loading: false, error: err.message });
    }
  },

  fetchUserPosts: async (userId) => {
    try {
      set({ loading: true, error: null });
      const res = await getPostsByUserApi(userId);
      set({ userPosts: res.data ?? [], loading: false });
    } catch (err: any) {
      set({ loading: false, error: err.message });
    }
  },

  updatePost: async (postId, data) => {
    try {
      set({ loading: true, error: null });
      const res = await updatePostApi(postId, data);

      set((state) => ({
        feed: state.feed.map((p) =>
          p.id === postId ? (res.data as Post) : p
        ),
        selectedPost: res.data as Post,
        loading: false,
      }));
    } catch (err: any) {
      set({ loading: false, error: err.message });
    }
  },

  deletePost: async (postId) => {
    try {
      set({ loading: true, error: null });
      await deletePostApi(postId);

      set((state) => ({
        feed: state.feed.filter((p) => p.id !== postId),
        userPosts: state.userPosts.filter((p) => p.id !== postId),
        selectedPost: null,
        loading: false,
      }));
    } catch (err: any) {
      set({ loading: false, error: err.message });
    }
  },

  clearSelectedPost: () => {
    set({ selectedPost: null });
  },

  // ================= LIKE / UNLIKE =================

  likePost: async (postId) => {
    // Optimistic update - update UI immediately
    set((state) => {
      const post = state.feed.find((p) => p.id === postId);
      if (post && post.isLiked) return state; // Already liked, don't update
      
      return {
        feed: state.feed.map((p) =>
          p.id === postId
            ? { ...p, likesCount: (p.likesCount || 0) + 1, isLiked: true }
            : p
        ),
        selectedPost:
          state.selectedPost?.id === postId
            ? { ...state.selectedPost, likesCount: (state.selectedPost.likesCount || 0) + 1, isLiked: true }
            : state.selectedPost,
      };
    });

    try {
      const res = await likePostApi(postId);
      const { liked, likesCount } = res.data || {};

      // Sync with server response
      set((state) => ({
        feed: state.feed.map((p) =>
          p.id === postId
            ? { ...p, likesCount: likesCount ?? p.likesCount, isLiked: liked ?? true }
            : p
        ),
        selectedPost:
          state.selectedPost?.id === postId
            ? { ...state.selectedPost, likesCount: likesCount ?? state.selectedPost.likesCount, isLiked: liked ?? true }
            : state.selectedPost,
      }));
    } catch (err: any) {
      console.error("Like post error:", err);
      // Revert on error
      set((state) => ({
        feed: state.feed.map((p) =>
          p.id === postId
            ? { ...p, likesCount: Math.max(0, (p.likesCount || 0) - 1), isLiked: false }
            : p
        ),
        selectedPost:
          state.selectedPost?.id === postId
            ? { ...state.selectedPost, likesCount: Math.max(0, (state.selectedPost.likesCount || 0) - 1), isLiked: false }
            : state.selectedPost,
      }));
      set({ error: err.message });
    }
  },

  unlikePost: async (postId) => {
    // Optimistic update - update UI immediately
    set((state) => {
      const post = state.feed.find((p) => p.id === postId);
      if (post && !post.isLiked) return state; // Already unliked, don't update
      
      return {
        feed: state.feed.map((p) =>
          p.id === postId
            ? { ...p, likesCount: Math.max(0, (p.likesCount || 0) - 1), isLiked: false }
            : p
        ),
        selectedPost:
          state.selectedPost?.id === postId
            ? { ...state.selectedPost, likesCount: Math.max(0, (state.selectedPost.likesCount || 0) - 1), isLiked: false }
            : state.selectedPost,
      };
    });

    try {
      const res = await unlikePostApi(postId);
      const { liked, likesCount } = res.data || {};

      // Sync with server response
      set((state) => ({
        feed: state.feed.map((p) =>
          p.id === postId
            ? { ...p, likesCount: likesCount ?? p.likesCount, isLiked: liked ?? false }
            : p
        ),
        selectedPost:
          state.selectedPost?.id === postId
            ? { ...state.selectedPost, likesCount: likesCount ?? state.selectedPost.likesCount, isLiked: liked ?? false }
            : state.selectedPost,
      }));
    } catch (err: any) {
      console.error("Unlike post error:", err);
      // Revert on error
      set((state) => ({
        feed: state.feed.map((p) =>
          p.id === postId
            ? { ...p, likesCount: (p.likesCount || 0) + 1, isLiked: true }
            : p
        ),
        selectedPost:
          state.selectedPost?.id === postId
            ? { ...state.selectedPost, likesCount: (state.selectedPost.likesCount || 0) + 1, isLiked: true }
            : state.selectedPost,
      }));
      set({ error: err.message });
    }
  },

  getPostLikeStatus: async (postId) => {
    try {
      const res = await getPostLikeStatusApi(postId);
      return res.data || null;
    } catch (err: any) {
      console.error("Get like status error:", err);
      return null;
    }
  },

  // ================= COMMENTS =================

  fetchPostComments: async (postId, page = 1, limit = DEFAULT_COMMENTS_LIMIT) => {
    try {
      set({ loading: true, error: null });
      const res = await getPostCommentsApi(postId, page, limit);
      
      const responseData = res.data;
      if (responseData) {
        set({
          comments: responseData.comments || [],
          commentsPagination: responseData.pagination || null,
          loading: false,
        });
      }
    } catch (err: any) {
      console.error("Fetch comments error:", err);
      set({ loading: false, error: err.message });
    }
  },

  addComment: async (postId, payload) => {
    try {
      set({ loading: true, error: null });
      const res = await addCommentApi(postId, payload);
      
      set((state) => ({
        comments: [res.data as Comment, ...state.comments],
        feed: state.feed.map((p) =>
          p.id === postId
            ? { ...p, commentsCount: p.commentsCount + 1 }
            : p
        ),
        selectedPost:
          state.selectedPost?.id === postId
            ? { ...state.selectedPost, commentsCount: state.selectedPost.commentsCount + 1 }
            : state.selectedPost,
        loading: false,
      }));
    } catch (err: any) {
      console.error("Add comment error:", err);
      set({ loading: false, error: err.message });
    }
  },

  clearComments: () => {
    set({ comments: [], commentsPagination: null });
  },

  // ================= SHARE =================

  sharePost: async (postId, payload) => {
    try {
      set({ loading: true, error: null });
      const res = await sharePostApi(postId, payload);
      
      const responseData = res.data;
      if (responseData) {
        set((state) => ({
          shares: responseData.shares || [],
          sharesCount: responseData.sharesCount || 0,
          feed: state.feed.map((p) =>
            p.id === postId
              ? { ...p, sharesCount: responseData.sharesCount || p.sharesCount }
              : p
          ),
          selectedPost:
            state.selectedPost?.id === postId
              ? { ...state.selectedPost, sharesCount: responseData.sharesCount || state.selectedPost.sharesCount }
              : state.selectedPost,
          loading: false,
        }));
      }
    } catch (err: any) {
      console.error("Share post error:", err);
      set({ loading: false, error: err.message });
    }
  },

  getPostShares: async (postId) => {
    try {
      set({ loading: true, error: null });
      const res = await getPostSharesApi(postId);
      
      const responseData = res.data;
      if (responseData) {
        set({
          shares: responseData.sharedWith || [],
          loading: false,
        });
      }
    } catch (err: any) {
      console.error("Get post shares error:", err);
      set({ loading: false, error: err.message });
    }
  },

  clearShares: () => {
    set({ shares: [], sharesCount: 0 });
  },
}));
