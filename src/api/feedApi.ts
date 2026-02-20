import { apiClient } from "../services/api";
import { FeedEvent } from "../types/feedTypes";

/* ================= TYPES ================= */

export interface FilterFeedResponse {
  success: boolean;
  data: FeedEvent[];
  nextCursor?: string;
}

/* ================= TRENDING FEED ================= */

export const getTrendingFeedApi = async (
  cursor?: string,
  category?: string
): Promise<FeedEvent[]> => {
  try {

    const response = await apiClient.get<FeedEvent[]>(
      "/events/feed/trending",
      {
        params: {
          cursor,
          category,
        },
      }
    );

  

    return response.data;
  } catch (error) {
    throw error;
  }
};

/* ================= RECOMMENDED FEED ================= */

export const getRecommendedFeedApi = async (
  cursor?: string
): Promise<FeedEvent[]> => {
  try {

    const response = await apiClient.get<FeedEvent[]>(
      "/events/feed/recommended",
      {
        params: {
          cursor,
        },
      }
    );

   

    return response.data;
  } catch (error) {
    throw error;
  }
};

/* ================= FILTER BY CATEGORY ================= */

export const getFilteredFeedApi = async (
  category: string,
  cursor?: string
): Promise<FeedEvent[]> => {
  try {

    const response = await apiClient.get<FilterFeedResponse>(
      "/events/feed/filter",
      {
        params: {
          category,
          cursor,
        },
      }
    );

    // Swagger returns wrapped response
    if (response.data.success) {
      return response.data.data;
    }

    return [];
  } catch (error) {

    throw error;
  }
};