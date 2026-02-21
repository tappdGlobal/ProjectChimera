import { create } from "zustand";
import {
  getTrendingFeedApi,
  getRecommendedFeedApi,
  getFilteredFeedApi,
} from "../api/feedApi";
import { FeedEvent } from "../types/feedTypes";

type FeedType = "trending" | "recommended" | "filter";

interface FeedState {
  events: FeedEvent[];
  activeType: FeedType;
  activeCategory?: string;

  loading: boolean;
  error: string | null;

  fetchTrending: (category?: string) => Promise<void>;
  fetchRecommended: () => Promise<void>;
  fetchFiltered: (category: string) => Promise<void>;

  resetFeed: () => void;
}

export const useFeedStore = create<FeedState>((set) => ({
  events: [],
  activeType: "recommended",
  activeCategory: undefined,
  loading: false,
  error: null,

  fetchTrending: async (category) => {
    try {
      set({ loading: true, error: null });

      // ✅ FIXED (removed undefined cursor)
      const events = await getTrendingFeedApi(category);

      set({
        events,
        activeType: "trending",
        activeCategory: category,
        loading: false,
      });
    } catch (error: any) {
      set({
        error: error?.response?.data?.message || error.message,
        loading: false,
      });
    }
  },

  fetchRecommended: async () => {
    try {
      set({ loading: true, error: null });

      const events = await getRecommendedFeedApi();

      set({
        events,
        activeType: "recommended",
        activeCategory: undefined,
        loading: false,
      });
    } catch (error: any) {
      set({
        error: error?.response?.data?.message || error.message,
        loading: false,
      });
    }
  },

  fetchFiltered: async (category: string) => {
    try {
      set({ loading: true, error: null });

      const events = await getFilteredFeedApi(category);

      set({
        events,
        activeType: "filter",
        activeCategory: category,
        loading: false,
      });
    } catch (error: any) {
      set({
        error: error?.response?.data?.message || error.message,
        loading: false,
      });
    }
  },

  resetFeed: () => {
    set({
      events: [],
      activeCategory: undefined,
      error: null,
    });
  },
}));