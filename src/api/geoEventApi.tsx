import { apiClient } from "../services/api";
import { ApiResponse } from "../types/authTypes";
import { Event } from "../types/eventTypes";

/* ================= NEARBY EVENTS ================= */

export interface NearbyEventsParams {
  lat: number;
  lng: number;
  radius?: number; // km (default 10)
  category?: string;
}

export interface NearbyEvent extends Event {
  distance: number; // km
}

export interface NearbyEventsResponse {
  userLocation: {
    latitude: number;
    longitude: number;
  };
  radius: number;
  count: number;
  events: NearbyEvent[];
}

export const getNearbyEventsApi = (
  params: NearbyEventsParams
): Promise<ApiResponse<NearbyEventsResponse>> => {
  return apiClient.get("/events/nearby", { params });
};

/* ================= MAP VIEWPORT EVENTS ================= */

export interface MapBoundsParams {
  ne_lat: number;
  ne_lng: number;
  sw_lat: number;
  sw_lng: number;
  category?: string;
}

export interface MapFeature {
  type: "Feature";
  id: string;
  geometry: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
  properties: {
    eventName: string;
    category: string;
    genre: string;
    eventDate: string;
    venue: string;
    city: string;
    image: string;
  };
}

export interface MapFeatureCollection {
  type: "FeatureCollection";
  features: MapFeature[];
}

export const getMapEventsApi = (
  params: MapBoundsParams
): Promise<ApiResponse<MapFeatureCollection>> => {
  return apiClient.get("/events/map", { params });
};

/* ================= EVENT LOCATION DETAILS ================= */

export interface EventLocationResponse {
  id: string;
  eventName: string;
  location: {
    venue: string;
    address: string;
    city: string;
    country: string;
    latitude: number;
    longitude: number;
    distance?: number;
  };
}

export const getEventLocationApi = (
  eventId: string
): Promise<ApiResponse<EventLocationResponse>> => {
  return apiClient.get(`/events/${eventId}/location`);
};
