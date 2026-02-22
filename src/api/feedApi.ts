import { apiClient } from "../services/api";
import { FeedEvent } from "../types/feedTypes";

/* ================= TYPES ================= */

export interface FilterFeedResponse {
  success: boolean;
  data: FeedEvent[];
}

/* ================= TRENDING FEED ================= */

export const getTrendingFeedApi = async (
  category?: string
): Promise<FeedEvent[]> => {
  try {
    const response = await apiClient.get<FeedEvent[]>(
      "/events/feed/trending",
      {
        params: {
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

export const getRecommendedFeedApi = async (): Promise<FeedEvent[]> => {
  try {
    console.log("📡 Calling Recommended Feed API...");

    const response = await apiClient.get<FeedEvent[]>(
      "/events/feed/recommended"
    );

    

    return response.data;
  } catch (error: any) {
    console.log("❌ FEED API ERROR:", error?.response?.data || error);
    throw error;
  }
};

/* ================= FILTER BY CATEGORY ================= */

export const getFilteredFeedApi = async (
  category: string
): Promise<FeedEvent[]> => {
  try {
    console.log("📡 Calling Filtered Feed API with category:", category);

    const response = await apiClient.get(
      "/events/feed/filter",
      {
        params: { category },
      }
    );

    console.log("✅ FULL FILTER RESPONSE:", response);
    console.log("✅ FILTER RESPONSE DATA:", response.data);
    console.log("✅ IS ARRAY?:", Array.isArray(response.data));

    return response.data;
  } catch (error: any) {
    console.error("❌ Filter API Error:", error?.response?.data || error);
    throw error;
  }
};