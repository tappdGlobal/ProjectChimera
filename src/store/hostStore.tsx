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
  analyticsMap: Map<string, EventAnalytics>; // eventId -> analytics
  guests: Guest[];
  guestsCountMap: Map<string, number>; // eventId -> guest count
  attendance: Attendance | null;
  attendanceMap: Map<string, Attendance>; // eventId -> attendance
  loading: boolean;
  error: string | null;

  fetchHostEvents: () => Promise<void>;
  fetchAnalytics: (eventId: string) => Promise<void>;
  fetchAllEventsAnalytics: (eventIds: string[]) => Promise<void>;
  fetchGuests: (eventId: string, params?: GuestListParams) => Promise<void>;
  fetchEventsGuestsCount: (eventIds: string[]) => Promise<void>;
  fetchAttendance: (eventId: string) => Promise<void>;
  fetchEventsAttendance: (eventIds: string[]) => Promise<void>;
  closeEntry: (eventId: string) => Promise<void>;
  openEntry: (eventId: string) => Promise<void>;
  manualScan: (eventId: string, bookingId: string) => Promise<void>;
  clearHostData: () => void;
}

export const useHostStore = create<HostState>((set, get) => ({
  events: [],
  analytics: null,
  analyticsMap: new Map(),
  guests: [],
  guestsCountMap: new Map(),
  attendance: null,
  attendanceMap: new Map(),
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

  fetchAllEventsAnalytics: async (eventIds) => {
    try {
      set({ loading: true, error: null });
      const analyticsMap = new Map(get().analyticsMap);

      // Fetch analytics for all events in parallel
      await Promise.all(
        eventIds.map(async (eventId) => {
          try {
            const res = await getEventAnalyticsApi(eventId);
            if (res.data) {
              analyticsMap.set(eventId, res.data);
            }
          } catch (err) {
            console.error(`Failed to fetch analytics for event ${eventId}:`, err);
          }
        })
      );

      set({ analyticsMap, loading: false });
    } catch (err: any) {
      set({ loading: false, error: err.message });
    }
  },

  fetchGuests: async (eventId, params) => {
    try {
      set({ loading: true, error: null });
      const res = await getEventGuestsApi(eventId, params);
      const resAny = res as any;

      // Smart extraction: handle { data: [...] } or direct array
      let rawGuests: any[] = [];
      if (Array.isArray(resAny)) {
        rawGuests = resAny;
      } else if (Array.isArray(resAny?.data)) {
        rawGuests = resAny.data;
      }

      const normalizedGuests = rawGuests.map((raw: any) => {
        // Backend uses `id` not `bookingId`
        const resolvedBookingId = raw.bookingId || raw.id || raw._id;

        return {
          ...raw,
          bookingId: resolvedBookingId,
          name: raw.name || raw.user?.name || raw.user?.username || "",
          email: raw.email || raw.user?.email || "",
          // Backend uses `hasCheckedIn`, not `checkedIn`
          checkedIn: raw.hasCheckedIn ?? raw.checkedIn ?? (raw.status === "CHECKED_IN"),
        };
      });

      console.log('✅ Guests loaded:', normalizedGuests.length, '| IDs:', normalizedGuests.map((g: any) => g.bookingId));

      set({ guests: normalizedGuests, loading: false });
    } catch (err: any) {
      console.error('❌ fetchGuests ERROR:', err);
      set({ loading: false, error: err.message });
    }
  },

  fetchEventsGuestsCount: async (eventIds) => {
    try {
      const guestsCountMap = new Map(get().guestsCountMap);
      await Promise.all(
        eventIds.map(async (eventId) => {
          try {
            const res = await getEventGuestsApi(eventId);
            if (res.data) {
              guestsCountMap.set(eventId, res.data.length);
            }
          } catch (err) {
            console.error(`Failed to fetch guests for event ${eventId}:`, err);
          }
        })
      );
      set({ guestsCountMap });
    } catch (err: any) {
      // Non-blocking error
      console.log(err.message);
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

  fetchEventsAttendance: async (eventIds) => {
    try {
      set({ loading: true, error: null });
      const attendanceMap = new Map(get().attendanceMap);

      await Promise.all(
        eventIds.map(async (eventId) => {
          try {
            const res = await getEventAttendanceApi(eventId);
            if (res.data) {
              attendanceMap.set(eventId, res.data);
            }
          } catch (err) {
            console.error(`Failed to fetch attendance for event ${eventId}:`, err);
          }
        })
      );

      set({ attendanceMap, loading: false });
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
      throw new Error(err.message || "Invalid ticket number");
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
