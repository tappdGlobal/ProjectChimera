import { apiClient } from "../services/api";
import { ApiResponse, User } from "../types/authTypes";

/* ================= TYPES ================= */

export type MediaType = "IMAGE" | "VIDEO";

export interface PostMedia {
  id: string;
  type: MediaType;
  url: string;
  thumbnailUrl?: string;
}

export interface Post {
  id: string;
  caption?: string;
  userId: string;
  user: User;
  media: PostMedia[];
  locationName?: string;
  latitude?: number;
  longitude?: number;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  viewsCount: number;
  isCarousel: boolean;
  allowComments: boolean;
  isLiked?: boolean;
  createdAt: string;
  updatedAt: string;
}

/* ================= CREATE POST ================= */

export interface CreatePostPayload {
  caption?: string;
  locationName?: string;
  latitude?: number;
  longitude?: number;
  allowComments: boolean;
  isCarousel: boolean;
  media: {
    uri: string;
    name: string;
    type: string;
  }[];
}

export const createPostApi = (
  payload: CreatePostPayload
): Promise<ApiResponse<Post>> => {
  const formData = new FormData();

  if (payload.caption) formData.append("caption", payload.caption);
  if (payload.locationName)
    formData.append("locationName", payload.locationName);
  if (payload.latitude)
    formData.append("latitude", String(payload.latitude));
  if (payload.longitude)
    formData.append("longitude", String(payload.longitude));

  formData.append("allowComments", String(payload.allowComments));
  formData.append("isCarousel", String(payload.isCarousel));

  payload.media.forEach((file) => {
    formData.append("media", file as any);
  });

  return apiClient.post("/posts", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

/* ================= GET FEED ================= */

export interface GetFeedParams {
  cursor?: string;
  limit?: number;
}

export const getFeedPostsApi = (
  cursor?: string,
  limit?: number
): Promise<ApiResponse<Post[]>> => {
  const params: GetFeedParams = {};
  if (cursor) params.cursor = cursor;
  if (limit) params.limit = limit;
  
  return apiClient.get("/posts", { params });
};

/* ================= GET POST BY ID ================= */

export const getPostByIdApi = (
  postId: string
): Promise<ApiResponse<Post>> => {
  return apiClient.get(`/posts/${postId}`);
};

/* ================= UPDATE POST ================= */

export type UpdatePostPayload = Partial<{
  caption: string;
  locationName: string;
  latitude: number;
  longitude: number;
  allowComments: boolean;
}>;

export const updatePostApi = (
  postId: string,
  payload: UpdatePostPayload
): Promise<ApiResponse<Post>> => {
  return apiClient.put(`/posts/${postId}`, payload);
};

/* ================= DELETE POST ================= */

export const deletePostApi = (
  postId: string
): Promise<ApiResponse<null>> => {
  return apiClient.delete(`/posts/${postId}`);
};

/* ================= GET USER POSTS ================= */

export const getPostsByUserApi = (
  userId: string
): Promise<ApiResponse<Post[]>> => {
  return apiClient.get(`/posts/user/${userId}`);
};

/* ================= LIKE / UNLIKE ================= */

export interface LikeResponse {
  liked: boolean;
  likesCount: number;
}

export const likePostApi = (
  postId: string
): Promise<ApiResponse<LikeResponse>> => {
  return apiClient.post(`/posts/${postId}/like`);
};

export const unlikePostApi = (
  postId: string
): Promise<ApiResponse<LikeResponse>> => {
  return apiClient.delete(`/posts/${postId}/like`);
};

export const getPostLikeStatusApi = (
  postId: string
): Promise<ApiResponse<LikeResponse>> => {
  return apiClient.get(`/posts/${postId}/like`);
};

/* ================= COMMENTS ================= */

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  text: string;
  likesCount: number;
  user: {
    id: string;
    username: string;
    profilePicUrl: string | null;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface CommentsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  pages?: number;
}

export interface CommentsResponse {
  comments: Comment[];
  pagination: CommentsPagination;
}

export interface AddCommentPayload {
  text: string;
}

export const getPostCommentsApi = (
  postId: string,
  page?: number,
  limit?: number
): Promise<ApiResponse<CommentsResponse>> => {
  const params: { page?: number; limit?: number } = {};
  if (page) params.page = page;
  if (limit) params.limit = limit;
  return apiClient.get(`/posts/${postId}/comments`, { params });
};

export const addCommentApi = (
  postId: string,
  payload: AddCommentPayload
): Promise<ApiResponse<Comment>> => {
  return apiClient.post(`/posts/${postId}/comments`, payload);
};

/* ================= SHARE ================= */

export interface SharePayload {
  friendIds: string[];
}

export interface ShareItem {
  id: string;
  postId: string;
  sharedByUserId: string;
  sharedWithUserId: string;
  createdAt: string;
  sharedWith: {
    id: string;
    username: string;
    profilePicUrl: string | null;
  };
}

export interface ShareResponse {
  shares: ShareItem[];
  sharesCount: number;
}

export interface ShareListResponse {
  sharedWith: Array<{
    id: string;
    sharedWithUserId: string;
    sharedWith: {
      id: string;
      username: string;
      profilePicUrl: string | null;
    };
  }>;
}

export const sharePostApi = (
  postId: string,
  payload: SharePayload
): Promise<ApiResponse<ShareResponse>> => {
  return apiClient.post(`/posts/${postId}/share`, payload);
};

export const getPostSharesApi = (
  postId: string
): Promise<ApiResponse<ShareListResponse>> => {
  return apiClient.get(`/posts/${postId}/share`);
};
