import { create } from "zustand";
import {
  createPostApi,
  getFeedPostsApi,
  getPostByIdApi,
  updatePostApi,
  deletePostApi,
  getPostsByUserApi,
  CreatePostPayload,
  UpdatePostPayload,
  Post,
} from "../api/postApi";

interface PostState {
  feed: Post[];
  userPosts: Post[];
  selectedPost: Post | null;
  loading: boolean;
  error: string | null;

  createPost: (data: CreatePostPayload) => Promise<void>;
  fetchFeed: () => Promise<void>;
  fetchPostById: (postId: string) => Promise<void>;
  fetchUserPosts: (userId: string) => Promise<void>;
  updatePost: (postId: string, data: UpdatePostPayload) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  clearSelectedPost: () => void;
}

export const usePostStore = create<PostState>((set) => ({
  feed: [],
  userPosts: [],
  selectedPost: null,
  loading: false,
  error: null,

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

  fetchFeed: async () => {
    try {
      set({ loading: true, error: null });
      const res = await getFeedPostsApi();
      console.log("Fetch feed response:", res);
      // Handle different response structures
      const postsData = (res as any).data || res || [];
      console.log("Extracted posts:", postsData);
      set({ feed: Array.isArray(postsData) ? postsData : [], loading: false });
    } catch (err: any) {
      console.error("Fetch feed error:", err);
      // Handle 500 error gracefully - keep existing feed
      if (err.response?.status === 500) {
        console.log("Server error (500) - keeping existing feed");
      }
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
}));
