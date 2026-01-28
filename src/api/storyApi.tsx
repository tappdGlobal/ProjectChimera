import { apiClient } from "../services/api";
import { ApiResponse } from "../types/authTypes";
import { Story, StoryView } from "../types/storyTypes";

/* ================= CREATE STORY ================= */

export interface CreateStoryPayload {
  caption?: string;
  media: {
    uri: string;
    name: string;
    type: string;
  };
}

export const createStoryApi = (
  payload: CreateStoryPayload
): Promise<ApiResponse<Story>> => {
  const formData = new FormData();

  if (payload.caption) {
    formData.append("caption", payload.caption);
  }

  // @ts-ignore - FormData in React Native supports file objects
  formData.append("media", {
    uri: payload.media.uri,
    name: payload.media.name,
    type: payload.media.type,
  });

  return apiClient.post("/stories", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

/* ================= GET USER STORIES ================= */

export const getUserStoriesApi = (
  userId: string
): Promise<ApiResponse<Story[]>> => {
  return apiClient.get(`/stories/user/${userId}`);
};

/* ================= GET ALL STORIES ================= */

export const getAllStoriesApi = (): Promise<ApiResponse<Story[]>> => {
  return apiClient.get("/stories");
};

/* ================= GET STORY VIEWS ================= */

export const getStoryViewsApi = (
  storyId: string
): Promise<ApiResponse<StoryView[]>> => {
  return apiClient.get(`/stories/${storyId}/views`);
};

/* ================= VIEW STORY ================= */

export const viewStoryApi = (
  storyId: string
): Promise<ApiResponse<null>> => {
  return apiClient.post(`/stories/${storyId}/view`);
};

/* ================= DELETE STORY ================= */

export const deleteStoryApi = (
  storyId: string
): Promise<ApiResponse<null>> => {
  return apiClient.delete(`/stories/${storyId}`);
};
