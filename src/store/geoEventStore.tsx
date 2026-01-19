import { create } from "zustand";
import {
  getNearbyEventsApi,
  getMapEventsApi,
  getEventLocationApi,
  NearbyEventsParams,
  NearbyEvent,
  MapBoundsParams,
  MapFeatureCollection,
  EventLocationResponse,
} from "../api/geoEventApi";

interface GeoEventState {
  nearbyEvents: NearbyEvent[];
  mapData: MapFeatureCollection | null;
  selectedEventLocation: EventLocationResponse | null;
  loading: boolean;
  error: string | null;

  fetchNearbyEvents: (params: NearbyEventsParams) => Promise<void>;
  fetchMapEvents: (params: MapBoundsParams) => Promise<void>;
  fetchEventLocation: (eventId: string) => Promise<void>;
  clearGeoData: () => void;
}

export const useGeoEventStore = create<GeoEventState>((set) => ({
  nearbyEvents: [],
  mapData: null,
  selectedEventLocation: null,
  loading: false,
  error: null,

  fetchNearbyEvents: async (params) => {
    try {
      set({ loading: true, error: null });
      const res = await getNearbyEventsApi(params);
      set({
        nearbyEvents: res.data?.events ?? [],
        loading: false,
      });
    } catch (err: any) {
      set({ loading: false, error: err.message });
    }
  },

  fetchMapEvents: async (params) => {
    try {
      set({ loading: true, error: null });
      const res = await getMapEventsApi(params);
      set({
        mapData: res.data ?? null,
        loading: false,
      });
    } catch (err: any) {
      set({ loading: false, error: err.message });
    }
  },

  fetchEventLocation: async (eventId) => {
    try {
      set({ loading: true, error: null });
      const res = await getEventLocationApi(eventId);
      set({
        selectedEventLocation: res.data ?? null,
        loading: false,
      });
    } catch (err: any) {
      set({ loading: false, error: err.message });
    }
  },

  clearGeoData: () => {
    set({
      nearbyEvents: [],
      mapData: null,
      selectedEventLocation: null,
      error: null,
    });
  },
}));
