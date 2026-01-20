import { create } from "zustand";
import {
  createEventApi,
  getEventCategoriesApi,
  CreateEventPayload,
  EventCategory,
} from "../api/eventApi";
import { Event } from "../types/eventTypes";

interface EventState {
  createdEvent: Event | null;
  categories: EventCategory[];
  loading: boolean;
  error: string | null;

  createEvent: (data: CreateEventPayload) => Promise<void>;
  fetchCategories: () => Promise<void>;
  clearEvent: () => void;
}

export const useEventStore = create<EventState>((set) => ({
  createdEvent: null,
  categories: [],
  loading: false,
  error: null,

  createEvent: async (data) => {
    try {
      set({ loading: true, error: null });

      const event = await createEventApi(data); // ✅ already Event

      set({
        createdEvent: event,
        loading: false,
      });
    } catch (err: any) {
      set({
        loading: false,
        error: err.message || "Failed to create event",
      });
    }
  },

  fetchCategories: async () => {
    try {
      set({ loading: true, error: null });

      const res = await getEventCategoriesApi(); // ✅ already data

      set({
        categories: res.categories,
        loading: false,
      });
    } catch (err: any) {
      set({
        loading: false,
        error: err.message || "Failed to fetch categories",
      });
    }
  },

  clearEvent: () => {
    set({ createdEvent: null, error: null });
  },
}));
