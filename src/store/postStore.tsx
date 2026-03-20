import { create } from "zustand";
import {
  createPostApi,
  getFeedPostsApi,
  getFriendsFeedApi,
  getEventFeedApi,
  getMyEventsFeedApi,
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
import { useUserStore } from "./userStore";
import { useAuthStore } from "./authStore";

interface PostState {
  feed: Post[];
  friendsFeed: Post[];
  eventFeed: Post[];
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
  friendsHasMore: boolean;
  eventHasMore: boolean;
  nextCursor: string | undefined;
  friendsNextCursor: string | undefined;
  eventNextCursor: string | undefined;
  currentEventId: string | null;

  createPost: (data: CreatePostPayload) => Promise<void>;
  fetchFeed: (cursor?: string, limit?: number) => Promise<void>;
  loadMoreFeed: () => Promise<void>;
  refreshFeed: () => Promise<void>;
  
  // Friends Feed
  fetchFriendsFeed: (page?: number, limit?: number) => Promise<void>;
  refreshFriendsFeed: () => Promise<void>;
  loadMoreFriendsFeed: () => Promise<void>;
  
  // Event Feed
  fetchEventFeed: (eventId: string, page?: number, limit?: number) => Promise<void>;
  refreshEventFeed: (eventId: string) => Promise<void>;
  loadMoreEventFeed: () => Promise<void>;
  
  // My Events Feed (Auto-aggregated from booked events)
  fetchMyEventsFeed: (page?: number, limit?: number) => Promise<void>;
  refreshMyEventsFeed: () => Promise<void>;
  loadMoreMyEventsFeed: () => Promise<void>;
  
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
  friendsFeed: [],
  eventFeed: [],
  userPosts: [],
  selectedPost: null,
  comments: [],
  commentsPagination: null,
  shares: [],
  sharesCount: 0,
  loading: false,
  error: null,
  hasMore: true,
  friendsHasMore: true,
  eventHasMore: true,
  nextCursor: undefined,
  friendsNextCursor: undefined,
  eventNextCursor: undefined,
  currentEventId: null,

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

  // ================= FRIENDS FEED =================
  fetchFriendsFeed: async (page: number = 1, limit: number = DEFAULT_LIMIT) => {
    try {
      // Don't set loading if we already have data (for faster switching)
      const currentFeed = get().friendsFeed;
      if (currentFeed.length === 0) {
        set({ loading: true });
      }
      set({ error: null });
      
      // Get current user ID from auth store
      const { userId: currentUserId } = useAuthStore.getState();
      
      // Fetch friends feed (required)
      const friendsRes = await getFriendsFeedApi(page, limit);
      const friendsData = (friendsRes as any).data?.data || (friendsRes as any).data || friendsRes || [];
      const hasMoreData = (friendsRes as any).data?.hasMore ?? (Array.isArray(friendsData) && friendsData.length === limit);
      
      // Filter out posts that have an eventId (those belong in Event Feed)
      const friendsPosts = (Array.isArray(friendsData) ? friendsData : []).filter((post: Post) => !post.eventId);
      
      // Try to fetch user's own posts (optional - may fail with 500)
      let userPosts: Post[] = [];
      if (currentUserId) {
        try {
          const userPostsRes = await getPostsByUserApi(currentUserId, page, limit);
          const userPostsData = (userPostsRes as any).data?.data || (userPostsRes as any).data || userPostsRes || [];
          userPosts = (Array.isArray(userPostsData) ? userPostsData : []).filter((post: Post) => !post.eventId);
        } catch (userPostsErr) {
          console.log("Failed to fetch user posts (optional):", userPostsErr);
          // Continue without user posts - friends feed is the main data
        }
      }
      
      // Merge friends posts and user posts, then sort by createdAt (newest first)
      const allPosts = [...friendsPosts, ...userPosts];
      const uniquePosts = [...new Map(allPosts.map(p => [p.id, p])).values()];
      
      // Preserve local isLiked state when refreshing
      const existingFeed = get().friendsFeed;
      const postsWithPreservedLikes = uniquePosts.map((newPost: Post) => {
        const existingPost = existingFeed.find(p => p.id === newPost.id);
        // If we have local like state and API doesn't provide it, preserve it
        if (existingPost && existingPost.isLiked && !newPost.isLiked) {
          return { ...newPost, isLiked: true };
        }
        return newPost;
      });
      
      const sortedPosts = postsWithPreservedLikes.sort((a: Post, b: Post) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      set({ 
        friendsFeed: sortedPosts, 
        friendsHasMore: hasMoreData,
        friendsNextCursor: hasMoreData ? String(page + 1) : undefined,
        loading: false 
      });
    } catch (err: any) {
      console.error("Fetch friends feed error:", err);
      set({ loading: false, error: err.message });
    }
  },

  refreshFriendsFeed: async () => {
    const { fetchFriendsFeed } = get();
    set({ friendsNextCursor: undefined, friendsHasMore: true });
    await fetchFriendsFeed(1, DEFAULT_LIMIT);
  },

  loadMoreFriendsFeed: async () => {
    const { friendsNextCursor, friendsFeed, loading, friendsHasMore } = get();
    
    if (!friendsHasMore || loading || !friendsNextCursor) return;
    
    const nextPage = parseInt(friendsNextCursor, 10);
    if (isNaN(nextPage)) return;
    
    try {
      set({ loading: true, error: null });
      const res = await getFriendsFeedApi(nextPage, DEFAULT_LIMIT);
      const postsData = (res as any).data?.data || (res as any).data || res || [];
      const hasMoreData = (res as any).data?.hasMore ?? (Array.isArray(postsData) && postsData.length === DEFAULT_LIMIT);
      
      // Filter out posts that have an eventId (those belong in Event Feed)
      const friendsPosts = (Array.isArray(postsData) ? postsData : []).filter((post: Post) => !post.eventId);
      
      // Merge and deduplicate
      const allPosts = [...friendsFeed, ...friendsPosts];
      const uniquePosts = [...new Map(allPosts.map(p => [p.id, p])).values()];
      
      set({ 
        friendsFeed: uniquePosts,
        friendsHasMore: hasMoreData,
        friendsNextCursor: hasMoreData ? String(nextPage + 1) : undefined,
        loading: false 
      });
    } catch (err: any) {
      console.error("Load more friends feed error:", err);
      set({ loading: false, error: err.message });
    }
  },

  // ================= EVENT FEED =================
  fetchEventFeed: async (eventId: string, page: number = 1, limit: number = DEFAULT_LIMIT) => {
    try {
      set({ loading: true, error: null, currentEventId: eventId });
      const res = await getEventFeedApi(eventId, page, limit);
      const postsData = (res as any).data?.data || (res as any).data || res || [];
      const hasMoreData = (res as any).data?.hasMore ?? (Array.isArray(postsData) && postsData.length === limit);
      
      // Preserve local isLiked state when refreshing
      const existingEventFeed = get().eventFeed;
      const postsWithPreservedLikes = (Array.isArray(postsData) ? postsData : []).map((newPost: Post) => {
        const existingPost = existingEventFeed.find(p => p.id === newPost.id);
        // If we have local like state and API doesn't provide it, preserve it
        if (existingPost && existingPost.isLiked && !newPost.isLiked) {
          return { ...newPost, isLiked: true };
        }
        return newPost;
      });
      
      set({ 
        eventFeed: postsWithPreservedLikes, 
        eventHasMore: hasMoreData,
        eventNextCursor: hasMoreData ? String(page + 1) : undefined,
        loading: false 
      });
    } catch (err: any) {
      console.error("Fetch event feed error:", err);
      // Handle 403 error - user hasn't booked the event
      if (err.response?.status === 403) {
        set({ 
          eventFeed: [], 
          eventHasMore: false,
          eventNextCursor: undefined,
          loading: false,
          error: "You need to book this event to see posts."
        });
      } else {
        set({ loading: false, error: err.message });
      }
    }
  },

  refreshEventFeed: async (eventId: string) => {
    const { fetchEventFeed } = get();
    set({ eventNextCursor: undefined, eventHasMore: true });
    await fetchEventFeed(eventId, 1, DEFAULT_LIMIT);
  },

  loadMoreEventFeed: async () => {
    const { eventNextCursor, eventFeed, loading, eventHasMore, currentEventId } = get();
    
    if (!eventHasMore || loading || !eventNextCursor || !currentEventId) return;
    
    const nextPage = parseInt(eventNextCursor, 10);
    if (isNaN(nextPage)) return;
    
    try {
      set({ loading: true, error: null });
      const res = await getEventFeedApi(currentEventId, nextPage, DEFAULT_LIMIT);
      const postsData = (res as any).data?.data || (res as any).data || res || [];
      const hasMoreData = (res as any).data?.hasMore ?? (Array.isArray(postsData) && postsData.length === DEFAULT_LIMIT);
      
      set({ 
        eventFeed: [...eventFeed, ...(Array.isArray(postsData) ? postsData : [])],
        eventHasMore: hasMoreData,
        eventNextCursor: hasMoreData ? String(nextPage + 1) : undefined,
        loading: false 
      });
    } catch (err: any) {
      console.error("Load more event feed error:", err);
      set({ loading: false, error: err.message });
    }
  },

  // ================= MY EVENTS FEED (Auto-aggregated from booked events) =================
  fetchMyEventsFeed: async (page: number = 1, limit: number = DEFAULT_LIMIT) => {
    try {
      // Don't set loading if we already have data (for faster switching)
      const currentFeed = get().eventFeed;
      if (currentFeed.length === 0) {
        set({ loading: true });
      }
      set({ error: null, currentEventId: null });
      
      const posts = await getMyEventsFeedApi(page, limit);
      const hasMoreData = posts.length === limit;
      
      set({ 
        eventFeed: posts, 
        eventHasMore: hasMoreData,
        eventNextCursor: hasMoreData ? String(page + 1) : undefined,
        loading: false 
      });
    } catch (err: any) {
      console.error("Fetch my events feed error:", err);
      set({ loading: false, error: err.message });
    }
  },

  refreshMyEventsFeed: async () => {
    const { fetchMyEventsFeed } = get();
    set({ eventNextCursor: undefined, eventHasMore: true });
    await fetchMyEventsFeed(1, DEFAULT_LIMIT);
  },

  loadMoreMyEventsFeed: async () => {
    const { eventNextCursor, eventFeed, loading, eventHasMore } = get();
    
    if (!eventHasMore || loading || !eventNextCursor) return;
    
    const nextPage = parseInt(eventNextCursor, 10);
    if (isNaN(nextPage)) return;
    
    try {
      set({ loading: true, error: null });
      const newPosts = await getMyEventsFeedApi(nextPage, DEFAULT_LIMIT);
      const hasMoreData = newPosts.length === DEFAULT_LIMIT;
      
      // Merge and deduplicate
      const allPosts = [...eventFeed, ...newPosts];
      const uniquePosts = [...new Map(allPosts.map(p => [p.id, p])).values()];
      
      set({ 
        eventFeed: uniquePosts,
        eventHasMore: hasMoreData,
        eventNextCursor: hasMoreData ? String(nextPage + 1) : undefined,
        loading: false 
      });
    } catch (err: any) {
      console.error("Load more my events feed error:", err);
      set({ loading: false, error: err.message });
    }
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
      const updatePost = (p: Post) =>
        p.id === postId
          ? { ...p, likesCount: (p.likesCount || 0) + 1, isLiked: true }
          : p;
      
      return {
        feed: state.feed.map(updatePost),
        friendsFeed: state.friendsFeed.map(updatePost),
        eventFeed: state.eventFeed.map(updatePost),
        selectedPost:
          state.selectedPost?.id === postId
            ? { ...state.selectedPost, likesCount: (state.selectedPost.likesCount || 0) + 1, isLiked: true }
            : state.selectedPost,
      };
    });

    try {
      const res = await likePostApi(postId);
      const { liked, likesCount } = res.data || {};
      
      console.log(`[likePost API] postId: ${postId}, liked: ${liked}, likesCount: ${likesCount}`);

      // Sync with server response - ONLY if server confirms like
      if (liked === true) {
        set((state) => {
          const syncPost = (p: Post) =>
            p.id === postId
              ? { ...p, likesCount: likesCount ?? p.likesCount, isLiked: true }
              : p;
          return {
            feed: state.feed.map(syncPost),
            friendsFeed: state.friendsFeed.map(syncPost),
            eventFeed: state.eventFeed.map(syncPost),
            selectedPost:
              state.selectedPost?.id === postId
                ? { ...state.selectedPost, likesCount: likesCount ?? state.selectedPost.likesCount, isLiked: true }
                : state.selectedPost,
          };
        });
      } else {
        console.log(`[likePost API] Server did not confirm like, keeping optimistic state`);
      }
    } catch (err: any) {
      console.error("Like post error:", err);
      // Revert on error
      set((state) => {
        const revertPost = (p: Post) =>
          p.id === postId
            ? { ...p, likesCount: Math.max(0, (p.likesCount || 0) - 1), isLiked: false }
            : p;
        return {
          feed: state.feed.map(revertPost),
          friendsFeed: state.friendsFeed.map(revertPost),
          eventFeed: state.eventFeed.map(revertPost),
          selectedPost:
            state.selectedPost?.id === postId
              ? { ...state.selectedPost, likesCount: Math.max(0, (state.selectedPost.likesCount || 0) - 1), isLiked: false }
              : state.selectedPost,
        };
      });
      set({ error: err.message });
    }
  },

  unlikePost: async (postId) => {
    // Optimistic update - update UI immediately
    set((state) => {
      const updatePost = (p: Post) =>
        p.id === postId
          ? { ...p, likesCount: Math.max(0, (p.likesCount || 0) - 1), isLiked: false }
          : p;
      
      return {
        feed: state.feed.map(updatePost),
        friendsFeed: state.friendsFeed.map(updatePost),
        eventFeed: state.eventFeed.map(updatePost),
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
      set((state) => {
        const syncPost = (p: Post) =>
          p.id === postId
            ? { ...p, likesCount: likesCount ?? p.likesCount, isLiked: liked ?? false }
            : p;
        return {
          feed: state.feed.map(syncPost),
          friendsFeed: state.friendsFeed.map(syncPost),
          eventFeed: state.eventFeed.map(syncPost),
          selectedPost:
            state.selectedPost?.id === postId
              ? { ...state.selectedPost, likesCount: likesCount ?? state.selectedPost.likesCount, isLiked: liked ?? false }
              : state.selectedPost,
        };
      });
    } catch (err: any) {
      console.error("Unlike post error:", err);
      // Revert on error
      set((state) => {
        const revertPost = (p: Post) =>
          p.id === postId
            ? { ...p, likesCount: (p.likesCount || 0) + 1, isLiked: true }
            : p;
        return {
          feed: state.feed.map(revertPost),
          friendsFeed: state.friendsFeed.map(revertPost),
          eventFeed: state.eventFeed.map(revertPost),
          selectedPost:
            state.selectedPost?.id === postId
              ? { ...state.selectedPost, likesCount: (state.selectedPost.likesCount || 0) + 1, isLiked: true }
              : state.selectedPost,
        };
      });
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
      
      // Get current user info to populate the comment
      const currentUser = useUserStore.getState().profile;
      const newComment = res.data as Comment;
      
      // If the API doesn't return user data, populate it from user store
      if (!newComment.user || !newComment.user.username) {
        newComment.user = {
          id: currentUser?.id || newComment.userId,
          username: currentUser?.username || currentUser?.name || "Unknown",
          profilePicUrl: currentUser?.profilePicUrl || null,
        };
      }
      
      // Handle different field names for comment text (backend might return 'content' instead of 'text')
      const commentData = res.data as any;
      if (!newComment.text && commentData.content) {
        newComment.text = commentData.content;
      }
      
      set((state) => ({
        comments: [newComment, ...state.comments],
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
