import { create } from "zustand";
import {
  getHostEventsApi,
  getEventAnalyticsApi,
  getEventGuestsApi,
  getEventAttendanceApi,
  closeEntryApi,
  openEntryApi,
  manualScanApi,
  GuestListParams,
  ManualScanPayload,
} from "../api/hostApi";
import { EventAnalytics, Guest, Attendance, HostEvent } from "../types/hostTypes";

interface HostState {
  events: HostEvent[];
  analytics: EventAnalytics | null;
  guests: Guest[];
  attendance: Attendance | null;
  loading: boolean;
  error: string | null;

  fetchHostEvents: () => Promise<void>;
  fetchAnalytics: (eventId: string) => Promise<void>;
  fetchGuests: (eventId: string, params?: GuestListParams) => Promise<void>;
  fetchAttendance: (eventId: string) => Promise<void>;
  closeEntry: (eventId: string) => Promise<void>;
  openEntry: (eventId: string) => Promise<void>;
  manualScan: (eventId: string, bookingId: string) => Promise<void>;
  clearHostData: () => void;
}

export const useHostStore = create<HostState>((set) => ({
  events: [],
  analytics: null,
  guests: [],
  attendance: null,
  loading: false,
  error: null,

  fetchHostEvents: async () => {
    try {
      set({ loading: true, error: null });
      const res = await getHostEventsApi();
      set({ events: res.data ?? [], loading: false });
    } catch (err: any) {
      set({ loading: false, error: err.message });
    }
  },

  fetchAnalytics: async (eventId) => {
    try {
      set({ loading: true, error: null });
      const res = await getEventAnalyticsApi(eventId);
      set({ analytics: res.data ?? null, loading: false });
    } catch (err: any) {
      set({ loading: false, error: err.message });
    }
  },

  fetchGuests: async (eventId, params) => {
    try {
      set({ loading: true, error: null });
      const res = await getEventGuestsApi(eventId, params);
      set({ guests: res.data ?? [], loading: false });
    } catch (err: any) {
      set({ loading: false, error: err.message });
    }
  },

  fetchAttendance: async (eventId) => {
    try {
      set({ loading: true, error: null });
      const res = await getEventAttendanceApi(eventId);
      set({ attendance: res.data ?? null, loading: false });
    } catch (err: any) {
      set({ loading: false, error: err.message });
    }
  },

  closeEntry: async (eventId) => {
    try {
      set({ loading: true, error: null });
      await closeEntryApi(eventId);
      set({ loading: false });
    } catch (err: any) {
      set({ loading: false, error: err.message });
    }
  },

  openEntry: async (eventId) => {
    try {
      set({ loading: true, error: null });
      await openEntryApi(eventId);
      set({ loading: false });
    } catch (err: any) {
      set({ loading: false, error: err.message });
    }
  },

  manualScan: async (eventId, bookingId) => {
    try {
      set({ loading: true, error: null });
      await manualScanApi(eventId, { bookingId });
      set({ loading: false });
    } catch (err: any) {
      set({ loading: false, error: err.message });
    }
  },

  clearHostData: () => {
    set({
      analytics: null,
      guests: [],
      attendance: null,
      error: null,
    });
  },
}));
