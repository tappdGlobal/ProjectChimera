import { create } from "zustand";
import {
  eventApi,
  CreateEventPayload,
  DraftEventPayload,
  EventCategory,
} from "../api/eventApi";
import { Event } from "../types/eventTypes";

interface EventState {
  createdEvent: Event | null;
  draftEvents: Event[];
  categories: EventCategory[];
  loading: boolean;
  error: string | null;

  // publish
  createEvent: (data: CreateEventPayload) => Promise<Event>;
  fetchCategories: () => Promise<void>;

  // drafts
  fetchDraftEvents: () => Promise<void>;
  saveDraft: (data: DraftEventPayload) => Promise<Event>;
  updateDraft: (draftId: string, data: DraftEventPayload) => Promise<Event>;
  deleteDraft: (draftId: string) => Promise<void>;
  publishDraft: (draftId: string) => Promise<Event>;

  clearEvent: () => void;
}

export const useEventStore = create<EventState>((set) => ({
  createdEvent: null,
  draftEvents: [],
  categories: [],
  loading: false,
  error: null,

  /* ================= CREATE EVENT ================= */

  createEvent: async (data) => {
    try {
      set({ loading: true, error: null });

      const event = await eventApi.createEvent(data);

      set({
        createdEvent: event,
        loading: false,
      });

      return event;
    } catch (err: unknown) {
      set({
        loading: false,
        error:
          err instanceof Error
            ? err.message
            : "Failed to create event",
      });
      throw err;
    }
  },

  /* ================= CATEGORIES ================= */

  fetchCategories: async () => {
    try {
      set({ loading: true, error: null });

      const res = await eventApi.getCategories();

      set({
        categories: res.categories,
        loading: false,
      });
    } catch (err: unknown) {
      set({
        loading: false,
        error:
          err instanceof Error
            ? err.message
            : "Failed to fetch categories",
      });
    }
  },

  /* ================= DRAFT EVENTS ================= */

  fetchDraftEvents: async () => {
    try {
      set({ loading: true, error: null });

      const drafts = await eventApi.getDraftEvents();

      set({
        draftEvents: Array.isArray(drafts) ? drafts : [],
        loading: false,
      });
    } catch (err: unknown) {
      set({
        loading: false,
        error:
          err instanceof Error
            ? err.message
            : "Failed to fetch drafts",
      });
    }
  },

  saveDraft: async (data) => {
    try {
      set({ loading: true, error: null });

      const draft = await eventApi.saveDraft(data);

      set((state) => ({
        draftEvents: [...state.draftEvents, draft],
        loading: false,
      }));

      return draft;
    } catch (err: unknown) {
      set({
        loading: false,
        error:
          err instanceof Error
            ? err.message
            : "Failed to save draft",
      });
      throw err;
    }
  },

  updateDraft: async (draftId, data) => {
    try {
      set({ loading: true, error: null });

      const updatedDraft = await eventApi.updateDraft(draftId, data);

      set((state) => ({
        draftEvents: state.draftEvents.map((d) =>
          d.id === draftId ? updatedDraft : d
        ),
        loading: false,
      }));

      return updatedDraft;
    } catch (err: unknown) {
      set({
        loading: false,
        error:
          err instanceof Error
            ? err.message
            : "Failed to update draft",
      });
      throw err;
    }
  },

  deleteDraft: async (draftId) => {
    try {
      set({ loading: true, error: null });

      await eventApi.deleteDraft(draftId);

      set((state) => ({
        draftEvents: state.draftEvents.filter(
          (d) => d.id !== draftId
        ),
        loading: false,
      }));
    } catch (err: unknown) {
      set({
        loading: false,
        error:
          err instanceof Error
            ? err.message
            : "Failed to delete draft",
      });
      throw err;
    }
  },

  publishDraft: async (draftId) => {
    try {
      set({ loading: true, error: null });

      const event = await eventApi.publishDraft(draftId);

      set((state) => ({
        createdEvent: event,
        draftEvents: state.draftEvents.filter(
          (d) => d.id !== draftId
        ),
        loading: false,
      }));

      return event;
    } catch (err: unknown) {
      set({
        loading: false,
        error:
          err instanceof Error
            ? err.message
            : "Failed to publish draft",
      });
      throw err;
    }
  },

  /* ================= RESET ================= */

  clearEvent: () => {
    set({
      createdEvent: null,
      error: null,
    });
  },
}));
