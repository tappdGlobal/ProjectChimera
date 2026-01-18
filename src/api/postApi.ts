import { apiClient } from "../services/api";

/* ===================== TYPES ===================== */

export interface CreatePostData {
  content: string;
  images?: string[];
  eventId?: string;
}

export interface Post {
  id: string;
  userId: string;
  content: string;
  images?: string[];
  eventId?: string;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
  user?: any; // User object
  event?: any; // Event object
  isLiked?: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: string;
  user?: any; // User object
}

export interface Like {
  id: string;
  postId: string;
  userId: string;
  createdAt: string;
}

/* ===================== API ===================== */

export const postApi = {
  /* ================= CREATE POST ================= */
  createPost: async (postData: CreatePostData): Promise<Post> => {
    const response = await apiClient.post<any>("/posts", postData);
    return response.data;
  },

  /* ================= GET POSTS ================= */
  getPosts: async (userId?: string): Promise<Post[]> => {
    const endpoint = userId ? `/posts/user/${userId}` : "/posts";
    const response = await apiClient.get<any>(endpoint);
    return response.data;
  },

  /* ================= GET FEED ================= */
  getFeed: async (page: number = 1, limit: number = 20): Promise<Post[]> => {
    const response = await apiClient.get<any>(
      `/posts/feed?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  /* ================= GET SINGLE POST ================= */
  getPost: async (postId: string): Promise<Post> => {
    const response = await apiClient.get<any>(`/posts/${postId}`);
    return response.data;
  },

  /* ================= UPDATE POST ================= */
  updatePost: async (postId: string, postData: Partial<CreatePostData>): Promise<Post> => {
    const response = await apiClient.put<any>(`/posts/${postId}`, postData);
    return response.data;
  },

  /* ================= DELETE POST ================= */
  deletePost: async (postId: string): Promise<void> => {
    await apiClient.delete(`/posts/${postId}`);
  },

  /* ================= LIKE POST ================= */
  likePost: async (postId: string): Promise<Like> => {
    const response = await apiClient.post<any>(`/posts/${postId}/like`);
    return response.data;
  },

  /* ================= UNLIKE POST ================= */
  unlikePost: async (postId: string): Promise<void> => {
    await apiClient.delete(`/posts/${postId}/like`);
  },

  /* ================= GET COMMENTS ================= */
  getComments: async (postId: string): Promise<Comment[]> => {
    const response = await apiClient.get<any>(`/posts/${postId}/comments`);
    return response.data;
  },

  /* ================= ADD COMMENT ================= */
  addComment: async (postId: string, content: string): Promise<Comment> => {
    const response = await apiClient.post<any>(`/posts/${postId}/comments`, {
      content,
    });
    return response.data;
  },

  /* ================= DELETE COMMENT ================= */
  deleteComment: async (postId: string, commentId: string): Promise<void> => {
    await apiClient.delete(`/posts/${postId}/comments/${commentId}`);
  },
};
