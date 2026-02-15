import { create } from "zustand";
import {
  createStoryApi,
  getUserStoriesApi,
  getAllStoriesApi,
  getStoryViewsApi,
  viewStoryApi,
  deleteStoryApi,
  CreateStoryPayload,
} from "../api/storyApi";
import { Story, StoryView } from "../types/storyTypes";

interface StoryState {
  stories: Story[];
  userStories: Story[];
  storyViews: StoryView[];
  loading: boolean;
  error: string | null;

  createStory: (payload: CreateStoryPayload) => Promise<Story>;
  getUserStories: (userId: string) => Promise<void>;
  getAllStories: () => Promise<void>;
  getStoryViews: (storyId: string) => Promise<void>;
  viewStory: (storyId: string) => Promise<void>;
  deleteStory: (storyId: string) => Promise<void>;
  clearStoryData: () => void;
}

export const useStoryStore = create<StoryState>((set, get) => ({
  stories: [],
  userStories: [],
  storyViews: [],
  loading: false,
  error: null,

  createStory: async (payload) => {
    try {
      set({ loading: true, error: null });
      const response = await createStoryApi(payload);
      
      // Handle different response structures
      const storyData = (response as any).data || response;
      
      if (!storyData) {
        throw new Error("Failed to create story - no data returned");
      }

      // Add new story to the beginning of stories list
      set((state) => ({
        stories: [storyData, ...state.stories],
        userStories: [storyData, ...state.userStories],
        loading: false,
      }));

      return storyData;
    } catch (err: any) {
      console.error("Create story error:", err);
      set({ loading: false, error: err.message || "Failed to create story" });
      throw err;
    }
  },

  getUserStories: async (userId) => {
    try {
      set({ loading: true, error: null });
      const res = await getUserStoriesApi(userId);
      set({ userStories: res.data ?? [], loading: false });
    } catch (err: any) {
      set({ loading: false, error: err.message || "Failed to fetch user stories" });
    }
  },

  getAllStories: async () => {
    try {
      set({ loading: true, error: null });
      const res = await getAllStoriesApi();
      // Handle different response structures
      const storiesData = (res as any).data || res;
      set({ stories: Array.isArray(storiesData) ? storiesData : [], loading: false });
    } catch (err: any) {
      console.error("getAllStories error:", err);
      set({ loading: false, error: err.message || "Failed to fetch stories" });
    }
  },

  getStoryViews: async (storyId) => {
    try {
      set({ loading: true, error: null });
      const res = await getStoryViewsApi(storyId);
      set({ storyViews: res.data ?? [], loading: false });
    } catch (err: any) {
      set({ loading: false, error: err.message || "Failed to fetch story views" });
    }
  },

  viewStory: async (storyId) => {
    try {
      await viewStoryApi(storyId);
      
      // Update views count locally
      set((state) => ({
        stories: state.stories.map((story) =>
          story.id === storyId
            ? { ...story, viewsCount: story.viewsCount + 1 }
            : story
        ),
      }));
    } catch (err: any) {
      // Silently log error - viewing your own story or other 400 errors are not critical
      // The UI will still work correctly with local state
      console.log("Story view not recorded (non-critical):", err.message || err);
    }
  },

  deleteStory: async (storyId) => {
    try {
      set({ loading: true, error: null });
      await deleteStoryApi(storyId);
      
      // Remove story from local state
      set((state) => ({
        stories: state.stories.filter((s) => s.id !== storyId),
        userStories: state.userStories.filter((s) => s.id !== storyId),
        loading: false,
      }));
    } catch (err: any) {
      set({ loading: false, error: err.message || "Failed to delete story" });
      // Don't re-throw - let the component handle the error display
      console.error("Delete story error:", err.message || err);
    }
  },

  clearStoryData: () => {
    set({
      stories: [],
      userStories: [],
      storyViews: [],
      error: null,
    });
  },
}));
