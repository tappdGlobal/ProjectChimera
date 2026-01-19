import { create } from "zustand";
import {
  getNearbyAttendeesApi,
  getEventAttendeesApi,
  matchByInterestsApi,
  updateLocationVisibilityApi,
  NearbyAttendeesParams,
} from "../api/socialApi";
import { NearbyAttendee, InterestMatch } from "../types/socialTypes";

interface SocialState {
  nearbyAttendees: NearbyAttendee[];
  eventAttendees: NearbyAttendee[];
  matches: InterestMatch[];
  locationVisible: boolean;
  loading: boolean;
  error: string | null;

  fetchNearbyAttendees: (params: NearbyAttendeesParams) => Promise<void>;
  fetchEventAttendees: (eventId: string) => Promise<void>;
  matchByInterests: (eventId: string) => Promise<void>;
  updateLocationVisibility: (isVisible: boolean) => Promise<void>;
  clearSocialData: () => void;
}

export const useSocialStore = create<SocialState>((set) => ({
  nearbyAttendees: [],
  eventAttendees: [],
  matches: [],
  locationVisible: true,
  loading: false,
  error: null,

  fetchNearbyAttendees: async (params) => {
    try {
      set({ loading: true, error: null });
      const res = await getNearbyAttendeesApi(params);
      set({ nearbyAttendees: res.data ?? [], loading: false });
    } catch (err: any) {
      set({ loading: false, error: err.message });
    }
  },

  fetchEventAttendees: async (eventId) => {
    try {
      set({ loading: true, error: null });
      const res = await getEventAttendeesApi(eventId);
      set({ eventAttendees: res.data ?? [], loading: false });
    } catch (err: any) {
      set({ loading: false, error: err.message });
    }
  },

  matchByInterests: async (eventId) => {
    try {
      set({ loading: true, error: null });
      const res = await matchByInterestsApi({ eventId });
      set({ matches: res.data ?? [], loading: false });
    } catch (err: any) {
      set({ loading: false, error: err.message });
    }
  },

  updateLocationVisibility: async (isVisible) => {
    try {
      set({ loading: true, error: null });
      await updateLocationVisibilityApi({ isVisible });
      set({ locationVisible: isVisible, loading: false });
    } catch (err: any) {
      set({ loading: false, error: err.message });
    }
  },

  clearSocialData: () => {
    set({
      nearbyAttendees: [],
      eventAttendees: [],
      matches: [],
      error: null,
    });
  },
}));

