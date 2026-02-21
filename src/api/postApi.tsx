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

export const getFeedPostsApi = (): Promise<ApiResponse<Post[]>> => {
  return apiClient.get("/posts");
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
